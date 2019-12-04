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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse, OverlayTrigger, Tab, Tabs, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import HighchartContainer from '../containers/HighchartContainer';
import Loader from './Loader';
import PerformanceDialog from './PerformanceDialog';
import ServicePlanTable from './ServicePlanTable';
import TimePeriodSelector from './TimePeriodSelector';
import VolumeServiceHistory from './VolumeServiceHistory';
import VolumeSettings from './VolumeSettings';

import { bytesFromUnit, bytesToUnit, cacheStatus, formatBytes, timePeriodUnit } from './utils';
import { complianceVolumeDetailsMsgs } from '../messages/ComplianceVolumeDetails';
import { findApplicationGroupIds } from './utils_ags';
import { formatDuration } from './utils_time';
import { servicePlanMsgs } from '../messages/ServicePlan';
import { violationLevelColor } from './utils_styles';
import { volumeMetricsMsgs } from '../messages/VolumeMetrics';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';

import btnCapacityDisable from '../assets/btn-capacity-disable.svg';
import btnCapacityHov from '../assets/btn-capacity-hov.svg';
import btnCapacityUp from '../assets/btn-capacity-up.svg';
import volumeHeaderIcon from '../volume.svg';

import { NavigateBefore, NavigateNext } from '@material-ui/icons';

import * as constants from '../constants';

import 'rc-slider/assets/index.css';

class VolumeDetails extends Component {
    constructor(props) {
        super(props);

        const { initialChart, tabKey } = this.props;

        this.state = {
            dialogOpenPerformance: false,
            selectedChartKey: initialChart,
            tabKey,
            updatedCapacity: null,
        };

        this.handleChartSelect = this.handleChartSelect.bind(this);
        this.handleClickPerformance = this.handleClickPerformance.bind(this);
        this.handleClosePerformance = this.handleClosePerformance.bind(this);
        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.iopsServicePlan = this.iopsServicePlan.bind(this);
        this.save = this.save.bind(this);
        this.selectChart = this.selectChart.bind(this);
        this.selectTimePeriod = this.selectTimePeriod.bind(this);
        this.updateCapacity = this.updateCapacity.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { tabKey } = this.props;
        const { tabKey: prevTabKey } = prevProps;
        const { tabKey: stateTabKey } = this.state;

        if (tabKey !== prevTabKey && tabKey !== stateTabKey) {
            this.setState({ tabKey });
        }
    }

    generateConfigData(title, yAxisTitle, allowDecimals = false, tooltipValueDecimals, tooltipValueSuffix) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        const chartConfig = {
            type: 'line',
            chart: {
                zoomType: 'xy',
                className: 'compliance-volume-details',
                animation: false,
            },
            lang: {
                noData: formatMessage(volumeMetricsMsgs.noData),
                drillUpText: null,
            },
            credits: {
                enabled: false,
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                width: 180,
            },
            xAxis: [
                {
                    // format parameters - https://www.php.net/manual/en/function.strftime.php
                    dateTimeLabelFormats: {
                        millisecond: '%l:%M:%S.%L %p',
                        second: '%l:%M:%S %p',
                        minute: '%l:%M %p',
                        hour: '%l:%M %p',
                        day: '%l:%M %p',
                        week: '%l:%M %p',
                        month: '%l:%M %p',
                        year: '%l:%M %p',
                    },
                    tickWidth: 0,
                    type: 'datetime',
                },
                {
                    className: 'volume-details-chart-xaxis-hide-line',
                    labels: {
                        formatter: function() {
                            const { tickPositions = [] } = this.axis || {};
                            const index = tickPositions.indexOf(this.value);

                            // always show first day, then only show day if there is a change
                            if (index > 1) {
                                const day = moment(this.value).dayOfYear();
                                const prevDay = moment(tickPositions[index - 1]).dayOfYear();

                                if (day === prevDay) {
                                    return '';
                                }
                            }

                            return `${moment(this.value).format('MMM D')}${
                                moment().isSame(this.value, 'day')
                                    ? ` (${formatMessage(complianceVolumeDetailsMsgs.todayAppendLabel)})`
                                    : ''
                            }`;
                        },
                    },
                    linkedTo: 0,
                    tickWidth: 0,
                    type: 'datetime',
                },
            ],
            series: [],
            subtitle: {
                text: null,
            },
            time: {
                useUTC: false,
            },
            title: {
                align: 'left',
                text: title,
            },
            yAxis: [
                {
                    allowDecimals,
                    labels: {
                        formatter: undefined,
                    },
                    tickInterval: undefined,
                    title: {
                        text: yAxisTitle,
                    },
                },
            ],
            plotOptions: {
                series: {
                    animation: false,
                },
            },
            tooltip: {
                pointFormatter: undefined,
                valueDecimals: tooltipValueDecimals,
                valueSuffix: tooltipValueSuffix,
            },
        };

