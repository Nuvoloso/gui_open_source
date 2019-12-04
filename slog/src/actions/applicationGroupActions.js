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

const constants = require('../constants');
const apiUrl = `/${constants.URI_APPLICATION_GROUPS}`;

export function getAGs() {
    return dispatch => {
        dispatch({ type: types.GET_AG_REQUEST });
        return axios.get(apiUrl).then(
            response => {
                dispatch({ type: types.GET_AG_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_AG_FAILURE, error });
            }
        );
    };
}

export function postAG(name, description, tags = []) {
    return dispatch => {
        dispatch({ type: types.POST_AG_REQUEST });

        const params = {
            name,
            ...(tags.length > 0 && { tags }),
            description,
        };

        return axios.post(apiUrl, params).then(
            response => {
                dispatch({ type: types.POST_AG_SUCCESS, payload: response.data });

                const { name } = response.data || {};
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'application group'}`,
                });
            },
            error => {
                dispatch({ type: types.POST_AG_FAILURE, error });
            }
        );
    };
}

export function deleteAG(ags) {
    return dispatch => {
        dispatch({ type: types.DELETE_AG_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failedNames = [];

        for (let i = 0; i < ags.length; i++) {
            reqs.push(
                axios.delete(`${apiUrl}/${ags[i].id}`, { ag: ags[i] }).catch(() => {
                    failedNames.push(ags[i].name);
                })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        if (validateStatus(args[j].status)) {
                            completedIds.push(args[j].config.ag.id);
                            dispatch({
                                type: types.REMOVE_SELECTED_ROW_APPLICATION_GROUPS_TABLE,
                                row: { id: args[j].config.ag.id },
                            });
                        } else {
                            failedNames.push(args[j].config.ag.name);
                        }
                    }
                }

                if (completedIds.length > 0) {
                    dispatch({ type: types.DELETE_AG_SUCCESS, payload: { ids: completedIds } });
                }
                if (failedNames.length > 0) {
                    dispatch({ type: types.DELETE_AG_FAILURE, payload: { names: failedNames } });
                }
            })
        );
    };
}

export function patchAG(id, params) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_AG_REQUEST });
            return axios.patch(apiUrl.concat('/', id, '?set='.concat(keys.join('&set='))), params).then(
                response => {
                    dispatch({ type: types.REMOVE_SELECTED_ROW_APPLICATION_GROUPS_TABLE, row: { id } });
                    dispatch({ type: types.UPDATE_AG_SUCCESS, payload: response.data });

                    const { name } = response.data || {};
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully updated ${name || 'application group'}`,
                    });
                },
                error => {
                    dispatch({ type: types.UPDATE_AG_FAILURE, error });
                }
            );
        }
    };
}
