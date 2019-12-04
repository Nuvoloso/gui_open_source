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
 * VolumeServiceHistory shape is
 * volumeServiceHistory: Array of history objects
 * loading: boolean to indicate if operation is in progress
 * error: error returned from server
 */
export const initialState = {
    volumeServiceHistory: [],
    error: null,
    loading: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_VOLUME_SERVICE_HISTORY_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_VOLUME_SERVICE_HISTORY_FAILURE:
            return {
                ...state,
                volumeServiceHistory: [],
                error: 'Error fetching volume service history',
                loading: false,
            };
        case types.GET_VOLUME_SERVICE_HISTORY_SUCCESS:
            return {
                ...state,
                volumeServiceHistory: action.payload.data,
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
