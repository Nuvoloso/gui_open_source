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
 * Compute delta and return string for hours/minutes.
 * Note: Days not included.
 * @param {*} startTime
 * @param {*} endTime
 */
export function durationDisplay(startTime, endTime) {
    const diff = moment(endTime).diff(moment(startTime));
    return formatDuration(diff, null, true);
}

export function formatDuration(diff, diffUnit, showZeroSeconds) {
    const diffDuration = diffUnit ? moment.duration(diff, diffUnit) : moment.duration(diff);

    const days = diffDuration.days();
    const hours = diffDuration.hours();
    const minutes = diffDuration.minutes();
    const seconds = diffDuration.seconds();

    return `
            ${days > 0 ? days : ''}
            ${days > 0 ? 'd' : ''}
            ${hours > 0 ? hours : ''}
            ${hours > 0 ? 'h' : ''}
            ${minutes > 0 ? minutes : ''}
            ${minutes > 0 ? 'm' : ''}
            ${showZeroSeconds || seconds > 0 ? `${seconds} s` : ''}`;
}
