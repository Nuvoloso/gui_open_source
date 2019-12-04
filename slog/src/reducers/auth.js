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
import * as types from '../actions/types';

const initialState = {
    loggedIn: false,
    loggedOut: true,
    loggingIn: false,
    message: '',
    user: {},
};

export default function auth(state = initialState, action) {
    const { payload } = action;
    const { data } = payload || {};

    switch (action.type) {
        case types.LOGIN:
            return {
                ...state,
                loggingIn: true,
            };
        case types.LOGIN_SUCCESS:
            return {
                ...state,
                loggedIn: true,
                loggedOut: false,
                loggingIn: false,
                user: data.user,
            };
        case types.LOGIN_FAILURE:
            return {
                ...state,
                loggedIn: false,
                loggingIn: false,
                message: (data && data.message) || data || '',
            };
        case types.LOGOUT: {
            const { message = '' } = data || {};
            return {
                ...initialState,
                loggedIn: false,
                loggedOut: true,
                message,
            };
        }
        default:
            return state;
    }
}
