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
import { getErrorMsg } from '../components/utils';

const constants = require('../constants');
const apiUrl = `/${constants.URI_CONSISTENCY_GROUPS}`;

export function getCGs() {
    return dispatch => {
        dispatch({ type: types.GET_CG_REQUEST });
        return axios.get(apiUrl).then(
            response => {
                dispatch({ type: types.GET_CG_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_CG_FAILURE, error });
            }
        );
    };
}

export function postCG(name, applicationGroupIds, description, tags = []) {
    return dispatch => {
        dispatch({ type: types.POST_CG_REQUEST });

        const params = {
            applicationGroupIds,
            description,
            name,
            ...(tags.length > 0 && { tags }),
        };

        return axios.post(apiUrl, params).then(
            response => {
                dispatch({ type: types.POST_CG_SUCCESS, payload: response.data });

                const { name } = response.data || {};
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'consistency group'}`,
                });
            },
            error => {
                dispatch({ type: types.POST_CG_FAILURE, error });
            }
        );
    };
}

export function deleteCG(cgs) {
    return dispatch => {
        dispatch({ type: types.DELETE_CG_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failedNames = [];

        for (let i = 0; i < cgs.length; i++) {
            reqs.push(
                axios.delete(`${apiUrl}/${cgs[i].id}`, { cg: cgs[i] }).catch(err => {
                    failedNames.push(`${cgs[i].name}: ${getErrorMsg(err)}`);
                })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        if (validateStatus(args[j].status)) {
                            completedIds.push(args[j].config.cg.id);
                            dispatch({
                                type: types.REMOVE_SELECTED_ROW_CONSISTENCY_GROUPS_TABLE,
                                row: { id: args[j].config.cg.id },
                            });
                        } else {
                            failedNames.push(args[j].config.cg.name);
                        }
                    }
                }

                if (completedIds.length > 0) {
                    dispatch({ type: types.DELETE_CG_SUCCESS, payload: { ids: completedIds } });
                }
                if (failedNames.length > 0) {
                    dispatch({ type: types.DELETE_CG_FAILURE, payload: { names: failedNames } });
                }
            })
        );
    };
}

export function patchCG(id, params) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_CG_REQUEST });
            return axios.patch(apiUrl.concat('/', id, '?set='.concat(keys.join('&set='))), params).then(
                response => {
                    dispatch({ type: types.REMOVE_SELECTED_ROW_CONSISTENCY_GROUPS_TABLE, row: { id } });
                    dispatch({ type: types.UPDATE_CG_SUCCESS, payload: response.data });

                    const { name } = response.data || {};
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully updated ${name || 'consistency group'}`,
                    });
                },
                error => {
                    dispatch({ type: types.UPDATE_CG_FAILURE, error });
                }
            );
        }
    };
}
