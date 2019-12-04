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
 * pds shape is
 * pds: array of Protection Domain objects as defined by the API
 * error: current error message
 * loading: boolean to indicate if operation is in progress
 */
const initialState = {
    protectionDomains: [],
    error: null,
    loading: false,
};

/**
 *
 * @param {array} pd
 */
export function normalize(pd) {
    const { accountId, description = '', encryptionAlgorithm, encryptionPassphrase, meta, name, tags } = pd || {};

    return {
        accountId,
        description,
        encryptionAlgorithm,
        encryptionPassphrase,
        meta,
        name,
        tags,
    };
}

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_PROTECTION_DOMAINS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_PROTECTION_DOMAINS_FAILURE:
            return {
                protectionDomains: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_PROTECTION_DOMAINS_SUCCESS:
            return {
                protectionDomains: action.payload.map(pd => normalize(pd)),
                error: null,
                loading: false,
            };
        case types.POST_PROTECTION_DOMAINS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.POST_PROTECTION_DOMAINS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.POST_PROTECTION_DOMAINS_SUCCESS:
            return {
                protectionDomains: [...state.protectionDomains, normalize(action.payload)],
                error: null,
                loading: false,
            };
        case types.DELETE_PROTECTION_DOMAINS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_PROTECTION_DOMAINS_FAILURE:
            return {
                ...state,
                error: `Error deleting ${
                    action.payload.names.length === 1 ? 'Protection Domain' : 'Proteciton Domains'
                }: ${action.payload.names.join(', ')}`,
                loading: false,
            };
        case types.DELETE_PROTECTION_DOMAINS_SUCCESS:
            return {
                protectionDomains: state.protectionDomains.filter(pd => !action.payload.ids.includes(pd.meta.id)),
                error: null,
                loading: false,
            };
        case types.UPDATE_PROTECTION_DOMAINS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_PROTECTION_DOMAINS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_PROTECTION_DOMAINS_SUCCESS:
            return {
                protectionDomains: state.protectionDomains.map(pd => {
                    if (pd.meta.id === action.payload.meta.id) {
                        return normalize(action.payload);
                    } else {
                        return pd;
                    }
                }),
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
