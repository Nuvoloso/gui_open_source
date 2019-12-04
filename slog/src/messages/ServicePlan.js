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

export const servicePlanMsgs = defineMessages({
    cost: {
        id: 'servicePlan.cost',
        defaultMessage: 'Cost',
    },
    notSet: {
        id: 'servicePlan.notSet',
        defaultMessage: 'Not Set',
    },
    tableTitle: {
        id: 'servicePlan.tableTitle',
        defaultMessage: 'Service Plans',
    },
    tableName: {
        id: 'servicePlan.tableName',
        defaultMessage: 'Name',
    },
    tableStatus: {
        id: 'servicePlan.tableStatus',
        defaultMessage: 'Status',
    },
    tableSlos: {
        id: 'servicePlan.tableSlos',
        defaultMessage: 'Service Level Objectives',
    },
    tableAvailability: {
        id: 'servicePlan.tableAvailability',
        defaultMessage: 'Availability',
    },
    tableRpo: {
        id: 'servicePlan.tableRpo',
        defaultMessage: 'RPO',
    },
    tableResponseTimeAvg: {
        id: 'servicePlan.tableResponseTimeAvg',
        defaultMessage: 'Avg Response Time',
    },
    tableResponseTimeMax: {
        id: 'servicePlan.tableResponseTimeMax',
        defaultMessage: 'Max Response Time',
    },
    tableResponseTimeAvgMax: {
        id: 'servicePlan.tableResponseTimeAvgMax',
        defaultMessage: 'Response Time Avg / Max',
    },
    tableRetention: {
        id: 'servicePlan.tableRetention',
        defaultMessage: 'Retention',
    },
    tableSecurity: {
        id: 'servicePlan.tableSecurity',
        defaultMessage: 'Security',
    },
    tableWorkloadProfiles: {
        id: 'servicePlan.tableWorkloadProfiles',
        defaultMessage: 'Workload Profiles',
    },
    tableIoProfile: {
        id: 'servicePlan.tableIoProfile',
        defaultMessage: 'I/O Profile',
    },
    tableIoPattern: {
        id: 'servicePlan.tableIoPattern',
        defaultMessage: 'I/O Pattern',
    },
    tableIoMix: {
        id: 'servicePlan.tableIoMix',
        defaultMessage: 'I/O Mix',
    },
    tableIoPerformance: {
        id: 'servicePlan.tableIoPerformance',
        defaultMessage: 'I/O Provisioned Performance',
    },
    tableVolumeSeries: {
        id: 'servicePlan.tableVolumeSeries',
        defaultMessage: 'Volume Size',
    },
    tableTags: {
        id: 'servicePlan.tableTags',
        defaultMessage: 'Tags',
    },
    tableAllocated: {
        id: 'servicePlan.tableAllocated',
        defaultMessage: 'Capacity Allocated',
    },
    tableEmptyPoolsPlaceholder: {
        id: 'servicePlan.tableEmptyPoolsPlaceholder',
        defaultMessage: 'No pools have been allocated for this account',
    },
    tableEmptyServicePlansPlaceholder: {
        id: 'servicePlan.tableEmptyServicePlansPlaceholder',
        defaultMessage: 'No service plans have been assigned to this account',
    },
    provisioningUnit: {
        id: 'servicePlan.provisioningUnit',
        defaultMessage: 'Performance/GiB',
    },
    provisioningUnitIops: {
        id: 'servicePlan.provisioningUnitIops',
        defaultMessage: 'IOPS / GiB',
    },
    provisioningUnitThroughput: {
        id: 'servicePlan.provisioningUnitThroughput',
        defaultMessage: 'Throughput / GiB',
    },
    provisioningUnitThroughputValue: {
        id: 'servicePlan.provisioningUnitThroughputValue',
        defaultMessage: '{formattedBytes}/s',
    },
    ioRandomDefinition: {
        id: 'servicePlan.ioRandomDefinition',
        defaultMessage: '<= 16KB I/O',
    },
    ioRandomWorkload: {
        id: 'servicePlan.ioRandomWorkload',
        defaultMessage: 'user-oriented applications',
    },
    ioSequentialDefinition: {
        id: 'servicePlan.ioSequentialDefinition',
        defaultMessage: '> 16KB, <= 64KB I/O',
    },
    ioSequentialWorkload: {
        id: 'servicePlan.ioSequentialWorkload',
        defaultMessage: 'logging, infrastructure applications, batch processing',
    },
    ioStreamingDefinition: {
        id: 'servicePlan.ioStreamingDefinition',
        defaultMessage: '> 64KB I/O',
    },
    ioStreamingWorkload: {
        id: 'servicePlan.ioStreamingWorkload',
        defaultMessage: 'backup, archive, streaming analytics',
    },
    ioMixRDefinition: {
        id: 'servicePlan.ioMixRDefinition',
        defaultMessage: '>= 70% of data accesses are reads',
    },
    ioMixRwDefinition: {
        id: 'servicePlan.ioMixRwDefinition',
        defaultMessage: 'neither reads nor writes comprise > 70% of data accesses',
    },
    ioMixWDefinition: {
        id: 'servicePlan.ioMixWDefinition',
        defaultMessage: '>= 70% of accesses are writes',
    },
    toolbarCompare: {
        id: 'servicePlan.toolbarCompare',
        defaultMessage: 'Compare',
    },
    actionClear: {
        id: 'servicePlan.actionClear',
        defaultMessage: 'Clear',
    },
    toolbarClone: {
        id: 'servicePlan.toolbarClone',
        defaultMessage: 'Clone Service Plan',
    },
    toolbarEdit: {
        id: 'servicePlan.toolbarEdit',
        defaultMessage: 'Edit',
    },
    toolbarAllocation: {
        id: 'servicePlan.toolbarAllocation',
        defaultMessage: 'Manage Allocations',
    },
    toolbarStatus: {
        id: 'servicePlan.toolbarStatus',
        defaultMessage: 'Change Status',
    },
    toolbarDelete: {
        id: 'servicePlan.toolbarDelete',
        defaultMessage: 'Delete',
    },
    actionPublish: {
        id: 'servicePlan.actionPublish',
        defaultMessage: 'Publish',
    },
    actionRetire: {
        id: 'servicePlan.actionRetire',
        defaultMessage: 'Retire',
    },
    cloneTitle: {
        id: 'servicePlan.cloneTitle',
        defaultMessage: 'Clone Service Plan - {name}',
    },
    cloneNameLabel: {
        id: 'servicePlan.cloneNameLabel',
        defaultMessage: 'Clone Name',
    },
    cloneNamePlaceholder: {
        id: 'servicePlan.cloneNamePlaceholder',
        defaultMessage: 'Enter a new name for the service plan clone (required)',
    },
    editTitle: {
        id: 'servicePlan.editTitle',
        defaultMessage: 'Edit Service Plan',
    },
    nameLabel: {
        id: 'servicePlan.nameLabel',
        defaultMessage: 'Name',
    },
    namePlaceholder: {
        id: 'servicePlan.namePlaceholder',
        defaultMessage: 'Enter a name for the service plan (required)',
    },
    descriptionLabel: {
        id: 'servicePlan.descriptionLabel',
        defaultMessage: 'Description',
    },
    descriptionPlaceholder: {
        id: 'servicePlan.descriptionPlaceholder',
        defaultMessage: 'Enter a description for the service plan',
    },
    capacityExpectedLabel: {
        id: 'servicePlan.capacityExpectedLabel',
        defaultMessage: 'Expected Plan Usage',
    },
    capacityExpectedPlaceholder: {
        id: 'servicePlan.capacityExpectedPlaceholder',
        defaultMessage: 'Enter expected capacity usage in GB',
    },
    accountsTitle: {
        id: 'servicePlan.accountsTitle',
        defaultMessage: 'Accounts',
    },
    slosTitle: {
        id: 'servicePlan.slosTitle',
        defaultMessage: 'Service Level Objectives',
    },
    costInfoTitle: {
        id: 'servicePlan.costInfoTitle',
        defaultMessage: 'Cost Information',
    },
    publishTitle: {
        id: 'servicePlan.publishTitle',
        defaultMessage: 'Publish Service Plan - {name}',
    },
    retireTitle: {
        id: 'servicePlan.retireTitle',
        defaultMessage: 'Retire Service Plan - {name}',
    },
    deleteTitle: {
        id: 'servicePlan.deleteTitle',
        defaultMessage: 'Delete {count, plural, one {Service Plan} other {Service Plans}}',
    },
    deleteMsg: {
        id: 'servicePlan.deleteMsg',
        defaultMessage: 'Are you sure you want to delete {count, plural, one {{name}} other {{count} service plans}}?',
    },
    allocationTitle: {
        id: 'servicePlan.allocationTitle',
        defaultMessage: 'Manage Capacity Allocations - {name}',
    },
    accountLabel: {
        id: 'servicePlan.accountLabel',
        defaultMessage: 'Account',
    },
    accountPlaceholder: {
        id: 'servicePlan.accountPlaceholder',
        defaultMessage: 'Select an account',
    },
    clusterLabel: {
        id: 'servicePlan.clusterLabel',
        defaultMessage: 'Cluster',
    },
    clusterPlaceholder: {
        id: 'servicePlan.clusterPlaceholder',
        defaultMessage: 'Select a cluster',
    },
    sizeLabel: {
        id: 'servicePlan.sizeLabel',
        defaultMessage: 'Size',
    },
    sizePlaceholder: {
        id: 'servicePlan.sizePlaceholder',
        defaultMessage: 'Enter size',
    },
    costPlaceholder: {
        id: 'servicePlan.costPlaceholder',
        defaultMessage: 'Enter cost',
    },
    costLabel: {
        id: 'servicePlan.costLabel',
        defaultMessage: 'Cost ($/GiB/month)',
    },
    spaWait: {
        id: 'servicePlan.spaWait',
        defaultMessage: 'Waiting for Service Plan allocation...',
    },
    spaCompleted: {
        id: 'servicePlan.spaCompleted',
        defaultMessage: 'Service Plan allocation completed!',
    },
    pools: {
        id: 'servicePlan.pools',
        defaultMessage: 'Pools',
    },
    servicePlansLabel: {
        id: 'servicePlan.servicePlansLabel',
        defaultMessage: 'Service {count, plural, one { plan } other { plans }}',
    },
    viewByCluster: {
        id: 'servicePlan.viewByCluster',
        defaultMessage: 'View by Cluster',
    },
    viewByAccount: {
        id: 'servicePlan.viewByAccount',
        defaultMessage: 'View by Account',
    },
    allClusters: {
        id: 'servicePlan.allClusters',
        defaultMessage: 'All Clusters',
    },
    allAccounts: {
        id: 'servicePlan.allAccounts',
        defaultMessage: 'All Accounts',
    },
    throughput: {
        id: 'servicePlan.throughput',
        defaultMessage: 'Throughput',
    },
    mbsPerSec: {
        id: 'servicePlan.mbsPerSec',
        defaultMessage: 'MB/s / GiB',
    },
    iops: {
        id: 'servicePlan.iops',
        defaultMessage: 'IOPS',
    },
    workloadProfiles: {
        id: 'servicePlan.workloadProfiles',
        defaultMessage: 'Workload Profiles',
    },
    avgResponse: {
        id: 'servicePlan.avgResponse',
        defaultMessage: 'Avg Response',
    },
    maxResponse: {
        id: 'servicePlan.maxResponse',
        defaultMessage: 'Max Response',
    },
    columnFilterLabel: {
        id: 'servicePlan.columnFilterLabel',
        defaultMessage: 'Search for Pools by:',
    },
    columnFilterPlaceholder: {
        id: 'servicePlan.columnFilterSelectPlaceholder',
        defaultMessage: 'All',
    },
    filterPercentLabel: {
        id: 'servicePlan.filterPercentLabel',
        defaultMessage: 'Range (%)',
    },
    deletePoolDisabledTooltip: {
        id: 'servicePlan.deletePoolDisabledTooltip',
        defaultMessage: 'Pool is being used',
    },
    deletePoolsTitle: {
        id: 'servicePlan.deletePoolsTitle',
        defaultMessage: 'Delete {count, plural, one {Pool} other {Pools}}',
    },
    deletePoolsMsg: {
        id: 'servicePlan.deletePoolsMsg',
        defaultMessage: 'Are you sure you want to delete {count, plural, one {this pool} other {{count} pools}}?',
    },
    poolsTableTitle: {
        id: 'servicePlan.poolsTableTitle',
        defaultMessage: 'Pools',
    },
});
