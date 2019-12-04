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

import { getUpdatedList } from '../components/utils_vsrs';

const initialState = {
    volumeSeriesRequestsCompleted: [],
    error: null,
    loading: false,
};

export default function volumeSeriesRequestsCompleted(state = initialState, action) {
    switch (action.type) {
        case types.GET_VSR_COMPLETED_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_VSR_COMPLETED_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_VSR_COMPLETED_SUCCESS:
            return {
                ...state,
                volumeSeriesRequestsCompleted: action.payload || [],
                error: null,
                loading: false,
            };
        case types.POST_VSR_SUCCESS:
            return {
                ...state,
                volumeSeriesRequestsCompleted: action.payload.cancelRequested
                    ? state.volumeSeriesRequestsCompleted.map(vsr => {
                          if (vsr.meta.id === action.payload.meta.id) {
                              const { cancelRequested } = action.payload;
                              return {
                                  ...vsr,
                                  cancelRequested,
                              };
                          } else {
                              return vsr;
                          }
                      })
                    : [...state.volumeSeriesRequestsCompleted, action.payload],
                error: null,
                loading: false,
            };
        case types.UPDATE_VSR_SUCCESS: {
            const volumeSeriesRequestsCompleted = getUpdatedList(state.volumeSeriesRequestsCompleted, action.payload);

            return {
                ...state,
                volumeSeriesRequestsCompleted,
            };
        }
        default:
            return state;
    }
}
