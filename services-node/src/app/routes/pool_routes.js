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
import { handleError, request, send } from '../../instance';

import { logMessage } from '../../utils';

const axios = require('axios');

const config = require('../../config');
const mock = require('../../mock');

import * as constants from '../../constants';
import { abbreviatedToken } from '../../utils';

const apiCSPs = `${config.API_URL}/${constants.URI_CSP_DOMAINS}`;
const apiPools = `${config.API_URL}/${constants.URI_POOLS}`;

module.exports = function(app) {
    app.get([`/${constants.URI_POOLS}`, `/${constants.URI_POOLS}/:id`], (req, res) => {
        const { id } = req.params || {};
        const reqUrl = id ? `${apiPools}/${id}` : apiPools;
        request(req, 'get', reqUrl)
            .then(response => {
                const pools = id ? [response.data] : response.data;
                if (pools.length < 1) {
                    send(res, response);
                    return;
                }
                const cspRequests = [];
                pools.forEach(pool => {
                    cspRequests.push(request(req, 'get', `${apiCSPs}/${pool.cspDomainId}`).catch(e => {
                            const token = e.request._headers['x-auth'];
                            logMessage(`error fetching domain ${pool.cspDomainId} for pool id ${pool.meta.id}: ${
                                    e.response.data.message
                                } account ${e.request._headers['x-account']} auth ${abbreviatedToken(token)}`);
                        }));
                });
                axios.all(cspRequests).then(axios.spread((...args) => {
                        args.forEach(arg => {
                            if (arg) {
                                const csp = arg.data;
                                // Need to fill in CSP domain name for all clusters
                                pools.forEach(pool => {
                                    if (pool.cspDomainId === csp.meta.id) {
                                        pool['cspDomainName'] = csp.name;
                                    }
                                });
                            }
                        });

                        /**
                         * Request may have failed, so ignore lack of headers.
                         */
                        const headers =
                            args && args.length > 0 && args[args.length - 1] && args[args.length - 1].headers
                                ? args[args.length - 1].headers
                                : {};
                        send(res, {
                            data: id ? pools[0] : pools,
                            headers,
                        });
                    }));
            })
            .catch(err => {
                logMessage(`error fetching pool ${reqUrl} ${err.message}`);
                handleError(res, err);
            });
    });
    app.post(`/${constants.URI_POOLS}`, (req, res) => {
        request(req, 'post', apiPools, req.body)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.delete(`/${constants.URI_POOLS}/:id`, (req, res) => {
        const url = apiPools.concat('/', req.params.id);
        request(req, 'delete', url)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.patch(`/${constants.URI_POOLS}/:id`, (req, res) => {
        const { set = [] } = req.query || {};
        const url = apiPools.concat('/', req.params.id, '?set=', Array.isArray(set) ? set.join('&set=') : set);
        request(req, 'patch', url, req.body)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.get('/resource-utilization', (req, res) => {
        setTimeout(() => {
            if (Number(req.query.capacity)) {
                res.send(mock.getRandomChartData(20));
            } else {
                res.send([]);
            }
        }, config.API_MOCK_DELAY);
    });
};
