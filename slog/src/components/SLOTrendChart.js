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
import HighchartContainer from '../containers/HighchartContainer';

/* how many points in the trend chart */
const trendCount = 20;

/*
 *  generate a trend of values
 * count: number of values to generate
 * min: lower end of range
 * max: higher end of range
 * down: optional boolean to indicate if trend is down/up
 */
function generateTrendValues(count, min = 0, max = 100, down = false) {
    let vals = [];
    for (let i = 0; i < count; i++) {
        let num = Math.random() * (max - min) + min;
        let prev = max;

        if (i === 0 && down) {
            num = 99;
            max = 99;
            min = min - 1;
        }

        if (down) {
            if (i === 0) {
                prev = max;
            } else {
                prev = vals[i - 1];
            }
            while (num >= prev) {
                num = Math.random() * (max - min) + min;
            }
        }

        vals.push(num);
        if (down) {
            max = max - 0.1;
            min = min - 0.1;
        }
    }

    return vals;
}

/* line chart for trends */
const sloConfig = {
    credits: false,
    chart: {
        type: 'line',
    },
    title: {
        text: '',
    },
    xAxis: {
        categories: ['11:00', '11:30', '12:00', '12:30'],
    },
    yAxis: {
        title: {
            text: 'Compliance %',
        },
        max: 100,
        min: 95,
    },
    series: [
        {
            name: 'Marketing DB Data',
            data: generateTrendValues(trendCount, 98.5, 99.5),
        },
        {
            name: 'Marketing DB Logs',
            data: generateTrendValues(trendCount, 99, 100, true),
        },
        {
            name: 'Marketing Web Server',
            data: generateTrendValues(trendCount, 99.25, 99.75),
        },
        {
            name: 'DB Data',
            data: generateTrendValues(trendCount, 99, 100),
        },
        {
            name: 'DB Logs',
            data: generateTrendValues(trendCount, 98, 99),
        },
        {
            name: 'Application',
            data: generateTrendValues(trendCount, 95, 96),
        },
    ],
};

class SLOTrendChart extends Component {
    render() {
        return <HighchartContainer container={'SLOTrendChart'} options={sloConfig} />;
    }
}

export default SLOTrendChart;
