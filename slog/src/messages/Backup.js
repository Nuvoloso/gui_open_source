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

export const backupMsgs = defineMessages({
    tabBackup: {
        id: 'backup.tabBackup',
        defaultMessage: 'BACKUP VOLUME',
    },
    tabBackupQueue: {
        id: 'backup.tabBackupQueue',
        defaultMessage: 'BACKUP QUEUE',
    },
    tabBackupHistory: {
        id: 'backup.tabBackupHistory',
        defaultMessage: 'BACKUP HISTORY',
    },
    titleSelectCG: {
        id: 'backup.titleSelectCG',
        defaultMessage: 'Select a Volume to Backup',
    },
    buttonSelectSnapshot: {
        id: 'backup.buttonSelectSnapshot',
        defaultMessage: 'ROLLBACK IN PLACE',
    },
    titleSelectSnapshot: {
        id: 'backup.titleSelectSnapshot',
        defaultMessage: 'Select a Snapshot to Backup',
    },
    buttonConfirm: {
        id: 'backup.buttonConfirm',
        defaultMessage: 'BACKUP CONSISTENCY GROUP',
    },
    titleConfirm: {
        id: 'backup.titleConfirm',
        defaultMessage: 'Confirm backup',
    },
    searchOptionsGroupName: {
        id: 'backup.searchOptionsGroupName',
        defaultMessage: 'Consistency Group Name',
    },
    searchOptionVolumeName: {
        id: 'backup.searchOptionVolumeName',
        defaultMessage: 'Contains Volume Name',
    },
    consistencyGroup: {
        id: 'backup.consistencyGroup',
        defaultMessage: 'Consistency Group',
    },
    volumes: {
        id: 'backup.volumes',
        defaultMessage: 'Volumes',
    },
    okButton: {
        id: 'backup.okButton',
        defaultMessage: 'OK',
    },
    enterName: {
        id: 'backup.enterName',
        defaultMessage: 'enter name...',
    },
    accountLabel: {
        id: 'backup.accountLabel',
        defaultMessage: 'Account:',
    },
    createdOnLabel: {
        id: 'backup.createdOnLabel',
        defaultMessage: 'Created on:',
    },
    snapshotsLabel: {
        id: 'backup.snapshotsLabel',
        defaultMessage: 'Snapshots:',
    },
    tagsLabel: {
        id: 'backup.tagsLabel',
        defaultMessage: 'Tags:',
    },
    servicePlanLabel: {
        id: 'backup.servicePlanLabel',
        defaultMessage: 'Service Plan:',
    },
    stateLabel: {
        id: 'backup.stateLabel',
        defaultMessage: 'State:',
    },
    sizeLabel: {
        id: 'backup.sizeLabel',
        defaultMessage: 'Size:',
    },
    backupAndRelocate: {
        id: 'backup.backupAndRelocate',
        defaultMessage: 'BACKUP & RELOCATE',
    },
    snapshot: {
        id: 'backup.snapshot',
        defaultMessage: 'Snapshot',
    },
    backup: {
        id: 'backup.backup',
        defaultMessage: 'Backup',
    },
    backupMethodInPlace: {
        id: 'backup.backupMethodInPlace',
        defaultMessage: 'Rollback in Place',
    },
    backupMethodRelocate: {
        id: 'backup.backupMethodRelocate',
        defaultMessage: 'Relocate',
    },
    backupApplicationGroupsAffected: {
        id: 'backupApplicationGroupsAffected',
        defaultMessage: 'Application {count, plural, one {Group} other {Groups}} Affected',
    },
    backupNumberPrefix: {
        id: 'backupNumberPrefix',
        defaultMessage: 'No.',
    },
    backupApplicationName: {
        id: 'backupApplicationName',
        defaultMessage: 'Application Name',
    },
    backupAccount: {
        id: 'backupAccount',
        defaultMessage: 'Account',
    },
    backupDescription: {
        id: 'backupDescription',
        defaultMessage: 'Description',
    },
    backupConsistencyGroups: {
        id: 'backupConsistencyGroups',
        defaultMessage: 'Consistency Groups',
    },
    backupWarning: {
        id: 'backupWarning',
        defaultMessage: 'BACKUP WARNING!',
    },
    backupWarningText: {
        id: 'backupWarningText',
        defaultMessage:
            'Warning: you are about to backup data to the specified location, overwriting any files or directories already present.',
    },
    backupLocationInformation: {
        id: 'backupLocationInformation',
        defaultMessage: 'Location Information',
    },
    backupPlaceholderPrefix: {
        id: 'backupPlaceholderPrefix',
        defaultMessage: 'prefix...',
    },
    backupPlaceholderCluster: {
        id: 'backupPlaceholderCluster',
        defaultMessage: 'pick a cluster...',
    },
    backupPlaceholderNodeCluster: {
        id: 'backupPlaceholderNodeCluster',
        defaultMessage: 'select cluster first',
    },
    backupPlaceholderNode: {
        id: 'backupPlaceholderNode',
        defaultMessage: 'pick a node...',
    },
    backupConsistencyGroupsAffected: {
        id: 'backupConsistencyGroupsAffected',
        defaultMessage: 'Consistency {count, plural, one {Group} other {Groups}} to Backup',
    },
    backupNoTasks: {
        id: 'backupNoTasks',
        defaultMessage: 'no tasks found',
    },
    tableName: {
        id: 'tableName',
        defaultMessage: 'Name',
    },
    tableStartTime: {
        id: 'tableStartTime',
        defaultMessage: 'Start Time',
    },
    tableEndTime: {
        id: 'tableEndTime',
        defaultMessage: 'End Time',
    },
    tableDuration: {
        id: 'tableDuration',
        defaultMessage: 'Duration',
    },
    tableStatus: {
        id: 'tableStatus',
        defaultMessage: 'Status',
    },
    tableActions: {
        id: 'tableActions',
        defaultMessage: 'Actions',
    },
    backupVolumeButton: {
        id: 'backupVolumeButton',
        defaultMessage: 'Backup Volume',
    },
    backupPercentComplete: {
        id: 'backupPercentComplete',
        defaultMessage: 'Complete %',
    },
});
