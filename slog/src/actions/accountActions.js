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
import { deleteUsers, getUser } from './userActions';

import * as constants from '../constants';
import * as types from './types';

const apiUrl = `/${constants.URI_ACCOUNTS}`;

export function getAccounts(userId) {
    return dispatch => {
        dispatch({ type: types.GET_ACCOUNTS_REQUEST });
        const requrl = userId ? `${apiUrl}?userId=${userId}` : apiUrl;
        return axios.get(requrl).then(
            response => {
                dispatch({ type: types.GET_ACCOUNTS_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_ACCOUNTS_FAILURE, error });
            }
        );
    };
}

export function postAccount(name, userRoles, description, tags, disabled, authIdentifier, tenantAccountId) {
    return dispatch => {
        dispatch({ type: types.POST_ACCOUNTS_REQUEST });

        const params = {
            tenantAccountId,
            name,
            ...(Object.keys(userRoles).length > 0 && { userRoles }),
            ...(description.length > 0 && { description }),
            ...(tags.length > 0 && { tags }),
            ...(disabled && { disabled }),
        };

        return axios.post(apiUrl, params).then(
            response => {
                dispatch({ type: types.POST_ACCOUNTS_SUCCESS, payload: response.data });

                const { name } = response.data || {};
                dispatch({ type: types.ADD_ALERT_MESSAGE, message: `Successfully created ${name || 'account'}` });
                dispatch(getUser(authIdentifier, false));
            },
            error => {
                dispatch({ type: types.POST_ACCOUNTS_FAILURE, error });
            }
        );
    };
}

export function deleteAccounts(accounts, authIdentifier) {
    return dispatch => {
        dispatch({ type: types.DELETE_ACCOUNTS_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failedDeletes = [];

        for (let i = 0; i < accounts.length; i++) {
            reqs.push(
                axios.delete(`${apiUrl}/${accounts[i].id}`, { account: accounts[i] }).catch(err => {
                    failedDeletes.push({ name: accounts[i].name, message: err.response.data.message });
                })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        const { config, status } = args[j] || {};
                        const { account } = config || {};
                        const { id, name } = account || {};

                        if (validateStatus(status)) {
                            completedIds.push(id);
                            dispatch({
                                type: `${types.REMOVE_SELECTED_ROW}_ACCOUNTS_TABLE`,
                                row: { id },
                            });
                        } else {
                            failedDeletes.push({ name, message: '' });
                        }
                    }
                }

                if (completedIds.length > 0) {
                    const message = `Successfully deleted ${completedIds.length > 1 ? 'accounts' : 'account'}`;

                    dispatch({ type: types.ADD_ALERT_MESSAGE, message });
                    dispatch(getUser(authIdentifier, false));
                }
                if (failedDeletes.length > 0) {
                    dispatch({ type: types.DELETE_ACCOUNTS_FAILURE, payload: { failedDeletes } });
                }
            })
        );
    };
}

export function patchAccount(id, params, authIdentifier, deleteUsersList = []) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_ACCOUNTS_REQUEST });
            return axios.patch(apiUrl.concat('/', id, '?set='.concat(keys.join('&set='))), params).then(
                response => {
                    dispatch({ type: `${types.REMOVE_SELECTED_ROW}_ACCOUNTS_TABLE`, row: { id } });
                    // may have updated user list, go ahead and clear the table
                    dispatch({ type: `${types.REMOVE_ALL_SELECTED_ROWS}_USERS_TABLE` });
                    dispatch({ type: types.UPDATE_ACCOUNTS_SUCCESS, payload: response.data });

                    const { name } = response.data || {};
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully updated ${name || 'account'}`,
                    });
                    dispatch(getUser(authIdentifier, false));

                    if (Array.isArray(deleteUsersList) && deleteUsersList.length > 0) {
                        return dispatch(deleteUsers(deleteUsersList));
                    }
                },
                error => {
                    dispatch({ type: types.UPDATE_ACCOUNTS_FAILURE, error });
                }
            );
        }
    };
}
