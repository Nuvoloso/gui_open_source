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

export function recoverInfoSubordinate(volumeSeries, recovers, vsr) {
    const { syncCoordinatorId, volumeSeriesCreateSpec, volumeSeriesId: relocateVolId = '' } = vsr;
    const parentVsr = recovers.find(v => v.meta.id === syncCoordinatorId);
    const { volumeSeriesId: originalVolumeSeriesId = '' } = parentVsr || {};
    const volume = volumeSeries.find(vol => {
        const { meta } = vol || {};
        const { id = '' } = meta || {};
        return id === originalVolumeSeriesId;
    });
    const { name: originalVolumeName = '' } = volume || {};
    const { name: relocateVolumeName = '' } = volumeSeriesCreateSpec || {};

    return {
        originalVolumeName,
        relocateVolId,
        relocateVolumeName,
    };
}

export function recoverInfo(volumeSeries, vsr) {
    const volume = volumeSeries.find(vol => {
        const { meta } = vol || {};
        const { id = '' } = meta || {};
        return id === vsr.volumeSeriesId;
    });
    const { name: originalVolumeName = '' } = volume || {};
    const { volumeSeriesId: relocateVolId = '' } = vsr || {};

    return {
        originalVolumeName,
        relocateVolId,
        relocateVolumeName: originalVolumeName,
    };
}

export function recoverInfoParent(volumeSeries, recovers, vsr) {
    const { volumeSeriesCreateSpec, volumeSeriesId: originalVolumeSeriesId = '' } = vsr;
    const volume = volumeSeries.find(vol => {
        const { meta } = vol || {};
        const { id = '' } = meta || {};
        return id === originalVolumeSeriesId;
    });
    const { name: originalVolumeName = '' } = volume || {};
    const { volumeSeriesId: relocateVolId = '' } = vsr || {};
    const { name: relocateVolumeName = '' } = volumeSeriesCreateSpec || {};

    return {
        originalVolumeName,
        relocateVolId,
        relocateVolumeName,
    };
}

export function includeRecoverInfoParent(recovers, vsr) {
    const { meta } = vsr;
    const { id } = meta;
    const subordinate = recovers.find(recover => {
        const { syncCoordinatorId = '' } = recover;
        return syncCoordinatorId === id;
    });
    return !subordinate;
}
