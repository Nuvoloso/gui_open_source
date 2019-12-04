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
 * Normalize volumeSeries data returned from the REST API
 *
 * @param { object } volumeSeries - Volume series configured in system
 * @returns { object } - Normalized volumeSeries object
 */
export function normalizeVolumeSeries(volumeSeries) {
    return {
        accountId: volumeSeries.accountId,
        accountName: volumeSeries.accountName,
        applicationGroupIds: volumeSeries.applicationGroupIds,
        applicationGroupName: volumeSeries.applicationGroupName,
        boundClusterId: volumeSeries.boundClusterId || '',
        cacheAllocations: volumeSeries.cacheAllocations,
        clusterDescriptor: volumeSeries.clusterDescriptor,
        consistencyGroupId: volumeSeries.consistencyGroupId,
        consistencyGroupName: volumeSeries.consistencyGroupName,
        description: volumeSeries.description || '',
        extentStoreId: volumeSeries.extentStoreId,
        messages: volumeSeries.messages,
        meta: volumeSeries.meta,
        mounts: volumeSeries.mounts,
        name: volumeSeries.name,
        servicePlanAllocationId: volumeSeries.servicePlanAllocationId,
        servicePlanId: volumeSeries.servicePlanId,
        sizeBytes: volumeSeries.sizeBytes,
        snapshots: volumeSeries.snapshots || [],
        spaAdditionalBytes: volumeSeries.spaAdditionalBytes,
        storageFormula: volumeSeries.storageFormula,
        storageParcels: volumeSeries.storageParcels,
        tags: volumeSeries.tags,
        volumeSeriesState: volumeSeries.volumeSeriesState,
    };
}
