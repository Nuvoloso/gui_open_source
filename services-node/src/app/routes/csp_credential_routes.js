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

const config = require('../../config');
const constants = require('../../constants');
const url = `/${constants.URI_CSP_CREDENTIALS}`;
const apiCspCredentials = config.API_URL.concat(url);

const urlMetadata = `/${constants.URI_CSP_CREDENTITAL_METADATA}`;
const apiMetadata = config.API_URL.concat(urlMetadata);

module.exports = function(app) {
    app.get([url, `${url}/:id`], (req, res) => {
        const { params } = req || {};
        const { id } = params || {};
        const reqUrl = id ? `${apiCspCredentials}/${id}` : apiCspCredentials;
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
        const { body } = req || {};
        request(req, 'post', apiCspCredentials, body)
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
        const { params } = req || {};
        const { id } = params || {};
        const url = `${apiCspCredentials}/${id}`;
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
        const { body, params, query } = req || {};
        const { id } = params || {};
        const { set = [] } = query || {};
        const url = `${apiCspCredentials}/${id}?set=${Array.isArray(set) ? set.join('&set=') : set}`;
        request(req, 'patch', url, body)
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
    app.get(`${urlMetadata}/:cspDomainType`, (req, res) => {
        const { cspDomainType } = req.params || {};
        const reqUrl = `${apiMetadata}/${cspDomainType}`;
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
};
