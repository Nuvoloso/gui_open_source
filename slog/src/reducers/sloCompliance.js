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
import { GET_SLO_COMPLIANCE_REQUEST, GET_SLO_COMPLIANCE_FAILURE, GET_SLO_COMPLIANCE_SUCCESS } from '../actions/types';

export const STR_GET_SLO_COMPLIANCE_FAILURE_ERR = 'Error communicating with server:  ';

const initialState = {
    SLOCompliance: [],
    error: null,
    loading: false,
};

// SLOCompliance shape is
// SLOSummariess: array of SLO summaries
// error: current error message
// loading: boolean to indicate if operation is in progress
export default function(state = initialState, action) {
    switch (action.type) {
        case GET_SLO_COMPLIANCE_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };

        case GET_SLO_COMPLIANCE_FAILURE: {
            let errorString = STR_GET_SLO_COMPLIANCE_FAILURE_ERR.concat(action.error.message);

            return {
                SLOCompliance: [], // return nothing or existing state?
                error: errorString,
                loading: false,
            };
        }
        case GET_SLO_COMPLIANCE_SUCCESS:
            return {
                SLOCompliance: action.payload,
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
