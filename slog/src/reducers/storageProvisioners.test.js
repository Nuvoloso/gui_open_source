import reducer from './pools';
import * as types from '../actions/types';

import { storage_provisioners_data } from '../../test/data_storage-provisioners';
import { normalize } from './storageProvisioners';

describe('storageProvisioners reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual({
            storageProvisioners: [],
            error: null,
            loading: false,
        });
    });

    it('should handle GET_STORAGE_PROVISIONERS_SUCCESS:', () => {
        expect(
            reducer([], {
                type: types.GET_STORAGE_PROVISIONERS_SUCCESS,
                payload: storage_provisioners_data,
            })
        ).toEqual({
            storageProvisioners: storage_provisioners_data.map(storageProvisioner => normalize(storageProvisioner)),
            error: null,
            loading: false,
        });
    });

    it('should handle GET_STORAGE_PROVISIONERS_REQUEST', () => {
        expect(
            reducer([], {
                type: types.GET_STORAGE_PROVISIONERS_REQUEST,
                payload: [],
            })
        ).toEqual({
            storageProvisioners: [],
            error: null,
            loading: true,
        });
    });

    it('should handle GET_STORAGE_PROVISIONERS_FAILURE', () => {
        const testErrorMessage = 'test harness';

        expect(
            reducer([], {
                type: types.GET_STORAGE_PROVISIONERS_FAILURE,
                error: { message: testErrorMessage },
            })
        ).toEqual({
            storageProvisioners: [],
            error: testErrorMessage,
            loading: false,
        });
    });
});
