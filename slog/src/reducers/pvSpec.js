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
 * pvSpec: YAML for the persistent volume specification that defines a Nuvoloso volume series object bound to a cluster
 * completed: list of volumes which successfully generated YAML
 * failed: list of volumes which ran into errors generating YAML
 * loading: in progress
 */
const initialState = {
    pvSpec: '',
    completed: [],
    failed: [],
    loading: false,
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_VOLUME_SERIES_PV_SPEC_REQUEST:
            return {
                ...initialState,
                loading: true,
            };
        case types.GET_VOLUME_SERIES_PV_SPEC_COMPLETE: {
            const { completed = [], failed = [], yamls = [] } = action.payload || {};
            return {
                ...state,
                pvSpec: yamls.length > 0 ? yamls.join('---\n') : '',
                completed,
                failed,
                loading: false,
            };
        }
        default:
            return state;
    }
}
