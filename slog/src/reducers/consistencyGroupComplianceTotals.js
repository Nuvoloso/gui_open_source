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

/**
 * consistencyGroupComplianceTotals shape is
 * metrics: Array of metric objects with a consistency group name and a count
 * loading: boolean to indicate if operation is in progress
 * error: error returned from server
 */
export const initialState = {
    metrics: [],
    error: null,
    startTime: null,
    endTime: null,
    loading: false,
    didInvalidate: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_CONSISTENCYGROUP_COMPLIANCE_TOTALS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
                didInvalidate: false,
            };
        case types.GET_CONSISTENCYGROUP_COMPLIANCE_TOTALS_FAILURE:
            return {
                ...state,
                metrics: [],
                error: 'Error fetching consistency group latency totals metrics',
                loading: false,
            };
        case types.GET_CONSISTENCYGROUP_COMPLIANCE_TOTALS_SUCCESS:
            return {
                ...state,
                metrics: action.payload.data,
                startTime: action.payload.startTime,
                endTime: action.payload.endTime,
                error: null,
                loading: false,
            };
        case types.INVALIDATE_METRICS:
            return {
                ...state,
                didInvalidate: true,
            };
        default:
            return state;
    }
}
