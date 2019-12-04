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
 * StorageLatencyMetrics shape is
 * metrics: {
 *     data: map storage IDs as keys to array of metric objects
 *     endTime: end time of metrics
 *     startTime: start time of metrics
 *     volId: ID of volume associated with the storage
 * }
 * error: Current error message
 * loading: boolean to indicate if operation is in progress
 */
export const initialState = {
    metrics: {},
    error: null,
    loading: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_STORAGE_METRICS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_STORAGE_METRICS_FAILURE:
            return {
                metrics: {},
                error: 'Error fetching storage metrics',
                loading: false,
            };
        case types.GET_STORAGE_METRICS_SUCCESS:
            return {
                metrics: action.payload,
                error: null,
                loading: false,
            };
        case types.CLEAR_STORAGE_METRICS:
            return initialState;
        default:
            return state;
    }
}
