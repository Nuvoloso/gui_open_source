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
 * shape is
 * cspCredentials: array of CSP credential objects as defined by the API
 * error: current error message
 * loading: boolean to indicate if operation is in progress
 */
const initialState = {
    cspCredentials: [],
    error: null,
    loading: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_CSP_CREDENTIALS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_CSP_CREDENTIALS_FAILURE:
            return {
                cspCredentials: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_CSP_CREDENTIALS_SUCCESS:
            return {
                cspCredentials: action.payload,
                error: null,
                loading: false,
            };
        case types.POST_CSP_CREDENTIALS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.POST_CSP_CREDENTIALS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.POST_CSP_CREDENTIALS_SUCCESS:
            return {
                cspCredentials: [...state.cspCredentials, action.payload],
                error: null,
                loading: false,
            };
        case types.DELETE_CSP_CREDENTIALS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_CSP_CREDENTIALS_FAILURE:
            return {
                ...state,
                error: `Error deleting ${
                    action.payload.names.length === 1 ? 'CSP credential' : 'CSP credentials'
                }: ${action.payload.names.join(', ')}`,
                loading: false,
            };
        case types.DELETE_CSP_CREDENTIALS_SUCCESS:
            return {
                cspCredentials: state.cspCredentials.filter(
                    cspCredential => !action.payload.ids.includes(cspCredential.meta.id)
                ),
                error: null,
                loading: false,
            };
        case types.UPDATE_CSP_CREDENTIALS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_CSP_CREDENTIALS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_CSP_CREDENTIALS_SUCCESS:
            return {
                cspCredentials: state.cspCredentials.map(cspCredential => {
                    if (cspCredential.meta.id === action.payload.meta.id) {
                        return action.payload;
                    } else {
                        return cspCredential;
                    }
                }),
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
