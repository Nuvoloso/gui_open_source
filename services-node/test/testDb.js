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
'use strict';

const { Pool } = require('pg');

var moment = require('moment');
const axios = require('axios');
const https = require('https');
const fs = require('fs');
const async = require('async');

const config = require('../src/config');

import * as constants from '../constants';

const apiApplicationGroups = `${config.API_URL}/${constants.URI_APPLICATION_GROUPS}`;
const apiClusters = `${config.API_URL}/${constants.URI_CLUSTERS}`;
const apiConsistencyGroups = `${config.API_URL}/${constants.URI_CONSISTENCY_GROUPS}`;
const apiServicePlans = `${config.API_URL}/${constants.URI_SERVICE_PLANS}`;
const apiVolumeSeries = `${config.API_URL}/${constants.URI_VOLUME_SERIES}`
const apiNodes = `${config.API_URL}/${constants.URI_NODES}`
const apiStorage = config.API_URL.concat('/storage');
const apiStorageProvisioners = config.API_URL.concat('/pools');

const apiVolumeSeriesRequests = `${config.API_URL}/${constants.URI_VOLUME_SERIES_REQUESTS}`);

const METRIC_SAMPLE_PERIOD_MINUTES = 5;
const METRIC_SAMPLE_PERIOD_SECONDS = METRIC_SAMPLE_PERIOD_MINUTES * 60;

// Global for the database handle
let psqlPool = null;

/**
 * Globals to stash the info retrieved.
 */
const applicationGroupInfo = [];
const consistencyGroupInfo = [];
const clusterInfo = [];
const nodeInfo = [];
const poolInfo = [];
const servicePlanInfo = [];
const storageInfo = [];
const volInfo = [];

const instance = axios.create({
    httpsAgent: new https.Agent({
        ca: fs.readFileSync('ssl/ca.crt'),
        key: fs.readFileSync('ssl/client.key'),
        cert: fs.readFileSync('ssl/client.crt'),
        rejectUnauthorized: false,
    }),
});

const debugViolations = false;
function debugViolationLog(stmt) {
    if (debugViolations) {
        console.log(stmt);
    }
}

/**
 * GiB sizes
 */
const KB = 1000;
const MB = KB * 1000;
const GB = MB * 1000;

/**
 * Number of samples -- currently set for a month, sampled every
 * 5 minutes.
 * numSampleDays - how many days of data configured in 'poolMetricInfo'
 * numSamples - total # of samples; real metrics are collected every 5 minutes
 * numDaysData - shortened number of days to fetch data to facilitate quick loads
 * numSkipSamples - how many samples to skip from the beginning to numDaysData left
 * to load
 */
const numSampleDays = 30;
const numDaysData = process.env.NUM_DAYS_DATA ? process.env.NUM_DAYS_DATA : 0;
const numSkipSamples = numDaysData ? ((numSampleDays - numDaysData) * 24 * 60) / METRIC_SAMPLE_PERIOD_MINUTES : 0;

/**
 * Compute number of samples.  Need an offset from start of day to load
 * up the database all the way to the current time.
 */
function getNumSamples() {
    const daySamples = (numSampleDays * 24 * 60) / METRIC_SAMPLE_PERIOD_MINUTES;
    const now = moment();
    var midnight = now.clone().startOf('day');
    var diffMinutes = now.diff(midnight, 'minutes');
    const samplesSinceMidnight = diffMinutes / METRIC_SAMPLE_PERIOD_MINUTES;

    const roundedSamples = Math.round(daySamples + samplesSinceMidnight);
    return roundedSamples + (10 - (roundedSamples % 10));
}

/**
 * Define ranges of metrics based on volumes.
 * latencies, capacity, serviceplans should be driven from this table of objects.
 */

/**
 * Change the following two constants to limit load to volumes
 * specified in 'small' file
 */
const smallLoad = false;
const testMetricInfo = smallLoad ? require('./testMetricInfoSmall') : require('./testMetricInfo');

const volumeMetricInfo = testMetricInfo.volumeMetricInfo;

/**
 * Resource pool/storage provisioner metrics.  We only key off the ones that
 * we know are created for the Q1 demo workflow.
 */
const poolMetricInfo = [
    {
        name: 'GP2',
        capacities: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                capacity: 500,
                reserved: 8,
            },
            {
                transitionTime: {
                    day: 21,
                    hour: 8,
                },
                capacity: 500,
                reserved: 12,
            },
        ],
    },
    {
        name: 'ST1',
        capacities: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                capacity: 500,
                reserved: 300,
            },
            {
                transitionTime: {
                    day: 21,
                    hour: 8,
                },
                capacity: 1000,
                reserved: 400,
            },
        ],
    },
    {
        name: 'IO1',
        capacities: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                capacity: 500,
                reserved: 100,
            },
        ],
    },
    {
        name: 'S3',
        capacities: [
            {
                transitionTime: {
                    day: 0,
                    hour: 0,
                },
                capacity: 2000,
                reserved: 200,
            },
        ],
    },
];

/**
 * The start time is numSampleDays days ago, but start from the top of the hour
 * to align to 5 minute sample periods.
 */
function getStartTime() {
    const startingHour = moment()
        .subtract(numSampleDays, 'days')
        .startOf('day');
    return startingHour;
}

/**
 * Load all volume latency metric info for the time range.
 */
