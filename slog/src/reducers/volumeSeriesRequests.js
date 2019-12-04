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

const initialState = {
    volumeSeriesRequests: [],
    error: null,
    loading: false,
};

export default function volumeSeriesRequests(state = initialState, action) {
    switch (action.type) {
        case types.GET_VSR_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_VSR_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_VSR_SUCCESS:
            return {
                ...state,
                volumeSeriesRequests: action.payload || [],
                error: null,
                loading: false,
            };
        case types.POST_VSR_SUCCESS:
            return {
                ...state,
                volumeSeriesRequests: action.payload.cancelRequested
                    ? state.volumeSeriesRequests.map(vsr => {
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
                    : [...state.volumeSeriesRequests, action.payload],
                error: null,
                loading: false,
            };
        case types.UPDATE_VSR_SUCCESS:
            return {
                ...state,
                volumeSeriesRequests: state.volumeSeriesRequests.map(vsr => {
                    if (vsr.meta.id === action.payload.meta.id) {
                        return action.payload;
                    } else {
                        return vsr;
                    }
                }),
            };
        default:
            return state;
    }
}
