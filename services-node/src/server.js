// Copyright 2019 Tad Lebeck
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import express from 'express';
import session from 'express-session';

// passport auth
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

// Websocket
import WebSocket from 'ws';

// requests
import https from 'https';
import instance from './instance';

// tools
import bodyParser from 'body-parser';
import config from './config';
import fs from 'fs';
import path from 'path';
import url from 'url';
import VSRUpdateQueue from './VSRUpdateQueue';

import { LOG_TIMESTAMP } from './logTimestamp';

import * as constants from './constants.js';

// For handling error code messages since we use babel
import 'source-map-support/register';

// load SQL
import { initDB } from './app/sqldb/psqldb';

import { logMessage } from './utils';

logMessage(LOG_TIMESTAMP);
setInterval(() => {
    logMessage(LOG_TIMESTAMP);
}, 30 * 60000);

process.on('SIGTERM', () => {
    logMessage(`Webservice signaled (SIGTERM)`);
    process.exit(1);
});

process.on('SIGINT', () => {
    logMessage(`Webservice signaled (SIGINT)`);
    process.exit(1);
});

process.on('exit', code => {
    logMessage(`Webservice shutting down and exiting ${code}`);
    process.exit(1);
});

// map of user sessions using token as id
const sessions = {};
// Use express for routing
const app = express();
const services = express();

// Options for the HTTP server
const options = {
    ca: fs.readFileSync(config.CA_CRT),
    cert: fs.readFileSync(config.SERVER_CRT),
    key: fs.readFileSync(config.SERVER_KEY),
    rejectUnauthorized: false,
};

logMessage('Starting service');

// Handle incoming request bodies
app.use(bodyParser.json({ extended: false }));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static(path.join(__dirname, '/build')));

app.use(session({
        secret: 'nuvoloso',
        resave: false,
        saveUninitialized: false,
    }));

// Passport config
passport.serializeUser((user, cb) => {
    cb(null, user.token);
});

passport.deserializeUser((id, cb) => {
    const user = sessions[id];
    const { username } = user || {};

    if (!username) {
        return cb(new Error(`No user found with this token`));
    }

    cb(null, user);
});

passport.use(new LocalStrategy((username, password, done) => {
        instance
            .post(config.API_AUTH + 'login', { username, password })
            .then(response => {
                const { data } = response || {};
                const { token } = data || {};

                if (token) {
                    sessions[token] = data;
                    return done(null, data);
                }

                return done(null, false, escape(data));
            })
            .catch(error => {
                const { response } = error || {};
                const { data = 'Error reaching authentication service.' } = response || {};
                return done(null, false, escape(data));
            });
    }));

const opts = {
    jwtFromRequest: ExtractJwt.fromHeader('x-auth'),
    secretOrKey: 'nuvoloso-secret',
};
passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        const { exp } = jwt_payload || {};
        const now = Date.now() / 1000;

        if (exp && now < exp) {
            return done(null, jwt_payload);
        }

        return done(null, false, { message: 'Unauthorized' });
    }));

app.use(passport.initialize());
app.use(passport.session());

require('./app/routes')(services);
app.use(`/${constants.SERVICES_NODE_API}`, services);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

const server = https.createServer(options, app).listen(config.PORT, function() {
    logMessage('We are live on port: ' + config.PORT);
    logMessage('Connected to API service: ' + config.API_URL);
});

/**
 * Manage metrics database connectivity.
 */
const metricsDatabaseStatus = {
    metricsDatabaseReady: false,
};

/**
 * Callback to keep track of metrics connectivity.  Update variable with
 * connection status.
 * @param {*} connected
 */
function databaseCallback(connected) {
    metricsDatabaseStatus.metricsDatabaseReady = connected;
    if (metricsDatabaseStatus.metricsDatabaseReady) {
        logMessage('--> Metrics database services READY');
    } else {
        logMessage('--> Metrics database services DISCONNECTED');
    }
}

/**
 * Initialize connection to metrics database and pass periodic callback function.
 */
initDB(databaseCallback);