function loadVolumeLatencyInfo(cb) {
    // month of data
    const startTime = getStartTime();
    var stmt;
    const numSamples = getNumSamples();

    // extend object to carry its metric change indexes
    volInfo.forEach(vol => {
        vol.latencyIndex = 0;
        vol.servicePlanIndex = 0;
        vol.capacityIndex = 0;
        vol.workloadIndex = 0;
        vol.used = 0;
    });

    /**
     * Account for difference in number of hours since start of day
     */

    /**
     * Insert the samples into the database.  We throttle the number of parallel inserts
     * occurring.  The first loop could be converted to 'times', but left as limited for
     * now for additional tuning.
     *
     * Also see the construction of the postgres client Pool in initDB() to determine how
     * many client connections can be set (via 'max').
     */
    /**
     * TBD: should change from timesLimit to whilst
     */
    console.log(`Inserting ${numSamples} time samples, period ${numSamples / METRIC_SAMPLE_PERIOD_MINUTES}`);
    async.timesLimit(numSamples,
        1,
        (n, next) => {
            const timestamp = startTime + n * METRIC_SAMPLE_PERIOD_MINUTES * 60 * 1000;
            if (n % (numSamples / 10) === 0) {
                console.log(`${(n / numSamples) * 100}% complete`, moment().format('MMMM Do YYYY, h:mm:ss a'));
            }
            if (numSkipSamples && n < numSkipSamples) {
                next();
            }
            async.eachLimit(volInfo,
                100,
                (vol, nextVol) => {
                    async.eachLimit(volumeMetricInfo,
                        50,
                        (metricInfo, nextMetric) => {
                            if (metricInfo.volname === vol.name) {
                                // Need to multiply by 5 for 5 minute intervals
                                insertLatencySample(timestamp,
                                    stmt,
                                    n * METRIC_SAMPLE_PERIOD_MINUTES,
                                    metricInfo,
                                    vol,
                                    () => {
                                        nextMetric();
                                    });
                            } else {
                                nextMetric();
                            }
                        },
                        err => {
                            if (err) {
                                console.log(err);
                                return cb(err, null);
                            }
                            nextVol();
                        });
                },
                err => {
                    if (err) {
                        console.log(err);
                        return cb(err, null);
                    }
                    next();
                });
        },
        err => {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            /**
             * No error and simply return an empty array.
             */
            cb(null, []);
        });
}

/**
 * For the given minute, determine if we need to transition to the next
 * entry in the metric table or continue with current values.
 *
 * @param {string} timestamp
 * @param {object} stmt
 * @param {string} minute
 * @param {object} metricInfo
 * @param {object} vol
 */
function insertLatencySample(timestamp, stmt, minute, metricInfo, vol, cb) {
    if (metricInfo.latencies.length === 1 && metricInfo.volname === 'ViolationWorkloadRate') {
        const tm = transitionMinute(metricInfo.latencies[0]);
        if (minute < tm) {
            return cb(null);
        }
    }

    if (
        metricInfo.latencies.length > vol.latencyIndex + 1 &&
        minute === transitionMinute(metricInfo.latencies[vol.latencyIndex + 1])
    ) {
        vol.latencyIndex = vol.latencyIndex + 1;
    }

    if (
        metricInfo.servicePlans.length > vol.servicePlanIndex + 1 &&
        minute === transitionMinute(metricInfo.servicePlans[vol.servicePlanIndex + 1])
    ) {
        vol.servicePlanIndex = vol.servicePlanIndex + 1;
    }

    if (
        metricInfo.workloads &&
        metricInfo.workloads.length > vol.workloadIndex + 1 &&
        minute === transitionMinute(metricInfo.workloads[vol.workloadIndex + 1])
    ) {
        vol.workloadIndex = vol.workloadIndex + 1;
    }

    /**
     * This is replicated from the code to load the capacity database which is used to
     * hold information for resource pools as well.  When we implement our real metrics
     * store, we will pull the data from somewhere else instead of accumulating by volume.
     */
    if (metricInfo.capacities && metricInfo.capacities.length > 0) {
        /**
         * Generate capacity information based on time.
         * If there is another capacity change, generate metrics based on that next step increment.
         * If there is only capacity, generate slightly randomly increasing values for the size.
         * If we are on the last metric for a range of capacities, generate slightly randomly increasing
         * values for the size.
         */
        let minutesUntilNextChange = 0;
        if (metricInfo.capacities.length > vol.capacityIndex + 1) {
            const nextPeriod = metricInfo.capacities[vol.capacityIndex + 1];
            const curPeriod = metricInfo.capacities[vol.capacityIndex];
            const deltaUsed = nextPeriod.used - curPeriod.used;

            // compute time between now and next change
            minutesUntilNextChange = transitionMinute(nextPeriod) - minute;

            // compute % difference, getting approximation of % left until next shift
            const minutesInPeriod = transitionMinute(nextPeriod) - transitionMinute(curPeriod);
            const approximation = 1 - minutesUntilNextChange / minutesInPeriod;

            vol.used = curPeriod.used * GB + approximation * deltaUsed * GB;

            // transition to next capacity increment
            if (minutesUntilNextChange === 0) {
                vol.capacityIndex = vol.capacityIndex + 1;
            }
        } else if (metricInfo.capacities.length === 1) {
            vol.used = metricInfo.capacities[0].used * GB + minute * 100 + getRandomIntInclusive(1, 10) * 10;
        } else {
            vol.used =
                metricInfo.capacities[metricInfo.capacities.length - 1].used * GB +
                minute * 100 +
                getRandomIntInclusive(1, 10) * 10;
        }
    }

    insertMetrics(stmt, timestamp, vol, metricInfo, cb);
}

/**
 * Do the match to determine what minute in the time period we are.
 * Works for latency, capacity, service plan, workload.
 */
function transitionMinute(transition) {
    /**
     * convert latency day/hour/minute to minute
     */
    const minuteOffset = transition.transitionTime.minute ? transition.transitionTime.minute : 0;
    return transition.transitionTime.day * 24 * 60 + transition.transitionTime.hour * 60 + minuteOffset;
}

function genLatencyCompliance(servicePlanId, latency) {
    // get service plan
    // compare latency against sp target
    const servicePlan = servicePlanInfo.find(sp => {
        return sp.meta.id === servicePlanId;
    });
    let compliance = 0; // ok
    const averageTarget = servicePlan.slos['Response Time Average'].value;
    const maximumTarget = servicePlan.slos['Response Time Maximum'].value;
    const target = parseInt(averageTarget.substr(0, averageTarget.indexOf('ms')), 10);
    let maximum = 0;
    let maxTarget = 0;
    if (maximumTarget.indexOf('ms') === -1) {
        // must be seconds
        maxTarget = parseInt(maximumTarget.substr(0, maximumTarget.indexOf('s')), 10) * 1000 * 1000;
    } else {
        maxTarget = parseInt(maximumTarget.substr(0, maximumTarget.indexOf('ms')), 10) * 1000;
    }
    if (latency * 1000 > maxTarget) {
        maximum = 1;
    } else {
        maximum = 0;
    }
    if (latency * 1000 > target * 1000) {
        compliance = 1; // not ok
    }
    return { compliance, target, maximum };
}

/**
 * Generate metrics for workloads.
 * @param {} timestamp
 * @param {*} servicePlanId
 * @param {*} metricInfo
 * @param {*} vol
 */
