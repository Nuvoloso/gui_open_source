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

import { handleError, request, send } from '../../instance';
import { getErrorMessage, logMessage } from '../../utils';

import { API_URL } from '../../config';

import * as constants from '../../constants';

const url = `/${constants.URI_SERVICE_PLANS}`;
const apiServicePlans = `${API_URL}/${constants.URI_SERVICE_PLANS}`;
const apiCspDomain = `${API_URL}/${constants.URI_CSP_DOMAINS}`;

module.exports = function(app) {
    app.get([url, `${url}/:id`], (req, res) => {
        const { id } = req.params || {};
        const { cspDomainId } = req.query || {};
        const reqUrl = id ? `${apiServicePlans}/${id}` : apiServicePlans;
        request(req, 'get', reqUrl)
            .then(response => {
                    /**
                     * Only fetch cost details if the cspDomainId was given.
                     */
                    if (!cspDomainId) {
                        send(res, response);
                        return;
                    }

                    const servicePlans = response.data;
                    if (servicePlans.length < 1) {
                        send(res, response);
                        return;
                    }

                    const requests = [];

                    servicePlans.forEach(servicePlan => {
                        const { meta } = servicePlan;
                        const { id } = meta;
                        requests.push(request(req,
                                'get',
                                `${apiCspDomain}/${cspDomainId}/service-plan-cost/?servicePlanId=${id}`,
                                {
                                    servicePlanId: id,
                                }).catch(e =>
                                logMessage('Cannot retrieve storage costs for service plan in the domain',
                                    getErrorMessage(e))));
                    });

                    axios.all(requests).then(axios.spread((...args) => {
                            args.forEach(arg => {
                                if (arg && arg.status === 200) {
                                    let config = {};
                                    if (arg.config && arg.config.data) {
                                        config = JSON.parse(arg.config.data);
                                    }
                                    const { servicePlanId } = config || {};
                                    servicePlans.forEach(servicePlan => {
                                        const { costPerGiB } = arg.data || {};
                                        const { meta } = servicePlan;
                                        const { id } = meta;
                                        if (servicePlanId === id) {
                                            servicePlan.costPerGiB = costPerGiB;
                                        }
                                    });
                                }
                            });
                            const headers =
                                args && args.length > 0 && args[args.length - 1] && args[args.length - 1].headers
                                    ? args[args.length - 1].headers
                                    : {};
                            send(res, {
                                data: servicePlans,
                                headers,
                            });
                        }));
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });

    app.post(`${url}/:id/clone`, (req, res) => {
        const url = apiServicePlans.concat('/', req.params.id, '/clone');
        const params = {
            name: req.body.name,
        };
        request(req, 'post', url, params)
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

    app.post(`${url}/:id/:action`, (req, res) => {
        const url = apiServicePlans.concat('/', req.params.id, '/', req.params.action, '?version=', req.query.version);
        request(req, 'post', url)
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
        const url = apiServicePlans.concat('/', req.params.id);
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
        const url = apiServicePlans.concat('/', req.params.id, '?set=', Array.isArray(set) ? set.join('&set=') : set);
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
};
