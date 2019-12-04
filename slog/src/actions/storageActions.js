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
import axios from 'axios';

import * as types from './types';

export function getStorage() {
    return dispatch => {
        dispatch({ type: types.GET_STORAGE_REQUEST });
        return axios.get('/storage').then(
            response => {
                dispatch({ type: types.GET_STORAGE_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_STORAGE_FAILURE, error });
            }
        );
    };
}
