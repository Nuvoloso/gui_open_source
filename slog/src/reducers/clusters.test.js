import reducer from './clusters';
import * as types from '../actions/types';

import { clusters_data } from '../../test/data_clusters';
import { normalize } from './clusters';

describe('clusters reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqual({
            clusters: [],
            error: null,
            loading: false,
        });
    });

    it('should handle GET_CLUSTERS_SUCCESS:', () => {
        expect(
            reducer([], {
                type: types.GET_CLUSTERS_SUCCESS,
                payload: clusters_data,
            })
        ).toEqual({
            clusters: normalize(clusters_data),
            error: null,
            loading: false,
        });
    });

    it('should handle GET_CLUSTERS_REQUEST', () => {
        expect(
            reducer([], {
                type: types.GET_CLUSTERS_REQUEST,
                payload: [],
            })
        ).toEqual({
            clusters: [],
            error: null,
            loading: true,
        });
    });

    it('should handle GET_CLUSTERS_FAILURE', () => {
        const errorString = 'Error fetching clusters';

        expect(
            reducer([], {
                type: types.GET_CLUSTERS_FAILURE,
                error: { response: { data: { message: errorString } } },
            })
        ).toEqual({
            clusters: [],
            error: errorString,
            loading: false,
        });
    });
});
