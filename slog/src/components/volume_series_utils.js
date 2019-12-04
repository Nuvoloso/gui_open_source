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

import * as types from '../actions/types';

export function updateNavigationList(volumeSeries) {
    return dispatch => {
        /**
         * In the VolumeSeriesTable, we stash the id from the
         * metadata for easy compares.  Map the data here the
         * same way.
         */
        const data = volumeSeries.map(vol => {
            const { meta } = vol || {};
            const { id } = meta || {};

            return {
                ...vol,
                id,
            };
        });

        /**
         * When loading the data, need to default to same sorting
         * method the table does (lower case name comparison).
         */
        data.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            if (aName < bName) {
                return -1;
            }
            if (aName > bName) {
                return 1;
            }
            return 0;
        });

        dispatch({ type: types.SET_RESOURCE_NAVIGATION_DATA, data });
    };
}
