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
import { defineMessages } from 'react-intl';

export const vsrMsgs = defineMessages({
    volumeSeriesRequests: {
        id: 'vsr.volumeSeriesRequests',
        defaultMessage: 'Volume Series Requests',
    },
    newDesc: {
        id: 'vsr.newDesc',
        defaultMessage: 'Initial state.',
    },
    creatingDesc: {
        id: 'vsr.creatingDesc',
        defaultMessage: 'A new volume series object is being created.',
    },
    bindingDesc: {
        id: 'vsr.bindingDesc',
        defaultMessage: 'Binding volume series to cluster.',
    },
    capacityWaitDesc: {
        id: 'vsr.capacityWaitDesc',
        defaultMessage: 'Binding is waiting for storage provisioner capacity to become available.',
    },
    sizingDesc: {
        id: 'vsr.sizingDesc',
        defaultMessage: 'The initial physical size is being determined.',
    },
    placementDesc: {
        id: 'vsr.placementDesc',
        defaultMessage: 'Obtaining storage parcels from the selected provisioners on the appropriate nodes.',
    },
    publishingDesc: {
        id: 'vsr.publishingDesc',
        defaultMessage: 'The volume is being published.',
    },
    publishingServicePlanDesc: {
        id: 'vsr.publishingServicePlanDesc',
        defaultMessage: 'The service plan is being published to a cluster.',
    },
    storageWaitDesc: {
        id: 'vsr.storageWaitDesc',
        defaultMessage: 'Placement is waiting for storage operations to complete.',
    },
    volumeConfigDesc: {
        id: 'vsr.volumeConfigDesc',
        defaultMessage: 'The volume series device configuration is taking place.',
    },
    volumeExportDesc: {
        id: 'vsr.volumeExportDesc',
        defaultMessage: 'The volume series device is being exposed to the operating system.',
    },
    undoVolumeExportDesc: {
        id: 'vsr.undoVolumeExportDesc',
        defaultMessage: 'The volume series device is being withdrawn from visibility.',
    },
    undoVolumeConfigDesc: {
        id: 'vsr.undoVolumeConfigDesc',
        defaultMessage: 'The volume series device configuration is being undone.',
    },
    undoPlacementDesc: {
        id: 'vsr.undoPlacementDesc',
        defaultMessage: 'Storage parcels are being released.',
    },
    undoSizingDesc: {
        id: 'vsr.undoSizingDesc',
        defaultMessage: 'The physical size calculations are being discarded.',
    },
    undoBindingDesc: {
        id: 'vsr.undoBindingDesc',
        defaultMessage: 'The volume series is being unbound from the cluster.',
    },
    undoCreatingDesc: {
        id: 'vsr.undoCreatingDesc',
        defaultMessage: 'The volume series object is being deleted.',
    },
    succeededDesc: {
        id: 'vsr.succeededDesc',
        defaultMessage: 'SUCCESS',
    },
    failedDesc: {
        id: 'vsr.failedDesc',
        defaultMessage: 'FAILURE',
    },
    cancelAlert: {
        id: 'vsrMsgs.cancelAlert',
        defaultMessage: 'This will cancel the volume series request.',
    },
    cancelAlertName: {
        id: 'vsrMsgs.cancelAlertName',
        defaultMessage: 'This will cancel the volume series request for {name}.',
    },
    canceledDesc: {
        id: 'vsr.canceledDesc',
        defaultMessage: 'CANCELED',
    },
    cancelBtn: {
        id: 'vsr.cancelBtn',
        defaultMessage: 'Cancel Volume Series Request',
    },
    cancelingBtn: {
        id: 'vsr.cancelingBtn',
        defaultMessage: 'Canceling Volume Series Request',
    },
    canceledBtn: {
        id: 'vsr.canceledBtn',
        defaultMessage: 'Volume Series Request Canceled',
    },
    confirmCancelTitle: {
        id: 'vsr.confirmCancelTitle',
        defaultMessage: 'Cancel Volume Series Request',
    },
    canceled: {
        id: 'vsr.canceled',
        defaultMessage: 'Canceled',
    },
    creatingFromSnapshotDesc: {
        id: 'vsr.creatingFromSnapshotDesc',
        defaultMessage: 'Creating from snapshot',
    },
    snapshotRestoreDesc: {
        id: 'vsr.snapshotRestore',
        defaultMessage: 'Snapshot restore',
    },
    cgSnapshotCreate: {
        id: 'vsr.cgSnapshotCreate',
        defaultMessage: 'Snapshot create',
    },
    volSnapshotCreate: {
        id: 'vsr.volSnapshotCreate',
        defaultMessage: 'Volume snapshot create',
    },
    volSnapshotRestore: {
        id: 'vsr.volSnapshotRestore',
        defaultMessage: 'Volume snapshot restore',
    },
    volSnapshotDelete: {
        id: 'vsr.volSnapshotDelete',
        defaultMessage: 'Volume snapshot delete',
    },
    undoCreatingPITDesc: {
        id: 'vsr.undoCreatingPITDesc',
        defaultMessage: 'Undo creating PIT',
    },
    allocateCapacityDesc: {
        id: 'vsr.allocateCapacityDesc',
        defaultMessage: 'Allocate capacity',
    },
    bindDesc: {
        id: 'vsr.bindDesc',
        defaultMessage: 'Bind volume',
    },
    changeServicePlanDesc: {
        id: 'vsr.changeServicePlanDesc',
        defaultMessage: 'Change service plan',
    },
    createFromSnapshotDesc: {
        id: 'vsr.createFromSnapshotDesc',
        defaultMessage: 'Create from snapshot',
    },
    createDesc: {
        id: 'vsr.createDesc',
        defaultMessage: 'Create',
    },
    deleteDesc: {
        id: 'vsr.deleteDesc',
        defaultMessage: 'Delete',
    },
    growDesc: {
        id: 'vsr.growDesc',
        defaultMessage: 'Grow',
    },
    mountDesc: {
        id: 'vsr.mountDesc',
        defaultMessage: 'Mount',
    },
    provisionDesc: {
        id: 'vsr.provisionDesc',
        defaultMessage: 'Provision',
    },
    renameDesc: {
        id: 'vsr.renameDesc',
        defaultMessage: 'Rename',
    },
    unmountDesc: {
        id: 'vsr.unmountDesc',
        defaultMessage: 'Unmount',
    },
    cgSnapshotVolumesDesc: {
        id: 'vsr.cgSnapshotVolumesDesc',
        defaultMessage: 'Consistency group snapshot volumes',
    },
    cgSnapshotWaitDesc: {
        id: 'vsr.cgSnapshotWaitDesc',
        defaultMessage: 'Consistency group snapshot wait',
    },
    createdPITDesc: {
        id: 'vsr.createdPITDesc',
        defaultMessage: 'Created PIT',
    },
    creatingPITDesc: {
        id: 'vsr.creatingPITDesc',
        defaultMessage: 'Creating PIT',
    },
    finalizingSnapshotDesc: {
        id: 'vsr.finalizingSnapshotDesc',
        defaultMessage: 'Finalizing snapshot',
    },
    pausedIODesc: {
        id: 'vsr.pausedIODesc',
        defaultMessage: 'Paused IO',
    },
    pausingIODesc: {
        id: 'vsr.pausingIODesc',
        defaultMessage: 'Pausing IO',
    },
    snapshotRestoreDoneDesc: {
        id: 'vsr.snapshotRestoreDoneDesc',
        defaultMessage: 'Snapshot restore done',
    },
    snapshotRestoreFinalizeDesc: {
        id: 'vsr.snapshotRestoreFinalizeDesc',
        defaultMessage: 'Snapshot restore finalize',
    },
    snapshotUploadingDesc: {
        id: 'vsr.snapshotUploadingDesc',
        defaultMessage: 'Snapshot uploading',
    },
    snapshotUploadDoneDesc: {
        id: 'vsr.snapshotUploadDoneDesc',
        defaultMessage: 'Snapshot upload done',
    },
    undoAllocateCapacityDesc: {
        id: 'vsr.undoAllocateCapacityDesc',
        defaultMessage: 'Undo allocate capacity',
    },
    undoCgSnapshotVolumesDesc: {
        id: 'vsr.undoCgSnapshotVolumesDesc',
        defaultMessage: 'Consistency group snapshot volumes',
    },
    undoCreatedPITDesc: {
        id: 'vsr.undoCreatedPITDesc',
        defaultMessage: 'Undo created PIT',
    },
    undoCreatingFromSnapshotDesc: {
        id: 'vsr.undoCreatingFromSnapshotDesc',
        defaultMessage: 'Undo creating from snapshot',
    },
    undoPausedIODesc: {
        id: 'vsr.undoPausedIODesc',
        defaultMessage: 'Undo paused IO',
    },
    undoPausingIODesc: {
        id: 'vsr.undoPausingIODesc',
        defaultMessage: 'Undo pausing IO',
    },
    undoSnapshotRestoreDesc: {
        id: 'vsr.undoSnapshotRestoreDesc',
        defaultMessage: 'Undo snapshot restore',
    },
    undoSnapshotUploadingDesc: {
        id: 'vsr.undoSnapshotUploadingDesc',
        defaultMessage: 'Undo snpashot uploading',
    },
    uploadDoneDesc: {
        id: 'vsr.uploadDoneDesc',
        defaultMessage: 'Upload done',
    },
    cgSnapshotFinalizeDesc: {
        id: 'vsr.cgSnapshotFinalizeDesc',
        defaultMessage: 'Finalizing snapshot',
    },
    allocatingCapacityDesc: {
        id: 'vsr.allocatingCapacityDesc',
        defaultMessage: 'Allocating capacity',
    },
    attachingFileSystemDesc: {
        id: 'vsr.attachingFileSystemDesc',
        defaultMessage: 'Attaching file system',
    },
    changingCapacityDesc: {
        id: 'vsr.changingCapacityDesc',
        defaultMessage: 'Changing capacity',
    },
    deletingSpaDesc: {
        id: 'vsr.deletingSpaDesc',
        defaultMessage: 'Deleting pool',
    },
    renamingDesc: {
        id: 'vsr.renamingDesc',
        defaultMessage: 'Renaming',
    },
    undoAttachingFileSystemDesc: {
        id: 'vsr.undoAttachingFileSystemDesc',
        defaultMessage: 'Undo attach of file system',
    },
    undoChangingCapacityDesc: {
        id: 'vsr.undoChangingCapacityDesc',
        defaultMessage: 'Undo capacity allocation',
    },
    undoPublishingDesc: {
        id: 'vsr.undoPublishingDesc',
        defaultMessage: 'Undo publish',
    },
    undoRenamingDesc: {
        id: 'vsr.undoRenamingDesc',
        defaultMessage: 'Undo rename',
    },
    request: {
        id: 'vsr.request',
        defaultMessage: 'Request',
    },
    noVolumeSeriesRequests: {
        id: 'vsr.noVolumeSeriesRequests',
        defaultMessage: 'No Volume Series Requests',
    },
});
