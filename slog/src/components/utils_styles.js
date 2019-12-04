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

export function violationLevelColor(violationLevel) {
    switch (violationLevel) {
        case constants.METRIC_VIOLATION_LEVELS.ERROR:
            return 'nuvo-color-critical-red';
        case constants.METRIC_VIOLATION_LEVELS.WARNING:
            return 'nuvo-color-neutral-yellow';
        case constants.METRIC_VIOLATION_LEVELS.OK:
            return 'nuvo-color-safe-green';
        default:
            return '';
    }
}