// WebSocket
server.on('upgrade', function upgrade(request, socket, head) {
    const urlObject = url.parse(request.url, true);
    const { pathname, query } = urlObject;
    const { accountId, token } = query || {};

    if (accountId && token && pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, function done(ws) {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy();
    }
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', function(ws, request) {
    const urlObject = url.parse(request.url, true);
    const { query } = urlObject;
    const { accountId, token } = query || {};

    /**
     * Mechanism to queue up all pending VSRs and flush periodically.
     * Needs to be managed per connection.
     */
    const vsrQueue = new VSRUpdateQueue();

    const expiryTimer = expiredTokenTimer(token, ws);

    /**
     * Stash account/token info for debugging purposes.
     */
    const lastSix = token.substring(token.length - 7, token.length - 1);
    /**
     * Initialize information we are tracking on the ws.
     */
    ws.ourInfo = {
        accountId,
        token: lastSix,
        complete: false,
    };

    vsrQueueTimer(vsrQueue);
    initWatcher(ws, accountId, token, vsrQueue);
    notifyClientMetricsStatus(ws);

    ws.on('close', function() {
        logMessage(`[WebSocket] closed ${ws.ourInfo.accountId} readyState ${readyStateDisplay(ws.readyState)}`);
        wsComplete(ws, 1000, 'Completed');
        clearInterval(expiryTimer);
    });

    ws.on('error', function(error) {
        const { message } = error || {};
        logMessage(`[WebSocket] error ${ws.ourInfo.accountId}: ${message} readyState ${readyStateDisplay(ws.readyState)}`);
    });

    ws.on('message', function incoming(data) {
        logMessage(`[WebSocket] message ${ws.ourInfo.accountId} readyState ${readyStateDisplay(ws.readyState)}`);

        /**
         * Possible messages include:
         *
         */
        const message = JSON.parse(data);

        if (message.id === constants.WS_MESSAGE_ACCOUNT_UPDATE) {
            /**
             * Clear any pending VSR request updates since the account
             * is changing and the requests may fail.
             */
            vsrQueue.clearIds();

            /**
             * Close any other open watchers
             */
            if (ws.ourInfo.accountId !== message.accountId) {
                /**
                 * Close the watcher as it is not needed.  Flag our
                 * info on the ws so we do not reopen on an expected
                 * close operation.
                 */
                debugMessage(`[WebSocket] account change, close watcher ${ws.ourInfo.accountId}`);
                wsComplete(ws, 1000, 'Completed');
            }
            debugMessage(`connection (${ws.ourInfo.accountId})`);
            /**
             * Initialize information we are tracking on the ws.
             */
            ws.ourInfo = {
                accountId: message.accountId,
                token: lastSix,
                complete: false,
            };
            initWatcher(ws, message.accountId, token, vsrQueue);
        }
    });

    ws.send(JSON.stringify({
            object: constants.SOCKET,
            data: constants.SOCKET_CONNECTED,
            message: constants.WS_MESSAGES.CONNECTED,
        }));
    logMessage(`[WebSocket] connected on port ${ws._socket.localPort} readyState ${readyStateDisplay(ws.readyState)}`);

    // run a keep alive ping to prevent any default timeouts
    const wsPing = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ object: 'ping' }));
        } else if (ws.readyState === WebSocket.CLOSED) {
            logMessage(`[WebSocket] terminating ws readyState ${readyStateDisplay(ws.readyState)}`);
            ws.terminate();
            clearInterval(wsPing);
        }
    }, 30000);

    /**
     * Periodically check metrics database status and update client.
     */
    const metricsStatus = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            notifyClientMetricsStatus(ws);
        } else if (ws.readyState === WebSocket.CLOSED) {
            clearInterval(metricsStatus);
        }
    }, config.NUVO_METRICSDB_STATUS_INTERVAL);
});

services.post('/events', (req, res) => {
    const { data, message, method, object } = req.body || {};
    const result = postEvent(null, message, object, method, data);
    res.send(result);
});

// Supporting functions below here //

const debugWatcher = true;

