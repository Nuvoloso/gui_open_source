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
 * User shape is
 * user: User object as defined by the API
 * error: Current error message
 * loading: Boolean to indicate if operation is in progress
 */
export const initialState = {
    user: null,
    error: null,
    loading: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_USER_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_USER_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_USER_SUCCESS:
            return {
                ...state,
                user: action.payload,
                error: null,
                loading: false,
            };
        case types.LOGOUT:
            return initialState;
        default:
            return state;
    }
}
