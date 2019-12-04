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
 * Account shape is
 * accounts: Array of Account objects as defined by the API
 * error: Current error message
 * loading: boolean to indicate if operation is in progress
 * settingDomain: boolean indicating if operation is in progress
 * domainSetId: name of the domain id that the acccount was set to
 */
export const initialState = {
    accounts: [],
    domainSetId: '',
    error: null,
    loading: false,
    settingDomain: false,
    settingPolicy: false,
    snapshotCatalogDomainId: '',
};

/**
 * Normalize account data returned from the REST API
 * "description" will be set to "" if not returned
 * "disabled" will be set if false or not returned
 * @param { array } accounts - Accounts configured in system
 * @returns { array } - Normalized array of accounts
 */
export function normalize(accounts) {
    const normalized = [];

    if (!accounts) {
        return normalized;
    }

    accounts.forEach(account => {
        const {
            description = '',
            disabled = false,
            meta,
            name,
            protectionDomains,
            snapshotCatalogPolicy,
            tags,
            tenantAccountId,
            userRoles = {},
        } = account || {};

        normalized.push({
            description,
            disabled,
            meta,
            name,
            protectionDomains,
            snapshotCatalogPolicy,
            tags,
            tenantAccountId,
            userRoles,
        });
    });

    return normalized;
}

export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_ACCOUNTS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_ACCOUNTS_FAILURE:
            return {
                ...state,
                accounts: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_ACCOUNTS_SUCCESS:
            return {
                ...state,
                accounts: normalize(action.payload),
                error: null,
                loading: false,
            };
        case types.POST_ACCOUNTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.POST_ACCOUNTS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.POST_ACCOUNTS_SUCCESS:
            return {
                ...state,
                accounts: [...state.accounts, action.payload],
                error: null,
                loading: false,
            };
        case types.DELETE_ACCOUNTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_ACCOUNTS_FAILURE: {
            const errorMessage = `Error deleting ${
                action.payload.failedDeletes.length === 1
                    ? 'Account'
                    : action.payload.failedDeletes.length + ' Accounts'
            }`;
            const failedDeletes = action.payload.failedDeletes;

            const allFailures = failedDeletes.reduce(
                (failedMessages, failure, idx) =>
                    failedMessages +
                    ` "${failure.name}": ${failure.message} ${idx !== failedDeletes.length - 1 ? ',' : ''}  `,
                ''
            );

            return {
                ...state,
                error: errorMessage.concat(allFailures),
                loading: false,
            };
        }
        case types.DELETE_ACCOUNTS_SUCCESS:
            return {
                ...state,
                accounts: state.accounts.filter(a => !action.payload.ids.includes(a.meta.id)),
                error: null,
                loading: false,
            };
        case types.UPDATE_ACCOUNTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_ACCOUNTS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_ACCOUNTS_SUCCESS:
            return {
                ...state,
                accounts: state.accounts.map(acct => {
                    if (acct.meta.id === action.payload.meta.id) {
                        return action.payload;
                    } else {
                        return acct;
                    }
                }),
                error: null,
                loading: false,
            };
        case types.POST_ACCOUNT_PROTECTION_DOMAIN_SET_REQUEST:
            return {
                ...state,
                settingDomain: true,
                error: null,
                domainSetId: '',
            };
        case types.POST_ACCOUNT_PROTECTION_DOMAIN_SET_FAILURE:
            return {
                ...state,
                settingDomain: false,
                error: getErrorMsg(action.error),
                domainSetId: '',
            };
        case types.POST_ACCOUNT_PROTECTION_DOMAIN_SET_SUCCESS: {
            const { protectionDomain } = action;
            const { meta } = protectionDomain || {};
            const { id } = meta || {};

            return {
                ...state,
                error: null,
                settingDomain: false,
                domainSetId: id,
            };
        }
        case types.POST_ACCOUNT_SNAPSHOT_POLICY_SET_REQUEST:
            return {
                ...state,
                settingPolicy: true,
                error: null,
            };
        case types.POST_ACCOUNT_SNAPSHOT_POLICY_FAILURE:
            return {
                ...state,
                settingPolicy: false,
                error: getErrorMsg(action.error),
            };
        case types.POST_ACCOUNT_SNAPSHOT_POLICY_SUCCESS: {
            return {
                ...state,
                accounts: state.accounts.map(acct => {
                    if (acct.meta.id === action.payload.meta.id) {
                        return action.payload;
                    } else {
                        return acct;
                    }
                }),
                error: null,
                settingPolicy: false,
            };
        }
        default:
            return state;
    }
}