function genWorkloadCompliance(timestamp, servicePlanId, metricInfo, vol) {
    let bytesRead = 0,
        bytesWritten = 0,
        numberReads = 0,
        numberWrites = 0,
        violationWorkloadRate = 0,
        violationWorkloadMixRead = 0,
        violationWorkloadMixWrite = 0,
        violationWorkloadAvgSizeMin = 0,
        violationWorkloadAvgSizeMax = 0;

    if (!metricInfo.workloads) {
        return {
            bytesRead,
            bytesWritten,
            numberReads,
            numberWrites,
            violationWorkloadRate,
            violationWorkloadMixRead,
            violationWorkloadMixWrite,
            violationWorkloadAvgSizeMin,
            violationWorkloadAvgSizeMax,
        };
    }

    const workload = metricInfo.workloads[vol.workloadIndex];
    const servicePlan = servicePlanInfo.find(sp => {
        return sp.meta.id === servicePlanId;
    });

    const iops = servicePlan.provisioningUnit.iOPS;
    const throughput = servicePlan.provisioningUnit.throughput;
    let capacity = 0;
    let totalCapacityBytes = 0;
    let totalBytes = 0;
    capacity = metricInfo.capacities[vol.capacityIndex].capacity;
    const costBytes = metricInfo.capacities[vol.capacityIndex].spaAllocatedBytes || 0;

    if (iops) {
        totalCapacityBytes = workload.ioSize * iops * capacity;
        totalBytes = totalCapacityBytes * (getRandomIntInclusive(workload.iops.min, workload.iops.max) / 100);
    } else if (throughput) {
        totalCapacityBytes = throughput * capacity;
        totalBytes = totalCapacityBytes * (getRandomIntInclusive(workload.iops.min, workload.iops.max) / 100);
    }

    const variance = getRandomIntInclusive(0, 10);
    const readMix = workload.ioMix.read - variance;
    const writeMix = 100 - readMix;
    bytesRead = Math.round(totalBytes * (readMix / 100));
    bytesWritten = Math.round(totalBytes * (writeMix / 100));
    numberReads = Math.round(bytesRead / workload.ioSize);
    numberWrites = Math.round(bytesWritten / workload.ioSize);
    const iopsPerSecond = iops * (capacity + costBytes);

    // console.log(`totalCapacityBytes ${totalCapacityBytes} totalBytes ${totalBytes} readMix ${readMix} writeMix ${writeMix} numberReads ${numberReads} numberWrites ${numberWrites} `);

    const timeString = moment(timestamp)
        .utc()
        .toISOString();

    /**
     * The workload is violated if the ioSize (specified in bytes in test matrix) is
     * greater than the allowedWorkload
     */
    if (iops) {
        const measuredIopsPerSecond = numberReads + numberWrites;
        violationWorkloadRate = measuredIopsPerSecond > iopsPerSecond ? 1 : 0;
        if (violationWorkloadRate && debugViolations) {
            debugViolationLog(`${timeString} ${vol.name} violation workloadrate iOPS' ${measuredIopsPerSecond} > ${iopsPerSecond}`);
        }
    } else if (throughput) {
        const rateMB = totalBytes / 1000 / 1000;
        const targetRateMB = (throughput * capacity) / 1000 / 1000;
        violationWorkloadRate = rateMB > targetRateMB ? 1 : 0;
        if (violationWorkloadRate && debugViolations) {
            debugViolationLog(`${timeString} ${vol.name} violation workloadrate throughput ${rateMB} > ${targetRateMB}`);
        }
    }

    const minSize = servicePlan['ioProfile'].ioPattern.minSizeBytesAvg;
    const maxSize = servicePlan['ioProfile'].ioPattern.maxSizeBytesAvg;
    if (minSize !== 0) {
        if (workload.ioSize < minSize) {
            violationWorkloadAvgSizeMin = 1;
            debugViolationLog(`${timeString} ${vol.name} violation wloadavgsizemin ${workload.ioSize} < ${minSize}`);
        }
    }
    if (maxSize !== 0) {
        if (workload.ioSize > maxSize) {
            violationWorkloadAvgSizeMax = 1;
            debugViolationLog(`${timeString} ${vol.name} violation violationWorkloadAvgSizeMax ${workload.ioSize} > ${maxSize}`);
        }
    }

    const minReadPercent = servicePlan.ioProfile.readWriteMix.minReadPercent;
    const maxReadPercent = servicePlan.ioProfile.readWriteMix.maxReadPercent;
    const maxWritePercent = 100 - servicePlan.ioProfile.readWriteMix.minReadPercent;

    if (minReadPercent > 0 && readMix < minReadPercent) {
        violationWorkloadMixRead = 1;
        debugViolationLog(`${timeString} ${vol.name} violation violationWorkloadMixRead ${readMix} < ${minReadPercent}`);
    }

    if (maxWritePercent !== 0 && writeMix < 100 - maxReadPercent) {
        violationWorkloadMixWrite = 1;
        debugViolationLog(`${timeString} ${vol.name} violation violationWorkloadMixWrite ${writeMix} < ${100 - maxReadPercent}`);
    }

    return {
        bytesRead,
        bytesWritten,
        numberReads,
        numberWrites,
        violationWorkloadRate,
        violationWorkloadMixRead,
        violationWorkloadMixWrite,
        violationWorkloadAvgSizeMin,
        violationWorkloadAvgSizeMax,
    };
}

/**
 * Based on the current indexes for different volume metrics configured
 * above, insert the appropriate entries in the database.
 *
 * Raw metrics and compliance entries are inserted.
 */
