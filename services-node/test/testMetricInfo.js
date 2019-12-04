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
const numSampleDays = 30;
const KB = 1024;

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
                    hour: 18,
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
                    hour: 19,
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
                    hour: 19,
                },
                used: 3,
                capacity: 5,
                spaAllocatedBytes: 5,
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
        workloads: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 8000,
            },
        ],
    },
    /**
     * Latency error - service plan change after application deployed and user
     * sees degraded behavior
     *
     * SP: OLTP Data => DSS Data
     * Violation: Latency error
     * Resolution: SP change
     */
    {
        volname: 'Marketing-DB2',
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
                    day: 17,
                    hour: 3,
                },
                latencyAverage: {
                    min: 6,
                    max: 8,
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
            {
                transitionTime: {
                    day: 17,
                    hour: 4,
                },
                name: 'DSS Data',
                id: null,
            },
        ],
    },
    /**
     * Temporary issues in cloud services
     *
     * SP: GVA
     * Violation: Latency max
     * Resolution: None - temporary glitch in cloud service
     */
    {
        volname: 'Eng-App1',
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
                    day: 19,
                    hour: 8,
                },
                latencyAverage: {
                    min: 200,
                    max: 240,
                },
            },
            {
                transitionTime: {
                    day: 19,
                    hour: 10,
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
                capacity: 10,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                name: 'General',
                id: null,
            },
        ],
    },
    /**
     * Temporary issues in cloud services
     *
     * SP: GVA
     * Violation: Latency max
     * Resolution: None - temporary glitch in cloud service
     */
    {
        volname: 'Eng-App2',
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
                    day: 19,
                    hour: 8,
                },
                latencyAverage: {
                    min: 200,
                    max: 240,
                },
            },
            {
                transitionTime: {
                    day: 19,
                    hour: 10,
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
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                name: 'Technical Applications',
                id: null,
            },
        ],
    },
    /**
     * Temporary issues in cloud services
     *
     * SP: Technical applications
     * Violation: Latency max
     * Resolution: None - temporary glitch in cloud service
     */
    {
        volname: 'Eng-App3',
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
                    day: 19,
                    hour: 8,
                },
                latencyAverage: {
                    min: 200,
                    max: 240,
                },
            },
            {
                transitionTime: {
                    day: 19,
                    hour: 10,
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
                capacity: 10,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                name: 'Technical Applications',
                id: null,
            },
        ],
    },
    /**
     * Capacity issue
     *
     * SP: DSS Data
     * Violation: Capacity (not implemented)
     * Resolution: None at this time
     */
    {
        volname: 'Marketing-DSS1',
        latencies: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                latencyAverage: {
                    min: 3,
                    max: 5,
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
                capacity: 10,
            },
            {
                transitionTime: {
                    day: 4,
                    hour: 0,
                },
                used: 2,
                capacity: 10,
            },
            {
                transitionTime: {
                    day: 6,
                    hour: 0,
                },
                used: 3,
                capacity: 10,
            },
            {
                transitionTime: {
                    day: 10,
                    hour: 0,
                },
                used: 4,
                capacity: 10,
            },
            {
                transitionTime: {
                    day: 13,
                    hour: 0,
                },
                used: 5,
                capacity: 10,
            },
            {
                transitionTime: {
                    day: 17,
                    hour: 0,
                },
                used: 6,
                reserved: 10,

                capacity: 10,
            },
            {
                transitionTime: {
                    day: 18,
                    hour: 0,
                },
                used: 7,
                capacity: 10,
            },
            {
                transitionTime: {
                    day: 20,
                    hour: 0,
                },
                used: 8,
                capacity: 10,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                name: 'DSS Data',
                id: null,
            },
        ],
    },
    /**
     * Wrong level of service plan chosen for required performance of application
     *
     * SP: OLTP => OLTP Premier
     * Violation: Workload
     * Resolution: Service plan change
     */
    {
        volname: 'WorkloadOLTPBasicToPremier',
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
                    day: 17,
                    hour: 5,
                },
                latencyAverage: {
                    min: 1,
                    max: 2,
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
                capacity: 100,
            },
            {
                transitionTime: {
                    day: 15,
                    hour: 9,
                },
                used: 20,
                capacity: 100,
            },
            {
                transitionTime: {
                    day: 16,
                    hour: 2,
                },
                used: 21,
                capacity: 100,
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
            {
                transitionTime: {
                    day: 17,
                    hour: 5,
                },
                name: 'OLTP Data - Premier',
                id: null,
            },
        ],
        workloads: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 8000,
            },
        ],
    },
    /**
     * Used for normal workload demonstration
     *
     * SP: OLTP
     * Violation: None
     * Resolution: None
     */
    {
        volname: 'WorkloadNoChange',
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
        ],
        capacities: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                used: 1,
                capacity: 100,
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
        workloads: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 8000,
            },
        ],
    },
    /**
     * Chose wrong service plan - archive !== backup
     *
     * SP: Online Archive -> Backup
     * Violation: Workload
     * Resolution: Service plan change
     */
    {
        volname: 'ViolationWorkloadRate',
        latencies: [
            {
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 21,
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
                    day: numSampleDays - 1,
                    hour: 21,
                },
                used: 1,
                capacity: 100,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 21,
                },
                name: 'Online Archive',
                id: null,
            },
            {
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 22,
                },
                name: 'Backup',
                id: null,
            },
        ],
        workloads: [
            {
                // increase workload rate beyond 100%
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 21,
                },
                iops: {
                    min: 110,
                    max: 120,
                },
                ioMix: {
                    read: 15,
                    write: 85,
                },
                ioSize: 512 * KB,
            },
            {
                // adjust after SP change (hand calculate differences)
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 22,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 15,
                    write: 85,
                },
                ioSize: 512 * KB,
            },
        ],
    },
    /**
     * Demonstrate that the user chose the wrong SP.
     * They should have picked Streaming Analytics instead of DSS Data
     * due to R/W mix.  Don't change the RW mix through the life of the
     * volume, only change the service plan to the correct one.
     */
    /**
     * SP: DB Log
     * Violation: Workload Mix Read
     * Resolution: Service plan change
     */
    {
        volname: 'ViolationWorkLoadMixRead',
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
        ],
        capacities: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                used: 1,
                capacity: 100,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                name: 'DSS Data',
                id: null,
            },
            {
                transitionTime: {
                    day: 8,
                    hour: 14,
                },
                name: 'Streaming Analytics',
                id: null,
            },
        ],
        workloads: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                iops: {
                    min: 10,
                    max: 20,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 256 * KB,
            },
        ],
    },
    /**
     * User places a database data file on a log volume.  Moves the
     * database off this volume.
     *
     * SP: DB Log
     * Violation: Workload Mix Write
     * Resolution: None (outside the solution, but data placement issue on customer side)
     */
    {
        volname: 'ViolationWorkLoadMixWrite',
        latencies: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                latencyAverage: {
                    min: 3,
                    max: 5,
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
                capacity: 100,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                name: 'DB Log',
                id: null,
            },
        ],
        workloads: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 15,
                    write: 85,
                },
                ioSize: 16 * KB,
            },
            {
                transitionTime: {
                    day: 18,
                    hour: 8,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 16 * KB,
            },
            {
                transitionTime: {
                    day: 18,
                    hour: 12,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 12,
                    write: 88,
                },
                ioSize: 16 * KB,
            },
        ],
    },
    /**
     * Technical Applications to General
     * Workload starts at 16KB then goes to 8KB, then SP is adjusted given
     * the application requirements change.
     *
     * SP: Technical Applications to General
     * Violation: Workload Average Size Minimum
     * Resolution: SP Change
     */
    {
        volname: 'ViolationWorkloadAvgSizeMin',
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
        ],
        capacities: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                used: 1,
                capacity: 100,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                name: 'Technical Applications',
                id: null,
            },
            {
                transitionTime: {
                    day: 22,
                    hour: 10,
                },
                name: 'General',
                id: null,
            },
        ],
        workloads: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 16 * KB,
            },
            {
                transitionTime: {
                    day: 22,
                    hour: 9,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 8 * KB,
            },
        ],
    },
    /**
     * General to Technical Applications
     * Workload starts at 16KB then goes to 32KB, then SP is adjusted given
     * the application requirements change.
     *
     * SP: General to Technical Applications
     * Violation: Workload Average Size Maximum
     * Resolution: SP Change
     */
    {
        volname: 'ViolationWorkloadAvgSizeMax',
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
        ],
        capacities: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                used: 1,
                capacity: 100,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                name: 'General',
                id: null,
            },
            {
                transitionTime: {
                    day: 19,
                    hour: 11,
                },
                name: 'Technical Applications',
                id: null,
            },
        ],
        workloads: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 16 * KB,
            },
            {
                transitionTime: {
                    day: 19,
                    hour: 10,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 32 * KB,
            },
        ],
    },
    {
        volname: 'Database-Alpha',
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
                    hour: 18,
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
                    hour: 19,
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
                    hour: 22,
                },
                used: 3,
                capacity: 5,
                spaAllocatedBytes: 2,
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
        workloads: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                iops: {
                    min: 70,
                    max: 80,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 8 * KB,
            },
            {
                // increase workload rate beyond 100%
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 21,
                },
                iops: {
                    min: 110,
                    max: 120,
                },
                ioMix: {
                    read: 60,
                    write: 40,
                },
                ioSize: 8 * KB,
            },
        ],
    },
];

module.exports = {
    volumeMetricInfo: volumeMetricInfo,
};
