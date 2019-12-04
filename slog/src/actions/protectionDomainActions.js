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
import { sessionGetAccount } from '../sessionUtils';

import * as constants from '../constants';

const apiUrl = `/${constants.URI_PROTECTION_DOMAINS}`;
const apiUrlMetadata = `/${constants.URI_PROTECTION_DOMAIN_METADATA}`;
const apiUrlAccounts = `/${constants.URI_ACCOUNTS}`;

export function getProtectionDomains() {
    return dispatch => {
        dispatch({ type: types.GET_PROTECTION_DOMAINS_REQUEST });
        return axios.get(apiUrl).then(
            response => {
                dispatch({ type: types.GET_PROTECTION_DOMAINS_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_PROTECTION_DOMAINS_FAILURE, error });
            }
        );
    };
}

export function getProtectionDomainMetadata() {
    return dispatch => {
        dispatch({ type: types.GET_PROTECTION_DOMAIN_METADATA_REQUEST });
        return axios.get(apiUrlMetadata).then(
            response => {
                dispatch({ type: types.GET_PROTECTION_DOMAIN_METADATA_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_PROTECTION_DOMAIN_METADATA_FAILURE, error });
            }
        );
    };
}

export function deleteProtectionDomains(protectionDomains) {
    return dispatch => {
        dispatch({ type: types.DELETE_PROTECTION_DOMAINS_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failedNames = [];

        for (let i = 0; i < protectionDomains.length; i++) {
            reqs.push(
                axios
                    .delete(`${apiUrl}/${protectionDomains[i].id}`, { protectionDomain: protectionDomains[i] })
                    .catch(error => {
                        failedNames.push({ name: protectionDomains[i].name, message: getErrorMsg(error) });
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
                            completedIds.push(args[j].config.protectionDomain.id);
                            dispatch({
                                type: types.REMOVE_SELECTED_ROW_PROTECTION_DOMAINS,
                                row: { id: args[j].config.protectionDomain.id },
                            });
                        } else {
                            failedNames.push({
                                name: args[j].config.protectionDomain.name,
                                message: `Error deleting protection domain ${status}`,
                            });
                        }
                    }
                }

                if (completedIds.length > 0) {
                    dispatch({ type: types.DELETE_PROTECTION_DOMAINS_SUCCESS, payload: { ids: completedIds } });

                    const message = `Successfully deleted protection ${completedIds.length > 1 ? 'domains' : 'domain'}`;

                    dispatch({ type: types.ADD_ALERT_MESSAGE, message });
                }
                if (failedNames.length > 0) {
                    const errorMessage = failedNames.map(name => {
                        return `Error deleting protection domain ${name.name}: ${name.message}`;
                    });
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: errorMessage });
                    dispatch({ type: types.DELETE_PROTECTION_DOMAINS_FAILURE, payload: { names: failedNames } });
                }
            })
        );
    };
}

export function patchProtectionDomain(id, params) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_PROTECTION_DOMAINS_REQUEST });
            return axios.patch(apiUrl.concat('/', id, '?set='.concat(keys.join('&set='))), params).then(
                response => {
                    dispatch({ type: types.REMOVE_SELECTED_ROW, row: { id } });
                    dispatch({
                        type: types.UPDATE_PROTECTION_DOMAINS_SUCCESS,
                        payload: {
                            ...response.data,
                        },
                    });

                    const { name } = response.data || {};
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully updated ${name || 'protection domain'}`,
                    });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                    dispatch({ type: types.UPDATE_PROTECTION_DOMAINS_FAILURE, error });
                }
            );
        }
    };
}

export function postProtectionDomain(params) {
    return dispatch => {
        dispatch({ type: types.POST_PROTECTION_DOMAINS_REQUEST });

        return axios.post(apiUrl, params).then(
            response => {
                dispatch({ type: types.POST_PROTECTION_DOMAINS_SUCCESS, payload: response.data });

                const { name } = response.data || {};
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'protectionDomain'}`,
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_PROTECTION_DOMAINS_FAILURE, error });
            }
        );
    };
}

export function postProtectionDomainSetActive(params) {
    const { cspDomainId } = params;
    return dispatch => {
        dispatch({ type: types.POST_PROTECTION_DOMAINS_REQUEST });

        return axios.post(apiUrl, params).then(
            response => {
                dispatch({ type: types.POST_PROTECTION_DOMAINS_SUCCESS, payload: response.data });

                const protectionDomain = response.data || {};
                const { meta, name } = protectionDomain || {};
                const { id } = meta || {};
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'protectionDomain'}`,
                });

                const accountId = sessionGetAccount();
                const params = {
                    cspDomainId,
                    protectionDomainId: id,
                };
                dispatch(postAccountProtectionDomainSet(accountId, params, protectionDomain));
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_PROTECTION_DOMAINS_FAILURE, error });
            }
        );
    };
}

function postAccountProtectionDomainSet(id, params, protectionDomain) {
    return dispatch => {
        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        dispatch({ type: types.POST_ACCOUNT_PROTECTION_DOMAIN_SET_REQUEST });
        const url = apiUrlAccounts.concat('/', id, '/protection-domains', querystr);
        return axios.post(url).then(
            response => {
                dispatch({
                    type: types.POST_ACCOUNT_PROTECTION_DOMAIN_SET_SUCCESS,
                    payload: response.data,
                    protectionDomain,
                });

                const { name } = response.data || {};
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully set protection for ${name || 'account'}`,
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_ACCOUNT_PROTECTION_DOMAIN_SET_FAILURE, error });
            }
        );
    };
}