function insertMetrics(stmt, timestamp, vol, metricInfo, cb) {
    const latencyIndex = vol.latencyIndex;
    const servicePlanIndex = vol.servicePlanIndex;
    const min = metricInfo.latencies[latencyIndex].latencyAverage.min;
    const max = metricInfo.latencies[latencyIndex].latencyAverage.max;
    const latency = getRandomIntInclusive(min, max);
    const servicePlanId = metricInfo.servicePlans[servicePlanIndex].id;

    /**
     * Look up service plan and compute compliance #.
     */
    const latencyMetrics = genLatencyCompliance(servicePlanId, latency);
    const workloadMetrics = genWorkloadCompliance(timestamp, servicePlanId, metricInfo, vol);
    const sql =
        'select VolumeMetricsInsert1($1::timestamptz, \
            $2::uuid, \
            $3::bigint, \
            $4::bigint, \
            $5::integer, \
            $6::integer, \
            $7::integer, \
            $8::integer, \
            $9::smallint, \
            $10::integer, \
            $11::integer, \
            $12::bigint, \
            $13::bigint, \
            $14::bigint, \
            $15::bigint, \
            $16::bigint \
            );';
    const values = [
        moment(timestamp) // timestamp
            .utc()
            .toISOString(),
        vol.meta.id, // UUID
        workloadMetrics.bytesRead * METRIC_SAMPLE_PERIOD_SECONDS, // pBytesRead
        workloadMetrics.bytesWritten * METRIC_SAMPLE_PERIOD_SECONDS, // pBytesWritten
        workloadMetrics.numberReads * METRIC_SAMPLE_PERIOD_SECONDS, // pNumberReads
        workloadMetrics.numberWrites * METRIC_SAMPLE_PERIOD_SECONDS, // pNumberWrites
        latency * 1000 * METRIC_SAMPLE_PERIOD_SECONDS, // pLatencyMean
        0, // pViolationLatencyMax (not calculated yet)
        METRIC_SAMPLE_PERIOD_SECONDS, // pSampleDuration
        latencyMetrics.compliance * METRIC_SAMPLE_PERIOD_SECONDS, // pViolationLatencyMean
        latencyMetrics.maximum * METRIC_SAMPLE_PERIOD_SECONDS, // pViolationLatencyMax
        workloadMetrics.violationWorkloadRate * METRIC_SAMPLE_PERIOD_SECONDS, // pViolationWorkloadRate
        workloadMetrics.violationWorkloadMixRead * METRIC_SAMPLE_PERIOD_SECONDS, // pViolationWorkloadMixRead
        workloadMetrics.violationWorkloadMixWrite * METRIC_SAMPLE_PERIOD_SECONDS, // pViolationWorkloadMixWrite
        workloadMetrics.violationWorkloadAvgSizeMin * METRIC_SAMPLE_PERIOD_SECONDS, // pViolationWorkloadAvgSizeMin
        workloadMetrics.violationWorkloadAvgSizeMax * METRIC_SAMPLE_PERIOD_SECONDS, // pViolationWorkloadAvgSizeMax
    ];

    psqlPool.connect((err, client, done) => {
        if (err) {
            return cb(err);
        }

        const { storageParcels } = vol;
        if (storageParcels) {
            Object.keys(storageParcels).forEach(key => {
                const storageMetricsSql =
                    'select StorageMetricsInsert1($1::timestamptz, \
                        $2::uuid, \
                        $3::bigint, \
                        $4::bigint, \
                        $5::integer, \
                        $6::integer, \
                        $7::integer, \
                        $8::integer, \
                        $9::smallint, \
                        $10::integer, \
                        $11::integer, \
                        $12::bigint \
                        );';
                const storageMetricsValues = [...values.slice(0, 1), key, ...values.slice(2, 12)];
                client.query(storageMetricsSql, storageMetricsValues, err => {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        }

        client.query(sql, values, (err, res) => {
            done(); // release the client
            if (err) {
                return cb(err);
            } else {
                cb(null, res.rows[0]);
            }
        });
    });
}

/**
 * Acquire service plan information and cache for use.
 */
function getServicePlanInfo() {
    console.log('Fetching service plan ', apiServicePlans);
    return instance.get(apiServicePlans).then(response => {
        const servicePlans = response.data;
        if (servicePlans.length < 1) {
            return;
        }

        servicePlans.forEach(plan => {
            console.log('Plan found ', plan.name, plan.meta.id);
            servicePlanInfo.push(plan);
        });

        return servicePlanInfo;
    });
}

/**
 * Call the REST API to get AGs.
 */
function getApplicationGroupInfo() {
    console.log('Fetching application groups from ', apiApplicationGroups);
    return instance.get(apiApplicationGroups).then(response => {
        const applicationGroups = response.data;
        if (applicationGroups.length < 1) {
            return;
        }

        applicationGroups.forEach(group => {
            applicationGroupInfo.push(group);
            console.log('Application Group info found:', group.name, group.meta.id);
        });

        return applicationGroupInfo;
    });
}

/**
 * Call the REST API to get CGs.
 */
function getConsistencyGroupInfo() {
    console.log('Fetching consistency groups from ', apiConsistencyGroups);
    return instance.get(apiConsistencyGroups).then(response => {
        const consistencyGroups = response.data;
        if (consistencyGroups.length < 1) {
            return;
        }

        consistencyGroups.forEach(group => {
            consistencyGroupInfo.push(group);
            console.log('Consistency Group info found:', group.name, group.meta.id);
        });

        return consistencyGroupInfo;
    });
}

/**
 * Call the REST API to get volumes.
 */
function getVolumeInfo() {
    console.log('Fetching current volumes from ', apiVolumeSeries);
    return instance.get(apiVolumeSeries).then(response => {
        const volumeSeries = response.data;
        if (volumeSeries.length < 1) {
            return;
        }

        volumeSeries.forEach(vol => {
            const cg = consistencyGroupInfo.find(cg => {
                return cg.meta.id === vol.consistencyGroupId;
            });
            vol.applicationGroupIds = cg.applicationGroupIds;
            volInfo.push(vol);
            console.log('Volume info found:', vol.name, vol.meta.id);
        });

        return volumeSeries;
    });
}

/**
 * Call the REST API to get storage provisioners.
 */
function getPoolInfo() {
    console.log('Fetching current pools from ', apiStorageProvisioners);
    return instance.get(apiStorageProvisioners).then(response => {
        const provisioners = response.data;
        if (provisioners.length < 1) {
            return;
        }

        provisioners.forEach(provisioner => {
            poolInfo.push(provisioner);
            console.log('Provisioner info found:', provisioner.name, provisioner.meta.id);
        });

        poolInfo.forEach(pool => {
            pool.capacityIndex = 0;
        });

        return provisioners;
    });
}

/**
 * Call the REST API to get storage.
 */
function getStorageInfo() {
    console.log('Fetching current storage from ', apiStorage);
    return instance.get(apiStorage).then(response => {
        const storage = response.data;
        if (storage.length < 1) {
            return;
        }

        storage.forEach(s => {
            storageInfo.push(s);
            console.log('Storage info found:', s.storageIdentifier, s.meta.id);
        });

        return storage;
    });
}

/**
 * Call the REST API to get clusters.
 */
function getClusterInfo() {
    console.log('Fetching current clusters from ', apiClusters);
    return instance.get(apiClusters).then(response => {
        const clusters = response.data;
        if (clusters.length < 1) {
            return;
        }

        clusters.forEach(cluster => {
            clusterInfo.push(cluster);
            console.log('Cluster info found:', cluster.name, cluster.meta.id);
        });

        return clusters;
    });
}

/**
 * Call the REST API to get nodes.
 */
function getNodeInfo() {
    console.log('Fetching current nodes from ', apiNodes);
    return instance.get(apiNodes).then(response => {
        const nodes = response.data;
        if (nodes.length < 1) {
            return;
        }

        nodes.forEach(node => {
            nodeInfo.push(node);
            console.log('Node info found:', node.name, node.meta.id);
        });

        return nodes;
    });
}

const SP_GEN_APP = 'General';
const SP_OLTP = 'OLTP Data';
const SP_DB_LOG = 'DB Log';
const SP_DSS_DATA = 'DSS Data';
const SP_TECH_APP = 'Technical Applications';
const SP_BACKUP = 'Backup';
const SP_ONLINE_ARCHIVE = 'Online Archive';

// Day to start inserting data
const START_SALESOPS = 26;
const START_ENGMFG_OPS = 28;

function normalLatencyForPlan(servicePlan) {
    let maxLatency = 0;

    switch (servicePlan) {
        case SP_OLTP:
        case SP_DB_LOG:
            maxLatency = 3;
            break;
        case SP_GEN_APP:
        case SP_DSS_DATA:
            maxLatency = 8;
            break;
        case SP_BACKUP:
            maxLatency = 50;
            break;
        case SP_ONLINE_ARCHIVE:
            maxLatency = 100;
            break;
        default:
            maxLatency = 0;
    }

    return maxLatency;
}

function abnormalLatencyForPlan(servicePlan) {
    let maxLatency = 0;

    switch (servicePlan) {
        /* 5 is the avg target for both */
        case SP_OLTP:
        case SP_DB_LOG:
            maxLatency = 7;
            break;
        /* 10 is the target */
        case SP_GEN_APP:
            maxLatency = 13;
            break;
        /* 8 is the target */
        case SP_DSS_DATA:
            maxLatency = 11;
            break;
        default:
            maxLatency = 0;
    }

    return maxLatency;
}

/**
 * Add a volume that ranges in the normal band for latency.  Variances should
 * be added separately.
 *
 * The specified servicePlan will drive the maxLatency target.
 * @param  {} startDay First day to insert data for
 * @param  {} account Account for volume
 * @param  {} appName AG name
 * @param  {} cgName CG name
 * @param  {} volname Volume name
 * @param  {} servicePlan Service plan
 * @param  {} usedCapacity How much capacity is used (at tned)
 * @param  {} maxCapacity Max capacity at this point
 * @param  {} warningInjection Hour to insert exception (must be >=1 and <=5)
 */
function addStandardVolume(startDay,
    account,
    appName,
    cgName,
    volname,
    servicePlan,
    usedCapacity,
    maxCapacity,
    warningInjection) {
    const latencies = [
        {
            transitionTime: {
                day: startDay,
                hour: 0,
            },
            latencyAverage: {
                min: 1,
                max: normalLatencyForPlan(servicePlan),
            },
        },
    ];

    if (warningInjection) {
        if (warningInjection >= 1 && warningInjection <= 5) {
            console.log('invalid warning injection');
            return;
        }
        latencies.push({
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 17 + warningInjection,
                    minute: 40,
                },
                latencyAverage: {
                    min: abnormalLatencyForPlan(servicePlan) - 1,
                    max: abnormalLatencyForPlan(servicePlan) + 1,
                },
            },
            {
                transitionTime: {
                    day: numSampleDays - 1,
                    hour: 18 + warningInjection,
                    minute: 0,
                },
                latencyAverage: {
                    min: 1,
                    max: normalLatencyForPlan(servicePlan),
                },
            });
    }

    volumeMetricInfo.push({
        volname: volname,
        account: account,
        appGroup: appName,
        consistencyGroup: cgName,
        latencies: latencies,
        capacities: [
            {
                transitionTime: {
                    day: startDay,
                    hour: 0,
                },
                used: usedCapacity,
                capacity: maxCapacity,
            },
        ],
        servicePlans: [
            {
                transitionTime: {
                    day: startDay,
                    hour: 0,
                },
                name: servicePlan,
                id: null,
            },
        ],
    });
}

/**
 * Add 'generic' volume data
 */
function addMarketingData() {
    const account = 'Marketing';

    let prefix = '';
    let appName = '';
    let cgName = '';
    let volname = '';

    prefix = 'App-Marketing';
    appName = prefix;
    cgName = prefix;
    for (let i = 0; i < 5; i++) {
        volname = prefix + '-0' + i;
        if (i === 3) {
            addStandardVolume(0, account, appName, cgName, volname, SP_GEN_APP, 1, 5, i);
        } else {
            addStandardVolume(0, account, appName, cgName, volname, SP_GEN_APP, 1, 5);
        }
    }
}

function addSalesOpData() {
    const account = 'SalesOps';

    let prefix = '';
    let appName = '';
    let cgName = '';
    let volname = '';

    // marketing db
    prefix = 'Sales-Mktg-DB';
    appName = prefix;
    cgName = prefix;
    for (let i = 0; i < 3; i++) {
        volname = prefix + '-0' + i;
        if (i === 0) {
            addStandardVolume(START_SALESOPS, account, appName, cgName, volname, SP_OLTP, 1, 5, 3);
        } else {
            addStandardVolume(START_SALESOPS, account, appName, cgName, volname, SP_OLTP, 1, 5);
        }
    }
    volname = prefix + '-Log-1';
    addStandardVolume(START_SALESOPS, account, appName, cgName, volname, SP_DB_LOG, 0, 2);

    // sales db
    prefix = 'Sales-DB';
    appName = prefix;
    cgName = prefix;
    for (let i = 0; i < 3; i++) {
        volname = prefix + '-0' + i;
        addStandardVolume(START_SALESOPS, account, appName, cgName, volname, SP_OLTP, 1, 5);
    }

    volname = prefix + '-Log-1';
    addStandardVolume(START_SALESOPS, account, appName, cgName, volname, SP_DB_LOG, 0, 2);

    // company website
    prefix = 'Website';
    appName = prefix;
    cgName = prefix;
    addStandardVolume(START_SALESOPS, account, appName, cgName, prefix, SP_GEN_APP, 0, 2);

    cgName = prefix + '-DB';
    volname = cgName + '-01';
    addStandardVolume(START_SALESOPS, account, appName, cgName, volname, SP_OLTP, 0, 2);
    volname = prefix + '-Log-1';
    addStandardVolume(START_SALESOPS, account, appName, cgName, volname, SP_DB_LOG, 0, 2);
}

function addEngOpsData() {
    const account = 'EngMfgOps';

    let prefix = '';
    let appName = '';
    let cgName = '';
    let volname = '';

    // marketing db
    prefix = 'BD-Mfg-Data';
    appName = prefix;
    cgName = prefix;
    for (let i = 0; i < 4; i++) {
        volname = prefix + '-0' + i;
        addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_DSS_DATA, 1, 5);
    }

    prefix = 'BD-Mfg-OEM';
    appName = prefix;
    cgName = prefix;
    for (let i = 0; i < 2; i++) {
        volname = prefix + '-0' + i;
        addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_DSS_DATA, 1, 5);
    }

    prefix = 'BD-Mfg-RMA';
    appName = prefix;
    cgName = prefix;
    for (let i = 0; i < 1; i++) {
        volname = prefix + '-0' + i;
        addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_DSS_DATA, 1, 5);
    }

    prefix = 'BD-Eng';
    appName = prefix;
    cgName = prefix;
    for (let i = 0; i < 5; i++) {
        volname = prefix + '-0' + i;
        addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_DSS_DATA, 1, 5);
    }

    // sales db
    prefix = 'DB-Mfg-Parts';
    appName = prefix;
    cgName = prefix;
    volname = prefix + '-0';
    addStandardVolume(START_SALESOPS, account, appName, cgName, volname, SP_OLTP, 1, 5);

    volname = prefix + '-Log-1';
    addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_DB_LOG, 0, 2);

    prefix = 'DB-Mfg-Inventory';
    appName = prefix;
    cgName = prefix;
    volname = prefix + '-0';
    addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_OLTP, 1, 5);

    volname = prefix + '-Log-1';
    addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_DB_LOG, 0, 2);

    prefix = 'DB-Eng-QA';
    appName = prefix;
    cgName = prefix;
    volname = prefix + '-0';
    addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_OLTP, 1, 5);

    volname = prefix + '-Log-1';
    addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_DB_LOG, 0, 2);

    prefix = 'Eng-CAD-Research';
    appName = prefix;
    cgName = prefix;
    volname = prefix + '-0';
    addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_TECH_APP, 1, 5);

    prefix = 'Eng-CAD-Development';
    appName = prefix;
    cgName = prefix;
    volname = prefix + '-0';
    addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_TECH_APP, 1, 5);

    prefix = 'App-Eng';
    appName = prefix;
    cgName = prefix;
    for (let i = 0; i < 25; i++) {
        volname = prefix + '-0' + i;
        addStandardVolume(START_ENGMFG_OPS, account, appName, cgName, volname, SP_GEN_APP, 1, 5);
    }
}

