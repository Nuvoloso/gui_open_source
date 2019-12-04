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
import axios from 'axios';
import https from 'https';
import fs from 'fs';

import config from './config';
import { abbreviatedToken, logMessage } from './utils';

const debugAuth = false;

const instance = axios.create({
    httpsAgent: new https.Agent({
        keepAlive: true,
        ca: fs.readFileSync(config.CA_CRT),
        cert: fs.readFileSync(config.CLIENT_CRT),
        key: fs.readFileSync(config.CLIENT_KEY),
        rejectUnauthorized: false, // TBD specify a checkServerIdentity fn
    }),
});

export default instance;

export function handleError(res, error) {
    const { response } = error || {};
    if (response) {
        const { data, status } = response || {};
        res.status(status).send(data);
    } else {
        const { code, message } = error || {};
        res.status(500).send({ code, message: `No response from API server: ${message}` });
    }
}

export function request(req, method, url, data) {
    const { headers = {} } = req || {};

    if (debugAuth) {
        const token = headers && headers['x-auth'] ? headers['x-auth'] : 'notoken';

        logMessage(`request account ${headers['x-account']} token ${abbreviatedToken(token)}`);
    }

    // const timeout = url.includes('auth') ? 10 * 1000 : 5 * 1000;
    const timeout = 60 * 1000;

    return instance.request({
        ...(data && { data }),
        headers: {
            ...(headers['x-auth'] && { 'X-Auth': headers['x-auth'] }),
            ...(headers['x-account'] && { 'X-Account': headers['x-account'] }),
        },
        method,
        url,
        timeout,
    });
}

export function send(res, response) {
    setToken(res, response);

    const { data, status } = response || {};

    if (status) {
        res.status(status);
    }

    return res.send(data);
}

export function setToken(res, response) {
    const { headers = {} } = response || {};
    const token = headers['x-auth'];

    if (debugAuth) {
        const account = headers['x-account'] ? headers['x-account'] : '';

        logMessage(`${res.req.url} setToken token ${account} ${abbreviatedToken(token)}`);
    }

    if (token) {
        res.set('X-Auth', token);
    }
}
