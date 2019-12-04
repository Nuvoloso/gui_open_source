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

import HighchartContainer from '../containers/HighchartContainer';

const capacityConfig = {
    credits: false,
    chart: {
        type: 'bar',
    },
    title: {
        text: '',
    },
    xAxis: {
        categories: ['Ephemeral', 'EBS GP2', 'EBS Disk', 'S3'],
        labels: {
            style: {
                fontSize: window.innerHeight > 850 ? '13px' : '9px',
            },
        },
    },
    yAxis: {
        title: {
            text: '% Used',
        },
        max: 100,
    },
    series: [
        {
            data: [29.9, 71.5, 10.4, 12.2],
            showInLegend: false,
        },
    ],
};

class StorageCapacityChart extends Component {
    render() {
        const { zoomed } = this.props;

        return <HighchartContainer container={'StorageCapacityChart'} options={capacityConfig} zoomed={zoomed} />;
    }
}

StorageCapacityChart.propTypes = {
    zoomed: PropTypes.string,
};

export default StorageCapacityChart;