/**
 * Volume mount to test storage metrics
 */
exports.volMount = () => {
    /**
     * Get volume information and dependencies.
     */
    return getVolumeInfo().then(() => {
        return getClusterInfo().then(() => {
            return getNodeInfo().then(() => {
                const vol = volInfo.find(vol => vol.name === 'Eng-App1');
                if (vol) {
                    const { meta: volumeSeriesMeta, name, volumeSeriesState } = vol;
                    const { id: volumeSeriesId } = volumeSeriesMeta || {};
                    const { meta: clusterMeta } = clusterInfo[0] || {};
                    const { id: clusterId } = clusterMeta || {};
                    const { meta: nodeMeta } = nodeInfo.find(node => (node.clusterId = clusterId)) || {};
                    const { id: nodeId } = nodeMeta || {};
                    const completeByTime = moment()
                        .utc()
                        .add(METRIC_SAMPLE_PERIOD_MINUTES, 'minutes')
                        .format();
                    if (clusterId && nodeId && volumeSeriesState === 'UNBOUND') {
                        const body = {
                            clusterId,
                            completeByTime,
                            nodeId,
                            requestedOperations: ['BIND', 'MOUNT'],
                            volumeSeriesId,
                        };
                        instance
                            .post(apiVolumeSeriesRequests, body)
                            .then(() => {
                                console.log(`requesting BIND & MOUNT on volume: ${name}`);
                            })
                            .catch(e => {
                                console.log(`Exception caught in POST request to BIND & MOUNT ${name}`);
                                console.log(e);
                            });
                    }
                }
            });
        });
    });
};

