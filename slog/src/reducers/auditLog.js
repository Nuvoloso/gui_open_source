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
 * audit log post
 */
export const initialState = {
    error: null,
    loading: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.POST_AUDIT_LOG_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.POST_AUDIT_LOG_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.POST_AUDIT_LOG_SUCCESS:
            return {
                ...state,
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
