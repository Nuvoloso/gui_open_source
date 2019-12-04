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

import { validateStatus } from '../components/utils';
import { getErrorMsg } from '../components/utils';

import * as constants from '../constants';
import * as types from './types';

const apiUrl = `/${constants.URI_CLUSTERS}`;

export function getClusters() {
    return dispatch => {
        dispatch({ type: types.GET_CLUSTERS_REQUEST });
        return axios.get(apiUrl).then(
            response => {
                dispatch({ type: types.GET_CLUSTERS_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_CLUSTERS_FAILURE, error });
            }
        );
    };
}

export function deleteClusters(clusters) {
    return dispatch => {
        dispatch({ type: types.DELETE_CLUSTERS_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failedNames = [];

        for (let i = 0; i < clusters.length; i++) {
            reqs.push(
                axios.delete(`${apiUrl}/${clusters[i].id}`, { cluster: clusters[i] }).catch(error => {
                    failedNames.push({ name: clusters[i].name, message: getErrorMsg(error) });
                    return null;
                })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        const { status } = args[j];
                        if (validateStatus(status)) {
                            completedIds.push(args[j].config.cluster.id);
                            dispatch({ type: types.REMOVE_SELECTED_ROW, row: { id: args[j].config.cluster.id } });
                        } else {
                            failedNames.push({
                                name: args[j].config.cluster.name,
                                message: `Error deleting cluster ${status}`,
                            });
                        }
                    }
                }

                if (completedIds.length > 0) {
                    dispatch({ type: types.DELETE_CLUSTERS_SUCCESS, payload: { ids: completedIds } });

                    const message = `Successfully deleted ${completedIds.length > 1 ? 'clusters' : 'cluster'}`;

                    dispatch({ type: types.ADD_ALERT_MESSAGE, message });
                }
                if (failedNames.length > 0) {
                    const errorMessage = failedNames.map(name => {
                        return `Error deleting cluster ${name.name}: ${name.message}`;
                    });
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: errorMessage });
                    dispatch({ type: types.DELETE_CLUSTERS_FAILURE, payload: { names: failedNames } });
                }
            })
        );
    };
}

export function patchCluster(id, cspDomainName, params) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_CLUSTERS_REQUEST });
            return axios.patch(apiUrl.concat('/', id, '?set='.concat(keys.join('&set='))), params).then(
                response => {
                    dispatch({ type: types.REMOVE_SELECTED_ROW, row: { id } });
                    dispatch({
                        type: types.UPDATE_CLUSTERS_SUCCESS,
                        payload: {
                            ...response.data,
                            cspDomainName,
                        },
                    });

                    const { name } = response.data || {};
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully updated ${name || 'cluster'}`,
                    });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                    dispatch({ type: types.UPDATE_CLUSTERS_FAILURE, error });
                }
            );
        }
    };
}

export function getClusterAccountSecret(id, authorizedAccountId) {
    return dispatch => {
        dispatch({ type: types.GET_CLUSTERS_ACCOUNT_SECRET_REQUEST });

        if (!id || !authorizedAccountId) {
            return dispatch({
                type: types.GET_CLUSTERS_ACCOUNT_SECRET_FAILURE,
                error: 'Missing cluster ID and/or authorized account ID',
            });
        }

        return axios.get(`${apiUrl}/${id}/account-secret?authorizedAccountId=${authorizedAccountId}`).then(
            response => {
                const { data } = response || {};
                const { value = '' } = data || {};
                dispatch({ type: types.GET_CLUSTERS_ACCOUNT_SECRET_SUCCESS, payload: value });
            },
            error => {
                dispatch({ type: types.GET_CLUSTERS_ACCOUNT_SECRET_FAILURE, error });
            }
        );
    };
}

export function postCluster(params) {
    return dispatch => {
        dispatch({ type: types.POST_CLUSTER_REQUEST });

        return axios.post(apiUrl, params).then(
            response => {
                dispatch({ type: types.POST_CLUSTER_SUCCESS, payload: response.data });

                const { name } = response.data || {};
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'cluster'}`,
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_CLUSTER_FAILURE, error });
            }
        );
    };
}

export function getOrchestratorDeployment(id) {
    return dispatch => {
        dispatch({ type: types.GET_ORCHESTRATOR_DEPLOYMENT_REQUEST });
        return axios.get(apiUrl.concat('/', id).concat('/orchestrator')).then(
            response => {
                dispatch({ type: types.GET_ORCHESTRATOR_DEPLOYMENT_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_ORCHESTRATOR_DEPLOYMENT_FAILURE, error });
            }
        );
    };
}
