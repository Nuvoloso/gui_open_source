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

/**
 * Join AG names into a string separated by commas.
 */
export function applicationGroupsNames(applicationGroups, ids = []) {
    const names = applicationGroupsNamesAsArray(applicationGroups, ids) || [];

    return names.join(', ');
}

export function applicationGroupsNamesAsArray(applicationGroups, ids = []) {
    const names = [];

    ids.forEach(id => {
        const ag = applicationGroups.find(ag => {
            return ag.meta.id === id;
        });
        if (ag) {
            names.push(ag.name);
        }
    });

    return names;
}

export function findApplicationGroupIds(consistencyGroups = [], consistencyGroupId) {
    const consistencyGroup = consistencyGroups.find(cg => {
        const { meta } = cg || {};
        const { id } = meta || {};

        return id === consistencyGroupId;
    });

    const { applicationGroupIds = [] } = consistencyGroup || {};

    return applicationGroupIds;
}
