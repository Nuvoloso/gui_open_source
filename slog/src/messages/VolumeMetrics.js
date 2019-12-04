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

export const volumeMetricsMsgs = defineMessages({
    /**
     * Time based messages
     */
    minute: {
        id: 'volumeMetrics.minute',
        defaultMessage: 'Minute',
    },
    day: {
        id: 'volumeMetrics.day',
        defaultMessage: 'Day',
    },
    hour: {
        id: 'volumeMetrics.hour',
        defaultMessage: 'Hour',
    },
    week: {
        id: 'volumeMetrics.week',
        defaultMessage: 'Week',
    },
    month: {
        id: 'volumeMetrics.month',
        defaultMessage: 'Month',
    },
    /**
     * Component messages
     */
    alertLevels: {
        id: 'volumeMetrics.alertLevels',
        defaultMessage: 'Alert Levels',
    },
    all: {
        id: 'volumeMetrics.all',
        defaultMessage: 'All',
    },
    appGroup: {
        id: 'volumeMetrics.appGroup',
        defaultMessage: 'Application Group',
    },
    appGroupComplianceTotalsChartPeriodSubtitle: {
        id: 'volumeMetrics.appGroupComplianceTotalsChartPeriodSubtitle',
        defaultMessage: '{count, plural, one {Application Group {range}} other {{count} Application Groups {range}}}',
    },
    capacity: {
        id: 'volumeMetrics.capacity',
        defaultMessage: 'Capacity',
    },
    compliance: {
        id: 'volumeMetrics.compliance',
        defaultMessage: 'Compliance',
    },
    complianceBackButton: {
        id: 'volumeMetrics.complianceBackButton',
        defaultMessage: 'Back',
    },
    detailsSelectVolume: {
        id: 'volumeMetrics.detailsSelectVolume',
        defaultMessage: 'Drill down to volume level and select a volume to see details',
    },
    filter: {
        id: 'volumeMetrics.filter',
        defaultMessage: 'Filter',
    },
    consistencyGroup: {
        id: 'volumeMetrics.consistencyGroup',
        defaultMessage: 'Consistency Group',
    },
    consistencyGroupComplianceTotalsChartPeriodSubtitle: {
        id: 'volumeMetrics.consistencyGroupComplianceTotalsChartPeriodSubtitle',
        defaultMessage: '{count, plural, one {Consistency Group} other {{count} Consistency Groups {range}}}',
    },
    displayOptions: {
        id: 'volumeMetrics.displayOptions',
        defaultMessage: 'Display Options',
    },
    end: {
        id: 'volumeMetrics.end',
        defaultMessage: 'End',
    },
    filterApplicationGroup: {
        id: 'volumeMetrics.filterApplicationGroup',
        defaultMessage: 'Application Group Filter',
    },
    filterFieldInfoAppGroup: {
        id: 'volumeMetrics.filterFieldInfo',
        defaultMessage: 'Navigate to Application Groups to change',
    },
    filterFieldInfoTouchAppGroup: {
        id: 'volumeMetrics.filterFieldInfoTouch',
        defaultMessage: 'Navigate to Application Groups to change',
    },
    filterFieldInfoVolume: {
        id: 'volumeMetrics.filterFieldInfoVolume',
        defaultMessage: 'Navigate to Volumes to change',
    },
    filterFieldInfoTouchVolume: {
        id: 'volumeMetrics.filterFieldInfoTouchVolume',
        defaultMessage: 'Navigate to Volumes to change',
    },
    filterVolume: {
        id: 'volumeMetrics.filterVolume',
        defaultMessage: 'Volume Filter',
    },
    latency: {
        id: 'volumeMetrics.latency',
        defaultMessage: 'Latency',
    },
    maximumLatency: {
        id: 'volumeMetrics.maximumLatency',
        defaultMessage: 'Maximum Latency',
    },
    storageLatency: {
        id: 'volumeMetrics.storageLatency',
        defaultMessage: 'Device Latency',
    },
    noData: {
        id: 'volumeMetrics.noData',
        defaultMessage: 'No Data',
    },
    noVolumes: {
        id: 'volumeMetrics.noVolumes',
        defaultMessage: 'No Volumes Configured',
    },
    noVolumesFound: {
        id: 'volumeMetrics.noVolumesFound',
        defaultMessage: 'No Volumes Found',
    },
    noVolumeMetricData: {
        id: 'volumeMetrics.noVolumeMetricData',
        defaultMessage: 'No Volume Metric Data',
    },
    unknown: {
        id: 'volumeMetrics.unknown',
        defaultMessage: 'unknown',
    },
    servicePlan: {
        id: 'volumeMetrics.servicePlan',
        defaultMessage: 'Service Plan',
    },
    servicePlanComplianceTotalsChartPeriodSubtitle: {
        id: 'volumeMetrics.servicePlanComplianceTotalsChartPeriodSubtitle',
        defaultMessage: '{count, plural, one {Service Plan} other {{count} Service Plans {range}}}',
    },
    servicePlanComplianceChartTitle: {
        id: 'volumeMetrics.servicePlanComplianceChartTitle',
        defaultMessage: 'Service Plan Compliance',
    },
    start: {
        id: 'volumeMetrics.start',
        defaultMessage: 'Start',
    },
    timePeriod: {
        id: 'volumeMetrics.timePeriod',
        defaultMessage: 'Time Period',
    },
    view: {
        id: 'volumeMetrics.view',
        defaultMessage: 'View',
    },
    volumeComplianceChartTitle: {
        id: 'volumeMetrics.volumeComplianceChartTitle',
        defaultMessage: 'Volume Compliance',
    },
    volumeComplianceChartPeriodSubtitle: {
        id: 'volumeMetrics.volumeComplianceChartPeriodSubtitle',
        defaultMessage: '{count, plural, one {{period} {range}} other {{count} {period}s {range}}}',
    },
    volumeComplianceTotalsChartPeriodSubtitle: {
        id: 'volumeMetrics.volumeComplianceTotalsChartPeriodSubtitle',
        defaultMessage: '{count, plural, one {Volume {range}} other {{count} Volumes {range}}}',
    },
    volumeDetails: {
        id: 'volumeMetrics.volumeDetails',
        defaultMessage: 'Volume Details',
    },
    volumes: {
        id: 'volumeMetrics.volumes',
        defaultMessage: 'Volumes',
    },
    capacityUsageTitle: {
        id: 'volumeMetrics.capacityUsageTitle',
        defaultMessage: 'Capacity Usage',
    },
    bytes: {
        id: 'volumeMetrics.bytes',
        defaultMessage: 'Bytes',
    },
    iOPS: {
        id: 'volumeMetrics.iOPS',
        defaultMessage: 'iOPS',
    },
});
