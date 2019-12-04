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

import { getErrorMsg } from '../components/utils';

import * as types from './types';

import * as constants from '../constants';

const urlAuditLog = `/${constants.URI_AUDIT_LOG}`;

export function getProtectionDomainHistory() {
    return dispatch => {
        dispatch({ type: types.GET_PROTECTION_DOMAIN_HISTORY_REQUEST });
        const url = `${urlAuditLog}?objectType=protectiondomain&action=set`;
        return axios.get(url).then(
            response => {
                dispatch({ type: types.GET_PROTECTION_DOMAIN_HISTORY_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_PROTECTION_DOMAIN_HISTORY_FAILURE, error });
            }
        );
    };
}
