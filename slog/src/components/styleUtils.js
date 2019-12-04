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
import * as constants from '../constants';

/**
 * Return one of several colors in a range given the count and the max in the range.
 * @param {*} count
 * @param {*} maxValue
 */
export function getColorClassname(count, maxValue) {
    const percentage = count / maxValue;
    if (percentage >= 1.0) {
        return 'compliance-cell-l3';
    } else if (percentage >= 0.3) {
        return 'compliance-cell-l2';
    } else if (percentage > 0) {
        return 'compliance-cell-l1';
    } else {
        return 'compliance-cell-ok';
    }
}

/**
 * Return red/yellow/ok colors given the count and maxvalues.
 * @param {*} count
 */
export function getSeverityColor(count) {
    if (count >= constants.METRICS_SP_ERROR_BASE) {
        return 'compliance-cell-l3';
    } else if (count > 0) {
        return 'compliance-cell-l2';
    } else {
        return 'compliance-cell-ok';
    }
}

export function getSeverityCountsByClassName(chartConfig, yCount) {
    const { series = [] } = chartConfig || {};
    const { data = [] } = series[0];
    const counts = { error: 0, ok: 0, warning: 0 };

    if (data) {
        data.forEach(d => {
            const { className, y = 1 } = d || {};
            const { error = 0, ok = 0, warning = 0 } = counts || {};

            const multiplier = yCount ? y : 1;

            switch (className) {
                case 'compliance-cell-ok':
                case 'compliance-ok':
                    counts.ok = ok + multiplier;
                    break;
                case 'compliance-cell-l1':
                case 'compliance-cell-l2':
                case 'compliance-l1':
                case 'compliance-l2':
                    counts.warning = warning + multiplier;
                    break;
                case 'compliance-cell-l3':
                case 'compliance-l3':
                    counts.error = error + multiplier;
                    break;
                default:
                    counts.ok = ok + multiplier;
                    break;
            }
        });
    }

    return counts;
}
