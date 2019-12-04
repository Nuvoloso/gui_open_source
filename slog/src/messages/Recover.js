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

export const recoverMsgs = defineMessages({
    tabRecover: {
        id: 'recover.tabRecover',
        defaultMessage: 'RECOVER VOLUME',
    },
    tabRecoveryQueue: {
        id: 'recover.tabRecoveryQueue',
        defaultMessage: 'RECOVERY QUEUE',
    },
    tabRecoveryHistory: {
        id: 'recover.tabRecoveryHistory',
        defaultMessage: 'RECOVERY HISTORY',
    },
    titleSelectCG: {
        id: 'recover.titleSelectCG',
        defaultMessage: 'Select a Volume to Recover',
    },
    buttonSelectSnapshot: {
        id: 'recover.buttonSelectSnapshot',
        defaultMessage: 'ROLLBACK IN PLACE',
    },
    titleSelectSnapshot: {
        id: 'recover.titleSelectSnapshot',
        defaultMessage: 'Select a Snapshot to Recover',
    },
    buttonConfirm: {
        id: 'recover.buttonConfirm',
        defaultMessage: 'RECOVER VOLUME',
    },
    titleConfirm: {
        id: 'recover.titleConfirm',
        defaultMessage: 'Confirm recovery',
    },
    searchOptionsGroupName: {
        id: 'recover.searchOptionsGroupName',
        defaultMessage: 'Consistency Group Name',
    },
    searchOptionVolumeName: {
        id: 'recover.searchOptionVolumeName',
        defaultMessage: 'Contains Volume Name',
    },
    consistencyGroup: {
        id: 'recover.consistencyGroup',
        defaultMessage: 'Consistency Group',
    },
    volumes: {
        id: 'recover.volumes',
        defaultMessage: 'Volumes',
    },
    okButton: {
        id: 'recover.okButton',
        defaultMessage: 'OK',
    },
    enterName: {
        id: 'recover.enterName',
        defaultMessage: 'enter name...',
    },
    accountLabel: {
        id: 'recover.accountLabel',
        defaultMessage: 'Account:',
    },
    createdOnLabel: {
        id: 'recover.createdOnLabel',
        defaultMessage: 'Created on:',
    },
    snapshotsLabel: {
        id: 'recover.snapshotsLabel',
        defaultMessage: 'Snapshots:',
    },
    tagsLabel: {
        id: 'recover.tagsLabel',
        defaultMessage: 'Tags:',
    },
    servicePlanLabel: {
        id: 'recover.servicePlanLabel',
        defaultMessage: 'Service Plan:',
    },
    stateLabel: {
        id: 'recover.stateLabel',
        defaultMessage: 'State:',
    },
    sizeLabel: {
        id: 'recover.sizeLabel',
        defaultMessage: 'Size:',
    },
    recoverAndRelocate: {
        id: 'recover.recoverAndRelocate',
        defaultMessage: 'RECOVER & RELOCATE',
    },
    snapshot: {
        id: 'recover.snapshot',
        defaultMessage: 'Snapshot',
    },
    recovery: {
        id: 'recover.recovery',
        defaultMessage: 'Recovery',
    },
    recoveryMethodInPlace: {
        id: 'recover.recoveryMethodInPlace',
        defaultMessage: 'Rollback in Place',
    },
    recoveryMethodRelocate: {
        id: 'recover.recoveryMethodRelocate',
        defaultMessage: 'Relocate',
    },
    applicationGroupsAffected: {
        id: 'applicationGroupsAffected',
        defaultMessage: 'Application {count, plural, one {Group} other {Groups}} Affected',
    },
    numberPrefix: {
        id: 'number',
        defaultMessage: 'No.',
    },
    applicationName: {
        id: 'applicationName',
        defaultMessage: 'Application Name',
    },
    account: {
        id: 'account',
        defaultMessage: 'Account',
    },
    description: {
        id: 'description',
        defaultMessage: 'Description',
    },
    consistencyGroups: {
        id: 'consistencyGroups',
        defaultMessage: 'Consistency Groups',
    },

    recoveryWarning: {
        id: 'recoveryWarning',
        defaultMessage: 'RECOVERY WARNING!',
    },
    recoveryWarningText: {
        id: 'recoveryWarningText',
        defaultMessage:
            'Warning: you are about to recover data to the specified location, overwriting any files or directories already present.',
    },
    locationInformation: {
        id: 'locationInformation',
        defaultMessage: 'Volume Information',
    },
    placeholderPrefix: {
        id: 'placeholderPrefix',
        defaultMessage: 'prefix...',
    },
    placeholderCluster: {
        id: 'placeholderCluster',
        defaultMessage: 'pick a cluster...',
    },
    placeholderNodeCluster: {
        id: 'placeholderNodeCluster',
        defaultMessage: 'select cluster first',
    },
    placeholderNode: {
        id: 'placeholderNode',
        defaultMessage: 'pick a node...',
    },
    recoverTableName: {
        id: 'recoverTableName',
        defaultMessage: 'Name',
    },
    recoverTableStartTime: {
        id: 'recoverTableStartTime',
        defaultMessage: 'Start Time',
    },
    recoverTableEndTime: {
        id: 'recoverTableEndTime',
        defaultMessage: 'End Time',
    },
    recoverTableDuration: {
        id: 'recoverTableDuration',
        defaultMessage: 'Duration',
    },
    recoverTableResult: {
        id: 'recoverTableResult',
        defaultMessage: 'Result',
    },
    recoverTableStatus: {
        id: 'recoverTableStatus',
        defaultMessage: 'Status',
    },
    recoverTableActions: {
        id: 'recoverTableActions',
        defaultMessage: 'Actions',
    },
    recoverNoTasks: {
        id: 'recoverNoTasks',
        defaultMessage: 'no tasks found',
    },
    recoverVolume: {
        id: 'recoverVolume',
        defaultMessage: 'Recover Volume',
    },
    recoverTableRecoveredName: {
        id: 'recoverTableRecoveredName',
        defaultMessage: 'Recovered Name',
    },
    locationPrefix: {
        id: 'locationPrefix',
        defaultMessage: 'Volume Prefix',
    },
    existingServicePlanLabel: {
        id: 'existingServicePlanLabel',
        defaultMessage: 'Existing Service Plan',
    },
    servicePlanOptionalLabel: {
        id: 'servicePlanOptionalLabel',
        defaultMessage: 'Service Plan (optional)',
    },
    recoverPercentComplete: {
        id: 'recoverPercentComplete',
        defaultMessage: 'Complete %',
    },
    recoverTableRecoverName: {
        id: 'recoverTableRecoverName',
        defaultMessage: 'Recover Name',
    },
    recoverProcessClusterDefaults: {
        id: 'recoverProcessClusterDefaults',
        defaultMessage: 'Automatically chosen',
    },
    recoverProcessLabelCluster: {
        id: 'recoverProcessLabelCluster',
        defaultMessage: 'Cluster',
    },
    priorClusterNameLabel: {
        id: 'priorClusterNameLabel',
        defaultMessage: 'Prior',
    },
    targetClusterNameLabel: {
        id: 'targetClusterNameLabel',
        defaultMessage: 'Target',
    },
});
