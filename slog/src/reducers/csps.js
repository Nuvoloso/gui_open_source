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

import { getUpdatedList } from '../components/utils_vsrs';

import * as constants from '../constants';

/**
 * Define default objects for each CSP domain.
 */

export const ATTRIBUTE_AWS = {
    aws_access_key_id: {
        kind: 'STRING',
        value: '',
    },
    aws_region: {
        kind: 'STRING',
        value: '',
    },
    aws_availability_zone: {
        kind: 'STRING',
        value: '',
    },
    aws_secret_access_key: {
        kind: 'SECRET',
        value: '',
    },
};

export const ATTRIBUTE_AWS_NO_CRED = {
    aws_region: {
        kind: 'STRING',
        value: '',
    },
    aws_availability_zone: {
        kind: 'STRING',
        value: '',
    },
};

export const ATTRIBUTE_GCP = {
    gc_cred: {
        kind: 'SECRET',
        value: '',
    },
    gc_zone: {
        kind: 'STRING',
        value: '',
    },
};

export const ATTRIBUTE_GCP_NO_CRED = {
    gc_zone: {
        kind: 'STRING',
        value: '',
    },
};

/**
 * csps shape is
 * csps: array of CSP objects as defined by the API
 * error: current error message
 * loading: boolean to indicate if operation is in progress
 */
const initialState = {
    csps: [],
    error: null,
    loading: false,
};

/**
 *
 * @param {array} csps
 */
export function normalize(csp) {
    const {
        accountId,
        authorizedAccounts,
        cspCredentialId,
        cspDomainAttributes,
        cspDomainType,
        description = '',
        managementHost = '',
        meta,
        name,
        storageCosts,
        tags = [],
    } = csp || {};

    return {
        accountId,
        authorizedAccounts,
        cspCredentialId,
        cspDomainAttributes: cspDomainAttributes ? cspDomainAttributes : ATTRIBUTE_AWS,
        cspDomainType: cspDomainType || constants.CSP_DOMAINS.AWS,
        description,
        managementHost,
        meta,
        name,
        storageCosts,
        tags,
    };
}

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_CSPS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_CSPS_FAILURE:
            return {
                csps: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_CSPS_SUCCESS:
            return {
                csps: action.payload.map(csp => normalize(csp)),
                error: null,
                loading: false,
            };
        case types.POST_CSPS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.POST_CSPS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.POST_CSPS_SUCCESS: {
            const csps = getUpdatedList(state.csps, normalize(action.payload));

            return {
                ...state,
                csps,
            };
        }
        case types.DELETE_CSPS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_CSPS_FAILURE:
            return {
                ...state,
                error: `Error deleting ${
                    action.payload.names.length === 1 ? 'CSP' : 'CSPs'
                }: ${action.payload.names.join(', ')}`,
                loading: false,
            };
        case types.DELETE_CSPS_SUCCESS:
            return {
                csps: state.csps.filter(csp => !action.payload.ids.includes(csp.meta.id)),
                error: null,
                loading: false,
            };
        case types.UPDATE_CSPS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_CSPS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_CSPS_SUCCESS:
            return {
                csps: state.csps.map(csp => {
                    if (csp.meta.id === action.payload.meta.id) {
                        return normalize(action.payload);
                    } else {
                        return csp;
                    }
                }),
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
