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
 * Generate tag to be stored in service plan to track SPA cost per authorized account/cluster.
 * Format: _SERVICE_PLAN_ALLOCATION_COST.cost
 * @param {*} cost
 */
export function spaTagGenCost(cost) {
    return `${constants.TAG_SERVICE_PLAN_ALLOCATION_COST}.${cost}`;
}

/**
 * Retrieve cost information for authorized account/cluster from the service plan tags.
 * Format: _SERVICE_PLAN_ALLOCATION_COST.cost
 * @param {*} tags
 */
export function spaTagGetCost(tags = []) {
    let cost = null;

    const costTag = tags.find(tag => {
        const values = tag.split('.');
        if (values[0] === constants.TAG_SERVICE_PLAN_ALLOCATION_COST) {
            return 1;
        } else {
            return 0;
        }
    });

    if (costTag) {
        const periodIdx = costTag.indexOf('.');
        cost = costTag.substring(periodIdx + 1);
    }

    return cost ? `${Number.parseFloat(cost).toFixed(constants.MAX_NUMBER_COST_DECIMAL_POINTS)}` : 0;
}