        return chartConfig;
    }

    generateConfigDataIO() {
        const { intl, volume, volumeMetricsData } = this.props;
        const { updatedCapacity } = this.state;
        const { formatMessage } = intl;
        const { sizeBytes = 0, spaAdditionalBytes = 0 } = volume || {};
        const { metrics } = volumeMetricsData || {};
        const { data = [] } = metrics || {};
        const { data: performanceData = [], name } = data[constants.METRICS_DATA_INDEX_PERFORMANCE] || {};
        const { data: maxPerformanceData = [] } = data[constants.METRICS_DATA_INDEX_MAX_PERFORMANCE] || {};
        const { data: costPerformanceData = [] } = data[constants.METRICS_DATA_INDEX_COST_PERFORMANCE] || {};

        const chartConfig = this.generateConfigData(formatMessage(volumeSeriesMsgs.servicePlanComplianceChartTitle));

        const currentPerformance = this.getPerformance(bytesToUnit(sizeBytes + spaAdditionalBytes));
        const updatedPerformance = this.getPerformance(updatedCapacity);

        const maxIopsLabel = updatedCapacity
            ? formatMessage(volumeSeriesMsgs.newMaxIOPS)
            : formatMessage(complianceVolumeDetailsMsgs.iopsMaxCurrent);
        const maxThroughputLabel = updatedCapacity
            ? formatMessage(volumeSeriesMsgs.newMaxThroughput)
            : formatMessage(complianceVolumeDetailsMsgs.throughputMaxCurrent);
        const maxPerformanceLabel = this.iopsServicePlan() ? maxIopsLabel : maxThroughputLabel;

        const maxPerformanceValue =
            Number.isFinite(updatedCapacity) && updatedCapacity >= 0 ? updatedPerformance : currentPerformance;

        const minMeasured = Math.min(
            ...performanceData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE]),
            ...maxPerformanceData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE])
        );
        const maxMeasured = Math.max(
            ...performanceData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE]),
            ...maxPerformanceData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE]),
            ...costPerformanceData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE]),
            maxPerformanceValue
        );
        // Compute the minimum value that would be showed and reduce slightly so there is a gap
        chartConfig.yAxis[0].min = Math.min(minMeasured, updatedPerformance || currentPerformance) * 0.9;
        chartConfig.yAxis[0].max = maxMeasured * 1.1;
        chartConfig.yAxis[0].plotLines = [
            this.generatePlotline(maxPerformanceValue, `${maxPerformanceLabel}: ${maxPerformanceValue}`),
        ];

        if (name === constants.METRICS_DATA_NAME_IOPS) {
            chartConfig.yAxis[0].title.text = formatMessage(volumeMetricsMsgs.iOPS);
            chartConfig.series = [
                {
                    name: formatMessage(complianceVolumeDetailsMsgs.iops),
                    data: [...performanceData],
                    type: 'line',
                },
                {
                    name: formatMessage(volumeSeriesMsgs.baselineOps),
                    data: [...maxPerformanceData],
                    type: 'line',
                },
                {
                    name: formatMessage(complianceVolumeDetailsMsgs.iopsMax),
                    data: [...costPerformanceData],
                    type: 'line',
                },
            ];
        } else {
            chartConfig.yAxis[0].title.text = formatMessage(complianceVolumeDetailsMsgs.mbpersec);
            chartConfig.series = [
                {
                    name: formatMessage(complianceVolumeDetailsMsgs.throughput),
                    data: [...performanceData],
                    type: 'line',
                },
                {
                    name: formatMessage(complianceVolumeDetailsMsgs.throughputMax),
                    data: [...maxPerformanceData],
                    type: 'line',
                },
                {
                    name: formatMessage(complianceVolumeDetailsMsgs.costPerformance),
                    data: [...costPerformanceData],
                    type: 'line',
                },
            ];
        }

        return chartConfig;
    }

    generateConfigDataLatency() {
        const { intl, volumeMetricsData } = this.props;
        const { formatMessage } = intl;
        const { metrics } = volumeMetricsData || {};
        const { data = [] } = metrics || {};
        const { data: latencyAvgData = [] } = data[constants.METRICS_DATA_INDEX_LATENCY_AVG] || {};
        const { data: latencyTargetAvgData = [] } = data[constants.METRICS_DATA_INDEX_LATENCY_TARGET_AVG] || {};

        const chartConfig = this.generateConfigData(
            formatMessage(volumeMetricsMsgs.latency),
            formatMessage(complianceVolumeDetailsMsgs.ms),
            false,
            2,
            ` ${formatMessage(complianceVolumeDetailsMsgs.ms)}`
        );

        const max = Math.max(
            ...latencyAvgData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE]),
            ...latencyTargetAvgData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE])
        );
        const maxAdjusted = max ? max * 1.2 : 1;

        chartConfig.yAxis[0].max = maxAdjusted;
        chartConfig.yAxis[0].min = 0;
        chartConfig.series = [
            {
                name: formatMessage(complianceVolumeDetailsMsgs.latency),
                data: [...latencyAvgData],
                type: 'line',
            },
            {
                name: formatMessage(complianceVolumeDetailsMsgs.latencyTarget),
                data: [...latencyTargetAvgData],
                type: 'line',
            },
        ];

        return chartConfig;
    }

    generateConfigDataLatencyMax() {
        const { intl, volumeMetricsData } = this.props;
        const { formatMessage } = intl;
        const { metrics } = volumeMetricsData || {};
        const { data = [] } = metrics || {};
        const { data: latencyAvgData = [] } = data[constants.METRICS_DATA_INDEX_LATENCY_MAX] || {};
        const { data: latencyTargetMaxData = [] } = data[constants.METRICS_DATA_INDEX_LATENCY_TARGET_MAX] || {};

        const chartConfig = this.generateConfigData(
            formatMessage(volumeMetricsMsgs.maximumLatency),
            formatMessage(complianceVolumeDetailsMsgs.ms),
            false,
            2,
            ` ${formatMessage(complianceVolumeDetailsMsgs.ms)}`
        );

        const max = Math.max(
            ...latencyAvgData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE]),
            ...latencyTargetMaxData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE])
        );
        const maxAdjusted = max ? max * 1.2 : 1;

        chartConfig.yAxis[0].max = maxAdjusted;
        chartConfig.yAxis[0].min = 0;
        chartConfig.series = [
            {
                name: formatMessage(complianceVolumeDetailsMsgs.latencyMaximumMeasured),
                data: [...latencyAvgData],
                type: 'line',
            },
            {
                name: formatMessage(complianceVolumeDetailsMsgs.latencyMaximum),
                data: [...latencyTargetMaxData],
                type: 'line',
            },
        ];

        return chartConfig;
    }

    generateConfigDataPattern() {
        const { intl, volumeMetricsData } = this.props;
        const { formatMessage } = intl;
        const { metrics } = volumeMetricsData || {};
        const { data = [] } = metrics || {};
        const { data: blocksizeData = [] } = data[constants.METRICS_DATA_INDEX_BLOCKSIZE] || {};
        const { data: blocksizeMinData = [] } = data[constants.METRICS_DATA_INDEX_MIN_BLOCKSIZE] || {};
        const { data: blocksizeMaxData = [] } = data[constants.METRICS_DATA_INDEX_MAX_BLOCKSIZE] || {};

        const chartConfig = this.generateConfigData(
            formatMessage(servicePlanMsgs.tableIoPattern),
            formatMessage(complianceVolumeDetailsMsgs.kbytes),
            true,
            2,
            ` ${formatMessage(complianceVolumeDetailsMsgs.kbytes)}`
        );

        const max = Math.max(
            ...blocksizeData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE]),
            ...blocksizeMaxData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE])
        );
        const maxAdjusted = max ? max * 1.2 : 1;

        chartConfig.yAxis[0].max = maxAdjusted;
        chartConfig.yAxis[0].min = 0;
        chartConfig.series = [
            {
                name: formatMessage(complianceVolumeDetailsMsgs.blocksize),
                data: [...blocksizeData],
                type: 'line',
            },
            {
                name: formatMessage(complianceVolumeDetailsMsgs.blocksizeMin),
                data: [...blocksizeMinData],
                type: 'line',
            },
            {
                name: formatMessage(complianceVolumeDetailsMsgs.blocksizeMax),
                data: [...blocksizeMaxData],
                type: 'line',
            },
        ];

        return chartConfig;
    }

    generateConfigDataRW() {
        const { intl, volumeMetricsData } = this.props;
        const { formatMessage } = intl;
        const { metrics } = volumeMetricsData || {};
        const { data = [] } = metrics || {};
        const { data: readsData = [] } = data[constants.METRICS_DATA_INDEX_PERCENT_READS] || {};
        const { data: writesData = [] } = data[constants.METRICS_DATA_INDEX_PERCENT_WRITES] || {};

        const chartConfig = this.generateConfigData(
            formatMessage(servicePlanMsgs.tableIoMix),
            formatMessage(complianceVolumeDetailsMsgs.rwmix)
        );

        chartConfig.yAxis[0].max = 100;
        chartConfig.yAxis[0].min = 0;
        chartConfig.series = [
            {
                name: formatMessage(complianceVolumeDetailsMsgs.percentReads),
                data: [...readsData],
                type: 'line',
            },
            {
                name: formatMessage(complianceVolumeDetailsMsgs.percentWrites),
                data: [...writesData],
                type: 'line',
            },
        ];

        return chartConfig;
    }

    generateConfigDataSnapshots() {
        const { intl, servicePlan, snapshotsData, volume } = this.props;
        const { formatMessage } = intl;
        const { slos } = servicePlan || {};
        const { RPO } = slos || {};
        const { value } = RPO || {};
        const { snapshots = [] } = snapshotsData || {};

        const chartConfig = this.generateConfigData(
            formatMessage(complianceVolumeDetailsMsgs.recoveryPointObjective),
            formatMessage(complianceVolumeDetailsMsgs.elapsedTime)
        );

        const { plotOptions = {}, tooltip = {} } = chartConfig || {};
        plotOptions.scatter = {
            tooltip: {
                pointFormatter: function() {
                    return `
                    ${formatMessage(complianceVolumeDetailsMsgs.snapshotStartTime)}: ${moment(this.x)
                        .subtract(this.y, 'minutes')
                        .format('lll')}<br />
                    ${formatMessage(complianceVolumeDetailsMsgs.snapshotFinishTime)}: ${moment(this.x).format(
                        'lll'
                    )}<br />
                    ${formatMessage(complianceVolumeDetailsMsgs.snapshotDuration)}: ${formatDuration(
                        this.y,
                        'minutes',
                        true
                    )}`;
                },
            },
        };
        tooltip.pointFormatter = function() {
            return `${this.series.name}: ${formatDuration(this.y, 'minutes', true)}`;
        };

        const data = [];
        const elapsedTimeData = [];
        const targetValue = this.getDurationStringAsMinutes(value);
        if (Array.isArray(snapshots)) {
            const filteredSnapshots = snapshots.filter(snapshot => {
                const { snapTime } = snapshot || {};
                const { timePeriod } = this.props;
                const now = new moment();
                return moment(snapTime).isSameOrAfter(now.subtract(1, timePeriodUnit(timePeriod)));
            });

            const sortedSnapshots = _.sortBy(filteredSnapshots, [
                function(snapshot) {
                    const { snapTime } = snapshot || {};
                    return moment(snapTime).valueOf();
                },
            ]);

            sortedSnapshots.forEach((snapshot, idx, arr) => {
                const { meta, snapTime } = snapshot || {};
                const { timeCreated } = meta || {};
                const snapStart = new moment(snapTime);
                const snapEnd = new moment(timeCreated);
                const snapDuration = timeCreated ? moment.duration(snapEnd.diff(snapStart)).as('minutes') : 0;
                data.push([snapEnd.valueOf(), snapDuration]);
                elapsedTimeData.push([snapEnd.valueOf(), snapDuration]);

                const nextSnap = arr[idx + 1];
                const { meta: nextMeta } = nextSnap || {};
                const { timeCreated: nextTimeCreated } = nextMeta || {};
                const end = idx === arr.length - 1 ? new moment() : new moment(nextTimeCreated);
                const duration = moment.duration(end.diff(snapEnd)).as('minutes');
                for (let i = 1; i <= duration; i++) {
                    // if volume is unmounted, trend line from the last snapshot to current time should not keep increasing
                    const trendValue =
                        idx < arr.length - 1 || (this.isVolumeMounted(volume) && idx === arr.length - 1)
                            ? snapDuration + i
                            : 0;
                    elapsedTimeData.push([snapEnd.add(1, 'minutes').valueOf(), trendValue]);
                }
            });
        }

        const maxMeasured = Math.max(
            ...data.map(d => d[constants.DATA_ARRAY_INDEX_VALUE]),
            ...elapsedTimeData.map(d => d[constants.DATA_ARRAY_INDEX_VALUE]),
            targetValue
        );

        chartConfig.yAxis[0].labels = {
            formatter: function() {
                return this.value ? formatDuration(this.value, 'minutes') : '0';
            },
        };
        chartConfig.yAxis[0].max = maxMeasured * 1.1 || 1;
        chartConfig.yAxis[0].min = 0;
        chartConfig.yAxis[0].tickInterval = 60;
        chartConfig.yAxis[0].plotLines = [
            this.generatePlotline(targetValue, `${formatMessage(complianceVolumeDetailsMsgs.targetRpoTime)}: ${value}`),
        ];

        chartConfig.series = [
            {
                data: elapsedTimeData,
                name: formatMessage(complianceVolumeDetailsMsgs.elapsedTime),
                type: 'line',
            },
            {
                data,
                marker: {
                    radius: 8,
                },
                name: formatMessage(complianceVolumeDetailsMsgs.timeOfSnapshot),
                type: 'scatter',
            },
        ];

        return chartConfig;
    }

    generatePlotline(value, text = '') {
        return {
            color: 'rgba(var(--critical-red-rgb), 0.7)',
            label: {
                style: {
                    color: 'rgba(var(--critical-red-rgb), 0.7)',
                    fontSize: '12px',
                    fontWeight: 'normal',
                },
                text,
                y: -8,
            },
            value,
            width: 1,
            zIndex: 5,
        };
    }

    getConfigData(key) {
        switch (key) {
            case constants.IO_KEYS.IO_PATTERN:
                return this.generateConfigDataPattern();
            case constants.IO_KEYS.PROVISIONING_UNIT:
                return this.generateConfigDataIO();
            case constants.IO_KEYS.READ_WRITE_MIX:
                return this.generateConfigDataRW();
            case constants.SLO_KEYS.RESPONSE_TIME_AVERAGE:
                return this.generateConfigDataLatency();
            case constants.SLO_KEYS.RESPONSE_TIME_MAXIMUM:
                return this.generateConfigDataLatencyMax();
            case constants.SLO_KEYS.RPO:
                return this.generateConfigDataSnapshots();
            default:
                return null;
        }
    }

    getChartLoadingStatus() {
        const { snapshotsData = {}, volumeMetricsData = {} } = this.props;
        const { selectedChartKey } = this.state;

        switch (selectedChartKey) {
            case constants.SLO_KEYS.RPO:
                return snapshotsData.loading;
            default:
                return volumeMetricsData.loading;
        }
    }

    getDurationStringAsMinutes(duration) {
        if (!duration) {
            return 0;
        }

        const numRegEx = RegExp(/([+-]?\d+(?:\.\d+)?)/);
        const splitDuration = duration.split(numRegEx);
        const numDuration = Number(splitDuration[1]) || 0;
        const unitDuration = splitDuration[2];
        const minutesDuration = unitDuration ? moment.duration(numDuration, unitDuration).asMinutes() : 0;

        return minutesDuration;
    }

    iopsServicePlan() {
        const { servicePlan } = this.props;
        const { provisioningUnit } = servicePlan || {};
        const { iOPS = 0 } = provisioningUnit || {};

        return iOPS !== 0;
    }

    getPerformance(capacity) {
        const { servicePlan } = this.props;
        const { provisioningUnit } = servicePlan || {};
        const { iOPS = 0, throughput = 0 } = provisioningUnit || {};

        if (iOPS) {
            return capacity * iOPS;
        }

        return bytesToUnit(capacity * throughput, 2, true);
    }

    handleTabSelect(tabKey) {
        this.setState({ tabKey });

        const { onTabSelect } = this.props;
        if (onTabSelect) {
            onTabSelect(tabKey);
        }
    }

    isVolumeMounted(volume) {
        const { mounts = [] } = volume || {};
        const { mountState } = mounts.find(mount => mount.snapIdentifier === constants.VOLUME_SNAPSHOT_HEAD) || {};

        return mountState === constants.VOLUME_MOUNT_STATES.MOUNTED;
    }

    renderFetchStatus() {
        const { loading } = this.props;

        if (loading) {
            return <Loader />;
        }
    }

    /**
     * @param {*} updatedCapacity
     */
    updateCapacity(updatedCapacity) {
        this.setState({ updatedCapacity });
    }

    getStatus(violationLevel) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (violationLevel) {
            case constants.METRIC_VIOLATION_LEVELS.ERROR:
                return formatMessage(volumeSeriesMsgs.statusError);
            case constants.METRIC_VIOLATION_LEVELS.WARNING:
                return formatMessage(volumeSeriesMsgs.statusWarning);
            case constants.METRIC_VIOLATION_LEVELS.OK:
                return formatMessage(volumeSeriesMsgs.statusOk);
            default:
                return '';
        }
    }

    getViolationLevel(id) {
        const { volumeComplianceTotalsData } = this.props;
        const { metrics = [] } = volumeComplianceTotalsData || {};
        const { violationlevel } = metrics.find(metric => metric.volId === id) || {};

        return violationlevel;
    }

    getServicePlanName(servicePlanId) {
        const { servicePlansData } = this.props;
        const { servicePlans = [] } = servicePlansData || {};

        const servicePlan = servicePlans.find(sp => sp.meta.id === servicePlanId);

        return (servicePlan && servicePlan.name) || '';
    }

    getAccountName(accountId) {
        const { accountsData } = this.props;
        const { accounts = [] } = accountsData || {};

        const account = accounts.find(account => account.meta.id === accountId);

        return (account && account.name) || '';
    }

    getConsistencyGroupName(consistencyGroupId) {
        const { consistencyGroupsData = [] } = this.props;
        const { consistencyGroups = [] } = consistencyGroupsData;

        const consistencyGroup = consistencyGroups.find(cg => {
            return cg.meta.id === consistencyGroupId;
        });

        return (consistencyGroup && consistencyGroup.name) || '';
    }

    /**
     * Determine what volume was listed before this one in the VolumeSeries table.
     */
    getPreviousLink() {
        const { volume, volumeList = [] } = this.props;
        const { meta } = volume || {};
        const { id } = meta || {};
        const currentVolumeIndex = volumeList.findIndex(vol => vol.id === id);

        if (currentVolumeIndex < 1) {
            return (
                <div className="resource-nav-link-disabled">
                    <NavigateBefore />
                </div>
            );
        }

        const prevVolume = volumeList[currentVolumeIndex - 1];
        const { id: prevVolumeId, name } = prevVolume;
        return (
            <Link
                className="resource-nav-link"
                to={{ pathname: `/${constants.URI_VOLUME_SERIES}/${prevVolumeId}`, state: { name, volumeList } }}
            >
                <NavigateBefore />
            </Link>
        );
    }

    /**
     * Determine what volume was listed after this one in the VolumeSeries table.
     */
    getNextLink() {
        const { volume, volumeList = [] } = this.props;
        const { meta } = volume || {};
        const { id } = meta || {};
        const currentVolumeIndex = volumeList.findIndex(vol => vol.id === id);

        if (currentVolumeIndex === -1 || currentVolumeIndex === volumeList.length - 1) {
            return (
                <div className="resource-nav-link-disabled">
                    <NavigateNext />
                </div>
            );
        }

        const nextVolume = volumeList[currentVolumeIndex + 1];
        const { id: nextVolumeId, name } = nextVolume;
        return (
            <Link
                className="resource-nav-link"
                to={{ pathname: `/${constants.URI_VOLUME_SERIES}/${nextVolumeId}`, state: { name, volumeList } }}
            >
                <NavigateNext />
            </Link>
        );
    }

    renderHeader() {
        const { consistencyGroupsData, intl, volume, volumeStatusData } = this.props;
        const { consistencyGroups = [] } = consistencyGroupsData || {};
        const { formatMessage } = intl;
        const { accountId, consistencyGroupId, meta, name = '', servicePlanId = '' } = volume || {};
        const { timeCreated } = meta || {};

        const servicePlanName = this.getServicePlanName(servicePlanId);
        const accountName = this.getAccountName(accountId);
        const consistencyGroupName = this.getConsistencyGroupName(consistencyGroupId);
        const applicationGroupIds = findApplicationGroupIds(consistencyGroups, consistencyGroupId);

        const cacheLevel =
            cacheStatus(volume) === constants.METRIC_VIOLATION_LEVELS.OK ? 'field-ok-text' : 'field-warning-text';

        const { metrics = [] } = volumeStatusData || {};
        const volumeStatusViolationLevel = metrics && metrics[0] && metrics[0].violationlevel;

        return (
            <div className="resource-details-header">
                <div className="layout-icon-background">
                    <img className="layout-icon" alt="" src={volumeHeaderIcon} />
                </div>
                <div className="resource-details-header-attributes-container">
                    <div className="content-flex-row-centered">
                        <div className="nav-links content-flex-row-centered">
                            <div className="flex-item-centered">{this.getPreviousLink()}</div>
                            <div className="flex-item-centered">{this.getNextLink()}</div>
                        </div>
                        <div className="resource-details-title">
                            {formatMessage(volumeSeriesMsgs.volumeDetailsTitle, { name })}
                        </div>
                    </div>
                    <div className="resource-details-header-attributes">
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                classNameValue="wizard-form-input-value"
                                inputComponent={
                                    <Link
                                        className="value-link"
                                        to={{
                                            pathname: `/${constants.URI_SERVICE_PLANS}`,
                                            state: {
                                                filter: servicePlanName,
                                                tabKey: constants.SERVICE_PLANS_OVERVIEW_TABS.POOLS,
                                            },
                                        }}
                                    >
                                        {servicePlanName}
                                    </Link>
                                }
                                label={formatMessage(volumeSeriesMsgs.servicePlanLabel)}
                            />
                            <FieldGroup
                                className="mb5"
                                classNameValue="wizard-form-input-value"
                                inputComponent={
                                    <Link
                                        className="value-link"
                                        to={{ pathname: `/${constants.URI_ACCOUNTS}/${accountId || ''}` }}
                                    >
                                        {accountName}
                                    </Link>
                                }
                                label={formatMessage(volumeSeriesMsgs.accountLabel)}
                            />
                        </div>
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                classNameValue="wizard-form-input-value"
                                inputComponent={
                                    <Link
                                        className="value-link"
                                        to={{
                                            pathname: `/${constants.URI_VOLUME_SERIES}`,
                                            state: {
                                                cgFilter: consistencyGroupName,
                                                tabKey: constants.VOLUMES_TABS.CONSISTENCY_GROUPS,
                                            },
                                        }}
                                    >
                                        {consistencyGroupName}
                                    </Link>
                                }
                                label={formatMessage(volumeSeriesMsgs.consistencyGroupLabel)}
                            />
                            <FieldGroup
                                className="mb5"
                                classNameValue="wizard-form-input-value"
                                inputComponent={
                                    applicationGroupIds.length > 0 ? (
                                        <OverlayTrigger
                                            overlay={
                                                <Tooltip id="resource-details-header-tooltip">
                                                    {applicationGroupIds.map(agId => {
                                                        const { applicationGroupsData } = this.props;
                                                        const { applicationGroups = [] } = applicationGroupsData || {};
                                                        const ag = applicationGroups.find(ag => ag.meta.id === agId);
                                                        const { name } = ag || {};

                                                        return <div key={agId}>{name}</div>;
                                                    })}
                                                </Tooltip>
                                            }
                                        >
                                            <div className="volume-details-ag-count resource-details-value">
                                                {applicationGroupIds.length}
                                            </div>
                                        </OverlayTrigger>
                                    ) : (
                                        applicationGroupIds.length
                                    )
                                }
                                label={formatMessage(volumeSeriesMsgs.applicationGroupsLabel)}
                            />
                        </div>
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(volumeSeriesMsgs.createdOnLabel)}
                                inputComponent={
                                    <div className="resource-details-value">{moment(timeCreated).format('LLL')}</div>
                                }
                            />
                            <FieldGroup
                                className="mb5"
                                classNameValue="wizard-form-input-value"
                                label={formatMessage(volumeSeriesMsgs.summaryStatusLabel)}
                                inputComponent={
                                    <div
                                        className={`resource-details-value ${violationLevelColor(
                                            volumeStatusViolationLevel
                                        )}`}
                                    >
                                        {this.getStatus(volumeStatusViolationLevel)}
                                    </div>
                                }
                            />
                        </div>
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                classNameText={cacheLevel}
                                classNameValue="wizard-form-input-value"
                                label={formatMessage(volumeSeriesMsgs.cacheLabel)}
                                name="cache"
                                type="static"
                                value={this.getStatus(cacheStatus(volume))}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderPerformance(sizeBytes) {
        const { intl, servicePlan } = this.props;
        const { formatMessage } = intl;
        const { provisioningUnit } = servicePlan || {};
        const { iOPS = 0, throughput = 0 } = provisioningUnit || {};

        const multiplier = bytesToUnit(sizeBytes) || 0;

        if (iOPS) {
            return `${multiplier * iOPS} ${formatMessage(servicePlanMsgs.iops)}`;
        }

        return formatMessage(servicePlanMsgs.provisioningUnitThroughputValue, {
            formattedBytes: formatBytes(multiplier * throughput, true),
        });
    }

    renderPerformanceDialog() {
        const { servicePlan = {}, servicePlanAllocationsData = {}, volume = {} } = this.props;
        const { dialogOpenPerformance } = this.state;

        return (
            <Collapse in={dialogOpenPerformance} unmountOnExit>
                <div>
                    <PerformanceDialog
                        cancel={this.handleClosePerformance}
                        save={this.save}
                        servicePlan={servicePlan}
                        servicePlanAllocationsData={servicePlanAllocationsData}
                        updateCapacity={this.updateCapacity}
                        volume={volume}
                    />
                </div>
            </Collapse>
        );
    }

    handleChartSelect(key) {
        this.setState({ selectedChartKey: key });

        const { dialogOpenPerformance } = this.state;
        if (dialogOpenPerformance && key !== constants.IO_KEYS.PROVISIONING_UNIT) {
            this.handleClosePerformance();
        }

        const { onChartSelect } = this.props;
        if (onChartSelect) {
            onChartSelect(key);
        }
    }

    /**
     * Toggle the dialog.
     */
    handleClickPerformance() {
        const { dialogOpenPerformance, selectedChart } = this.state;
        const { volume = {} } = this.props;
        const capacity = bytesToUnit(volume.sizeBytes + volume.spaAdditionalBytes);

        if (dialogOpenPerformance) {
            this.handleClosePerformance();
        } else {
            this.setState({
                dialogOpenPerformance: true,
                updatedCapacity: capacity,
            });

            if (selectedChart !== constants.IO_KEYS.PROVISIONING_UNIT) {
                this.handleChartSelect(constants.IO_KEYS.PROVISIONING_UNIT);
            }
        }
    }

    handleClosePerformance() {
        this.setState({
            dialogOpenPerformance: false,
            updatedCapacity: null,
        });
    }

    /**
     * Save operation for the capacity dialog.
     */
    save(performanceCapacity) {
        const { postChangeCapacity, volume } = this.props;
        const { meta, name } = volume || {};
        const { id: volumeSeriedId = '' } = meta || {};
        const spaAdditionalBytes = bytesFromUnit(performanceCapacity) - volume.sizeBytes;

        const volumeSeriesCreateSpec = {
            spaAdditionalBytes,
        };

        this.setState({ dialogOpenPerformance: false, initialCapacity: performanceCapacity });
        postChangeCapacity(volumeSeriesCreateSpec, volumeSeriedId, name);
    }

    selectTimePeriod(timePeriod) {
        const { selectTimePeriod } = this.props;

        if (selectTimePeriod) {
            selectTimePeriod(timePeriod);
        }
    }

    selectChart(selectedChart) {
        const { selectChart } = this.props;

        if (selectChart) {
            selectChart(selectedChart);
            this.setState({ selectedChartKey: selectedChart });
        }
    }

    renderTabs() {
        const {
            clustersData,
            endTime,
            intl,
            loading,
            onPatchVolume,
            postAuditLog,
            selectTimePeriod,
            servicePlan,
            snapshotsData,
            startTime,
            timePeriod,
            timeShift,
            volume,
            volumeComplianceTotalsData,
            volumeSeriesData,
            volumeServiceHistoryData,
        } = this.props;
        const { formatMessage } = intl;
        const { name } = servicePlan || {};
        const { dialogOpenPerformance, selectedChartKey, tabKey } = this.state;
        const chartOptions = this.getConfigData(selectedChartKey);
        const { series = [], yAxis = [] } = chartOptions || {};
        const { plotLines = [] } = yAxis[0] || {};

        series.forEach((s = {}, idx) => {
            const { data = [], marker = {}, type } = s;
            const { enabled, radius = 4 } = marker;

            s.marker = {
                ...marker,
                enabled,
                radius,
            };

            if (type === 'line') {
                s.marker.enabled = data.length <= 1;
            }

            s.color = constants.STYLE_HIGHCHART_COLORS[idx];
        });

        if (Array.isArray(plotLines) && plotLines.length < 1) {
            chartOptions.yAxis[0].plotLines = [];
        }

        const unmounted = !this.isVolumeMounted(volume);

        return (
            <Tabs
                activeKey={tabKey}
                className="tabs-container"
                id="resource-details-tabs"
                mountOnEnter
                onSelect={this.handleTabSelect}
            >
                <Tab
                    eventKey={constants.VOLUME_DETAILS_TABS.SETTINGS}
                    title={formatMessage(volumeSeriesMsgs.volumeDetailsTabSettings)}
                >
                    <VolumeSettings
                        loading={loading}
                        onPatchVolume={onPatchVolume}
                        servicePlan={servicePlan}
                        volume={volume}
                    />
                </Tab>
                <Tab
                    eventKey={constants.VOLUME_DETAILS_TABS.SERVICE_PLAN_COMPLIANCE}
                    title={formatMessage(volumeSeriesMsgs.volumeDetailsTabCompliance)}
                >
                    <div className="service-plan-compliance">
                        <div className="resource-settings-header">
                            <div className="service-plan-compliance-title">
                                {formatMessage(volumeSeriesMsgs.servicePlanComplianceTitle, { name })}
                            </div>
                            <div className="content-flex-row dialog-save-exit-buttons">
                                <TimePeriodSelector
                                    endTime={endTime}
                                    onClick={this.selectTimePeriod}
                                    startTime={startTime}
                                    timePeriod={timePeriod}
                                    timeShift={timeShift}
                                />
                                <ButtonAction
                                    btnUp={btnCapacityUp}
                                    btnHov={btnCapacityHov}
                                    btnDisable={btnCapacityDisable}
                                    onClick={this.handleClickPerformance}
                                    disabled={dialogOpenPerformance}
                                />
                            </div>
                        </div>
                        {this.renderPerformanceDialog()}
                        <ServicePlanTable
                            initialSelectedKey={selectedChartKey}
                            onClick={this.handleChartSelect}
                            servicePlan={servicePlan}
                            volume={volume}
                        />
                        {unmounted ? (
                            <div className="ml20 warning-text">{formatMessage(volumeSeriesMsgs.volumeIsUnmounted)}</div>
                        ) : (
                            ''
                        )}
                        {chartOptions ? (
                            <div className="service-plan-compliance-chart">
                                <HighchartContainer
                                    loading={this.getChartLoadingStatus()}
                                    container={`volume-compliance-chart-${selectedChartKey}`}
                                    options={chartOptions}
                                />
                            </div>
                        ) : null}
                    </div>
                </Tab>
                <Tab
                    eventKey={constants.VOLUME_DETAILS_TABS.SERVICE_HISTORY}
                    title={formatMessage(volumeSeriesMsgs.volumeDetailsTabHistory)}
                >
                    <VolumeServiceHistory
                        clustersData={clustersData}
                        endTime={endTime}
                        postAuditLog={postAuditLog}
                        selectChart={this.selectChart}
                        selectTimePeriod={selectTimePeriod}
                        snapshotsData={snapshotsData}
                        startTime={startTime}
                        timePeriod={timePeriod}
                        timeShift={timeShift}
                        volume={volume}
                        volumeComplianceTotalsData={volumeComplianceTotalsData}
                        volumeSeriesData={volumeSeriesData}
                        volumeServiceHistoryData={volumeServiceHistoryData}
                    />
                </Tab>
            </Tabs>
        );
    }

    render() {
        return (
            <div className="resource-details volume-details">
                <div className="component-page">
                    {this.renderFetchStatus()}
                    {this.renderHeader()}
                    {this.renderTabs()}
                </div>
            </div>
        );
    }
}

