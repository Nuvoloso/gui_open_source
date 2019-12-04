import reducer from './accounts';
import * as types from '../actions/types';

import { accounts_data } from '../../test/data_accounts';
import { normalize, initialState } from './accounts';

describe('accounts reducer', () => {
    it('should return an empty array if undefined for the normalizer', () => {
        expect(normalize(undefined)).toEqual([]);
    });

    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('should handle GET_ACCOUNTS_REQUEST', () => {
        expect(
            reducer([], {
                type: types.GET_ACCOUNTS_REQUEST,
                payload: [],
            })
        ).toEqual({
            accounts: [],
            error: null,
            loading: true,
        });
    });

    it('should handle GET_ACCOUNTS_SUCCESS:', () => {
        expect(
            reducer([], {
                type: types.GET_ACCOUNTS_SUCCESS,
                payload: accounts_data,
            })
        ).toEqual({
            accounts: normalize(accounts_data),
            error: null,
            loading: false,
        });
    });

    it('should handle GET_ACCOUNTS_FAILURE', () => {
        const testErrorMessage = 'test harness';

        expect(
            reducer([], {
                type: types.GET_ACCOUNTS_FAILURE,
                error: { message: testErrorMessage },
            })
        ).toEqual({
            accounts: [],
            error: testErrorMessage,
            loading: false,
        });
    });

    it('should handle POST_ACCOUNTS_REQUEST', () => {
        expect(
            reducer(
                {
                    accounts: accounts_data,
                    error: null,
                    loading: false,
                },
                {
                    type: types.POST_ACCOUNTS_REQUEST,
                    payload: {},
                }
            )
        ).toEqual({
            accounts: accounts_data,
            error: null,
            loading: true,
        });
    });

    it('should handle POST_ACCOUNTS_FAILURE', () => {
        const testErrorMessage = 'test harness';

        expect(
            reducer(
                {
                    accounts: accounts_data,
                    error: null,
                    loading: false,
                },
                {
                    type: types.POST_ACCOUNTS_FAILURE,
                    error: { message: testErrorMessage },
                }
            )
        ).toEqual({
            accounts: accounts_data,
            error: testErrorMessage,
            loading: false,
        });
    });

    it('should handle POST_ACCOUNTS_SUCCESS:', () => {
        expect(
            reducer(initialState, {
                type: types.POST_ACCOUNTS_SUCCESS,
                payload: accounts_data[1],
            })
        ).toEqual({
            accounts: [accounts_data[1]],
            error: null,
            loading: false,
        });
    });

    it('should handle DELETE_ACCOUNTS_REQUEST', () => {
        expect(
            reducer(initialState, {
                type: types.DELETE_ACCOUNTS_REQUEST,
            })
        ).toEqual({
            accounts: [],
            error: null,
            loading: true,
        });
    });

    it('should handle DELETE_ACCOUNTS_FAILURE single case', () => {
        const testErrorMessage = 'test harness';
        // TBD how to handle error message generation in reducer and unit test
        // Assume single account message
        const failedNames = ['Marketing'];
        const errorString = `Error deleting ${failedNames.length === 1 ? 'Account' : 'Accounts'}: ${failedNames.join(
            ', '
        )}`;

        expect(
            reducer(
                {
                    accounts: accounts_data,
                    error: null,
                    loading: false,
                },
                {
                    type: types.DELETE_ACCOUNTS_FAILURE,
                    error: { message: testErrorMessage },
                    payload: { names: failedNames },
                }
            )
        ).toEqual({
            accounts: accounts_data,
            error: errorString,
            loading: false,
        });
    });

    it('should handle DELETE_ACCOUNTS_FAILURE multiple case', () => {
        const testErrorMessage = 'test harness';
        // TBD how to handle error message generation in reducer and unit test
        // Assume single account message
        const failedNames = ['Marketing', 'Sales'];
        const errorString = `Error deleting ${failedNames.length === 1 ? 'Account' : 'Accounts'}: ${failedNames.join(
            ', '
        )}`;

        expect(
            reducer(
                {
                    accounts: accounts_data,
                    error: null,
                    loading: false,
                },
                {
                    type: types.DELETE_ACCOUNTS_FAILURE,
                    error: { message: testErrorMessage },
                    payload: { names: failedNames },
                }
            )
        ).toEqual({
            accounts: accounts_data,
            error: errorString,
            loading: false,
        });
    });

    it('should handle DELETE_ACCOUNTS_SUCCESS: single', () => {
        const completedIds = accounts_data[1].meta.id;
        expect(
            reducer(
                {
                    accounts: [accounts_data[1]],
                    error: null,
                    loading: false,
                },
                {
                    type: types.DELETE_ACCOUNTS_SUCCESS,
                    payload: { ids: completedIds },
                }
            )
        ).toEqual({
            accounts: [],
            error: null,
            loading: false,
        });
    });

    it('should handle DELETE_ACCOUNTS_SUCCESS: delete all but system', () => {
        const completedIds = accounts_data.map(acct => {
            // TBD Constant for us and backend
            if (acct.name !== 'System') {
                return acct.meta.id;
            }
        });
        expect(
            reducer(
                {
                    accounts: accounts_data,
                    error: null,
                    loading: false,
                },
                {
                    type: types.DELETE_ACCOUNTS_SUCCESS,
                    payload: { ids: completedIds },
                }
            )
        ).toEqual({
            accounts: accounts_data.filter(acct => {
                return !completedIds.includes(acct.meta.id);
            }),
            error: null,
            loading: false,
        });
    });

    it('should handle DELETE_ACCOUNTS_SUCCESS: multiple', () => {
        const completedIds = [accounts_data[1].meta.id, accounts_data[2].meta.id];
        expect(
            reducer(
                {
                    accounts: accounts_data,
                    error: null,
                    loading: false,
                },
                {
                    type: types.DELETE_ACCOUNTS_SUCCESS,
                    payload: { ids: completedIds },
                }
            )
        ).toEqual({
            accounts: accounts_data.filter(acct => {
                if (acct.meta.id !== accounts_data[1].meta.id && acct.meta.id !== accounts_data[2].meta.id) return acct;
            }),
            error: null,
            loading: false,
        });
    });

    it('should handle UPDATE_ACCOUNTS_REQUEST', () => {
        expect(
            reducer(initialState, {
                type: types.UPDATE_ACCOUNTS_REQUEST,
                payload: [],
            })
        ).toEqual({
            accounts: [],
            error: null,
            loading: true,
        });
    });

    it('should handle UPDATE_ACCOUNTS_FAILURE', () => {
        const testErrorMessage = 'test harness';

        expect(
            reducer(
                {
                    accounts: accounts_data,
                    error: null,
                    loading: false,
                },
                {
                    type: types.UPDATE_ACCOUNTS_FAILURE,
                    error: { message: testErrorMessage },
                }
            )
        ).toEqual({
            accounts: accounts_data,
            error: testErrorMessage,
            loading: false,
        });
    });

    it('should handle UPDATE_ACCOUNTS_SUCCESS:', () => {
        const patchData = accounts_data[1];
        patchData.description = 'test the patch';
        const patchedAccounts = accounts_data;
        patchedAccounts[1].description = 'test the patch';

        expect(
            reducer(
                {
                    accounts: accounts_data,
                    error: null,
                    loading: false,
                },
                {
                    type: types.UPDATE_ACCOUNTS_SUCCESS,
                    payload: patchData,
                }
            )
        ).toEqual({
            accounts: patchedAccounts,
            error: null,
            loading: false,
        });
    });

    it('should handle UPDATE_ACCOUNTS_SUCCESS failure to find:', () => {
        const patchData = accounts_data[1];
        patchData.meta.id = 'makeitfailbyid';

        expect(
            reducer(
                {
                    accounts: accounts_data,
                    error: null,
                    loading: false,
                },
                {
                    type: types.UPDATE_ACCOUNTS_SUCCESS,
                    payload: patchData,
                }
            )
        ).toEqual({
            accounts: accounts_data,
            error: null,
            loading: false,
        });
    });
});
