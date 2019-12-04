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

import * as types from './types';
import { validateStatus } from '../components/utils';

import * as constants from '../constants';

export function getPools() {
    return dispatch => {
        dispatch({ type: types.GET_POOLS_REQUEST });
        return axios.get(`/${constants.URI_POOLS}`).then(
            response => {
                dispatch({ type: types.GET_POOLS_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_POOLS_FAILURE, error });
            }
        );
    };
}

/**
 * postPool
 * @param {Object} params - params
 * @param {string} params.cspDomainId - cspDomainId
 * @param {string} params.cspStorageType - cspStorageType
 * @param {Object} params.storageAccessibility - storageAccessibility
 * @param {string} params.storageAccessibility.accessibilityScope - accessibilityScope
 * @param {string} params.storageAccessibility.accessibilityScopeObjId - accessibilityScopeObjId
 * @param {string} params.description - description
 * @param {boolean} params.disabled - disabled
 * @param {string} params.name - name
 * @param {Object} params.poolAttributes - poolAttributes
 * @param {string[]} params.tags - tags
 * @param {number} params.totalCapacityBytes - totalCapacityBytes
 */
export function postPool(params) {
    return dispatch => {
        dispatch({ type: types.POST_POOLS_REQUEST });
        return axios.post(`/${constants.URI_POOLS}`, params).then(
            response => {
                dispatch({
                    type: types.POST_POOLS_SUCCESS,
                    payload: {
                        ...response.data,
                        cspDomainName: params.cspDomainName,
                    },
                });

                const { name } = response.data || {};
                dispatch({ type: types.ADD_ALERT_MESSAGE, message: `Successfully created ${name || 'resource pool'}` });
            },
            error => {
                dispatch({ type: types.POST_POOLS_FAILURE, error });
            }
        );
    };
}

export function deletePools(pools) {
    return dispatch => {
        dispatch({ type: types.DELETE_POOLS_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failedNames = [];

        for (let i = 0; i < pools.length; i++) {
            reqs.push(
                axios
                    .delete(`/${constants.URI_POOLS}/${pools[i].id}`, {
                        pool: pools[i],
                    })
                    .catch(() => {
                        failedNames.push(pools[i].name);
                        return null;
                    })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        if (validateStatus(args[j].status)) {
                            completedIds.push(args[j].config.pool.id);
                            dispatch({
                                type: types.REMOVE_SELECTED_ROW,
                                row: { id: args[j].config.pool.id },
                            });
                        } else {
                            failedNames.push(args[j].config.pool.name);
                        }
                    }
                }

                if (completedIds.length > 0) {
                    dispatch({ type: types.DELETE_POOLS_SUCCESS, payload: { ids: completedIds } });

                    const message = `Successfully deleted resource ${completedIds.length > 1 ? 'pools' : 'pool'}`;

                    dispatch({ type: types.ADD_ALERT_MESSAGE, message });
                }
                if (failedNames.length > 0) {
                    dispatch({ type: types.DELETE_POOLS_FAILURE, payload: { names: failedNames } });
                }
            })
        );
    };
}

export function patchPool(id, cspDomainName, params) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_POOLS_REQUEST });
            return axios
                .patch(`/${constants.URI_POOLS}`.concat('/', id, '?set='.concat(keys.join('&set='))), params)
                .then(
                    response => {
                        dispatch({ type: types.REMOVE_SELECTED_ROW, row: { id } });
                        dispatch({
                            type: types.UPDATE_POOLS_SUCCESS,
                            payload: {
                                ...response.data,
                                cspDomainName,
                            },
                        });

                        const { name } = response.data || {};
                        dispatch({
                            type: types.ADD_ALERT_MESSAGE,
                            message: `Successfully updated ${name || 'resource pool'}`,
                        });
                    },
                    error => {
                        dispatch({ type: types.UPDATE_POOLS_FAILURE, error });
                    }
                );
        }
    };
}

export function getResourceUtilization(ids) {
    return dispatch => {
        dispatch({ type: types.GET_RESOURCE_UTILIZATION_REQUEST });

        const query = `id=${ids.join('&id=')}`;

        return axios.get(`/metrics/storageprovisioners/countbyperiod?${query}`).then(
            response => {
                dispatch({ type: types.GET_RESOURCE_UTILIZATION_SUCCESS, ids, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_RESOURCE_UTILIZATION_FAILURE, ids, error });
            }
        );
    };
}

export function clearResourceUtilization() {
    return dispatch => {
        dispatch({ type: types.INVALIDATE_RESOURCE_UTILIZATION });
    };
}