VolumeDetails.propTypes = {
    accountsData: PropTypes.object,
    applicationGroupsData: PropTypes.object,
    clustersData: PropTypes.object,
    consistencyGroupsData: PropTypes.object,
    endTime: PropTypes.object,
    initialChart: PropTypes.string,
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
    onChartSelect: PropTypes.func,
    onPatchVolume: PropTypes.func,
    onTabSelect: PropTypes.func,
    postAuditLog: PropTypes.func,
    postChangeCapacity: PropTypes.func,
    selectChart: PropTypes.func,
    selectTimePeriod: PropTypes.func,
    servicePlan: PropTypes.object,
    servicePlanAllocationsData: PropTypes.object,
    servicePlansData: PropTypes.object,
    snapshotsData: PropTypes.object,
    startTime: PropTypes.object,
    tabKey: PropTypes.string,
    timePeriod: PropTypes.string,
    timeShift: PropTypes.func,
    volume: PropTypes.object,
    volumeComplianceTotalsData: PropTypes.object,
    volumeList: PropTypes.array,
    volumeMetricsData: PropTypes.object,
    volumeSeriesData: PropTypes.object,
    volumeServiceHistoryData: PropTypes.object,
    volumeStatusData: PropTypes.object,
};

export default injectIntl(VolumeDetails);
