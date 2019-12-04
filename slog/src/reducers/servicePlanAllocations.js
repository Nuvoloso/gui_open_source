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
import { getErrorMsg } from '../components/utils';

const initialState = {
    servicePlanAllocations: [],
    error: null,
    loading: false,
};

export default function servicePlans(state = initialState, action) {
    switch (action.type) {
        case types.GET_SPA_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_SPA_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_SPA_SUCCESS:
            return {
                servicePlanAllocations: action.payload,
                error: null,
                loading: false,
            };
        case types.POST_SPA_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_SPA_SUCCESS:
            return {
                servicePlanAllocations: state.servicePlanAllocations.map(spa => {
                    if (spa.meta.id === action.payload.meta.id) {
                        return action.payload;
                    } else {
                        return spa;
                    }
                }),
                error: null,
                loading: false,
            };
        case types.DELETE_SPAS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.DELETE_SPAS_SUCCESS:
            return {
                ...state,
                servicePlanAllocations: state.servicePlanAllocations.filter(
                    spa => !action.payload.ids.includes(spa.meta.id)
                ),
                loading: false,
            };
        default:
            return state;
    }
}