/**
 * Initialize and open the database.
 */
exports.initDB = () => {
    console.log('Initialize metrics database: ');

    psqlPool = new Pool({
        user: 'postgres',
        host: process.env.METRICSDB_HOST || 'localhost',
        database: 'nuvo_metrics',
        port: '5432',
        max: 100,
        ...(process.env.METRICSDB_USE_SSL && {
            ssl: {
                ca: fs.readFileSync('ssl/ca.crt'),
                key: fs.readFileSync('ssl/client.key'),
                cert: fs.readFileSync('ssl/client.crt'),
                rejectUnauthorized: false,
            },
        }),
    });

    if (!psqlPool) {
        console.log('cannot connect to database');
        return;
    }

    psqlPool.on('error', err => {
        console.log('==> psql error:', err);
    });

    if (!smallLoad) {
        addMarketingData();
        addSalesOpData();
        addEngOpsData();
    }

    return getServicePlanInfo().then(() => {
        /**
         * Map volume ids into the metric info
         */
        volumeMetricInfo.forEach(metricInfo => {
            metricInfo.servicePlans.forEach(metricPlan => {
                // find sp Id
                const plan = servicePlanInfo.find(sp => {
                    return metricPlan.name === sp.name;
                });
                metricPlan.id = plan.meta.id;
            });
        });

        /**
         * Get all required configuration database information:
         * AGs, CGs, volumes, storage resources, and pools
         */
        return getApplicationGroupInfo().then(() => {
            return getConsistencyGroupInfo().then(() => {
                return getVolumeInfo().then(() => {
                    return getStorageInfo().then(() => {
                        return getPoolInfo();
                    });
                });
            });
        });
    });
};

