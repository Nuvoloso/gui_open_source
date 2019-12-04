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

import * as constants from '../../constants';

const config = require('../../config');

const url = `/${constants.URI_ACCOUNTS}`;
const apiAccounts = config.API_URL.concat(url);

module.exports = function(app) {
    app.get(`${url}/:id`, (req, res) => {
        const { id } = req.params || {};
        request(req, 'get', `${apiAccounts}/${id}`)
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
    app.get(url, (req, res) => {
        const { userId } = req.query || {};
        const reqUrl = userId ? `${apiAccounts}?userId=${userId}` : apiAccounts;
        request(req, 'get', reqUrl)
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
    app.post(url, (req, res) => {
        request(req, 'post', apiAccounts, req.body)
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
    app.delete(`${url}/:id`, (req, res) => {
        const url = `${apiAccounts}/${req.params.id}`;
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
    app.patch(`${url}/:id`, (req, res) => {
        const { set = [] } = req.query || {};
        const url = `${apiAccounts}/${req.params.id}?set=${Array.isArray(set) ? set.join('&set=') : set}`;
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
    app.post(`${url}/:id/protection-domains`, (req, res) => {
        const { query = [] } = req || {};
        const querystr =
            '?' +
            Object.keys(query)
                .map(k => k + '=' + query[k])
                .join('&');
        const url = `${apiAccounts}/${req.params.id}/protection-domains${querystr}`;

        request(req, 'post', url, req.body)
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
};
