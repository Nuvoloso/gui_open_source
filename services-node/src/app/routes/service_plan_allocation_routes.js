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
import { API_URL } from '../../config';

import axios from 'axios';

import { getErrorMessage, logMessage } from '../../utils';

import * as constants from '../../constants';

const url = `/${constants.URI_SERVICE_PLAN_ALLOCATIONS}`;
const apiServicePlanAllocations = `${API_URL}/${constants.URI_SERVICE_PLAN_ALLOCATIONS}`;
const apiCspDomain = `${API_URL}/${constants.URI_CSP_DOMAINS}`;

module.exports = function(app) {
    app.get([url, `${url}/:id`], (req, res) => {
        const { id } = req.params || {};
        const { clusterId: queryClusterId } = req.query || {};
        const reqUrl = id ? `${apiServicePlanAllocations}/${id}` : apiServicePlanAllocations;
        request(req, 'get', reqUrl)
            .then(response => {
                    const { data = [] } = response || {};
                    const servicePlanAllocations = id ? [data] : data;

                    if (servicePlanAllocations.length < 1) {
                        send(res, response);
                        return;
                    }

                    const requests = [];
                    const requestedSpas = [];

                    servicePlanAllocations.forEach(allocation => {
                        const { clusterId, cspDomainId, servicePlanId } = allocation || {};

                        if (
                            !queryClusterId ||
                            (queryClusterId === clusterId &&
                                !requestedSpas.find(spa => spa.cspDomainId === cspDomainId && spa.servicePlanId === servicePlanId))
                        ) {
                            requests.push(request(req,
                                    'get',
                                    `${apiCspDomain}/${cspDomainId}/service-plan-cost/?servicePlanId=${servicePlanId}`,
                                    {
                                        servicePlanId,
                                    }).catch(e =>
                                    logMessage('Cannot retrieve storage costs for service plan in the domain',
                                        getErrorMessage(e))));
                            requestedSpas.push(allocation);
                        }
                    });

                    axios.all(requests).then(axios.spread((...args) => {
                            args.forEach(arg => {
                                if (arg && arg.status === 200) {
                                    let config = {};
                                    if (arg.config && arg.config.data) {
                                        config = JSON.parse(arg.config.data);
                                    }
                                    const { servicePlanId } = config || {};
                                    servicePlanAllocations.forEach(allocation => {
                                        const { costPerGiB } = arg.data || {};
                                        if (allocation.servicePlanId === servicePlanId) {
                                            allocation.costPerGiB = costPerGiB;
                                        }
                                    });
                                }
                            });
                            const headers =
                                args && args.length > 0 && args[args.length - 1] && args[args.length - 1].headers
                                    ? args[args.length - 1].headers
                                    : {};
                            send(res, {
                                data: id ? servicePlanAllocations[0] : servicePlanAllocations,
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
    app.patch(`${url}/:id`, (req, res) => {
        const { set = [] } = req.query || {};
        const url = `${apiServicePlanAllocations}/${req.params.id}?set=${Array.isArray(set) ? set.join('&set=') : set}`;
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
    app.delete(`${url}/:id`, (req, res) => {
        const url = `${apiServicePlanAllocations}/${req.params.id}`;
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
};
