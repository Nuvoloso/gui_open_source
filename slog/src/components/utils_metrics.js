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
// utils_metrics
import * as constants from '../constants';

/**
 * Given an array of metrics violations, tally the total for each level.
 * @param {*} metrics
 */
export function getViolationLevels(metrics = []) {
    const violationLevels = { error: 0, ok: 0, warning: 0 };

    metrics.forEach(metric => {
        const { violationlevel } = metric || {};

        switch (violationlevel) {
            case constants.METRIC_VIOLATION_LEVELS.ERROR:
                violationLevels.error = violationLevels.error + 1;
                break;
            case constants.METRIC_VIOLATION_LEVELS.WARNING:
                violationLevels.warning = violationLevels.warning + 1;
                break;
            case constants.METRIC_VIOLATION_LEVELS.OK:
            default:
                violationLevels.ok = violationLevels.ok + 1;
                break;
        }
    });

    return violationLevels;
}
