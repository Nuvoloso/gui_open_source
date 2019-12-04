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

export const messages = defineMessages({
    // actions
    cancel: {
        id: 'messages.cancel',
        defaultMessage: 'Cancel',
    },
    close: {
        id: 'messages.close',
        defaultMessage: 'Close',
    },
    create: {
        id: 'messages.create',
        defaultMessage: 'Create',
    },
    delete: {
        id: 'messages.delete',
        defaultMessage: 'Delete',
    },
    edit: {
        id: 'messages.edit',
        defaultMessage: 'Edit',
    },
    ok: {
        id: 'messages.ok',
        defaultMessage: 'OK',
    },
    saveChanges: {
        id: 'messages.saveChanges',
        defaultMessage: 'Save Changes',
    },
    submit: {
        id: 'messages.submit',
        defaultMessage: 'Submit',
    },
    copyToClipboard: {
        id: 'messages.copyToClipboard',
        defaultMessage: 'Copy to clipboard',
    },
    copied: {
        id: 'messages.copied',
        defaultMessage: 'Copied',
    },
    // info
    alertMsg: {
        id: 'messages.alertMsg',
        defaultMessage: 'Are you sure?',
    },
    disabledTag: {
        id: 'messages.disabledTag',
        defaultMessage: '(disabled)',
    },
    error: {
        id: 'messages.error',
        defaultMessage: 'Error',
    },
    good: {
        id: 'messages.good',
        defaultMessage: 'Good',
    },
    loading: {
        id: 'messages.loading',
        defaultMessage: 'Loading',
    },
    missingRequired: {
        id: 'messages.missingRequiredDependencies',
        defaultMessage: 'Missing Required {count, plural, one {Dependency} other {Dependencies}}',
    },
    na: {
        id: 'messages.na',
        defaultMessage: 'N/A',
    },
    total: {
        id: 'messages.total',
        defaultMessage: 'Total',
    },
    unknown: {
        id: 'messages.unknown',
        defaultMessage: 'Unknown',
    },
    warning: {
        id: 'messages.warning',
        defaultMessage: 'Warning',
    },
    // objects
    nameLabel: {
        id: 'messages.nameLabel',
        defaultMessage: 'Name',
    },
    volumesLabel: {
        id: 'messages.volumesLabel',
        defaultMessage: '{count, plural, one {Volume} other {Volumes}}',
    },
    tooltipVolumes: {
        id: 'messages.tooltipVolumes',
        defaultMessage: 'Volumes',
    },
    tooltipServicePlans: {
        id: 'messages.tooltipServicePlans',
        defaultMessage: 'Service Plans',
    },
    tooltipApplicationGroups: {
        id: 'messages.tooltipApplicationGroups',
        defaultMessage: 'Application Groups',
    },
    tooltipConsistencyGroups: {
        id: 'messages.tooltipConsistencyGroups',
        defaultMessage: 'Consistency Groups',
    },
    consistencyGroupsLabel: {
        id: 'messages.consistencyGroupsLabel',
        defaultMessage: 'Consistency Groups',
    },
    descriptionLabel: {
        id: 'messages.descriptionLabel',
        defaultMessage: 'Description',
    },
    appGroupsLabel: {
        id: 'messages.appGroupsLabel',
        defaultMessage: '{count, plural, one {Application Group} other {Application Groups}}',
    },
    servicePlansLabel: {
        id: 'messages.servicePlansLabel',
        defaultMessage: '{count, plural, one {Service Plan} other {Service Plans}}',
    },
    tagsLabel: {
        id: 'messages.tagsLabel',
        defaultMessage: 'Tags',
    },
    tagsPlaceholder: {
        id: 'messages.tagsPlaceholder',
        defaultMessage: 'Enter tags',
    },
    // sizes
    gib: {
        id: 'messages.gib',
        defaultMessage: 'GiB',
    },
    tib: {
        id: 'messages.tib',
        defaultMessage: 'TiB',
    },
    // cards
    collapse: {
        id: 'messages.collapse',
        defaultMessage: 'Collapse',
    },
    expand: {
        id: 'messages.expand',
        defaultMessage: 'Expand',
    },
    viewOptions: {
        id: 'messages.viewOptions',
        defaultMessage: 'View Options',
    },
    // ws
    connectionStatus: {
        id: 'messages.connectionStatus',
        defaultMessage: 'Connection Status',
    },
    disconnected: {
        id: 'messages.disconnected',
        defaultMessage: 'Disconnected from system',
    },
    reconnecting: {
        id: 'messages.reconnecting',
        defaultMessage: 'Reconnecting to system...',
    },
    watcherConnecting: {
        id: 'messages.watcherConnecting',
        defaultMessage: 'Connecting to central service...',
    },
    watcherDisconnected: {
        id: 'messages.watcherDisconnected',
        defaultMessage: 'Disconnected from central service',
    },
    watcherDisconnectedBanner: {
        id: 'messages.watcherDisconnectedBanner',
        defaultMessage: 'Disconnected from central service.',
    },
    //
    filter: {
        id: 'messages.filter',
        defaultMessage: 'Filter',
    },
    filterInfo: {
        id: 'messages.filterInfo',
        defaultMessage:
            'Any characters entered here will filter volumes that match the string displayed in the Compliance panel',
    },
    filterInfoTouch: {
        id: 'messages.filterInfoTouch',
        defaultMessage: 'Filter volumes to be displayed',
    },
    // abbreviations for time periods
    abbrevDay: {
        id: 'messages.abbrevDay',
        defaultMessage: 'D',
    },
    abbrevWeek: {
        id: 'messages.abbrevWeek',
        defaultMessage: 'W',
    },
    abbrevMonth: {
        id: 'messages.abbrevMonth',
        defaultMessage: 'M',
    },
    day: {
        id: 'messages.day',
        defaultMessage: 'Day',
    },
    week: {
        id: 'messages.week',
        defaultMessage: 'Week',
    },
    month: {
        id: 'messages.month',
        defaultMessage: 'Month',
    },
    waitingForMetricsDB: {
        id: 'messages.waitingForMetricsDB',
        defaultMessage: 'WAITING FOR METRICS DATABASE',
    },
    offlineMode: {
        id: 'messages.offlineMode',
        defaultMessage: 'You are in offline mode.',
    },
    offlineRefresh: {
        id: 'message.offlineRefresh',
        defaultMessage: 'To go back online, refresh the page.',
    },
    selectedLabel: {
        id: 'messages.selectedLabel',
        defaultMessage: 'Selected',
    },
    displayedLabel: {
        id: 'messages.displayedLabel',
        defaultMessage: 'Displayed',
    },
    displayedColumns: {
        id: 'messages.displayedColumns',
        defaultMessage: 'Displayed Columns',
    },
});
