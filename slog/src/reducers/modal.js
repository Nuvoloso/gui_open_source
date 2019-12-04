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

const initialState = {
    content: null,
    config: {},
    values: {},
};

export default function modal(state = initialState, action) {
    switch (action.type) {
        case types.CLOSE_MODAL:
            return initialState;
        case types.OPEN_MODAL:
            return {
                content: action.content,
                config: action.config,
                values: action.values,
            };
        default:
            return state;
    }
}
