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
import * as constants from '../constants';
/**
 * any data related to the current session
 */
export const initialState = {
    accountId: null,
    authIdentifier: null,
    reset: false,
    metricsDatabaseConnected: constants.METRICS_SERVICE_UNKNOWN,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.UPDATE_SESSION_ACCOUNT_SUCCESS:
            return {
                ...state,
                accountId: action.accountId,
                authIdentifier: action.authIdentifier,
            };
        case types.SESSION_RELOAD_START:
            return {
                ...state,
                reset: true,
            };
        case types.SESSION_RELOAD_DONE:
            return {
                ...state,
                reset: false,
            };
        case types.LOGOUT:
            return initialState;
        case types.METRICS_DATABASE_READY:
            return {
                ...state,
                metricsDatabaseConnected: constants.METRICS_SERVICE_CONNECTED,
            };
        case types.METRICS_DATABASE_DISCONNECTED:
            return {
                ...state,
                metricsDatabaseConnected: constants.METRICS_SERVICE_DISCONNECTED,
            };
        default:
            return state;
    }
}
