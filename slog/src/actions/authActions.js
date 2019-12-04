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

import { closeModal } from './modalActions';
import { sessionSetToken } from '../sessionUtils';

import * as constants from '../constants';
import * as types from './types';

export function getLogin() {
    return dispatch => {
        return axios.get(constants.URI_AUTH.LOGIN).then(
            response => {
                const { data } = response || {};
                const { user } = data || {};
                const { token } = user || {};

                if (token) {
                    sessionSetToken(token);
                }

                if (user) {
                    dispatch({ type: types.LOGIN_SUCCESS, payload: response });
                    dispatch(closeModal());
                }
            },
            error => {
                dispatch({ type: types.LOGIN_FAILURE, error });
            }
        );
    };
}

export function logout(message) {
    return dispatch => {
        return axios.post(constants.URI_AUTH.LOGOUT).then(() => {
            dispatch({ type: types.CLEAR_ALL_MESSAGES });
            dispatch({
                type: types.LOGOUT,
                payload: {
                    data: {
                        message,
                    },
                },
            });
            sessionStorage.clear();
        });
    };
}

export function postLogin(username, password) {
    return dispatch => {
        dispatch({ type: types.LOGIN });

        return axios.post(constants.URI_AUTH.LOGIN, { username, password }).then(
            response => {
                const { data } = response || {};
                const { user } = data || {};
                const { token } = user || {};

                if (token) {
                    sessionSetToken(token);
                }

                dispatch({ type: types.LOGIN_SUCCESS, payload: response });
                dispatch(closeModal());
            },
            error => {
                const { response } = error;
                dispatch({ type: types.LOGIN_FAILURE, payload: response });
            }
        );
    };
}