function debugMessage(message) {
    if (debugWatcher) {
        logMessage(message);
    }
}
function postEvent(ws, message, object, method, data) {
    if (!wss) {
        return '[WebSocket] server not running';
    }

    debugMessage(`=====================================================`);
    debugMessage(`Watcher postEvent ${ws.ourInfo.accountId} ${message}`);
    const body = JSON.stringify({
        ...(message && { message }),
        ...(object && { object }),
        ...(method && { method }),
        ...(data && { data }),
    });
    wss.clients.forEach(function each(client) {
        /**
         * Only broadcast once for each account.
         */
        if (client.readyState === WebSocket.OPEN && (!ws || (ws && client === ws))) {
            debugMessage(`Watcher postEvent sending results to ${client.ourInfo.accountId} ${lastSix(client.ourInfo.token)} readyState ${readyStateDisplay(client.readyState)}`);
            client.send(body);
        }
    });
    debugMessage(`-----------------------------------------------------`);

    return `[WebSocket] sent message: ${message}`;
}

/**
 * Fetch the given object
 * @param {*} object
 * @param {*} id
 * @param {*} accountId
 * @param {*} token
 * @param {*} ws
 * @param {*} message
 * @param {*} method
 */
function httpsGet(object, id, accountId, token, ws, message, method) {
    logMessage(`httpsGet /${constants.SERVICES_NODE_API}/${object}/${id} x-account: ${accountId} x-auth: ${lastSix(token)}`);
    https
        .get({
                path: `/${constants.SERVICES_NODE_API}/${object}/${id}`,
                port: config.PORT,
                rejectUnauthorized: false,
                headers: {
                    'X-Account': accountId,
                    'X-Auth': token,
                },
            },
            res => {
                if (res.statusCode >= 400) {
                    /**
                     * XXX We attempt to fetch all objects.  If we are not authorized, we will
                     * get the expected 403 error.
                     */
                    logMessage(`[Watcher] error ${res.statusCode} fetching ${object}/${id}`);
                    return;
                }

                res.setEncoding('utf8');
                let body = '';
                res.on('data', data => {
                    body += data;
                });
                res.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        postEvent(ws, message, object, method, data);
                    } catch (e) {
                        logMessage('[Watcher] unsupported object type in services-node: ', object, e);
                    }
                });
            })
        .on('error', e => {
            logMessage(`[Watcher] get resource failure: ${e}`);
        });
}

