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

import * as constants from '../constants';
import * as types from './types';

const apiUrl = `/${constants.URI_SNAPSHOTS}`;

export function getSnapshots(volumeSeriesId, snapTimeGE, snapTimeLE, preserveCache) {
    const params = {
        ...(snapTimeGE && { snapTimeGE }),
        ...(snapTimeLE && { snapTimeLE }),
        ...(volumeSeriesId && { volumeSeriesId }),
    };

    const keys = Object.keys(params);
    const queryParams = keys.length > 0 ? `?${keys.map(key => `${key}=${params[key]}`).join('&')}` : '';

    return dispatch => {
        dispatch({ type: types.GET_SNAPSHOTS_REQUEST, preserveCache });

        return axios.get(`${apiUrl}${queryParams}`).then(
            response => {
                dispatch({ type: types.GET_SNAPSHOTS_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_SNAPSHOTS_FAILURE, error });
            }
        );
    };
}