exports.createMetadata = cb => {
    const hourEarlier = getStartTime()
        .clone()
        .subtract(1, 'hour');
    async.series([
            callback => {
                async.eachSeries(volInfo,
                    (volume, next) => {
                        const { storageParcels } = volume;
                        if (storageParcels) {
                            Object.keys(storageParcels).forEach(key => {
                                const storage = storageInfo.find(s => s.meta.id === key);
                                if (storage) {
                                    const { cspDomainId, cspStorageType, storageProvisionerId, storageState } = storage;
                                    const { attachedClusterId } = storageState || {};
                                    const sql =
                                        'select StorageMetadataInsert1($1::timestamptz, $2::uuid, $3::varchar, $4::uuid, $5::uuid, $6::uuid, $7::bigint, $8::bigint)';
                                    const values = [
                                        hourEarlier.toISOString(),
                                        key,
                                        cspStorageType,
                                        cspDomainId || '00000000-0000-0000-0000-000000000000',
                                        storageProvisionerId || '00000000-0000-0000-0000-000000000000',
                                        attachedClusterId || '00000000-0000-0000-0000-000000000000',
                                        0,
                                        0,
                                    ];
                                    psqlPool.query(sql, values, err => {
                                        console.log(err);
                                    });
                                }
                            });
                        }
                        // insert the sp
                        // pT timestamptz,
                        // pVolumeID uuid,
                        // pAccountID uuid,
                        // pServicePlanID uuid,
                        // pClusterID uuid,
                        // pConsistencyGroupID uuid,
                        // pApplicationGroupID uuid[],
                        // pTotalBytes bigint,
                        // pCostBytes bigint,
                        // pBytesAllocated bigint
                        // pRequestedCacheSizeBytes bigint,
                        // pAllocatedCacheSizeBytes bigint,
                        let sql = `SELECT VolumeMetadataInsert1($1::timestamptz,
                                $2::uuid,
                                $3::uuid,
                                $4::uuid,
                                $5::uuid,
                                $6::uuid,
                                $7,
                                $8::bigint,
                                $9::bigint,
                                $10::bigint,
                                $11::bigint,
                                $12::bigint)`;
                        // XXX TBD can we use different values for initial sizes
                        const values = [
                            hourEarlier.toISOString(),
                            volume.meta.id,
                            volume.accountId,
                            volume.servicePlanId,
                            volume.boundClusterId ? volume.boundClusterId : '00000000-0000-0000-0000-000000000000',
                            volume.consistencyGroupId,
                            volume.applicationGroupIds,
                            0,
                            0,
                            0,
                            0,
                            0,
                        ];
                        psqlPool.query(sql, values, err => {
                            if (err) {
                                console.log(err);
                                return callback(err, null);
                            }
                            next();
                        });
                    },
                    (err, results) => {
                        callback(err, results);
                    });
            },
        ],
        err => {
            if (err) {
                console.log(err);
                return cb(err);
            }
            cb();
        });
};

/**
 * Load all metrics for the database.
 */
exports.loadMetricData = cb => {
    console.log('Loading metric data for ', volInfo.length, 'volumes');
    async.series([
            callback => {
                if (numSkipSamples === 0) {
                    loadVolumeCapacityInfo(callback);
                } else {
                    callback();
                }
            },
            callback => {
                loadVolumeLatencyInfo(callback);
            },
        ],
        err => {
            if (err) {
                console.log(err);
                return cb(err);
            }
            console.log('Done loading latency info');
            cb();
        });
};

/**
 * Close the database handle.
 */
exports.closeDB = cb => {
    if (psqlPool) {
        psqlPool.end();
    }
    cb();
};

/**
 * Random number generator.
 * @param {int} min
 * @param {int} max
 */
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

/**
 * Load all volume capacity metric info for the time range.
 */
function loadVolumeCapacityInfo(cb) {
    const startTime = getStartTime();
    var stmt;

    // extend object to carry its metric change indexes
    volInfo.forEach(vol => {
        vol.capacityIndex = 0;
        vol.servicePlanIndex = 0;
        vol.used = 0;
    });

    /**
     * Need to insert every hour, so adjust the number of samples.
     */

    const multiplier = 60;
    const capacitySamples = numSampleDays * 24;

    console.log('Inserting capacity metrics: ', capacitySamples);

    /**
     * TBD: should change from timesLimit to whilst
     */
    async.timesLimit(capacitySamples,
        1,
        (n, next) => {
            const timestamp = startTime + n * multiplier * 60 * 1000;
            async.series([
                    callback => {
                        async.eachLimit(volInfo,
                            100,
                            (vol, nextVol) => {
                                async.eachLimit(volumeMetricInfo,
                                    50,
                                    (metricInfo, nextMetric) => {
                                        if (metricInfo.volname === vol.name) {
                                            insertCapacitySample(timestamp,
                                                stmt,
                                                n * multiplier,
                                                metricInfo,
                                                vol,
                                                () => {
                                                    nextMetric();
                                                });
                                        } else {
                                            nextMetric();
                                        }
                                    },
                                    err => {
                                        if (err) {
                                            console.log(err);
                                            return callback(err, null);
                                        }
                                        nextVol();
                                    });
                            },
                            err => {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else {
                                    callback(null);
                                }
                            });
                    },
                    callback => {
                        const poolUsage = { GP2: 0, ST1: 0, IO1: 0 };

                        volInfo.forEach(vol => {
                            const servicePlanName = getServicePlanName(vol.servicePlanId);
                            switch (servicePlanName) {
                                case 'OLTP Data': // GP2 100
                                    poolUsage['GP2'] += vol.used;
                                    break;
                                case 'DSS Data': // GP2 50, ST1 50
                                    poolUsage['GP2'] += vol.used / 2;
                                    poolUsage['ST1'] += vol.used / 2;
                                    break;
                                case 'Technical Applications': // GP2 50, ST1 50
                                    poolUsage['GP2'] += vol.used / 2;
                                    poolUsage['ST1'] += vol.used / 2;
                                    break;
                                case 'General': // IO1 100
                                    poolUsage['IO1'] += vol.used;
                                    break;
                                default:
                                // do nothing;
                            }
                        });

                        insertPoolSample(timestamp, n * multiplier, poolUsage, () => {
                            callback();
                        });
                    },
                ],
                err => {
                    if (err) {
                        console.log(err);
                        return cb(err, null);
                    }
                    next();
                });
        },
        err => {
            if (err) {
                console.log(err);
                return cb(err, null);
            }
            /**
             * No error and simply return an empty array.
             */
            cb(null, []);
        });
}

/**
 * For the given minute, determine if we need to transition to the next
 * entry in the metric table or continue with current values.
 *
 * @param {string} timestamp
 * @param {object} stmt
 * @param {string} minute
 * @param {object} metricInfo
 * @param {object} vol
 */