function initWatcher(ws, accountId, token, vsrQueue) {
    /**
     * watcher: setup websocket connection with kontroller
     */
    function reconnect(ws) {
        return setTimeout(() => {
            logMessage('[Watcher] reconnecting...');
            initWatcher(ws, accountId, token, vsrQueue);
        }, constants.WS_RECONNECT_INTERVAL);
    }

    postEvent(ws, constants.WS_MESSAGES.WATCHER_CONNECTING, constants.WATCHER);

    if (debugWatcher) {
        debugMessage(`initwatch current clients (${accountId}`);
        wss.clients.forEach(function each(client) {
            debugMessage(`connection (${client.ourInfo.accountId}) readyState ${readyStateDisplay(client.readyState)}`);
        });
    }

    const apiWatchers = config.API_URL.concat('/watchers');
    const allURIs = [
        constants.URI_ACCOUNTS,
        constants.URI_APPLICATION_GROUPS,
        constants.URI_CLUSTERS,
        constants.URI_CONSISTENCY_GROUPS,
        constants.URI_CSP_CREDENTIALS,
        constants.URI_CSP_DOMAINS,
        constants.URI_NODES,
        constants.URI_SERVICE_PLAN_ALLOCATIONS,
        constants.URI_SERVICE_PLANS,
        constants.URI_SNAPSHOTS,
        constants.URI_USERS,
        constants.URI_VOLUME_SERIES_REQUESTS,
        constants.URI_VOLUME_SERIES,
    ];
    const headers = {
        'X-Account': accountId,
        'X-Auth': token,
    };
    instance
        .post(apiWatchers,
            {
                matchers: [
                    {
                        uriPattern: allURIs.join('|'),
                    },
                ],
                name: 'Nuvoloso-GUI',
            },
            {
                headers,
            })
        .then(res => {
            const watcher = new WebSocket(apiWatchers.concat('/', res.data), {
                ca: fs.readFileSync(config.CA_CRT),
                cert: fs.readFileSync(config.CLIENT_CRT),
                headers,
                key: fs.readFileSync(config.CLIENT_KEY),
                rejectUnauthorized: false, // TBD specify a checkServerIdentity fn
            });
            /**
             * Store watcher client for use later when managing account
             * context switches.
             */
            ws.ourInfo.watcher = watcher;
            watcher.on('message', function incoming(data) {
                const { method, trimmedURI = '', scope } = JSON.parse(data || '{}');
                const uri = trimmedURI.split('/');
                const object = uri[1];
                const id = (uri[2] || '').split('?')[0];
                const action = uri[3];
                const message = `${method} ${object} ${id} ${action}`;

                debugMessage(`====> [Watcher message] ${accountId} readyState ${readyStateDisplay(ws.readyState)}`);
                debugMessage(`Watcher ${accountId} message: ${message}`);

                /**
                 * Ignore any objects we don't need updates for, but might have got past our matcher expression
                 */
                if (!allURIs.find(uri => uri === object)) {
                    return;
                }

                if (object === constants.URI_VOLUME_SERIES_REQUESTS) {
                    /**
                     * If the action is a PATCH, push the volume ID onto a list
                     * of IDs to get and send to the client.
                     */
                    const metaId = scope['meta.id'] || {};
                    if (method === 'PATCH') {
                        debugMessage(`Watcher VSR request PATCH ${message} ${accountId} ${lastSix(ws.ourInfo.token)}`);
                        vsrQueue.addId(id ? id : metaId, accountId, token, ws, message, method);
                    } else {
                        debugMessage(`Watcher VSR request POST ${message}  ${accountId} ${lastSix(ws.ourInfo.token)}`);
                        httpsGet(object, id ? id : metaId, accountId, token, ws, message, method);
                    }

                    return;
                }

                if (method === 'DELETE') {
                    postEvent(ws, message, object, method, { ids: [id] });
                    return;
                }

                if (object === constants.URI_NODES && id === constants.NODE_ID_SUMMARY_HEARTBEAT) {
                    // ignore these updates
                    return;
                }

                if (debugWatcher) {
                    debugMessage(`Watcher fetching ${object}/${id} ${accountId}/${lastSix(token)}`);
                    debugMessage(`Watcher current connections`);
                    let i = 0;
                    wss.clients.forEach(client => {
                        debugMessage(`Watcher connection ${i++} (${client.ourInfo.accountId}) readyState ${readyStateDisplay(client.readyState)}`);
                    });
                }

                /**
                 * Issue the GET on the object/id using account/token.
                 */
                httpsGet(object, id, accountId, token, ws, message, method);
            });
            watcher.on('close', function() {
                debugMessage(`====> [Watcher close] ${accountId} readyState ${readyStateDisplay(ws.readyState)}`);
                logMessage(`[Watcher] ${accountId} closed readyState ${readyStateDisplay(ws.readyState)}`);

                postEvent(ws, constants.WS_MESSAGES.WATCHER_DISCONNECTED, constants.WATCHER);
                watcher.removeAllListeners();

                /**
                 * We may have intentionally closed the watcher when we switched accounts.
                 * Do not reconnect if that is the case.
                 */
                if (ws.ourInfo.accountId === accountId && !ws.ourInfo.complete) {
                    debugMessage(`reconnect from close ${accountId} ${ws.ourInfo.accountId}`);
                    reconnect(ws);
                }
            });
            watcher.on('error', function(error) {
                debugMessage(`====> [Watcher error] ${accountId} readyState ${readyStateDisplay(ws.readyState)}`);

                const { message } = error || {};
                logMessage(`[Watcher] ${accountId} error: ${message}`);
                watcher.removeAllListeners();
                reconnect(ws);
            });
            watcher.on('open', function() {
                debugMessage(`====> [Watcher open] ${accountId} readyState ${readyStateDisplay(ws.readyState)}`);
                logMessage(`[Watcher] ${accountId} connected `);
                if (debugWatcher) {
                    debugMessage(`Watcher after connect current clients`);
                    let i = 0;
                    wss.clients.forEach(function each(client) {
                        debugMessage(`Watcher connection open ${i++} (${
                                client.ourInfo.accountId
                            }) readyState ${readyStateDisplay(client.readyState)}`);
                    });
                }

                postEvent(ws, constants.WS_MESSAGES.WATCHER_CONNECTED, constants.WATCHER);
            });
        })
        .catch(error => {
            debugMessage(`====> [Watcher catch] ${accountId} readyState ${readyStateDisplay(ws.readyState)}`);
            if (error) {
                const { message, response } = error;
                const { data } = response || {};
                const { code } = data || {};
                if (code && code === 403) {
                    logMessage('[Watcher] Disconnecting due to expired token');
                    wsComplete(ws, 4403, 'Expired token');
                    logMessage('[WebSocket] Disconnecting due to expired token');
                    ws.close(4403, 'Expired token');
                }
                logMessage(`[Watcher] error: ${data ? JSON.stringify(data) : message}`);
            } else {
                postEvent(ws, constants.WS_MESSAGES.WATCHER_DISCONNECTED, constants.WATCHER);
                logMessage('[Watcher] No response from API server.');
            }
            if (!ws.ourInfo.complete) {
                debugMessage('reconnect from exception');

                reconnect(ws);
            }
        });
}

