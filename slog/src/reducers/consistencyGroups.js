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
 * Consistency groups shape is
 * consistencyGroups: Array of consistency group objects as defined by the API
 * error: Current error message
 * loading: boolean to indicate if operation is in progress
 */
export const initialState = {
    consistencyGroups: [],
    error: null,
    loading: false,
};

/**
 * Normalize consistency group data returned from the REST API
 * "description" will be set to "" if not returned
 * @param { array } consistencyGroups - consistencyGroups configured in system
 * @returns { array } - Normalized array of consistencyGroups
 */
export function normalize(consistencyGroup) {
    return {
        accountId: consistencyGroup.accountId,
        applicationGroupIds: consistencyGroup.applicationGroupIds,
        accountName: consistencyGroup.accountName,
        description: consistencyGroup.description ? consistencyGroup.description : '',
        meta: consistencyGroup.meta,
        name: consistencyGroup.name,
        tags: consistencyGroup.tags,
    };
}

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_CG_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_CG_FAILURE:
            return {
                consistencyGroups: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_CG_SUCCESS:
            return {
                consistencyGroups: action.payload.map(group => normalize(group)),
                error: null,
                loading: false,
            };
        case types.POST_CG_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.POST_CG_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.POST_CG_SUCCESS:
            return {
                consistencyGroups: [...state.consistencyGroups, normalize(action.payload)],
                error: null,
                loading: false,
            };
        case types.DELETE_CG_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_CG_FAILURE:
            return {
                ...state,
                error: `Error deleting ${
                    action.payload.names.length === 1 ? 'Consistency Group' : 'Consistency Groups'
                }: ${action.payload.names.join(', ')}`,
                loading: false,
            };
        case types.DELETE_CG_SUCCESS:
            return {
                consistencyGroups: state.consistencyGroups.filter(a => !action.payload.ids.includes(a.meta.id)),
                error: null,
                loading: false,
            };
        case types.UPDATE_CG_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_CG_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_CG_SUCCESS:
            return {
                consistencyGroups: state.consistencyGroups.map(group => {
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
