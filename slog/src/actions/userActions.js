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
import { sessionSetAccount } from '../sessionUtils';
import { patchAccount } from './accountActions';
import { logout } from './authActions';

import * as constants from '../constants';
import * as types from './types';

const apiUrl = `/${constants.URI_USERS}`;
const apiAccounts = `/${constants.URI_ACCOUNTS}`;

export function getUser(authIdentifier, reload) {
    return dispatch => {
        dispatch({ type: types.GET_USER_REQUEST });

        return axios.get(`${apiUrl}?authIdentifier=${authIdentifier}`).then(
            response => {
                const { data = [] } = response || {};

                if (reload) {
                    const { accountRoles = [], profile } = data[0] || {};
                    const { accountId } = accountRoles[0] || {};
                    const { defaultAccountId } = profile || {};
                    const { value } = defaultAccountId || {};
                    const isDefaultAccountIdValid = accountRoles.find(ar => ar.accountId === value);
                    const accountIdToUse = isDefaultAccountIdValid ? value : accountId;

                    if (accountIdToUse) {
                        sessionSetAccount(accountId);
                        dispatch({
                            type: types.UPDATE_SESSION_ACCOUNT_SUCCESS,
                            accountId: accountIdToUse,
                            authIdentifier,
                        });
                    } else {
                        response.data.message = `User has not been added to an account: ${authIdentifier}`;
                        dispatch({ type: types.LOGIN_FAILURE, payload: response });
                        dispatch(logout(response.data.message));
                    }
                }
                dispatch({ type: types.GET_USER_SUCCESS, payload: data[0] });
            },
            error => {
                const { response = {} } = error;

                /**
                 * If we are in login/reload phase, post a login failure if we cannot get
                 * the user to force it back to the login page.
                 */
                if (reload) {
                    if (response.data.code === 403) {
                        response.data.message = `User not configured in ${constants.NUVOLOSO}: ${authIdentifier}`;
                    }
                    dispatch({ type: types.LOGIN_FAILURE, payload: response });
                    dispatch(logout(response.data.message));
                } else {
                    const { data = {} } = response;
                    const { message = `error getting user ${authIdentifier}` } = data;

                    dispatch({ type: types.ADD_ALERT_MESSAGE, message });
                    dispatch({ type: types.GET_USER_FAILURE, error });
                    dispatch(logout(message));
                }
            }
        );
    };
}

export function getUsers(authIdentifier) {
    return dispatch => {
        dispatch({ type: types.GET_USERS_REQUEST });
        const requrl = apiUrl;
        const params = {
            ...(authIdentifier && { authIdentifier }),
        };

        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');
        return axios.get(requrl.concat(querystr)).then(
            response => {
                dispatch({ type: types.GET_USERS_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_USERS_FAILURE, error });
            }
        );
    };
}

export function postUser(userName, authIdentifier, password, disabled, accountId, roleId, sessionAuthIdentifier) {
    return dispatch => {
        dispatch({ type: types.POST_USERS_REQUEST });

        const params = {
            ...(authIdentifier && { authIdentifier }),
            ...(password && { password }),
            ...(userName && {
                profile: {
                    userName: {
                        value: userName,
                        kind: 'STRING',
                    },
                },
            }),
            ...(disabled && { disabled }),
        };

        return axios.post(apiUrl, params).then(
            response => {
                const { data } = response || {};
                const { authIdentifier, meta } = data || {};
                const { id } = meta || {};

                dispatch({ type: types.POST_USERS_SUCCESS, payload: data });
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${authIdentifier || 'user'}`,
                });

                if (accountId) {
                    return axios.get(`/${apiAccounts}/${accountId}`).then(
                        response => {
                            const { data } = response || {};
                            const { userRoles = {} } = data || {};
                            const params = {
                                userRoles: {
                                    ...userRoles,
                                    [id]: { roleId },
                                },
                            };

                            dispatch(patchAccount(accountId, params, sessionAuthIdentifier));
                        },
                        error => {
                            dispatch({ type: types.GET_ACCOUNTS_FAILURE, error });
                        }
                    );
                }
            },
            error => {
                dispatch({ type: types.POST_USERS_FAILURE, error });
            }
        );
    };
}

export function deleteUsers(users) {
    return dispatch => {
        dispatch({ type: types.DELETE_USERS_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failed = [];

        for (let i = 0; i < users.length; i++) {
            reqs.push(
                axios.delete(`${apiUrl}/${users[i].id}`, { user: users[i] }).catch(error => {
                    const { response } = error || {};
                    const { data } = response || {};
                    const { message } = data || {};

                    failed.push({ error: message || error, user: users[i] });
                })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        if (validateStatus(args[j].status)) {
                            const { config } = args[j] || {};
                            const { user } = config || {};
                            const { id } = user || {};

                            completedIds.push(id);
                            dispatch({ type: `${types.REMOVE_SELECTED_ROW}_USERS_TABLE`, row: { id } });
                        } else {
                            const { config, statusText } = args[j] || {};
                            const { user } = config || {};

                            failed.push({ error: statusText, user });
                        }
                    }
                }

                if (completedIds.length > 0) {
                    dispatch({ type: types.DELETE_USERS_SUCCESS, payload: { ids: completedIds } });

                    const message = `Successfully deleted ${completedIds.length > 1 ? 'users' : 'user'}`;

                    dispatch({ type: types.ADD_ALERT_MESSAGE, message });
                }
                if (failed.length > 0) {
                    dispatch({
                        type: types.DELETE_USERS_FAILURE,
                        error: {
                            message: failed.map(e => {
                                const { error, user } = e;
                                const { message } = error || {};
                                const { name } = user || {};
                                return `Error deleting ${name || 'user'}: ${message || error}`;
                            }),
                        },
                    });
                }
            })
        );
    };
}

export function patchUser(id, params, updateSession) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_USERS_REQUEST });
            return axios.patch(apiUrl.concat('/', id, '?set='.concat(keys.join('&set='))), params).then(
                response => {
                    dispatch({ type: `${types.REMOVE_SELECTED_ROW}_USERS_TABLE`, row: { id } });
                    dispatch({ type: types.UPDATE_USERS_SUCCESS, payload: response.data });

                    const { authIdentifier, profile } = response.data;
                    const { defaultAccountId } = profile || {};
                    const { value: accountId } = defaultAccountId || {};

                    if (!updateSession) {
                        dispatch({
                            type: types.ADD_ALERT_MESSAGE,
                            message: `Successfully updated ${authIdentifier || 'user'}`,
                        });
                    }

                    if (updateSession && accountId) {
                        dispatch({ type: types.UPDATE_SESSION_ACCOUNT_SUCCESS, accountId, authIdentifier });
                    }
                },
                error => {
                    dispatch({ type: types.UPDATE_USERS_FAILURE, error });
                }
            );
        }
    };
}
