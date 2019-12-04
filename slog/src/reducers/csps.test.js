import reducer from './csps';
import * as types from '../actions/types';

import { csp_domains_data } from '../../test/data_csp-domains';
import { normalize } from './csps';

describe('csps reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual({
            csps: [],
            error: null,
            loading: false,
        });
    });

    it('should handle GET_CSPS_SUCCESS:', () => {
        expect(
            reducer([], {
                type: types.GET_CSPS_SUCCESS,
                payload: csp_domains_data,
            })
        ).toEqual({
            csps: csp_domains_data.map(csp => normalize(csp)),
            error: null,
            loading: false,
        });
    });

    it('should handle GET_CSPS_REQUEST', () => {
        expect(
            reducer([], {
                type: types.GET_CSPS_REQUEST,
                payload: [],
            })
        ).toEqual({
            csps: [],
            error: null,
            loading: true,
        });
    });

    it('should handle GET_CSPS_FAILURE', () => {
        const testErrorMessage = 'test harness';

        expect(
            reducer([], {
                type: types.GET_CSPS_FAILURE,
                error: { message: testErrorMessage },
            })
        ).toEqual({
            csps: [],
            error: testErrorMessage,
            loading: false,
        });
    });
});
