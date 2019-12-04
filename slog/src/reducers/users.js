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
import { getErrorMsg } from '../components/utils';
import * as types from '../actions/types';

/**
 * Users shape is
 * users: Array of User objects as defined by the API
 * error: Current error message
 * loading: boolean to indicate if operation is in progress
 */
export const initialState = {
    users: [],
    error: null,
    loading: false,
};

/**
 * Normalize user data returned from the REST API
 * "description" will be set to "" if not returned
 * "disabled" will be set if false or not returned
 * @param { array } - Users configured in system
 * @returns { array } - Normalized array of users
 */
export function normalize(users) {
    const normalized = [];

    users.forEach(user => {
        normalized.push({
            accountRoles: user.accountRoles,
            authIdentifier: user.authIdentifier,
            disabled: user.disabled ? user.disabled : false,
            meta: user.meta,
            profile: user.profile ? user.profile : { userName: { value: '' } },
        });
    });

    return normalized;
}

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_USERS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_USERS_FAILURE:
            return {
                users: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_USERS_SUCCESS:
            return {
                users: normalize(action.payload),
                error: null,
                loading: false,
            };
        case types.POST_USERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.POST_USERS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.POST_USERS_SUCCESS:
            /**
             * Need to handle two types od dispatch.  One is where the payload is from the watcher
             * and returns the full array of users.  The other is from the action where the payload
             * is a single object that we need to merge into the existing state.
             */
            return {
                users: Array.isArray(action.payload) ? action.payload : [...state.users, action.payload],
                error: null,
                loading: false,
            };
        case types.DELETE_USERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_USERS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.DELETE_USERS_SUCCESS:
            return {
                users: state.users.filter(a => !action.payload.ids.includes(a.meta.id)),
                error: null,
                loading: false,
            };
        case types.UPDATE_USERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_USERS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_USERS_SUCCESS:
            return {
                users: state.users.map(user => {
                    if (user.meta.id === action.payload.meta.id) {
                        return action.payload;
                    } else {
                        return user;
                    }
                }),
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
