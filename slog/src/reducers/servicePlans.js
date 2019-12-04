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
import { messages } from '../messages';

const initialState = {
    servicePlans: [],
    error: null,
    loading: false,
};

export default function servicePlans(state = initialState, action) {
    switch (action.type) {
        case types.GET_SERVICE_PLANS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_SERVICE_PLANS_FAILURE:
            return {
                servicePlans: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_SERVICE_PLANS_SUCCESS:
            return {
                servicePlans: action.payload,
                error: null,
                loading: false,
            };
        case types.DELETE_SERVICE_PLANS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_SERVICE_PLANS_FAILURE:
            return {
                ...state,
                error: `${messages.SERVICE_PLAN_DELETE_ERROR}${
                    action.payload.failed.length === 1 ? '' : 's'
                }: ${action.payload.failed
                    .map(item => {
                        return `${item.servicePlan.name} - ${item.error}`;
                    })
                    .join(', ')}`,
                loading: false,
            };
        case types.DELETE_SERVICE_PLANS_SUCCESS:
            return {
                servicePlans: state.servicePlans.filter(
                    servicePlan => !action.payload.ids.includes(servicePlan.meta.id)
                ),
                error: null,
                loading: false,
            };
        case types.UPDATE_SERVICE_PLANS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_SERVICE_PLANS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.payload.error),
                loading: false,
            };
        case types.UPDATE_SERVICE_PLANS_SUCCESS:
            return {
                servicePlans: state.servicePlans.map(servicePlan => {
                    if (servicePlan.meta.id === action.payload.meta.id) {
                        return action.payload;
                    } else {
                        return servicePlan;
                    }
                }),
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
