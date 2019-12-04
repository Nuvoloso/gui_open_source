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

import * as constants from '../../constants';

const apiProtectionDomains = `${config.API_URL}/${constants.URI_PROTECTION_DOMAINS}`;
const apiProtectionDomainMetadata = `${config.API_URL}/${constants.URI_PROTECTION_DOMAIN_METADATA}`;

module.exports = function(app) {
    app.get([`/${constants.URI_PROTECTION_DOMAINS}`, `/${constants.URI_PROTECTION_DOMAINS}/:id`], (req, res) => {
        const { id } = req.params || {};
        const url = id ? `${apiProtectionDomains}/${id}` : apiProtectionDomains;
        const { authIdentifier } = req.query || {};
        const reqUrl = authIdentifier ? `${url}?authIdentifier=${authIdentifier}` : url;
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

    app.post(`/${constants.URI_PROTECTION_DOMAINS}`, (req, res) => {
        request(req, 'post', apiProtectionDomains, req.body)
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
    app.delete(`/${constants.URI_PROTECTION_DOMAINS}/:id`, (req, res) => {
        const url = `${apiProtectionDomains}/${req.params.id}`;
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
    app.patch(`/${constants.URI_PROTECTION_DOMAINS}/:id`, (req, res) => {
        const { set = [] } = req.query || {};
        const url = `${apiProtectionDomains}/${req.params.id}?set=${Array.isArray(set) ? set.join('&set=') : set}`;
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

    app.get([`/${constants.URI_PROTECTION_DOMAIN_METADATA}`], (req, res) => {
        request(req, 'get', apiProtectionDomainMetadata)
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
