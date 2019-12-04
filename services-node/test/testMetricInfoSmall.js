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

/**
 * Define ranges of metrics based on volumes.
 * latencies, capacity, serviceplans should be driven from this table of objects.
 */
const volumeMetricInfo = [
    /**
     * Latency warning only
     *
     * SP: OLTP Data (no change)
     * Violation: Latency warning
     * Resolution: Capacity change
     */
    {
        volname: 'Marketing-DB1',
        latencies: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                latencyAverage: {
                    min: 1,
                    max: 3,
                },
            },
            {
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 3,
                },
                latencyAverage: {
                    min: 3,
                    max: 4,
                },
            },
            {
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 6,
                    minute: 40,
                },
                latencyAverage: {
                    min: 7,
                    max: 9,
                },
            },
            {
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 12,
                },
                latencyAverage: {
                    min: 1,
                    max: 3,
                },
            },
        ],
        capacities: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                used: 1,
                capacity: 5,
            },
            {
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 9,
                },
                used: 2,
                capacity: 5,
            },
            {
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 12,
                },
                used: 3,
                capacity: 10,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                name: 'OLTP Data',
                id: null,
            },
        ],
    },
];

module.exports = {
    volumeMetricInfo: volumeMetricInfo,
};
