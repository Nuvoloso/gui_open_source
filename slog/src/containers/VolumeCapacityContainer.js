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
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';

import HighchartContainer from '../containers/HighchartContainer';
import { getVolumeCapacity } from '../actions/volumeMetricsActions';
import { volumeMetricsMsgs } from '../messages/VolumeMetrics';

class VolumeCapacityContainer extends Component {
    componentDidMount() {
        const { volumeSeries } = this.props;
        const { id, meta = {}, name } = volumeSeries || {};

        if (id || meta.id) {
            this.fetchData(id || meta.id, name);
        }
    }

    componentDidUpdate(prevProps) {
        const { volumeSeries } = this.props;
        const { meta, name } = volumeSeries || {};
        const { id } = meta || {};
        const { volumeSeries: prevVolumeSeries } = prevProps;
        const { meta: prevMeta } = prevVolumeSeries || {};
        const { id: prevId } = prevMeta || {};

        if (id !== prevId) {
            this.fetchData(id, name);
        }
    }

    fetchData(id, name) {
        const { dispatch } = this.props;

        dispatch(
            getVolumeCapacity(
                'admin',
                moment()
                    .utc()
                    .subtract(7, 'days')
                    .toISOString(),
                moment()
                    .utc()
                    .toISOString(),
                id,
                name
            )
        );
    }

    render() {
        const { intl, volumeCapacityMetricsData } = this.props;
        const { formatMessage } = intl;
        const { loading, metrics } = volumeCapacityMetricsData || {};

        return (
            <HighchartContainer
                loading={loading}
                container="volumeCapacity"
                options={{
                    colors: ['#1298d3', '#6e5bb9', '#f5a623', '#e0da75'],
                    type: 'line',
                    chart: {
                        zoomType: 'x',
                        className: 'volume-capacity',
                        animation: false,
                    },
                    lang: {
                        noData: formatMessage(volumeMetricsMsgs.noData),
                    },
                    credits: {
                        enabled: false,
                    },
                    xAxis: {
                        type: 'datetime',
                    },
                    series:
                        !metrics || metrics.length === 0
                            ? [{ name: 'Size', data: [] }, { name: 'Allocated', data: [] }]
                            : [metrics.data[0], metrics.data[1]],
                    subtitle: {
                        text: null,
                    },
                    time: {
                        useUTC: false,
                    },
                    title: {
                        text: formatMessage(volumeMetricsMsgs.capacityUsageTitle),
                    },
                    yAxis: {
                        allowDecimals: false,
                        title: {
                            text: formatMessage(volumeMetricsMsgs.bytes),
                        },
                    },
                    tooltip: {
                        formatter: function() {
                            return false;
                        },
                    },
                }}
            />
        );
    }
}

VolumeCapacityContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    volumeCapacityMetricsData: PropTypes.object.isRequired,
    volumeSeries: PropTypes.object,
};

function mapStateToProps(state) {
    const { volumeCapacityMetricsData } = state;
    return {
        volumeCapacityMetricsData,
    };
}

export default injectIntl(connect(mapStateToProps)(VolumeCapacityContainer));
