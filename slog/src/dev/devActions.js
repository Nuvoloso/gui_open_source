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

import { getErrorMsg } from '../components/utils';
import * as types from '../actions/types';

import * as constants from '../constants';

export function postCluster(name, cspDomainId) {
    return dispatch => {
        const params = {
            clusterType: constants.ORCHESTRATOR_TYPE_KUBERNETES,
            cspDomainId,
            clusterAttributes: {
                property1: {},
            },
            name,
        };

        return axios.post(`/${constants.URI_CLUSTERS}`, params).then(
            response => {
                const { name } = response.data || {};
                dispatch({ type: types.ADD_ALERT_MESSAGE, message: `Successfully created ${name || 'cluster'}` });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
            }
        );
    };
}

export function postNode(name, clusterId) {
    return dispatch => {
        const params = {
            clusterId,
            name,
            nodeIdentifier: name,
        };

        return axios.post(`/${constants.URI_NODES}`, params).then(
            response => {
                const { name } = response.data || {};
                dispatch({ type: types.ADD_ALERT_MESSAGE, message: `Successfully created ${name || 'node'}` });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
            }
        );
    };
}

export function patchNode(id, params) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            return axios.patch(`/${constants.URI_NODES}/${id}?set=${keys.join('&set=')}`, params).then(
                response => {
                    const { name } = response.data || {};
                    dispatch({ type: types.ADD_ALERT_MESSAGE, message: `Successfully updated ${name || 'node'}` });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                }
            );
        }
    };
}

export function deleteNode(id, name) {
    return dispatch => {
        return axios.delete(`/${constants.URI_NODES}/${id}`).then(
            () => {
                dispatch({ type: types.ADD_ALERT_MESSAGE, message: `Successfully deleted ${name || 'node'}` });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
            }
        );
    };
}
