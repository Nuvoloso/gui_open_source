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

const constants = require('../constants');

/** pools shape is
 * pools: array of Storage Provisioner objects as defined by the API
 * error: current error message
 * loading: boolean to indicate if operation is in progress
 */
const initialState = {
    pools: [],
    error: null,
    loading: false,
};

/**
 * Normalize pool data returned from the REST API
 *
 * @param { object } pool - Resource pool configured in system
 * @returns { object } - Normalized pool object
 */
export function normalize(pool) {
    return {
        meta: pool.meta,
        availableCapacityBytes: pool.availableCapacityBytes,
        cspDomainId: pool.cspDomainId,
        cspDomainName: pool.cspDomainName,
        cspStorageType: pool.cspStorageType,
        description: pool.description ? pool.description : '',
        disabled: pool.poolState ? pool.poolState.state === constants.STATE_DISABLED : false,
        name: pool.name ? pool.name : '',
        reservableCapacityBytes: pool.reservableCapacityBytes,
        storageAccessibility: pool.storageAccessibility
            ? pool.storageAccessibility
            : {
                  accessibilityScope: 'GLOBAL',
                  accessibilityScopeObjId: '',
              },
        // TBD: will need to adjust once we put in a component for editing....should be object based
        poolAttributes: pool.poolAttributes ? pool.poolAttributes : {},
        poolState: pool.poolState,
        tags: pool.tags,
        totalCapacityBytes: pool.totalCapacityBytes,
    };
}

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_STORAGE_PROVISIONERS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_STORAGE_PROVISIONERS_FAILURE:
            return {
                pools: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_STORAGE_PROVISIONERS_SUCCESS:
            return {
                pools: action.payload.map(pool => normalize(pool)),
                error: null,
                loading: false,
            };
        case types.POST_STORAGE_PROVISIONERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.POST_STORAGE_PROVISIONERS_FAILURE:
            return {
                ...state,
                error: action.error.response.data.message,
                loading: false,
            };
        case types.POST_STORAGE_PROVISIONERS_SUCCESS:
            return {
                pools: [...state.pools, normalize(action.payload)],
                error: null,
                loading: false,
            };
        case types.DELETE_STORAGE_PROVISIONERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_STORAGE_PROVISIONERS_FAILURE:
            return {
                ...state,
                error: `Error deleting resource ${
                    action.payload.names.length === 1 ? 'pool' : 'pools'
                }: ${action.payload.names.join(', ')}`,
                loading: false,
            };
        case types.DELETE_STORAGE_PROVISIONERS_SUCCESS:
            return {
                pools: state.pools.filter(pool => !action.payload.ids.includes(pool.meta.id)),
                error: null,
                loading: false,
            };
        case types.UPDATE_STORAGE_PROVISIONERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_STORAGE_PROVISIONERS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_STORAGE_PROVISIONERS_SUCCESS:
            return {
                pools: state.pools.map(pool => {
                    if (pool.meta.id === action.payload.meta.id) {
                        return normalize(action.payload);
                    } else {
                        return pool;
                    }
                }),
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
