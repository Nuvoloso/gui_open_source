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

export const poolMsgs = defineMessages({
    tableTitle: {
        id: 'pool.tableTitle',
        defaultMessage: 'Resource Pools',
    },
    tableName: {
        id: 'pool.tableName',
        defaultMessage: 'Name',
    },
    tableCspDomain: {
        id: 'pool.tableCspDomain',
        defaultMessage: 'CSP Domain',
    },
    tableStorageType: {
        id: 'pool.tableStorageType',
        defaultMessage: 'Storage Type',
    },
    tableUsedCapacity: {
        id: 'pool.tableUsedCapacity',
        defaultMessage: 'Used Capacity',
    },
    tableDescription: {
        id: 'pool.tableDescription',
        defaultMessage: 'Description',
    },
    tableTags: {
        id: 'pool.tableTags',
        defaultMessage: 'Tags',
    },
    toolbarCreate: {
        id: 'pool.toolbarCreate',
        defaultMessage: 'Create Resource Pool',
    },
    toolbarEdit: {
        id: 'pool.toolbarEdit',
        defaultMessage: 'Edit',
    },
    toolbarModifyCapacity: {
        id: 'pool.toolbarModifyCapacity',
        defaultMessage: 'Modify Capacity',
    },
    toolbarDelete: {
        id: 'pool.toolbarDelete',
        defaultMessage: 'Delete',
    },
    utilizationChartTitle: {
        id: 'pool.utilizationChartTitle',
        defaultMessage: 'Utilization Over Time',
    },
    utilizationChartYLabel: {
        id: 'pool.utilizationChartYLabel',
        defaultMessage: '% Used',
    },
    utilizationChartInfo: {
        id: 'pool.utilizationChartInfo',
        defaultMessage: 'Click and drag inside the chart to zoom in. Hold down shift key to pan.',
    },
    utilizationChartInfoTouch: {
        id: 'pool.utilizationChartInfoTouch',
        defaultMessage: 'Pinch the chart to zoom in. Use two finger drag to pan.',
    },
    utilizationChartSubtitle: {
        id: 'pool.utilizationChartSubtitle',
        defaultMessage:
            'Showing {numSelected} {numSelected, plural, one {resource pool} other {resource pools}} over {numPeriod} {numPeriod, plural, one {day} other {days}}',
    },
    utilizationChartSubtitlePlaceholder: {
        id: 'pool.utilizationChartSubtitlePlaceholder',
        defaultMessage: 'Select one or more resource pools',
    },
    utilizationChartTrendLabel: {
        id: 'pool.utilizationChartTrendLabel',
        defaultMessage: 'Trendline of New Maximum Capacity',
    },
    utilizationChartThresholdLabel: {
        id: 'pool.utilizationChartThresholdLabel',
        defaultMessage: 'Max Capacity Exceeded',
    },
    createTitle: {
        id: 'pool.createTitle',
        defaultMessage: 'Create Resource Pool',
    },
    editTitle: {
        id: 'pool.editTitle',
        defaultMessage: 'Edit Resource Pool',
    },
    nameLabel: {
        id: 'pool.nameLabel',
        defaultMessage: 'Name',
    },
    namePlaceholder: {
        id: 'pool.namePlaceholder',
        defaultMessage: 'Enter name (required)',
    },
    disabledLabel: {
        id: 'pool.disabledLabel',
        defaultMessage: 'Disabled',
    },
    cspDomainLabel: {
        id: 'pool.cspDomainLabel',
        defaultMessage: 'CSP Domain',
    },
    cspDomainPlaceholder: {
        id: 'pool.cspDomainPlaceholder',
        defaultMessage: 'Select a CSP domain (required)',
    },
    cspDomainHelp: {
        id: 'pool.cspDomainHelp',
        defaultMessage: 'No CSP domains found. A CSP domain is required to create a resource pool.',
    },
    accessibilityLabel: {
        id: 'pool.accessibilityLabel',
        defaultMessage: 'Accessibility',
    },
    accessibilityGlobal: {
        id: 'pool.accessibilityGlobal',
        defaultMessage: 'Global',
    },
    accessibilityGlobalHelp: {
        id: 'pool.accessibilityGlobalHelp',
        defaultMessage: 'The storage is accessible from any node host in any cluster in any CSP Domain.',
    },
    accessibilityCspDomain: {
        id: 'pool.accessibilityCspDomain',
        defaultMessage: 'CSP Domain',
    },
    accessibilityCspDomainHelp: {
        id: 'pool.accessibilityCspDomainHelp',
        defaultMessage: 'The storage is accessible from any node host in any cluster in the specified CSP Domain.',
    },
    accessibilityNode: {
        id: 'pool.accessibilityNode',
        defaultMessage: 'Node',
    },
    accessibilityNodePlaceholder: {
        id: 'pool.accessibilityNodePlaceholder',
        defaultMessage: 'Node ID (required)',
    },
    accessibilityNodeHelp: {
        id: 'pool.accessibilityNodeHelp',
        defaultMessage: 'The storage is only accessible from a specified node host.',
    },
    cspStorageTypeLabel: {
        id: 'pool.cspStorageTypeLabel',
        defaultMessage: 'CSP Storage Type',
    },
    maximumCapacityLabel: {
        id: 'pool.maximumCapacityLabel',
        defaultMessage: 'Maximum Capacity',
    },
    maximumCapacityPlaceholder: {
        id: 'pool.maximumCapacityPlaceholder',
        defaultMessage: 'Enter maximum storage capacity (required)',
    },
    maximumCapacityHelp: {
        id: 'pool.maximumCapacityHelp',
        defaultMessage: 'Mininum size is {size}.',
    },
    tagsLabel: {
        id: 'pool.tagsLabel',
        defaultMessage: 'Tags',
    },
    descriptionLabel: {
        id: 'pool.descriptionLabel',
        defaultMessage: 'Description',
    },
    descriptionPlaceholder: {
        id: 'pool.descriptionPlaceholder',
        defaultMessage: 'Enter Description',
    },
    modifyCapacityTitle: {
        id: 'pool.modifyCapacityTitle',
        defaultMessage: 'Modify Capacity',
    },
    currentMaximumCapacityLabel: {
        id: 'pool.currentMaximumCapacityLabel',
        defaultMessage: 'Current Maximum Capacity',
    },
    newMaximumCapacityLabel: {
        id: 'pool.newMaximumCapacityLabel',
        defaultMessage: 'New Maximum Capacity',
    },
    newMaximumCapacityPlaceholder: {
        id: 'pool.newMaximumCapacityPlaceholder',
        defaultMessage: 'Enter new maximum storage capacity (required)',
    },
    deleteTitle: {
        id: 'pool.deleteTitle',
        defaultMessage: 'Delete {count, plural, one {Resource Pool} other {Resource Pools}}',
    },
    deleteMsg: {
        id: 'pool.deleteMsg',
        defaultMessage: 'Are you sure you want to delete {count, plural, one {{name}} other {{count} resource pools}}?',
    },
});
