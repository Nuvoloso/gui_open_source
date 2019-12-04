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
    system: {},
    systemHostname: '',
    error: null,
    loading: false,
    loadingHostname: false,
};

export default function servicePlans(state = initialState, action) {
    switch (action.type) {
        case types.GET_SYSTEM_HOSTNAME_REQUEST:
            return {
                ...state,
                error: null,
                loadingHostname: true,
            };
        case types.GET_SYSTEM_HOSTNAME_SUCCESS:
            return {
                ...state,
                systemHostname: action.payload,
                error: null,
                loadingHostname: false,
            };
        case types.GET_SYSTEM_HOSTNAME_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loadingHostname: false,
            };
        default:
            return state;
    }
}
