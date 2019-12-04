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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';

import HighchartContainer from '../containers/HighchartContainer';
import NuDonut from './NuDonut';
import { getSeverityCountsByClassName } from './styleUtils';
import { messages } from '../messages/Messages';
import { volumeMetricsMsgs } from '../messages/VolumeMetrics';

/**
 * If only one data point, only show 'ok' (green), otherwise show
 * ok/alert ('orange') colors.
 * @param {array} data
 */
function getColors(data) {
    if (data && data.length === 1) {
        return ['rgb(82,211,118)'];
    } else {
        return ['rgb(253,186,92)', 'rgb(82,211,118)'];
    }
}

class OverallComplianceChart extends Component {
    generateConfigData(chartTitle, data) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        let indent = 0;
        let titleFontSize = '';

        /**
         * Determine where the labels should be placed on the pie chart.  Where
         * they land impacts the dimensions of the chart and can lead to irregularities
         * when placed side-by-side with other pie charts.  If there is only one
         * piece of data, put it in the middle.
         */
        if (data.chartData && data.chartData.length === 1) {
            indent = -50;
        } else {
            indent = -20;
        }

        const chartConfig = {
            chart: {
                type: 'pie',
                marginLeft: 0,
                marginRight: 0,
            },
            lang: {
                noData: formatMessage(volumeMetricsMsgs.noData),
            },
            plotOptions: {
                pie: {
                    colors: getColors(data.chartData),
                    dataLabels: {
                        enabled: true,
                        distance: indent,
                        /**
                         * No decimal points but we may want to
                         * re-evaluate for larger scale deployments.
                         * This can impact the layout.
                         */
                        format: '{point.percentage:.0f}%',
                        style: {
                            fontSize: '11px',
                            color: 'black',
                            fontWeight: 'bold',
                        },
                    },
                },
            },
            credits: {
                enabled: false,
            },
            legend: {
                enabled: false,
            },
            xAxis: {
                title: null,
                visible: false,
            },
            series: [
                {
                    borderWidth: 1,
                    dataLabels: {
                        enabled: true,
                        useHTML: true,
                        formatter: function() {
                            return '<div>' + this.point.name + '</div>';
                        },
                    },
                },
            ],
            title: {
                text: chartTitle,
                style: { fontSize: titleFontSize },
            },
            subtitle: null,
            yAxis: {
                title: null,
                labels: {
                    enabled: false,
                },
                visible: false,
            },
        };

        chartConfig.series[0].data = data.chartData;
        chartConfig.series[0].name = chartTitle;

        return chartConfig;
    }

    render() {
        const { intl, useHighcharts } = this.props;
        const { formatMessage } = intl;
        const { volumeData, consistencyGroupData, appGroupData, servicePlanData } = this.props;
        const volumeChartConfig = this.generateConfigData(
            formatMessage(messages.volumesLabel, { count: 2 }),
            volumeData
        );
        const consistencyGroupChartConfig = this.generateConfigData(
            formatMessage(messages.consistencyGroupsLabel),
            consistencyGroupData
        );
        const appChartConfig = this.generateConfigData(
            formatMessage(messages.appGroupsLabel, { count: 2 }),
            appGroupData
        );
        const servicePlanChartConfig = this.generateConfigData(
            formatMessage(messages.servicePlansLabel, { count: 2 }),
            servicePlanData
        );

        const volumeCounts = getSeverityCountsByClassName(volumeChartConfig, true);
        const consistencyGroupCounts = getSeverityCountsByClassName(consistencyGroupChartConfig, true);
        const appGroupCounts = getSeverityCountsByClassName(appChartConfig, true);
        const servicePlanCounts = getSeverityCountsByClassName(servicePlanChartConfig, true);
        const strokeWidth = 2.5;

        return (
            <div className="overallComplianceChart">
                {useHighcharts ? (
                    <Fragment>
                        <HighchartContainer
                            container={'overallComplianceChartVolumes'}
                            loading={volumeData.loading}
                            options={volumeChartConfig}
                        />
                        <HighchartContainer
                            container={'overallComplianceChartCG'}
                            loading={consistencyGroupData.loading}
                            options={consistencyGroupChartConfig}
                        />
                        <HighchartContainer
                            container={'overallComplianceChartAG'}
                            loading={appGroupData.loading}
                            options={appChartConfig}
                        />
                        <HighchartContainer
                            container={'overallComplianceChartSP'}
                            loading={servicePlanData.loading}
                            options={servicePlanChartConfig}
                        />
                    </Fragment>
                ) : (
                    <Fragment>
                        <NuDonut
                            countError={volumeCounts.error}
                            countOk={volumeCounts.ok}
                            countWarning={volumeCounts.warning}
                            id="overallComplianceChartVolumes"
                            loading={volumeData.loading}
                            showDetails
                            strokeWidth={strokeWidth}
                            title={volumeChartConfig.title.text}
                        />
                        <NuDonut
                            countError={consistencyGroupCounts.error}
                            countOk={consistencyGroupCounts.ok}
                            countWarning={consistencyGroupCounts.warning}
                            id="overallComplianceChartCG"
                            loading={consistencyGroupData.loading}
                            showDetails
                            strokeWidth={strokeWidth}
                            title={consistencyGroupChartConfig.title.text}
                        />
                        <NuDonut
                            countError={appGroupCounts.error}
                            countOk={appGroupCounts.ok}
                            countWarning={appGroupCounts.warning}
                            id="overallComplianceChartAG"
                            loading={appGroupData.loading}
                            showDetails
                            strokeWidth={strokeWidth}
                            title={appChartConfig.title.text}
                        />
                        <NuDonut
                            countError={servicePlanCounts.error}
                            countOk={servicePlanCounts.ok}
                            countWarning={servicePlanCounts.warning}
                            id="overallComplianceChartSP"
                            loading={servicePlanData.loading}
                            showDetails
                            strokeWidth={strokeWidth}
                            title={servicePlanChartConfig.title.text}
                        />
                    </Fragment>
                )}
            </div>
        );
    }
}

OverallComplianceChart.propTypes = {
    appGroupData: PropTypes.object.isRequired,
    consistencyGroupData: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    loading: PropTypes.bool.isRequired,
    servicePlanData: PropTypes.object.isRequired,
    useHighcharts: PropTypes.bool,
    volumeData: PropTypes.object.isRequired,
};

export default injectIntl(OverallComplianceChart);
