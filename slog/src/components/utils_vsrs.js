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

function vsrStateIsTerminated(vsr, isTerminated) {
    const { volumeSeriesRequestState } = vsr;

    const terminatedState =
        volumeSeriesRequestState === constants.VSR_COMPLETED_STATES.SUCCEEDED ||
        volumeSeriesRequestState === constants.VSR_COMPLETED_STATES.FAILED ||
        volumeSeriesRequestState === constants.VSR_COMPLETED_STATES.CANCELED;

    return isTerminated ? terminatedState : !terminatedState;
}

function vsrValidCG(vsr, consistencyGroups) {
    const consistencyGroup =
        consistencyGroups &&
        consistencyGroups.length > 0 &&
        consistencyGroups.find(cg => {
            return cg.meta.id === vsr.consistencyGroupId;
        });

    return consistencyGroup;
}

export function backupVsrs(vsrRequests, isTerminated, consistencyGroups) {
    const backupVsrs =
        (vsrRequests &&
            vsrRequests.filter(vsr => {
                return (
                    vsr.requestedOperations &&
                    vsr.requestedOperations.length > 0 &&
                    vsr.requestedOperations.includes(constants.VSR_OPERATIONS.CG_SNAPSHOT_CREATE) &&
                    vsrStateIsTerminated(vsr, isTerminated) &&
                    vsrValidCG(vsr, consistencyGroups)
                );
            })) ||
        [];

    return backupVsrs;
}

/**
 * Count a parent VSR only if it does not have a subordinate.
 * @param {*} vsrRequests
 * @param {*} vsr
 */
function countParentVsr(vsrRequests, vsr) {
    if (vsr.requestedOperations.includes(constants.VSR_OPERATIONS.CREATE_FROM_SNAPSHOT)) {
        const { meta } = vsr;
        const { id } = meta;
        const subordinate = vsrRequests.find(recover => {
            const { syncCoordinatorId = '' } = recover;
            return syncCoordinatorId === id;
        });
        return !subordinate;
    }
}

/**
 * Need to count a VSR if it is a parent without subordinates or
 * a completed operation on its own.
 * @param {*} vsrRequests
 * @param {*} isTerminated
 * @param {*} retrieveAll
 */
export function recoverVsrsCount(vsrRequests, isTerminated) {
    const recoverVrs =
        (vsrRequests &&
            vsrRequests.filter(vsr => {
                const { requestedOperations } = vsr;

                return (
                    requestedOperations &&
                    requestedOperations.length > 0 &&
                    vsrStateIsTerminated(vsr, isTerminated) &&
                    (requestedOperations.includes(constants.VSR_OPERATIONS.VOL_SNAPSHOT_RESTORE) ||
                        countParentVsr(vsrRequests, vsr))
                );
            })) ||
        [];

    return recoverVrs;
}

/**
 * Filter out all recover VSRs
 * @param {*} vsrRequests
 * @param {boolean} isTerminated : only terminated vsrs
 */
export function recoverVsrs(vsrRequests, isTerminated) {
    const recoverVrs =
        (vsrRequests &&
            vsrRequests.filter(vsr => {
                const { requestedOperations } = vsr;
                return (
                    requestedOperations &&
                    requestedOperations.length > 0 &&
                    vsrStateIsTerminated(vsr, isTerminated) &&
                    (requestedOperations.includes(constants.VSR_OPERATIONS.VOL_SNAPSHOT_RESTORE) ||
                        requestedOperations.includes(constants.VSR_OPERATIONS.CREATE_FROM_SNAPSHOT))
                );
            })) ||
        [];

    return recoverVrs;
}

export function getUpdatedList(list = [], itemToAdd = {}) {
    let resourceExisted = false;
    const updatedState = list.map(resource => {
        if (resource.meta.id === itemToAdd.meta.id) {
            resourceExisted = true;
            return itemToAdd;
        } else {
            return resource;
        }
    });

    if (!resourceExisted) {
        updatedState.push(itemToAdd);
    }

    return updatedState;
}