function insertCapacitySample(timestamp, stmt, minute, metricInfo, vol, cb) {
    if (
        metricInfo.servicePlans.length > vol.servicePlanIndex + 1 &&
        minute === transitionMinute(metricInfo.servicePlans[vol.servicePlanIndex + 1])
    ) {
        vol.servicePlanIndex = vol.servicePlanIndex + 1;
    }

    if (metricInfo.capacities && metricInfo.capacities.length > 0) {
        /**
         * Generate capacity information based on time.
         * If there is another capacity change, generate metrics based on that next step increment.
         * If there is only capacity, generate slightly randomly increasing values for the size.
         * If we are on the last metric for a range of capacities, generate slightly randomly increasing
         * values for the size.
         */
        let minutesUntilNextChange = 0;
        if (metricInfo.capacities.length > vol.capacityIndex + 1) {
            const nextPeriod = metricInfo.capacities[vol.capacityIndex + 1];
            const curPeriod = metricInfo.capacities[vol.capacityIndex];
            const deltaUsed = nextPeriod.used - curPeriod.used;

            // compute time between now and next change
            minutesUntilNextChange = transitionMinute(nextPeriod) - minute;

            // compute % difference, getting approximation of % left until next shift
            const minutesInPeriod = transitionMinute(nextPeriod) - transitionMinute(curPeriod);
            const approximation = 1 - minutesUntilNextChange / minutesInPeriod;

            vol.used = curPeriod.used * GB + approximation * deltaUsed * GB;

            // transition to next capacity increment
            if (minutesUntilNextChange === 0) {
                vol.capacityIndex = vol.capacityIndex + 1;
            }
        } else if (metricInfo.capacities.length === 1) {
            vol.used = metricInfo.capacities[0].used * GB + minute * 100 + getRandomIntInclusive(1, 10) * 10;
        } else {
            vol.used =
                metricInfo.capacities[metricInfo.capacities.length - 1].used * GB +
                minute * 100 +
                getRandomIntInclusive(1, 10) * 10;
        }
    }
    insertMetricCapacity(stmt, timestamp, vol, metricInfo, vol.servicePlanIndex, cb);
}

/**
 * For the given minute, determine if we need to transition to the next
 * entry in the metric table or continue with current values.
 */
function insertPoolSample(timestamp, minute, poolUsage, cb) {
    // For the timestamp, cycle through the pools to see if there is a transition on capacity

    async.eachSeries(poolInfo,
        (pool, nextPool) => {
            // poolInfo.forEach(pool => {
            // look up metric for the pool

            const metric = poolMetricInfo.find(metric => {
                return metric.name === pool.name;
            });
            if (metric) {
                if (
                    metric.capacities.length > pool.capacityIndex + 1 &&
                    minute === transitionMinute(metric.capacities[pool.capacityIndex + 1])
                ) {
                    pool.capacityIndex = pool.capacityIndex + 1;
                }

                insertPoolCapacity(timestamp,
                    pool.meta.id,
                    pool.cspDomainId,
                    metric.capacities[pool.capacityIndex].capacity,
                    poolUsage[pool.name],
                    metric.capacities[pool.capacityIndex].capacity,
                    err => {
                        if (err) {
                            console.log(err);
                            return cb(err);
                        } else {
                            nextPool();
                        }
                    });
            } else {
                nextPool();
            }
        },
        err => {
            if (err) {
                console.log(err);
                return cb(err);
            }
            cb();
        });
}

/**
 * Based on the data, insert an entry for capacity nto the database.
 */
function insertMetricCapacity(stmt, timestamp, vol, metricInfo, servicePlanIndex, cb) {
    const size = Math.trunc(metricInfo.capacities[vol.capacityIndex].capacity * GB);
    const used = Math.trunc(vol.used); // expect this will come from data plane
    const { spaAllocatedBytes = 0 } = metricInfo.capacities[vol.capacityIndex];
    const costBytes = Math.trunc(spaAllocatedBytes * GB);

    const servicePlanId = metricInfo.servicePlans[servicePlanIndex].id;

    const { cacheAllocations } = vol || {};
    const { allocatedSizeBytes = 0, requestedSizeBytes = 0 } = cacheAllocations || {};

    // pT timestamptz,
    // pVolumeID uuid,
    // pAccountID uuid,
    // pServicePlanID uuid,
    // pClusterID uuid,
    // pConsistencyGroupID uuid,
    // pApplicationGroupID uuid[],
    // pTotalBytes bigint,
    // pCostBytes bigint,
    // pBytesAllocated bigint
    // pRequestedCacheSizeBytes bigint,
    // pAllocatedCacheSizeBytes bigint,
    let sql =
        'select VolumeMetadataInsert1($1::timestamptz, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, $7::uuid[], $8::bigint, $9::bigint, $10::bigint, $11::bigint, $12::bigint) ';
    const values = [
        moment(timestamp)
            .utc()
            .toISOString(),
        vol.meta.id,
        vol.accountId,
        servicePlanId,
        vol.boundClusterId ? vol.boundClusterId : '00000000-0000-0000-0000-000000000000',
        vol.consistencyGroupId,
        vol.applicationGroupIds,
        size,
        costBytes,
        used,
        requestedSizeBytes,
        allocatedSizeBytes,
    ];

    psqlPool.query(sql, values, err => {
        if (err) {
            console.log(err);
            return cb(err);
        }
        cb(null);
    });
}

/**
 * Based on the data, insert an entry for resource pool capacity nto the database.
 */
function insertPoolCapacity(timestamp, poolid, domainid, capacity, used, reserved, cb) {
    const size = capacity * GB;

    const totalbytes = Math.trunc(size);
    const usedCompute = !used ? 0 : used; // safeguard against pool not being set
    const availablebytes = Math.trunc(size - usedCompute);
    const reservablebytes = Math.trunc(reserved * GB);

    const sql = 'select PoolMetricsInsert1($1, $2, $3, $4, $5, $6);';
    const values = [
        moment(timestamp)
            .utc()
            .toISOString(),
        poolid,
        domainid,
        totalbytes,
        availablebytes,
        reservablebytes,
    ];

    psqlPool.query(sql, values, err => {
        if (err) {
            console.log(err);
            return cb(err);
        }
        cb(null);
    });
}

/**
 * Based on the service plan ID, look up its name.
 * @param {string} servicePlanId
 */
function getServicePlanName(servicePlanId) {
    const found = servicePlanInfo.find(sp => {
        return sp.meta.id === servicePlanId;
    });

    return found.name;
}
