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
import moment from 'moment';

import { validateStatus } from '../components/utils';
import { spaTagGenCost } from '../containers/spaUtils';

import * as constants from '../constants';
import * as types from './types';

const apiUrl = `/${constants.URI_SERVICE_PLAN_ALLOCATIONS}`;
const reqUrl = `/${constants.URI_VOLUME_SERIES_REQUESTS}`;

export function getServicePlanAllocations(clusterId) {
    return dispatch => {
        dispatch({ type: types.GET_SPA_REQUEST });
        const requrl = clusterId ? `${apiUrl}?clusterId=${clusterId}` : apiUrl;
        return axios.get(requrl).then(
            response => {
                dispatch({ type: types.GET_SPA_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_SPA_FAILURE, error });
            }
        );
    };
}

/**
 *
 * @param {String} accountId ID of account requesting the service plan allocations
 * @param {String} servicePlanId ID of service plan
 * @param {Array} spas array of objects describing the allocation needed { authorizedAccountId, clusterId, totalCapacityBytes }
 */
export function postServicePlanAllocations(accountId, servicePlanId, spas) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
            .format();
        const requestedOperations = ['ALLOCATE_CAPACITY'];

        const reqs = [];
        const completedIds = [];
        const failed = [];

        spas.forEach(spa => {
            const { authorizedAccountId, clusterId, cost, totalCapacityBytes } = spa || {};
            const tags = [spaTagGenCost(cost)];
            const servicePlanAllocationCreateSpec = {
                accountId,
                authorizedAccountId,
                clusterId,
                servicePlanId,
                tags,
                totalCapacityBytes,
            };
            reqs.push(
                axios
                    .post(
                        reqUrl,
                        {
                            completeByTime,
                            requestedOperations,
                            servicePlanAllocationCreateSpec,
                        },
                        {
                            servicePlanAllocationCreateSpec,
                        }
                    )
                    .catch(error => {
                        const { response } = error;
                        const { data } = response || {};
                        const { message } = data || {};
                        failed.push({
                            servicePlanAllocationCreateSpec,
                            error: message || error,
                        });
                    })
            );
        });

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        const { config } = args[j] || {};
                        const { servicePlanAllocationCreateSpec } = config || {};
                        const { authorizedAccountId } = servicePlanAllocationCreateSpec || {};
                        if (validateStatus(args[j].status)) {
                            completedIds.push(authorizedAccountId);
                        } else {
                            failed.push({
                                servicePlanAllocationCreateSpec,
                                error: args[j].statusText,
                            });
                        }
                    }
                }
                if (completedIds.length > 0) {
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully updated ${completedIds.length > 1 ? 'pools' : 'pool'}`,
                    });
                }
                if (failed.length > 0) {
                    const errorMessage = failed.map(e => {
                        const { error, servicePlanAllocationCreateSpec } = e;
                        const { message } = error || {};
                        const { authorizedAccountId } = servicePlanAllocationCreateSpec || {};
                        return `Error requesting ${requestedOperations.join(' and ')} for ${authorizedAccountId ||
                            'account'}: ${message || error}`;
                    });

                    dispatch({
                        type: types.POST_SPA_FAILURE,
                        error: {
                            message: errorMessage,
                        },
                    });
                    dispatch({
                        type: types.ADD_ERROR_MESSAGE,
                        message: errorMessage,
                    });
                }
                dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS });
            })
        );
    };
}

export function patchServicePlanAllocations(id, params) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_SPA_REQUEST });
            return axios.patch(`${apiUrl}/${id}?set=${keys.join('&set=')}`, params).then(
                response => {
                    const spa = response.data || {};

                    dispatch({ type: types.UPDATE_SPA_SUCCESS, payload: spa });
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: 'Successfully updated pool',
                    });
                    dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS });
                },
                error => {
                    dispatch({ type: types.UPDATE_SPA_FAILURE, payload: { error } });
                }
            );
        }
    };
}

export function deleteServicePlanAllocations(ids = []) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
            .format();
        const requestedOperations = ['DELETE_SPA'];

        const reqs = [];
        const completedIds = [];
        const failed = [];

        ids.forEach(servicePlanAllocationId => {
            reqs.push(
                axios
                    .post(
                        reqUrl,
                        {
                            completeByTime,
                            requestedOperations,
                            servicePlanAllocationId,
                        },
                        {
                            servicePlanAllocationId,
                        }
                    )
                    .catch(error => {
                        const { response } = error;
                        const { data } = response || {};
                        const { message } = data || {};
                        failed.push({
                            servicePlanAllocationId,
                            error: message || error,
                        });
                    })
            );
        });

        return axios.all(reqs).then(
            axios.spread((...args) => {
                args.forEach(arg => {
                    const { config, status, statusText } = arg || {};
                    const { servicePlanAllocationId } = config || {};

                    if (validateStatus(status)) {
                        completedIds.push(servicePlanAllocationId);
                    } else {
                        failed.push({
                            error: statusText,
                            servicePlanAllocationId,
                        });
                    }
                });
                if (failed.length > 0) {
                    dispatch({
                        type: types.DELETE_SPAS_FAILURE,
                        error: {
                            message: failed.map(e => {
                                const { error } = e;
                                const { message } = error || {};

                                return `Error requesting ${requestedOperations.join(' and ')}: ${message || error}`;
                            }),
                        },
                    });
                }
            })
        );
    };
}
