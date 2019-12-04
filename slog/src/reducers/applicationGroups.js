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
 * Application group shape is
 * applicationGroups: Array of application group objects as defined by the API
 * error: Current error message
 * loading: boolean to indicate if operation is in progress
 */
export const initialState = {
    applicationGroups: [],
    error: null,
    loading: false,
};

/**
 * Normalize application group data returned from the REST API
 * "description" will be set to "" if not returned
 * "disabled" will be set if false or not returned
 * @param { array } applicationGroups - applicationGroups configured in system
 * @returns { array } - Normalized array of applicationGroups
 */
export function normalize(applicationGroup) {
    return {
        meta: applicationGroup.meta,
        accountId: applicationGroup.accountId,
        accountName: applicationGroup.accountName,
        description: applicationGroup.description ? applicationGroup.description : '',
        name: applicationGroup.name,
        tags: applicationGroup.tags,
    };
}

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_AG_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_AG_FAILURE:
            return {
                applicationGroups: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_AG_SUCCESS:
            return {
                applicationGroups: action.payload.map(group => normalize(group)),
                error: null,
                loading: false,
            };
        case types.POST_AG_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.POST_AG_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.POST_AG_SUCCESS:
            return {
                applicationGroups: [...state.applicationGroups, normalize(action.payload)],
                error: null,
                loading: false,
            };
        case types.DELETE_AG_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_AG_FAILURE:
            return {
                ...state,
                error: `Error deleting ${
                    // TBD XXX
                    action.payload.names.length === 1 ? 'Application Group' : 'Application Groups'
                }: ${action.payload.names.join(', ')}`,
                loading: false,
            };
        case types.DELETE_AG_SUCCESS:
            return {
                applicationGroups: state.applicationGroups.filter(a => !action.payload.ids.includes(a.meta.id)),
                error: null,
                loading: false,
            };
        case types.UPDATE_AG_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_AG_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_AG_SUCCESS:
            return {
                applicationGroups: state.applicationGroups.map(group => {
                    if (group.meta.id === action.payload.meta.id) {
                        return normalize(action.payload);
                    } else {
                        return normalize(group);
                    }
                }),
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