/**
 * Convenience function for displaying the state of the WS connection.
 * @param {*} state
 */
function readyStateDisplay(state) {
    switch (state) {
        case WebSocket.CONNECTING:
            return 'CONNECTING';
        case WebSocket.OPEN:
            return 'OPEN';
        case WebSocket.CLOSING:
            return 'CLOSING';
        case WebSocket.CLOSED:
            return 'CLOSED';
        default:
            return '<UNKNOWN>';
    }
}

/**
 * Convenenience function for displaying the last 6 characters of a token.
 * @param {*} token
 */
function lastSix(token) {
    return token.substring(token.length - 7, token.length - 1);
}

/**
 * Flush the queue of pending VSRs.  Clear the queue afterwards and restart
 * the timer.
 */
function vsrQueueFlush(vsrQueue) {
    vsrQueue.getIds().forEach(vsrId => {
        const { id, accountId, token, ws, message, method } = vsrId || {};
        httpsGet('volume-series-requests', id, accountId, token, ws, message, method);
    });
    vsrQueue.clearIds();
}

/**
 * Create a timer and invoke the flush command when it completes.
 */
function vsrQueueTimer(vsrQueue) {
    return setInterval(() => {
        vsrQueueFlush(vsrQueue);
    }, 5000);
}

/**
 * Handle closing down the websocket.
 * @param {*} ws
 * @param {*} code
 * @param {*} message
 */
function wsComplete(ws, code, message) {
    ws.ourInfo.complete = true;
    ws.ourInfo.accountId = '';
    ws.ourInfo.token = '';
    if (ws.ourInfo.watcher) {
        ws.ourInfo.watcher.removeAllListeners();
        if (ws.ourInfo.watcher.readyState === 1) {
            ws.ourInfo.watcher.close(code, message);
        }
        ws.ourInfo.watcher = null;
    }
}

/**
 * Periodically validate the token.
 * @param {*} token
 * @param {*} ws
 */
function expiredTokenTimer(token, ws) {
    const timer = setInterval(() => {
        const headers = {
            token,
        };

        instance
            .post(config.API_AUTH + 'validate?preserve-expiry=true',
                {},
                {
                    headers,
                })
            .then(() => {
                // still authenticated
            })
            .catch(error => {
                const { response } = error || {};
                const { status } = response || {};
                /**
                 * Look for specific error from auth service that token is invalid.
                 */
                if (status === 401) {
                    ws.send(JSON.stringify({
                            object: constants.WS_EXPIRED_AUTH,
                            message: 'Automatic logout due to authentication timeout',
                        }));
                    wsComplete(ws, 1000, 'Completed');
                    ws.close(4403, 'Expired token');
                    clearInterval(timer);
                } else {
                    const { message } = error || {};
                    logMessage(`Error contacting authentication service ${message}`);
                }
            });
    }, 60000);
    return timer;
}

function notifyClientMetricsStatus(ws) {
    if (ws && ws.readyState === 1) {
        if (metricsDatabaseStatus.metricsDatabaseReady) {
            ws.send(JSON.stringify({ object: constants.WS_MESSAGES.METRICS_DB_READY }));
        } else {
            ws.send(JSON.stringify({ object: constants.WS_MESSAGES.METRICS_DB_DISCONNECTED }));
        }
    }
}
