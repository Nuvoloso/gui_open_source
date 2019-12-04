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

/**
 * clusterAccountSecret: cluster account secret as a string
 * error: current error message
 * loading: boolean to indicate if operation is in progress
 */
const initialState = {
    clusterAccountSecret: '',
    error: null,
    loading: false,
};

/**
 * Reducer function for clusterAccountSecret
 * @param {*} state
 * @param {*} action
 */
export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_CLUSTERS_ACCOUNT_SECRET_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_CLUSTERS_ACCOUNT_SECRET_FAILURE:
            return {
                clusterAccountSecret: '',
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_CLUSTERS_ACCOUNT_SECRET_SUCCESS:
            return {
                clusterAccountSecret: action.payload,
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
