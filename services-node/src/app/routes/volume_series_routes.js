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

import * as constants from '../../constants';

const url = `/${constants.URI_VOLUME_SERIES}`;
const reqUrl = `/${constants.URI_VOLUME_SERIES_REQUESTS}`;

const apiAccounts = `${config.API_URL}/${constants.URI_ACCOUNTS}`;

const apiConsistencyGroups = `${config.API_URL}/${constants.URI_CONSISTENCY_GROUPS}`;
const apiServicePlans = `${config.API_URL}/${constants.URI_SERVICE_PLANS}`;
const apiVolumeSeries = config.API_URL.concat(url);
const apiVolumeSeriesRequests = `${config.API_URL}/${constants.URI_VOLUME_SERIES_REQUESTS}`;

module.exports = function(app) {
    app.get([url, `${url}/:id`], (req, res) => {
        const { id } = req.params || {};
        const reqUrl = id ? `${apiVolumeSeries}/${id}` : apiVolumeSeries;

        request(req, 'get', reqUrl)
            .then(response => {
                send(res, response);
            })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.get(`${url}/:id/:action`, (req, res) => {
        const { id, action } = req.params || {};
        const reqUrl = `${apiVolumeSeries}/${id}/${action}`;
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
        request(req, 'post', apiVolumeSeries, req.body)
            .then(response => {
                const volumeSeries = response.data;
                const requests = [];
                requests.push(request(req, 'get', `${apiAccounts}/${volumeSeries.accountId}`).catch(e =>
                        logMessage(e.response.data)),
                    request(req, 'get', `${apiServicePlans}/${volumeSeries.servicePlanId}`).catch(e =>
                        logMessage(e.response.data)));
                axios.all(requests).then(axios.spread((...args) => {
                        args.forEach(arg => {
                            if (arg) {
                                const { meta, name } = arg.data || {};
                                const { id, objType } = meta || {};
                                if (objType === constants.OBJ_ACCOUNT && volumeSeries.accountId === id) {
                                    volumeSeries['accountName'] = name;
                                }
                                if (objType === constants.OBJ_SERVICE_PLAN && volumeSeries.servicePlanId === id) {
                                    volumeSeries['servicePlanName'] = name;
                                }
                            }
                        });

                        send(res, { data: volumeSeries, headers: args[args.length - 1].headers });
                    }));
            })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.delete(`${url}/:id`, (req, res) => {
        const url = apiVolumeSeries.concat('/', req.params.id);
        request(req, 'delete', url)
            .then(response => {
                send(res, response);
            })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.patch(`${url}/:id`, (req, res) => {
        const { set = [] } = req.query || {};
        const url = apiVolumeSeries.concat('/', req.params.id, '?set=', Array.isArray(set) ? set.join('&set=') : set);
        request(req, 'patch', url, req.body)
            .then(response => {
                const volumeSeries = response.data;
                const requests = [];
                requests.push(request(req, 'get', `${apiAccounts}/${volumeSeries.accountId}`).catch(e =>
                        logMessage(e.response.data)),
                    request(req, 'get', `${apiServicePlans}/${volumeSeries.servicePlanId}`).catch(e =>
                        logMessage(e.response.data)),
                    request(req, 'get', `${apiConsistencyGroups}/${volumeSeries.consistencyGroupId}`).catch(e =>
                        logMessage(e.response.data)));
                axios.all(requests).then(axios.spread((...args) => {
                        args.forEach(arg => {
                            if (arg) {
                                const { meta, name } = arg.data || {};
                                const { id, objType } = meta || {};
                                if (objType === constants.OBJ_ACCOUNT && volumeSeries.accountId === id) {
                                    volumeSeries['accountName'] = name;
                                }
                                if (objType === constants.OBJ_SERVICE_PLAN && volumeSeries.servicePlanId === id) {
                                    volumeSeries['servicePlanName'] = name;
                                }
                                if (
                                    objType === constants.OBJ_CONSISTENCY_GROUP &&
                                    volumeSeries.consistencyGroupId === id
                                ) {
                                    volumeSeries['consistencyGroupName'] = name;
                                }
                            }
                        });

                        send(res, { data: volumeSeries, headers: args[args.length - 1].headers });
                    }));
            })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.get([reqUrl, `${reqUrl}/:id`], (req, res) => {
        const { id } = req.params || {};
        const url = id ? `${apiVolumeSeriesRequests}/${id}` : apiVolumeSeriesRequests;
        const reqUrl = `${url}?${Object.keys(req.query)
            .map(k => k + '=' + req.query[k])
            .join('&')}`;
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
    app.post([reqUrl, `${reqUrl}/:id/:action`], (req, res) => {
        const { id, action } = req.params || {};
        const reqUrl = id && action ? `${apiVolumeSeriesRequests}/${id}/${action}` : apiVolumeSeriesRequests;
        request(req, 'post', reqUrl, req.body)
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
