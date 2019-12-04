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

import * as constants from '../constants';
import * as types from './types';

const apiUrl = `/${constants.URI_SERVICE_PLANS}`;

export function getServicePlans(cspDomainId) {
    return dispatch => {
        dispatch({ type: types.GET_SERVICE_PLANS_REQUEST });
        const requrl = cspDomainId ? `${apiUrl}?cspDomainId=${cspDomainId}` : apiUrl;
        return axios.get(requrl).then(
            response => {
                dispatch({ type: types.GET_SERVICE_PLANS_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_SERVICE_PLANS_FAILURE, error });
            }
        );
    };
}

export function deleteServicePlans(servicePlans) {
    return dispatch => {
        dispatch({ type: types.DELETE_SERVICE_PLANS_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failed = [];

        for (let i = 0; i < servicePlans.length; i++) {
            reqs.push(
                axios
                    .delete(`${apiUrl}/${servicePlans[i].id}`, {
                        servicePlan: servicePlans[i],
                    })
                    .catch(error => {
                        const { response } = error;
                        const { data } = response || {};
                        const { message } = data || {};
                        failed.push({
                            servicePlan: servicePlans[i],
                            error: message || error,
                        });
                    })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        if (validateStatus(args[j].status)) {
                            completedIds.push(args[j].config.servicePlan.id);
                            dispatch({ type: types.REMOVE_SELECTED_ROW, row: { id: args[j].config.servicePlan.id } });
                        } else {
                            failed.push({
                                servicePlan: args[j].config.servicePlan,
                                error: args[j].statusText,
                            });
                        }
                    }
                }

                if (completedIds.length > 0) {
                    dispatch({ type: types.DELETE_SERVICE_PLANS_SUCCESS, payload: { ids: completedIds } });

                    const message = `Successfully deleted service ${completedIds.length > 1 ? 'plans' : 'plan'}`;

                    dispatch({ type: types.ADD_ALERT_MESSAGE, message });
                }
                if (failed.length > 0) {
                    dispatch({ type: types.DELETE_SERVICE_PLANS_FAILURE, payload: { failed } });
                }
            })
        );
    };
}

export function patchServicePlan(id, params) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_SERVICE_PLANS_REQUEST });
            return axios.patch(apiUrl.concat(id, '?set='.concat(keys.join('&set='))), params).then(
                response => {
                    const servicePlan = response.data || {};

                    dispatch({ type: types.UPDATE_SERVICE_PLANS_SUCCESS, payload: servicePlan });
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully updated ${servicePlan.name || 'service plan'}`,
                    });
                    dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS });
                },
                error => {
                    dispatch({ type: types.UPDATE_SERVICE_PLANS_FAILURE, payload: { error } });
                }
            );
        }
    };
}
