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

export const volumeSeriesMsgs = defineMessages({
    tableTitle: {
        id: 'volumeSeries.tableTitle',
        defaultMessage: 'Volumes',
    },
    tableName: {
        id: 'volumeSeries.tableName',
        defaultMessage: 'Name',
    },
    tableServicePlan: {
        id: 'volumeSeries.tableServicePlan',
        defaultMessage: 'Service Plan',
    },
    tableSize: {
        id: 'volumeSeries.tableSize',
        defaultMessage: 'Size',
    },
    tableState: {
        id: 'volumeSeries.tableState',
        defaultMessage: 'State',
    },
    tableCluster: {
        id: 'volumeSeries.tableCluster',
        defaultMessage: 'Cluster',
    },
    tableApplicationGroup: {
        id: 'volumeSeries.tableApplicationGroup',
        defaultMessage: 'App Group',
    },
    tableConsistencyGroup: {
        id: 'volumeSeries.tableConsistencyGroup',
        defaultMessage: 'Consistency Group',
    },
    tableStatus: {
        id: 'volumeSeries.tableStatus',
        defaultMessage: 'Status',
    },
    tableAccount: {
        id: 'volumeSeries.tableAccount',
        defaultMessage: 'Account',
    },
    tableDescription: {
        id: 'volumeSeries.tableDescription',
        defaultMessage: 'Description',
    },
    tableCapacity: {
        id: 'volumeSeries.tableCapacity',
        defaultMessage: 'Capacity',
    },
    tableTags: {
        id: 'volumeSeries.tableTags',
        defaultMessage: 'Tags',
    },
    tableEmptyPlaceholder: {
        id: 'volumeSeries.tableEmptyPlaceholder',
        defaultMessage: 'No volumes have been created',
    },
    toolbarCreate: {
        id: 'volumeSeries.toolbarCreate',
        defaultMessage: 'Create Volume',
    },
    toolbarBind: {
        id: 'volumeSeries.toolbarBind',
        defaultMessage: 'Bind to Cluster',
    },
    toolbarUnmount: {
        id: 'volumeSeries.toolbarUnmount',
        defaultMessage: 'Unmount',
    },
    toolbarEdit: {
        id: 'volumeSeries.toolbarEdit',
        defaultMessage: 'Edit',
    },
    toolbarDelete: {
        id: 'volumeSeries.toolbarDelete',
        defaultMessage: 'Delete',
    },
    toolbarYaml: {
        id: 'volumeSeries.toolbarYaml',
        defaultMessage: 'Generate YAML',
    },
    toolbarGetYaml: {
        id: 'volumeSeries.toolbarGetYaml',
        defaultMessage: 'Get YAML for PVC',
    },
    createTitle: {
        id: 'volumeSeries.createTitle',
        defaultMessage: 'Create New Volume',
    },
    editTitle: {
        id: 'volumeSeries.editTitle',
        defaultMessage: 'Edit Volume Series',
    },
    saveBtn: {
        id: 'volumeSeries.saveBtn',
        defaultMessage: 'SAVE VOLUME',
    },
    nameLabel: {
        id: 'volumeSeries.nameLabel',
        defaultMessage: 'Volume Name',
    },
    namePlaceholder: {
        id: 'volumeSeries.namePlaceholder',
        defaultMessage: 'Enter unique volume name (required)',
    },
    accountLabel: {
        id: 'volumeSeries.accountLabel',
        defaultMessage: 'Account',
    },
    applicationGroupLabel: {
        id: 'volumeSeries.applicationGroupLabel',
        defaultMessage: 'Application Group',
    },
    applicationGroupsLabel: {
        id: 'volumeSeries.applicationGroupsLabel',
        defaultMessage: 'Application Groups',
    },
    consistencyGroupLabel: {
        id: 'volumeSeries.consistencyGroupLabel',
        defaultMessage: 'Consistency Group',
    },
    groupPlaceholder: {
        id: 'volumeSeries.groupPlaceholder',
        defaultMessage: 'Same as volume name',
    },
    servicePlanLabel: {
        id: 'volumeSeries.servicePlanLabel',
        defaultMessage: 'Service Plan',
    },
    servicePlanPlaceholder: {
        id: 'volumeSeries.servicePlanPlaceholder',
        defaultMessage: 'Select service plan (required)',
    },
    servicePlanPlaceholderOptional: {
        id: 'volumeSeries.servicePlanPlaceholderOptional',
        defaultMessage: 'Select service plan',
    },
    sizeLabel: {
        id: 'volumeSeries.sizeLabel',
        defaultMessage: 'Size',
    },
    sizePlaceholder: {
        id: 'volumeSeries.sizePlaceholder',
        defaultMessage: 'Enter size (required)',
    },
    tagsLabel: {
        id: 'volumeSeries.tagsLabel',
        defaultMessage: 'Tags',
    },
    settingsTagsLabel: {
        id: 'volumeSeries.volumeTagsLabel',
        defaultMessage: 'Volume Tags',
    },
    descriptionLabel: {
        id: 'volumeSeries.descriptionLabel',
        defaultMessage: 'Description',
    },
    settingsDescriptionLabel: {
        id: 'volumeSeries.settingsDescriptionLabel',
        defaultMessage: 'Volume Description',
    },
    descriptionPlaceholder: {
        id: 'volumeSeries.descriptionPlaceholder',
        defaultMessage: 'Enter description',
    },
    bindLabel: {
        id: 'volumeSeries.bindLabel',
        defaultMessage: 'Bind to Cluster',
    },
    clustersPlaceholder: {
        id: 'volumeSeries.clustersPlaceholder',
        defaultMessage: 'Select cluster',
    },
    createdOnLabel: {
        id: 'volumeSeries.createdOn',
        defaultMessage: 'Created On',
    },
    deleteTitle: {
        id: 'volumeSeries.deleteTitle',
        defaultMessage: 'Delete Volume Series',
    },
    deleteMsg: {
        id: 'volumeSeries.deleteMsg',
        defaultMessage: 'Are you sure you want to delete {count, plural, one {{name}} other {{count} volume series}}?',
    },
    summaryTitle: {
        id: 'volumeSeries.summaryTitle',
        defaultMessage: 'Summary',
    },
    summarySizeLabel: {
        id: 'volumeSeries.summarySizeLabel',
        defaultMessage: 'Total Size',
    },
    summaryAgLabel: {
        id: 'volumeSeries.summaryAgLabel',
        defaultMessage: 'Affected {count, plural, one {Application Group} other {Application Groups}}',
    },
    summaryCgLabel: {
        id: 'volumeSeries.summaryCgLabel',
        defaultMessage: 'Affected {count, plural, one {Consistency Group} other {Consistency Groups}}',
    },
    indexOfTotalCount: {
        id: 'volumeSeries.indexOfTotalCount',
        defaultMessage: '{index} of {count}',
    },
    sizeRange: {
        id: 'volumeSeries.sizeRange',
        defaultMessage: 'Size range:',
    },
    performance: {
        id: 'volumeSeries.performance',
        defaultMessage: 'Performance',
    },
    iops: {
        id: 'volumeSeries.iops',
        defaultMessage: '(iOPS)',
    },
    mbpersec: {
        id: 'volumeSeries.mbpersec',
        defaultMessage: '(MB/sec)',
    },
    yamlTitle: {
        id: 'volumeSeries.yamlTitle',
        defaultMessage:
            'Kubernetes Persistent Volume Claim YAML: {count, plural, one {{name}} other {{count} Volumes}}',
    },
    yamlInfo: {
        id: 'volumeSeries.yamlInfo',
        defaultMessage:
            'Sample persistent volume claim YAML with a valid selector for the {count, plural, one {volume} other {volumes}}.',
    },
    yamlErrorTitle: {
        id: 'volumeSeries.yamlErrorTitle',
        defaultMessage: 'ERROR',
    },
    yamlErrorMsg: {
        id: 'volumeSeries.yamlErrorMsg',
        defaultMessage: 'Error generating YAML for {count} {count, plural, one {volume} other {volumes}}:',
    },
    consistencyGroupChosen: {
        id: 'volumeSeries.consistencyGroupChosen',
        defaultMessage: 'Consistency Group Chosen',
    },
    volumeDetailsTitle: {
        id: 'volumeSeries.volumeDetailsTitle',
        defaultMessage: 'Volume: {name}',
    },
    volumeDetailsTabSettings: {
        id: 'volumeSeries.volumeDetailsTabSettings',
        defaultMessage: 'Volume Settings',
    },
    volumeDetailsTabMemberships: {
        id: 'volumeSeries.volumeDetailsTabMemberships',
        defaultMessage: 'Volume Memberships',
    },
    volumeDetailsTabCompliance: {
        id: 'volumeSeries.volumeDetailsTabCompliance',
        defaultMessage: 'Service Plan Compliance',
    },
    volumeDetailsTabHistory: {
        id: 'volumeSeries.volumeDetailsTabHistory',
        defaultMessage: 'Service History',
    },
    settingsMetadataTitle: {
        id: 'volumeSeries.settingsMetadataTitle',
        defaultMessage: 'Metadata Settings',
    },
    settingsAllocationsTitle: {
        id: 'volumeSeries.settingsAllocationsTitle',
        defaultMessage: 'Allocations',
    },
    servicePlanComplianceTitle: {
        id: 'volumeSeries.servicePlanComplianceTitle',
        defaultMessage: 'SLO for Plan: {name}',
    },
    servicePlanComplianceChartTitle: {
        id: 'volumeSeries.servicePlanComplianceChartTitle',
        defaultMessage: 'I/O Provisioned Performance',
    },
    historyTodayLabel: {
        id: 'volumeSeries.historyTodayLabel',
        defaultMessage: 'Things happened today',
    },
    historyWeekLabel: {
        id: 'volumeSeries.historyWeekLabel',
        defaultMessage: 'Things happened in the last week',
    },
    historyMonthLabel: {
        id: 'volumeSeries.historyMonthLabel',
        defaultMessage: 'Total things happened over the last month',
    },
    statusError: {
        id: 'volumeSeries.statusError',
        defaultMessage: 'Error',
    },
    statusOk: {
        id: 'volumeSeries.statusOk',
        defaultMessage: 'Good',
    },
    statusWarning: {
        id: 'volumeSeries.statusWarning',
        defaultMessage: 'Warning',
    },
    minSizeHelper: {
        id: 'volumeSeries.minSizeHelper',
        defaultMessage: 'Size must be >=',
    },
    titleCapacityDialog: {
        id: 'volumeSeries.titleCapacityDialog',
        defaultMessage: 'Provision capacity for performance',
    },
    labelCapacityDialogPerMonth: {
        id: 'volumeSeries.labelCapacityDialogPerMonth',
        defaultMessage: '/ Month',
    },
    labelCapacityDialogCostSymbol: {
        id: 'volumeSeries.labelCapacityDialogCostSymbol',
        defaultMessage: 'Cost $',
    },
    labelCapacityPerformanceSize: {
        id: 'volumeSeries.labelCapacityPerformanceSize',
        defaultMessage: 'Capacity (max: {maxPerformanceSize} GiB)',
    },
    labelPerformanceCapacity: {
        id: 'volumeSeries.labelPerformanceCapacity',
        defaultMessage: 'Performance Capacity',
    },
    servicePlanInfoPlaceholder: {
        id: 'volumeSeries.servicePlanInfoPlaceholder',
        defaultMessage: 'Select plan to see details',
    },
    spaCapacityAvailable: {
        id: 'volumeSeries.spaCapacityAvailable',
        defaultMessage: 'Available',
    },
    spaSelectionHelperText: {
        id: 'volumeSeries.spaSelectionHelperText',
        defaultMessage: 'Select Cluster and Service Plan',
    },
    spaSelectionLabel: {
        id: 'volumeSeries.spaSelectionLabel',
        defaultMessage: 'Pool Info',
    },
    newMaxIOPS: {
        id: 'volumeSeries.newMaxIOPS',
        defaultMessage: 'New MAX IOPS',
    },
    newMaxThroughput: {
        id: 'volumeSeries.newMaxThroughput',
        defaultMessage: 'New MAX Throughput',
    },
    baselineOps: {
        id: 'volumeSeries.baselineOps',
        defaultMessage: 'Baseline IOPS',
    },
    maxIOPS: {
        id: 'volumeSeries.maxIOPS',
        defaultMessage: 'Max IOPS',
    },
    measuredIops: {
        id: 'volumeSeries.measuredIops',
        defaultMessage: 'iOPS',
    },
    violationLatencyMean: {
        id: 'volumeSeries.violationLatencyMean',
        defaultMessage: 'Latency Mean Violation',
    },
    violationLatencyMax: {
        id: 'volumeSeries.violationLatencyMax',
        defaultMessage: 'Latency Maximum Violation',
    },
    violationWorkloadRate: {
        id: 'volumeSeries.violationWorkloadRate',
        defaultMessage: 'Workload Rate Violation',
    },
    violationWorkloadMixRead: {
        id: 'volumeSeries.violationWorkloadMixRead',
        defaultMessage: 'Workload Read Mix Violation',
    },
    violationWorkloadMixWrite: {
        id: 'volumeSeries.violationWorkloadMixWrite',
        defaultMessage: 'Workload Write Mix Violation',
    },
    violationWorkloadAvgSizeMin: {
        id: 'volumeSeries.violationWorkloadAvgSizeMin',
        defaultMessage: 'Workload Average Size Minimum Violation',
    },
    violationWorkloadAvgSizeMax: {
        id: 'volumeSeries.violationWorkloadAvgSizeMax',
        defaultMessage: 'Workload Average Size Maximum Violation',
    },
    violationRPO: {
        id: 'volumeSeries.violationRPO',
        defaultMessage: 'RPO violation',
    },
    violationChangeWarning: {
        id: 'volumeSeries.violationChangeWarning',
        defaultMessage: 'Warning',
    },
    violationChangeError: {
        id: 'volumeSeries.violationChangeError',
        defaultMessage: 'Error',
    },
    violationChangeCleared: {
        id: 'volumeSeries.violationChangeCleared',
        defaultMessage: 'Cleared',
    },
    tableServiceHistorySnapshots: {
        id: 'volumeSeries.tableServiceHistorySnapshots',
        defaultMessage: 'Snapshots',
    },
    tableServiceHistoryViolations: {
        id: 'volumeSeries.tableServiceHistoryViolations',
        defaultMessage: 'Violations',
    },
    tableServiceHistoryTime: {
        id: 'volumeSeries.tableServiceHistoryTime',
        defaultMessage: 'Time',
    },
    tableServiceHistoryType: {
        id: 'volumeSeries.tableServiceHistoryType',
        defaultMessage: 'Type',
    },
    tableServiceHistoryMessages: {
        id: 'volumeSeries.tableServiceHistoryMessages',
        defaultMessage: 'Messages',
    },
    tableServiceHistoryActions: {
        id: 'volumeSeries.tableServiceHistoryActions',
        defaultMessage: 'Actions',
    },
    serviceHistoryFiltersLabel: {
        id: 'volumeSeries.serviceHistoryFiltersLabel',
        defaultMessage: 'Filters',
    },
    snapshotCreated: {
        id: 'volumeSeries.snapshotCreated',
        defaultMessage: 'Snapshot created',
    },
    summaryStatusLabel: {
        id: 'volumeSeries.summaryStatusLabel',
        defaultMessage: 'Status',
    },
    tableServiceHistoryInfo: {
        id: 'volumeSeries.tableServiceHistoryInfo',
        defaultMessage: 'Info',
    },
    tableServiceHistoryNote: {
        id: 'volumeSeries.tableServiceHistoryNote',
        defaultMessage: 'Note',
    },
    tableServiceHistoryNotes: {
        id: 'volumeSeries.tableServiceHistoryNotes',
        defaultMessage: 'Notes',
    },
    relatedVolumesTitle: {
        id: 'volumeSeries.relatedVolumesTitle',
        defaultMessage: 'Related Volumes',
    },
    volumeIsUnmounted: {
        id: 'volumeSeries.volumeIsUnmounted',
        defaultMessage: 'Volume is unmounted',
    },
    filterLabelInfo: {
        id: 'volumeSeries.filterLabelInfo',
        defaultMessage: 'Info',
    },
    viewLabel: {
        id: 'volumeSeries.viewLabel',
        defaultMessage: 'View',
    },
    viewTooltipTime: {
        id: 'volumeSeries.viewTooltipTime',
        defaultMessage: 'Time',
    },
    viewTooltipNotes: {
        id: 'volumeSeries.viewTooltipNotes',
        defaultMessage: 'Notes',
    },
    cacheLabel: {
        id: 'volumeSeries.cacheLabel',
        defaultMessage: 'Cache',
    },
    newServicePlanLabel: {
        id: 'volumeSeries.newServicePlanLabel',
        defaultMessage: 'New Service Plan',
    },
    insufficientCacheWarning: {
        id: 'volumeSeries.insufficientCacheWarning',
        defaultMessage: 'Insufficient cache capacity available on the node.  Check your node type and service plan.',
    },
    labelCluster: {
        id: 'volumeSeries.labelCluster',
        defaultMessage: 'Cluster',
    },
    bindClusterPlaceholder: {
        id: 'volumeSeries.bindClusterPlaceholder',
        defaultMessage: 'Select a cluster',
    },
    bindClusterTitle: {
        id: 'volumeSeries.bindClusterTitle',
        defaultMessage: 'Bind Volume to Cluster',
    },
    summaryStatusError: {
        id: 'volumeSeries.summaryStatusError',
        defaultMessage: 'Number of volumes that have critical issues that need to be addressed',
    },
    summaryStatusOk: {
        id: 'volumeSeries.summaryStatusOk',
        defaultMessage: 'Number of volumes that are operating normally',
    },
    summaryStatusWarning: {
        id: 'volumeSeries.summaryStatusWarning',
        defaultMessage: 'Number of volumes that have issues that need attention soon',
    },
    requiredProtectionDesc: {
        id: 'volumeSeries.requiredProtectionDesc',
        defaultMessage:
            'No protection domains have been set up for this cluster. Click to go create a protection domain.',
    },
});
