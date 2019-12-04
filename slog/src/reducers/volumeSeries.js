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
import { normalizeVolumeSeries } from './reducer_utils';

import * as types from '../actions/types';

const initialState = {
    volumeSeries: [],
    error: null,
    loading: false,
};

export default function volumeSeries(state = initialState, action) {
    switch (action.type) {
        case types.GET_VOLUME_SERIES_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_VOLUME_SERIES_FAILURE:
            return {
                volumeSeries: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_VOLUME_SERIES_SUCCESS:
            return {
                volumeSeries: action.payload.map(vol => normalizeVolumeSeries(vol)),
                error: null,
                loading: false,
            };
        case types.POST_VOLUME_SERIES_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.POST_VOLUME_SERIES_SUCCESS:
            return {
                volumeSeries: [...state.volumeSeries, normalizeVolumeSeries(action.payload)],
                error: null,
                loading: false,
            };
        case types.POST_VOLUME_SERIES_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.DELETE_VOLUME_SERIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_VOLUME_SERIES_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.DELETE_VOLUME_SERIES_SUCCESS:
            return {
                ...state,
                volumeSeries: state.volumeSeries.filter(vol => !action.payload.ids.includes(vol.meta.id)),
                loading: false,
            };
        case types.UPDATE_VOLUME_SERIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_VOLUME_SERIES_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_VOLUME_SERIES_SUCCESS:
            return {
                volumeSeries: state.volumeSeries.map(vol => {
                    if (vol.meta.id === action.payload.meta.id) {
                        return normalizeVolumeSeries(action.payload);
                    } else {
                        return normalizeVolumeSeries(vol);
                    }
                }),
                error: null,
                loading: false,
            };

        default:
            return state;
    }
}
