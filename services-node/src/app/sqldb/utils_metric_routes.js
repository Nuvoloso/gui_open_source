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

import moment from 'moment';

/**
 * Compute the bucket size for the time series query based on the overall
 * duration of the query.  Anything longer than a day will bucket by hour,
 * otherwise by 10 minutes.
 * @param {*} startTime
 * @param {*} endTime
 */
export function bucketSize(startTime, endTime) {
    const duration = moment.duration(moment(endTime).diff(moment(startTime)));
    if (duration > moment.duration(2, 'd')) {
        return '1 hour';
    } else {
        return '5 minutes';
    }
}
