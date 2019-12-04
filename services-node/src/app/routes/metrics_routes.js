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
const moment = require('moment');
const constants = require('../../constants');
const config = require('../../config');
const async = require('async');

import _ from 'lodash';

import {
    qComplianceAccounts,
    qComplianceAllVolumes,
    qComplianceApplicationGroups,
    qComplianceClusters,
    qCompliancePools,
    qComplianceVolumeByHour,
    qComplianceVolumeByViolation,
    qComplianceVolumeByViolationByHour,
    qComplianceVolumes,
    qSeverityByPeriod,
    queryAppGroups,
    queryConsistencyGroups,
    queryServicePlanByVol,
    queryTotalComplianceIssuesGroupAG,
    queryTotalComplianceIssuesGroupCG,
    queryVolumeLatencyCountByPeriod,
} from '../sqldb/psqldb';

import { qStorageMetrics, qVolumeMetrics, qCapacityMetrics } from '../sqldb/latency_metrics';

import { getErrorMessage } from '../../utils';

const apiAccounts = `${config.API_URL}/${constants.URI_ACCOUNTS}`;
const apiApplicationGroups = `${config.API_URL}/${constants.URI_APPLICATION_GROUPS}`;
const apiAuditLog = `${config.API_URL}/${constants.URI_AUDIT_LOG}`;
const apiClusters = `${config.API_URL}/${constants.URI_CLUSTERS}`;
const apiConsistencyGroups = `${config.API_URL}/${constants.URI_CONSISTENCY_GROUPS}`;
const apiPools = `${config.API_URL}/${constants.URI_SERVICE_PLAN_ALLOCATIONS}`;
const apiServicePlans = `${config.API_URL}/${constants.URI_SERVICE_PLANS}`;
const apiSnapshots = `${config.API_URL}/${constants.URI_SNAPSHOTS}`;
const apiVolumeSeries = `${config.API_URL}/${constants.URI_VOLUME_SERIES}`;

import { handleError, request } from '../../instance';

import { logMessage } from '../../utils';

const DEBUG_METRICS_ROUTES = false;

function debugAPI(msg, query) {
    if (DEBUG_METRICS_ROUTES) {
        logMessage(msg, query);
    }
}

/**
 * Return specific error if the database is down, otherwise use the standard
 * error handling path.
 * @param {*} res
 * @param {*} error
 */
function handleMetricError(res, error) {
    const { code = '' } = error || {};

    if (code === 'ECONNREFUSED') {
        res.status(500).send({ code, message: `Waiting for metrics database` });
    } else {
        handleError(res, error);
    }
}

module.exports = function(app) {
    /**
     * API to retreive compliance issue counts by period
     * username: username which will get mapped to account(s) to look for volumes
     * startTime: start of time range being evaluated
     * endTime: end of time range being evaluated
     * period: constant which identifies minute/day/month
     */
    app.get('/metrics/volumes/countbyperiod', (req, res) => {
        const { username, startTime, endTime, period } = req.query || {};

        debugAPI('countbyperiod volumes', req.query);

        let configData = {
            volIds: null,
        };
        async.series([
                callback => {
                    getAllAccountIds(req, res, username).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.accountIds = result.data;
                        callback(null);
                    });
                },
                callback => {
                    getAllVolumes(req, res, username).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                callback => {
                    getAllServicePlans(req, res).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.servicePlans = result.data;
                        callback(null);
                    });
                },
                callback => {
                    queryAllPeriodsByDay(configData, startTime, endTime, period, callback);
                },
            ],
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results[3]);
                return;
            });
    });

    /**
     * Get totals by volume in time range.  Will return an array of objects
     * with
     *  volumeId
     *  total
     */
    app.get('/metrics/volumes/totalinrange', (req, res) => {
        const { username, startTime, endTime, appGroup, consistencyGroup } = req.query || {};

        let configData = {
            volumes: null,
        };
        debugAPI('countbyperiod totalinrange', req.query);
        async.series([
                callback => {
                    getAllAccountIds(req, res, username).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.accountIds = result.data;
                        callback(null);
                    });
                },
                callback => {
                    getAllVolumes(req, res, username, appGroup, consistencyGroup).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                callback => {
                    getAllServicePlans(req, res).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.servicePlans = result.data;
                        callback(null);
                    });
                },
                callback => {
                    queryVolumeComplianceTotalsByPeriod(configData, startTime, endTime, callback);
                },
            ],
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results[3]);
                return;
            });
    });

    /**
     * Query for compliance totals by application group in the given period.
     */
    app.get('/metrics/volumes/totalinrangebyag', (req, res) => {
        const { username, startTime, endTime } = req.query || {};
        const totals = [];
        const configData = {
            appGroups: [],
            appGroupsConfig: [],
        };

        debugAPI('/metrics/volumes/totalinrangebyag', req.query);

        async.series([
                // get all the AGs
                callback => {
                    getAllAppGroups(startTime, endTime, (err, result) => {
                        configData.appGroups = result;
                        callback(null);
                    });
                },
                callback => {
                    getApplicationGroupsConfig(req, res, username).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.appGroupsConfig = result.data;
                        callback(null);
                    });
                },
                callback => {
                    if (configData.appGroupsConfig) {
                        configData.appGroupsConfig.forEach(appGroup => {
                            totals.push({
                                applicationgroupid: appGroup.id,
                                count: 0,
                                name: appGroup.name,
                            });
                        });
                    }

                    /**
                     * We do not save all information for application groups in
                     * metrics database.  Map names from config info.
                     */
                    totals.forEach(total => {
                        const info = configData.appGroupsConfig.find(info => {
                            return info.id === total.applicationgroupid;
                        });
                        total.name = info.name;
                    });

                    queryTotalComplianceIssuesGroupAG(startTime, endTime, (err, results) => {
                        if (err) {
                            logMessage(err);
                            return callback(err);
                        } else {
                            results.rows.forEach(result => {
                                if (result.applicationgroupid) {
                                    addCountForAG(result, totals);
                                }
                            });
                            callback(null, totals);
                        }
                    });
                },
            ],
            err => {
                if (err) {
                    logMessage(err);
                    handleMetricError(res, err);
                    return;
                }
                // sort the data
                const sorted = sortTotalData(totals);
                res.send(sorted);
                return;
            });
    });

    /**
     * Find totals in range by consistency group
     */
    app.get('/metrics/volumes/totalinrangebycg', (req, res) => {
        const { username, startTime, endTime } = req.query || {};
        const totals = [];
        const configData = {
            consistencyGroups: [],
            consistencyGroupsConfig: [],
        };

        debugAPI('/metrics/volumes/totalinrangebycg', req.query);

        async.series([
                callback => {
                    getAllConsistencyGroups(startTime, endTime, (err, result) => {
                        if (err) {
                            return callback(err);
                        }
                        configData.consistencyGroups = result;
                        callback(null);
                    });
                },
                callback => {
                    getConsistencyGroupsConfig(req, res, username).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.consistencyGroupsConfig = result.data;
                        callback(null);
                    });
                },

                callback => {
                    if (configData && configData.consistencyGroupsConfig) {
                        configData.consistencyGroupsConfig.forEach(consistencyGroup => {
                            totals.push({
                                consistencygroupid: consistencyGroup.consistencygroupid,
                                count: 0,
                                name: consistencyGroup.name,
                            });
                        });
                    }

                    /**
                     * We do not save all information for consistency groups in
                     * metrics database.  Map names from config info.
                     */
                    totals.forEach(total => {
                        const info = configData.consistencyGroupsConfig.find(info => {
                            return info.consistencygroupid === total.consistencygroupid;
                        });
                        total.name = info.name;
                    });

                    queryTotalComplianceIssuesGroupCG(startTime, endTime, (err, results) => {
                        if (err) {
                            logMessage(err);
                            return callback(err);
                        } else {
                            results.rows.forEach(result => {
                                if (result.consistencygroupid) {
                                    addCountForCG(result, totals);
                                }
                            });
                            callback(null, totals);
                        }
                    });
                },
            ],
            err => {
                if (err) {
                    logMessage(err);
                    handleMetricError(res, err);
                    return;
                }
                // sort the data
                const sorted = sortTotalData(totals);
                res.send(sorted);
                return;
            });
    });

    app.get('/metrics/serviceplans/severitybyperiod', (req, res) => {
        const { username, startTime, endTime } = req.query || {};
        const totals = [];
        const configData = {
            accountIds: [],
            servicePlans: [],
        };
        debugAPI('serviceplans/severityinrange', req.query);

        async.series([
                callback => {
                    getAllAccountIds(req, res, username).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.accountIds = result.data;
                        callback(null);
                    });
                },

                callback => {
                    getAllServicePlans(req, res).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.servicePlans = result.data;
                        callback(null);
                    });
                },

                callback => {
                    if (configData.servicePlans) {
                        configData.servicePlans.forEach(servicePlan => {
                            totals.push({
                                name: servicePlan.name,
                                id: servicePlan.meta.id,
                                count: 0,
                            });
                        });
                    }
                    qSeverityByPeriod(startTime, endTime, (err, results) => {
                        if (err) {
                            logMessage(err);
                            return callback(err);
                        } else {
                            results.rows.forEach(result => {
                                if (result.serviceplanid) {
                                    addSeverityCountForServicePlan(result, totals);
                                }
                            });
                        }
                        callback(null, totals);
                    });
                },
            ],
            err => {
                if (err) {
                    logMessage(err);
                    handleMetricError(res, err);
                    return;
                }
                // sort the data
                const sorted = sortTotalData(totals);
                res.send(sorted);
                return;
            });
    });

    /**
     * Query latency metrics and return an object with array(s) for the time range,
     * including a timestamp for each value for chart rendering
     */
    app.get('/metrics/storage/latency', (req, res) => {
        // eslint-disable-next-line
        const { username, startTime, endTime, volId } = req.query || {};
        const series = {};

        debugAPI('/metrics/storage/latency ', req.query);

        request(req, 'get', `${apiVolumeSeries}/${volId}`)
            .then(response => {
                const { data } = response;
                const { storageParcels = {} } = data || {};

                async.each(Object.keys(storageParcels),
                    (storageId, callback) => {
                        qStorageMetrics(startTime, endTime, storageId, (err, metrics) => {
                            series[storageId] = [];
                            const latency = [];

                            if (err) {
                                logMessage(err);
                            }

                            if (metrics) {
                                metrics.rows.forEach(metric => {
                                    const timeindex = moment(metric.data_timestamp).valueOf();
                                    latency.push([timeindex, metric.latencymean / 1000]);
                                });

                                series[storageId].push({ name: 'Response Time Average', data: latency });
                            }

                            callback(null, series);
                        });
                    },
                    e => {
                        if (e) {
                            logMessage('error querying for storage latency');
                            logMessage('metrics_routes: ', e);
                        }
                        res.send(series);
                    });
            })
            .catch(e => {
                logMessage('exception caught querying for storage latency metrics');
                logMessage('metrics_routes: ', e);
                res.send(series);
            });
    });

    /**
     * Get compliance summary for volumes in the period.
     * Returns an array of objects with the volume id, name, and violation level.
     */
    app.get('/metrics/compliance/volumes', (req, res) => {
        const { startTime, endTime } = req.query || {};
        const configData = {
            volumes: null,
        };

        debugAPI('/metrics/compliance/volumes ', req.query);

        async.series({
                volumes: callback => {
                    getAllVolumes(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null, result.data);
                    });
                },
                snapshots: callback => {
                    getAllSnapshots(req, startTime, endTime).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.snapshots = result.data || [];
                        callback(null, result.data);
                    });
                },
                complianceResults: callback => {
                    queryComplianceVolumes(configData, startTime, endTime, callback);
                },
            },
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results.complianceResults);
                return;
            });
    });

    /**
     * Get compliance status for a single volume.
     * Returns an array with a single objects with the volume id, name, and violation level.
     * Leave return data structure as array for now as expect this may change to return
     * status for multiple volumes with multiple attributes related to status.
     */
    app.get('/metrics/compliance/volumestatus', (req, res) => {
        const { endTime, startTime } = req.query || {};
        const configData = {
            volumes: null,
        };

        debugAPI('/metrics/compliance/volumestatus ', req.query);

        async.series({
                volumes: callback => {
                    getVolume(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                snapshots: callback => {
                    getAllSnapshots(req, startTime, endTime).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.snapshots = result.data || [];
                        callback(null, result.data);
                    });
                },
                complianceResults: callback => {
                    queryComplianceVolumes(configData, startTime, endTime, callback);
                },
            },
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results.complianceResults);
                return;
            });
    });

    /**
     * Get compliance summary for volumes in the period.
     * Returns an array of objects with the volume id, name, and violation level by hour.
     */
    app.get('/metrics/compliance/volumesbyperiod', (req, res) => {
        const { startTime, endTime, volId } = req.query || {};
        const configData = {
            volumes: null,
        };

        debugAPI('/metrics/compliance/volumesbyperiod ', req.query);

        async.series([
                callback => {
                    getAllVolumes(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                callback => {
                    queryComplianceVolumesByPeriod(configData, startTime, endTime, volId, callback);
                },
            ],
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results[1]);
                return;
            });
    });

    /**
     * Get compliance summary for volumes in the period.
     * Returns an array of objects with the volume id, name, and violation level by hour.
     */
    app.get('/metrics/compliance/volumesbyperioddetail', (req, res) => {
        const { startTime, endTime, volId } = req.query || {};
        const configData = {
            volumes: null,
        };

        debugAPI('/metrics/compliance/volumesbyperioddetail ', req.query);

        async.series([
                callback => {
                    getAllVolumes(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                callback => {
                    queryComplianceVolumesByViolationByPeriod(configData, startTime, endTime, volId, callback);
                },
            ],
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results[1]);
                return;
            });
    });

    /**
     * Get service history for volume in the specified time period.
     * Returns an array of
     * - timestamp
     * - object with level violations for that period
     * - object with level violation changes for that period
     */
    app.get('/metrics/compliance/volumeservicehistory', (req, res) => {
        const { startTime, endTime, objectId: volId } = req.query || {};
        const configData = {
            records: [],
            volumes: null,
        };

        debugAPI('/metrics/compliance/volumeservicehistory ', req.query);

        async.series({
                volumes: callback => {
                    getAllVolumes(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                snapshots: callback => {
                    getAllSnapshots(req, null, null, volId).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.snapshots = result.data || [];
                        callback(null, result.data);
                    });
                },
                auditRecords: callback => {
                    getAuditRecords(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.records = result.data || [];
                        callback(null);
                    });
                },
                complianceLastHour: callback => {
                    const oneHourAgo = moment(endTime).clone().subtract(1, 'hour');
                    qComplianceVolumeByViolation(oneHourAgo, endTime, volId, callback);

                },
                complianceResults: callback => {
                    queryComplianceVolumesByViolationByPeriod(configData, startTime, endTime, volId, callback);
                },
            },
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                const snapshotHistory = snapshotServiceHistory(configData.snapshots, volId);

                /**
                 * Walk through all results by time slot to determine what has changed
                 * and record the level of compliance violation (warning, error).
                 */
                const result = results.complianceResults || {};
                const data = result[0] || {}; // will only be one volume in array
                const { violationsByPeriod } = data || {};
                const resultsData = violationsByPeriod || [];
                const history = [];
                const tracker = {
                    violationlatencymax: false,
                    violationlatencymean: false,
                    violationRPO: false,
                    violationworkloadavgsizemax: false,
                    violationworkloadavgsizemin: false,
                    violationworkloadmixread: false,
                    violationworkloadmixwrite: false,
                    violationworkloadrate: false,
                };
                const levels = {
                    violationlatencymax: constants.METRIC_VIOLATION_LEVELS.OK,
                    violationlatencymean: constants.METRIC_VIOLATION_LEVELS.OK,
                    violationRPO: constants.METRIC_VIOLATION_LEVELS.OK,
                    violationworkloadavgsizemax: constants.METRIC_VIOLATION_LEVELS.OK,
                    violationworkloadavgsizemin: constants.METRIC_VIOLATION_LEVELS.OK,
                    violationworkloadmixread: constants.METRIC_VIOLATION_LEVELS.OK,
                    violationworkloadmixwrite: constants.METRIC_VIOLATION_LEVELS.OK,
                    violationworkloadrate: constants.METRIC_VIOLATION_LEVELS.OK,
                };

                const numResults = resultsData.length;
                resultsData.forEach((result, idx) => {
                    const { timestamp, violations } = result;
                    const timeslot = { timestamp, messages: [], tracker: null };
                    const violationLevelChanges = {
                        violationlatencymean: null,
                        violationlatencymax: null,
                        violationworkloadrate: null,
                        violationworkloadmixread: null,
                        violationworkloadmixwrite: null,
                        violationworkloadavgsizemin: null,
                        violationworkloadavgsizemax: null,
                    };

                    /**
                     * Track the creation/clearing of violations based on the metrics database.
                     */
                    let changeOccurred = false;
                    Object.keys(tracker).forEach(key => {
                        if (tracker[key]) {
                            if (idx === numResults - 1) {
                                /**
                                 * If it is the last hour, we need to look at the past hour only for this volume.
                                 */
                                const lastHour = results.complianceLastHour || [];

                                // count # of violations in past hour for this key
                                let count = 0;
                                lastHour.rows.forEach(period => {
                                     if (period[key]) {
                                         count ++;
                                     }
                                })

                                /**
                                 * Match violation levels set in SQL.
                                 */
                                if (count > 6) {
                                    violations[key] = constants.METRIC_VIOLATION_LEVELS.ERROR
                                } else if (count > 3) {
                                    violations[key] = constants.METRIC_VIOLATION_LEVELS.WARNING
                                }
                            }
                            if (violations[key] === constants.METRIC_VIOLATION_LEVELS.OK) {
                                tracker[key] = false;
                                violationLevelChanges[key] = constants.VIOLATION_CLEARED;
                                changeOccurred = true;
                            } else if (violations[key] !== levels[key]) {
                                // level change
                                violationLevelChanges[key] = constants.VIOLATION_SET;
                                changeOccurred = true;
                            }
                        } else {
                            if (
                                violations[key] === constants.METRIC_VIOLATION_LEVELS.WARNING ||
                                violations[key] === constants.METRIC_VIOLATION_LEVELS.ERROR
                            ) {
                                tracker[key] = true;
                                violationLevelChanges[key] = constants.VIOLATION_SET;
                                changeOccurred = true;
                            }
                        }
                        levels[key] = violations[key];
                    });

                    /**
                     * Clone the results we are sending.
                     */
                    if (changeOccurred) {
                        timeslot.levels = _.cloneDeep(levels);
                        timeslot.violationLevelChanges = _.cloneDeep(violationLevelChanges);
                        timeslot.objectType = constants.SERVICE_HISTORY_METRICS_VIOLATION;
                        history.push(timeslot);
                    }
                });

                const snapshots = (snapshotHistory[volId] && snapshotHistory[volId].snaptimes) || [];

                snapshots.forEach(snapshot => {
                    // timestamps were UNIX time integers for comparison,
                    // need to convert to timestring
                    const { forceSet, timestamp, violationLevel: snapshotViolationLevel } = snapshot;
                    const timestampFormatted = moment.unix(timestamp).toISOString();
                    const timeslot = { timestamp: timestampFormatted, messages: [], tracker: null };
                    const violationLevelChanges = {
                        violationRPO: null,
                    };

                    let changeOccurred = false;
                    if (forceSet) {
                        tracker[constants.VIOLATION_RPO] = true;
                        violationLevelChanges[constants.VIOLATION_RPO] = constants.VIOLATION_SET;
                        changeOccurred = true;
                    } else if (tracker[constants.VIOLATION_RPO]) {
                        if (snapshotViolationLevel === constants.METRIC_VIOLATION_LEVELS.OK) {
                            tracker[constants.VIOLATION_RPO] = false;
                            violationLevelChanges[constants.VIOLATION_RPO] = constants.VIOLATION_CLEARED;
                            changeOccurred = true;
                        } else if (snapshotViolationLevel !== levels[constants.VIOLATION_RPO]) {
                            // level change
                            violationLevelChanges[constants.VIOLATION_RPO] = constants.VIOLATION_SET;
                            changeOccurred = true;
                        }
                    } else {
                        if (
                            snapshotViolationLevel === constants.METRIC_VIOLATION_LEVELS.WARNING ||
                            snapshotViolationLevel === constants.METRIC_VIOLATION_LEVELS.ERROR
                        ) {
                            tracker[constants.VIOLATION_RPO] = true;
                            violationLevelChanges[constants.VIOLATION_RPO] = constants.VIOLATION_SET;
                            changeOccurred = true;
                        }
                    }

                    levels[constants.VIOLATION_RPO] = snapshotViolationLevel;
                    /**
                     * Clone the results we are sending.
                     */
                    if (changeOccurred) {
                        timeslot.levels = _.cloneDeep(levels);
                        timeslot.violationLevelChanges = _.cloneDeep(violationLevelChanges);
                        timeslot.objectType = constants.SERVICE_HISTORY_RPO_VIOLATION;
                        history.push(timeslot);
                    }
                });

                configData.volumes.forEach(volume => {
                    const { volumeSeriesState, meta } = volume || {};
                    const { id, timeCreated } = meta || {};

                    /**
                     * If volume is in use and it was created more than RPO target
                     * time ago and there are no snapshots, we will mark it in
                     * violation based on the creation time of the volume + RPO target.
                     */
                    if (volumeSeriesState === 'IN_USE' && id === volId) {
                        const snapshots = configData.snapshots;
                        if (
                            snapshots.length === 0 &&
                            moment(timeCreated).isSameOrBefore(moment().subtract(constants.RPO_MAXIMUM_SNAPSHOT_INTERVAL, 'seconds'))
                        ) {
                            const violationLevelChanges = {
                                violationRPO: null,
                            };
                            const timestampFormatted = moment(timeCreated)
                                .add(constants.RPO_MAXIMUM_SNAPSHOT_INTERVAL, 'seconds')
                                .toISOString();
                            const timeslot = { timestamp: timestampFormatted, messages: [], tracker: null };

                            levels[constants.VIOLATION_RPO] = constants.METRIC_VIOLATION_LEVELS.ERROR;
                            violationLevelChanges[constants.VIOLATION_RPO] = constants.VIOLATION_SET;
                            timeslot.violationLevelChanges = _.cloneDeep(violationLevelChanges);
                            timeslot.objectType = constants.SERVICE_HISTORY_RPO_VIOLATION;
                            timeslot.levels = _.cloneDeep(levels);
                            history.push(timeslot);

                            /**
                             * If we synthesize an entry if there were no snapshots, also synthesize
                             * an entry for today if needed, as we do in snapshotServiceHistory().
                             */
                            if (
                                moment(timeCreated)
                                    .add(constants.RPO_MAXIMUM_SNAPSHOT_INTERVAL, 'seconds')
                                    .unix() <
                                moment()
                                    .subtract(1, 'day')
                                    .unix()
                            ) {
                                const syntheticEntry = _.cloneDeep(timeslot);
                                const syntheticTime = moment().subtract(1, 'hour');
                                timeslot.timestamp = syntheticTime.toISOString();
                                history.push(syntheticEntry);
                            }
                        }
                    }
                });

                const { records = [] } = configData || {};
                records.forEach(record => {
                    history.push({ ...record });
                });

                res.send(history);
                return;
            });
    });

    /**
     * Get compliance summary for application groups in the period.
     * Returns an array of objects with the application group id, name, and violation level.
     */
    app.get('/metrics/compliance/application-groups', (req, res) => {
        const { startTime, endTime } = req.query || {};
        const configData = {
            appGroups: null,
        };

        debugAPI('/metrics/compliance/application-groups ', req.query);

        async.series({
                applicationGroups: callback => {
                    getApplicationGroupsConfig(req, res).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.appGroupsConfig = result.data;
                        callback(null);
                    });
                },
                consistencyGroups: callback => {
                    getConsistencyGroupsConfig(req, res, null).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.consistencyGroupsConfig = result.data;
                        callback(null);
                    });
                },
                snapshots: callback => {
                    getAllSnapshots(req, startTime, endTime).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.snapshots = result.data || [];
                        callback(null, result.data);
                    });
                },
                volumes: callback => {
                    getAllVolumes(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                complianceResults: callback => {
                    queryComplianceApplicationGroups(configData, startTime, endTime, callback);
                },
            },
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results.complianceResults);
                return;
            });
    });

    /**
     * Get compliance summary for accounts in the period.
     * Returns an array of objects with the account id, name, and violation level.
     */
    app.get('/metrics/compliance/accounts', (req, res) => {
        const { accountId, startTime, endTime } = req.query || {};
        const configData = {
            accounts: null,
        };

        debugAPI('/metrics/compliance/accounts', req.query);

        async.series({
                accounts: callback => {
                    getAllAccounts(req, res, accountId).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.accounts = result.data;
                        callback(null);
                    });
                },
                snapshots: callback => {
                    getAllSnapshots(req, startTime, endTime).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.snapshots = result.data || [];
                        callback(null, result.data);
                    });
                },
                volumes: callback => {
                    getAllVolumes(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                complianceResults: callback => {
                    queryComplianceAccounts(configData, startTime, endTime, callback);
                },
            },

            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results.complianceResults);
                return;
            });
    });

    /**
     * Get compliance summary for clusters in the period.
     * Returns an array of objects with the clusters id, name, and violation level.
     */
    app.get('/metrics/compliance/clusters', (req, res) => {
        const { startTime, endTime } = req.query || {};
        const configData = {
            clusters: null,
        };

        debugAPI('/metrics/compliance/clusters', req.query);

        async.series({
                clusters: callback => {
                    getAllClusters(req, res).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.clusters = result.data;
                        callback(null);
                    });
                },
                snapshots: callback => {
                    getAllSnapshots(req, startTime, endTime).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.snapshots = result.data || [];
                        callback(null, result.data);
                    });
                },
                volumes: callback => {
                    getAllVolumes(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                complianceResults: callback => {
                    queryComplianceClusters(configData, startTime, endTime, callback);
                },
            },
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results.complianceResults);
                return;
            });
    });

    /**
     * Get compliance summary for pools in the period.
     * Returns an array of objects with the pool id, name, and violation level.
     */
    app.get('/metrics/compliance/pools', (req, res) => {
        const { startTime, endTime } = req.query || {};
        const configData = {
            pools: null,
        };

        debugAPI('/metrics/compliance/pools', req.query);

        async.series({
                pools: callback => {
                    getAllPools(req, res).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.pools = result.data;
                        callback(null);
                    });
                },
                snapshots: callback => {
                    getAllSnapshots(req, startTime, endTime).then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.snapshots = result.data || [];
                        callback(null, result.data);
                    });
                },
                volumes: callback => {
                    getAllVolumes(req, res, 'admin').then(result => {
                        if (result.err) {
                            return callback(result.err);
                        }
                        configData.volumes = result.data;
                        callback(null);
                    });
                },
                complianceResults: callback => {
                    queryCompliancePools(configData, startTime, endTime, callback);
                },
            },
            (err, results) => {
                if (err) {
                    handleMetricError(res, err);
                    return;
                }
                res.send(results.complianceResults);
                return;
            });
    });

    /**
     * Query latency metrics and return an object with array(s) for the time range,
     * including a timestamp for each value for chart rendering
     */
    app.get('/metrics/volumes/performance', (req, res) => {
        // eslint-disable-next-line
        const { username, startTime, endTime, volId } = req.query || {};
        const series = [constants.METRICS_DATA_SIZE_ARRAY];

        debugAPI('/metrics/volumes/performance ', req.query);
        qVolumeMetrics(startTime, endTime, volId, (err, metrics) => {
            const blocksize = [];
            const costiops = [];
            const costthroughput = [];
            const iOPS = [];
            const latency = [];
            const latencyMaximum = [];
            const maxavgsizebytes = [];
            const maxiops = [];
            const maxthroughput = [];
            const minavgsizebytes = [];
            const percentReads = [];
            const percentWrites = [];
            const responsetimeaverage = [];
            const responsetimemax = [];
            const throughput = [];

            if (err) {
                logMessage(err);
                handleMetricError(res, err);
                return;
            }
            if (metrics) {
                metrics.rows.forEach(metric => {
                    const timeindex = moment(metric.data_timestamp).valueOf();
                    latency.push([timeindex, metric.latencymean / 1000]);
                    latencyMaximum.push([timeindex, metric.latencymax / 1000]);

                    responsetimeaverage.push([timeindex, metric.responsetimeaverage / 1000]);
                    responsetimemax.push([timeindex, metric.responsetimemax / 1000]);

                    iOPS.push([timeindex, metric.iopspersec]);
                    throughput.push([timeindex, metric.throughput]);

                    maxiops.push([timeindex, metric.maxiops]);
                    maxthroughput.push([timeindex, metric.maxthroughput]);

                    costiops.push([timeindex, metric.costiops]);
                    costthroughput.push([timeindex, metric.costthroughput]);

                    const noRW = !metric.numberreads && !metric.numberwrites;
                    const readpercentage = noRW
                        ? 0
                        : Math.round((metric.numberreads / (metric.numberreads + metric.numberwrites)) * 100);
                    const writepercentage = noRW ? 0 : 100 - readpercentage;
                    percentReads.push([timeindex, readpercentage]);
                    percentWrites.push([timeindex, writepercentage]);

                    blocksize.push([timeindex, metric.blocksize / 1024]);
                    minavgsizebytes.push([timeindex, metric.minavgsizebytes / 1024]);
                    maxavgsizebytes.push([timeindex, metric.maxavgsizebytes / 1024]);
                });

                /**
                 * Maps to METRICS_DATA_INDEX_* constants
                 * 0-latency mean (measured)
                 * 1-latency average (target)
                 * 2-latency maximum (measured)
                 * 3-RTA
                 * 4-RTM
                 * 5/6 -one of IOPS or Throughput
                 *
                 *  5-iops
                 *  6-maxiops
                 *  7-costiops
                 *
                 *  5-throughput
                 *  6-maxthroughput
                 *  7-costthroughput
                 *
                 * 7-percent reads => 8
                 * 8-percent writes => 9
                 * 9-blocksize => 10
                 * 10-min blocksize => 11
                 * 11-max blocksize => 12
                 */
                series[constants.METRICS_DATA_INDEX_LATENCY_AVG] = { name: 'Response Time Average', data: latency };
                series[constants.METRICS_DATA_INDEX_LATENCY_MAX] = {
                    name: 'Response Time Maximum',
                    data: latencyMaximum,
                };
                series[constants.METRICS_DATA_INDEX_LATENCY_TARGET_AVG] = {
                    name: 'Target Response Time Average',
                    data: responsetimeaverage,
                };
                series[constants.METRICS_DATA_INDEX_LATENCY_TARGET_MAX] = {
                    name: 'Target Response Time Maximum',
                    data: responsetimemax,
                };

                if (metrics && metrics.rows[0]) {
                    if (metrics.rows[0].iopspergib && metrics.rows[0].iopspergib !== 0) {
                        series[constants.METRICS_DATA_INDEX_PERFORMANCE] = {
                            name: constants.METRICS_DATA_NAME_IOPS,
                            data: iOPS,
                        };
                        series[constants.METRICS_DATA_INDEX_MAX_PERFORMANCE] = { name: 'maxiops', data: maxiops };
                        series[constants.METRICS_DATA_INDEX_COST_PERFORMANCE] = { name: 'costiops', data: costiops };
                    } else {
                        series[constants.METRICS_DATA_INDEX_PERFORMANCE] = { name: 'Throughput', data: throughput };
                        series[constants.METRICS_DATA_INDEX_MAX_PERFORMANCE] = {
                            name: 'maxthroughput',
                            data: maxthroughput,
                        };
                        series[constants.METRICS_DATA_INDEX_COST_PERFORMANCE] = {
                            name: 'costthroughput',
                            data: costthroughput,
                        };
                    }
                } else {
                    series[constants.METRICS_DATA_INDEX_PERFORMANCE] = {
                        name: constants.METRICS_DATA_NAME_IOPS,
                        data: [],
                    };
                    series[constants.METRICS_DATA_INDEX_MAX_PERFORMANCE] = { name: 'maxiops', data: [] };
                    series[constants.METRICS_DATA_INDEX_COST_PERFORMANCE] = { name: 'costiops', data: [] };
                }
                series[constants.METRICS_DATA_INDEX_PERCENT_READS] = { name: '% Reads', data: percentReads };
                series[constants.METRICS_DATA_INDEX_PERCENT_WRITES] = { name: '% Writes', data: percentWrites };

                series[constants.METRICS_DATA_INDEX_BLOCKSIZE] = { name: 'Blocksize', data: blocksize };
                series[constants.METRICS_DATA_INDEX_MIN_BLOCKSIZE] = { name: 'Min Blocksize', data: minavgsizebytes };
                series[constants.METRICS_DATA_INDEX_MAX_BLOCKSIZE] = { name: 'Max Blocksize', data: maxavgsizebytes };
                res.send(series);
            } else {
                res.send([]);
            }
        });
    });

    /**
     * Query capacity metrics and return an object with array(s) for the time range,
     * including a timestamp for each value for chart rendering
     */
    app.get('/metrics/volumes/capacity', (req, res) => {
        // eslint-disable-next-line
        const { username, startTime, endTime, volId } = req.query || {};
        const series = [];

        qCapacityMetrics(startTime, endTime, volId, (err, metrics) => {
            const size = [];
            const allocated = [];

            if (err) {
                logMessage(err);
                handleMetricError(res, err);
                return;
            }
            if (metrics) {
                metrics.rows.forEach(metric => {
                    const timeindex = moment(metric.timestamp).valueOf();
                    size.push([timeindex, metric.totalbytes / 1024 / 1024 / 1024]);
                    allocated.push([timeindex, metric.bytesallocated / 1024 / 1024 / 1024]);
                });

                series.push({ name: 'Size', data: size });
                series.push({ name: 'Allocated', data: allocated });
            }
            res.send(series);
        });
    });
};

/**
 * Sort the data that is being returned so highest severity appears first.
 * TBD: Sort remaining alphabetically, or sort any cells with the same value
 * alphabetically.
 * @param {} data
 */
function sortTotalData(data) {
    const sortedData = data.sort((a, b) => {
        if (a.count < b.count) {
            return -1;
        }
        if (a.count > b.count) {
            return 1;
        }
        return 0;
    });

    return sortedData;
}

/**
 * Retrieve all service plans from the configuration database.
 */
function getAllServicePlans(req) {
    return request(req, 'get', apiServicePlans)
        .then(response => {
                const servicePlans = response.data;

                return { data: servicePlans };
            },
            err => {
                logMessage(`Cannot retrieve service plan information ${getErrorMessage(err)}`);
                return { err };
            })
        .catch(err => {
            logMessage('Cannot retrieve service plan information:', err);
            return { err };
        });
}

/**
 * Retrieve all snapshots from the configuration database.
 */
function getAllSnapshots(req, startTime, endTime, volId = null) {
    const volIdStr = volId ? `volumeSeriesId=${volId}` : '';
    const queryStr = startTime ? `?snapTimeGE=${startTime}&${volIdStr}&snapTimeLE=${endTime}` : `?${volIdStr}`;
    const reqUrl = `${apiSnapshots}${queryStr}`;

    return request(req, 'get', reqUrl)
        .then(response => {
                const snapshots = response.data;

                return { data: snapshots };
            },
            err => {
                logMessage(`Cannot retrieve snapshots ${getErrorMessage(err)}`);
                return { err };
            })
        .catch(err => {
            logMessage('Cannot retrieve snapshots:', err);
            return { err };
        });
}

/**
 * Retrieve all application groups from the metrics database.
 */
function getAllAppGroups(startTime, endTime, callback) {
    return queryAppGroups(startTime, endTime, (err, result) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, result);
    });
}

/**
 * Retrieve all application groups from the metrics database.
 */
function getAllConsistencyGroups(startTime, endTime, callback) {
    return queryConsistencyGroups(startTime, endTime, (err, result) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, result);
    });
}

/**
 * Retrieve all account ids from the confuration database.
 * TBD: RBAC
 * @param {string} username
 */
// eslint-disable-next-line
function getAllAccountIds(req, res, username) {
    return request(req, 'get', apiAccounts)
        .then(response => {
                const accountIds = [];
                const accounts = response.data;

                accounts.forEach(acct => {
                    accountIds.push(acct.meta.id);
                });
                return { data: accountIds };
            },
            err => {
                logMessage(`Cannot retrieve account information ${getErrorMessage(err)}`);
                return { err };
            })
        .catch(err => {
            logMessage('Cannot retrieve account information:', err.message);
            return { err };
        });
}

/**
 * Get all accounts from the config database.
 * @param {*} req
 * @param {*} res
 */
function getAllAccounts(req, res, accountId) {
    return request(req, 'get', apiAccounts)
        .then(response => {
                const accountIds = [];
                const accounts = response.data;

                accounts.forEach(acct => {
                    const { meta } = acct;
                    const { id } = meta;

                    if (!accountId) {
                        accountIds.push({ name: acct.name, id });
                    } else if (accountId === id) {
                        accountIds.push({ name: acct.name, id });
                    }
                });
                return { data: accountIds };
            },
            err => {
                logMessage(`Cannot retrieve account information ${getErrorMessage(err)}`);
                return { err };
            })
        .catch(err => {
            logMessage('Cannot retrieve account information:', err.message);
            return { err };
        });
}

/**
 * Get all clusters from the config database.
 * @param {*} req
 * @param {*} res
 */
function getAllClusters(req) {
    return request(req, 'get', apiClusters)
        .then(response => {
                const results = [];
                const clusters = response.data;

                clusters.forEach(cluster => {
                    results.push({ name: cluster.name, id: cluster.meta.id });
                });
                return { data: results };
            },
            err => {
                logMessage(`Cannot retrieve cluster information ${getErrorMessage(err)}`);
                return { err };
            })
        .catch(err => {
            logMessage('Cannot retrieve cluster information:', err.message);
            return { err };
        });
}

/**
 * Get all pool information from the config database.
 * @param {*} req
 * @param {*} res
 */
function getAllPools(req) {
    return request(req, 'get', apiPools)
        .then(response => {
                const results = [];
                const pools = response.data;

                pools.forEach(pool => {
                    results.push({
                        poolId: pool.meta.id,
                        clusterId: pool.clusterId,
                        accountId: pool.authorizedAccountId,
                        servicePlanId: pool.servicePlanId,
                    });
                });
                return { data: results };
            },
            err => {
                logMessage(`Cannot retrieve pool information ${getErrorMessage(err)}`);
                return { err };
            })
        .catch(err => {
            logMessage('Cannot retrieve pool information:', err.message);
            return { err };
        });
}

/**
 * Get all pool information from the config database.
 * @param {*} req
 * @param {*} res
 */
function getAuditRecords(req) {
    const url = apiAuditLog;
    const reqUrl = `${url}?${Object.keys(req.query)
        .map(k => k + '=' + req.query[k])
        .join('&')}`;

    return request(req, 'get', reqUrl)
        .then(response => {
                const results = [];
                const records = response.data;

                records.forEach(record => {
                    results.push(record);
                });
                return { data: results };
            },
            err => {
                logMessage(`Cannot retrieve audit log records ${getErrorMessage(err)}`);
                return { err };
            })
        .catch(err => {
            logMessage('Cannot retrieve audit log records:', err.message);
            return { err };
        });
}

function getApplicationGroupsConfig(req) {
    return request(req, 'get', apiApplicationGroups)
        .then(response => {
                const results = [];
                const applicationGroups = response.data;

                applicationGroups.forEach(group => {
                    results.push({ name: group.name, id: group.meta.id });
                });
                return { data: results };
            },
            err => {
                logMessage(`Cannot retrieve application groups ${getErrorMessage(err)}`);
                return { err };
            })
        .catch(err => {
            logMessage('Cannot retrieve application groups:', err);
            return { err };
        });
}

function getConsistencyGroupsConfig(req) {
    return request(req, 'get', apiConsistencyGroups)
        .then(response => {
                const results = [];
                const consistencyGroups = response.data;

                consistencyGroups.forEach(group => {
                    results.push({
                        name: group.name,
                        consistencygroupid: group.meta.id,
                        applicationGroupIds: group.applicationGroupIds,
                    });
                });
                return { data: results };
            },
            err => {
                logMessage(`Cannot retrieve consistency groups: ${getErrorMessage(err)}`);
                return { err };
            })
        .catch(err => {
            logMessage('Cannot retrieve consistency groups:', err);
            return { err };
        });
}

/**
 * Retrieve all volume Ids from the conifiguration database for the given username.
 * If the username is 'admin', retrieve information for all volumes.  This may not scale
 * with larger datasets.
 * If the username is not 'admin', we will need to retrieve all accounts that the user
 * is a member of.
 * You can restrict the set of volumes by application group or consistency group.
 * TBD: RBAC
 * @param {string} username
 * @param {string} appGroup
 * @param {string} consistencyGroup
 */
function getAllVolumes(req, res, username, appGroup, consistencyGroup) {
    // eslint-disable-next-line
    return request(req, 'get', apiVolumeSeries).then(
        response => {
            const volumeSeries = response.data;
            const vols = [];

            if (volumeSeries.length < 1) {
                // no volumes, return empty array
                return { data: vols };
            }

            volumeSeries.forEach(vol => {
                let match = true;
                if (
                    (consistencyGroup && consistencyGroup !== vol.consistencyGroupTag) ||
                    (appGroup && appGroup !== vol.applicationGroupTag)
                ) {
                    match = false;
                }

                if (username === 'admin' && match) {
                    /**
                     * Get all volumes
                     */
                    vols.push(vol);
                }
            });

            return { data: vols };
        },
        err => {
            logMessage(`Cannot retrieve volume information ${getErrorMessage(err)}`);
            return { err };
        });
}

/**
 * Look up the latency for the given service plan from the SP data.
 * @param {object} configData
 * @param {string} spId
 */
function findLatencyForPlan(configData, spId) {
    const sp = configData.servicePlans.find(plan => {
        return plan.meta.id === spId;
    });
    if (sp) {
        const sloString = sp.slos['Response Time Average'].value;
        return parseInt(sloString.substr(0, sloString.indexOf('ms')));
    } else {
        return -1;
    }
}

/**
 * The array we pass back needs to have elements for each period in the range.
 * Depending on the period, this function loads the arrays with the correct number
 * of placeholders.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} period
 * @param {*} periods
 */
function loadPlacedholderSlots(startTime, endTime, period, periods) {
    const durationDays = moment(endTime).diff(moment(startTime)) / 1000 / 60 / 60 / 24;

    if (period === constants.METRIC_PERIOD_HOUR) {
        for (let i = 0; i < 25; i++) {
            const timeString = moment(startTime)
                .add(i, 'hour')
                .format();
            periods.push({
                count: 0,
                timestamp: timeString,
            });
        }
    } else {
        for (let i = 0; i < durationDays + 1; i++) {
            const timeString = moment(startTime)
                .add(i, 'days')
                .format();
            periods.push({
                count: 0,
                timestamp: timeString,
            });
        }
    }
}

/**
 * Return the period that is used when querying the database depending on what is being shown.
 * We query by 'day' unless we are looking at the last 24 hours.
 * @param {*} period
 */
function timePeriodToQueryPeriod(period) {
    return period === constants.METRIC_PERIOD_HOUR ? constants.METRIC_PERIOD_HOUR : constants.METRIC_PERIOD_DAY;
}

/**
 * Query the database for samples that exceed the service plan's latency threshold for the specified
 * volume in the given time range.
 * @param {*} configData Resource configuration information
 * @param {*} volId Volume UUID
 * @param {*} firstDay First day of the period
 * @param {*} range Service plan time range
 * @param {*} next callback function to move to next volume
 * @param {*} period Time period we are querying by
 * @param {*} periods Resulting values
 * @param {*} callback
 */
function getCountByTimeRange(configData, volId, firstDay, range, next, period, periods, callback) {
    const spStartTime = range.startTime;
    const spEndTime = range.endTime;
    const spLatency = findLatencyForPlan(configData, range.spId);
    // This check likely unnecessary but do it anyway
    if (spLatency < 0) {
        logMessage('cannot determine latency');
        next();
    }

    queryVolumeLatencyCountByPeriod(volId,
        spStartTime,
        spEndTime,
        timePeriodToQueryPeriod(period),
        spLatency,
        (err, results) => {
            if (err) {
                logMessage(err);
                return callback(err);
            } else {
                /**
                 * index into the array is calculated based on the first day and
                 * when the compliance issue occurred.
                 */
                if (period === constants.METRIC_PERIOD_HOUR) {
                    results.forEach(result => {
                        const index = parseInt(result.hourIndex);
                        periods[index].count += result.count;
                    });
                } else {
                    results.forEach(result => {
                        const index = dayToResultIndex(result, firstDay, spStartTime);
                        periods[index].count += result.count;
                    });
                }
            }
            next();
        });
}

/**
 * Get all latency violations in the time range for all volumes.
 * @param  {array} configData Data set we are operating on
 * @param  {string} startTime Start of time range
 * @param  {string} endTime End of time range
 * @param  {string} period Period (m/w/d)
 * @param  {function} cb Callback function
 */
function queryAllPeriodsByDay(configData, startTime, endTime, period, cb) {
    const periods = [];
    const firstDay = moment(startTime).format('DDDD');

    // We add an additional slot for the current day.  The results array is shifted before returning.
    loadPlacedholderSlots(startTime, endTime, period, periods);

    /**
     * For each volume found...
     */
    async.eachSeries(configData.volumes,
        (volume, next) => {
            let timeRanges = [];
            async.series([
                    callback => {
                        // Get the service plans for each time range within the query time period
                        queryServicePlanByVol(volume.meta.id, startTime, endTime, (err, result) => {
                            timeRanges = result;
                            callback(null, timeRanges);
                        });
                    },
                    callback => {
                        // Get the counts by period in the time range
                        async.eachSeries(timeRanges,
                            (range, next) => {
                                getCountByTimeRange(configData,
                                    volume.meta.id,
                                    firstDay,
                                    range,
                                    next,
                                    period,
                                    periods,
                                    callback);
                            },
                            err => {
                                if (err) {
                                    logMessage(err);
                                    return callback(err, null);
                                }
                                callback(null, periods);
                            });
                    },
                ],
                err => {
                    if (err) {
                        logMessage(err);
                    }
                    next();
                });
        },
        err => {
            if (err) {
                logMessage(err);
                cb(err, null);
            }

            /**
             * We added a slot for today earlier.  Remove the first period so we get the requested number of periods.
             */
            periods.shift();
            cb(null, periods);
        });
}

/**
 * Determine the index into the resulting array which is the offset of days from
 * the start of the time period.  Account for crossing year/leap year.
 * @param {*} result
 * @param {*} firstDay
 * @param {*} startTime
 */
function dayToResultIndex(result, firstDay, startTime) {
    let index = -1;
    if (result.dayNum < firstDay) {
        const leapYear = moment(startTime).isLeapYear() ? 1 : 0;
        index = parseInt(result.dayNum) + 365 + leapYear - parseInt(firstDay);
    } else {
        index = result.dayNum - firstDay;
    }
    return index;
}

/**
 * Increment the results for the specified volume.
 * XXX Should we referencing objects by using the volid?
 * @param {*} volId
 * @param {*} result
 * @param {*} data
 */
function addCountForAG(result, data) {
    const index = data.findIndex(item => {
        return item.applicationgroupid === result.applicationgroupid;
    });

    if (index === -1) {
        return;
    }

    data[index].count += result.count;
}

function addCountForCG(result, data) {
    const index = data.findIndex(item => {
        return item.consistencygroupid === result.consistencygroupid;
    });

    if (index === -1) {
        return;
    }

    data[index].count += result.count;
}

/**
 * Weight the return values based on severity.
 * @param {*} result
 * @param {*} data
 */
function addSeverityCountForServicePlan(result, data) {
    const index = data.findIndex(item => {
        return item.id === result.serviceplanid;
    });

    if (index === -1) {
        return;
    }

    let count = 0;
    if (result.error !== 0) {
        /**
         * We skew the count for errors by a large number to avoid
         * colliding with cases where a SP always has errors.
         */
        count = constants.METRICS_SP_ERROR_BASE + result.error;
    } else if (result.warning !== 0) {
        count = result.warning;
    }
    data[index].count += count;
}

/**
 * Increment the results for the specified volume.
 * XXX Should we referencing objects by using the volid?
 * @param {*} volId
 * @param {*} result
 * @param {*} data
 */
function addCountForVolId(volId, result, data) {
    const index = data.findIndex(item => {
        return item.volId === volId;
    });

    if (index === -1) {
        return;
    }

    data[index].count += result;
}

/**
 * Return array of objects that contain
 *   volume id
 *   count of latency compliance issues for that entire period
 *
 * @param  {array} configData Data set we are operating on
 * @param  {string} startTime Start of time range
 * @param  {string} endTime End of time range
 * @param  {function} cb Callback function
 */
function queryVolumeComplianceTotalsByPeriod(configData, startTime, endTime, cb) {
    const data = [];

    if (!configData || !configData.volumes) {
        return cb(null, data);
    }

    // build resulting array of objects
    configData.volumes.forEach(volume => {
        data.push({
            volId: volume.meta.id,
            servicePlanId: volume.servicePlanId,
            consistencyGroupId: volume.consistencyGroupId,
            applicationGroupIds: volume.applicationGroupIds,
            name: volume.name,
            count: 0,
        });
    });

    async.series([
            callback => {
                qComplianceAllVolumes(startTime, endTime, (err, results) => {
                    if (err) {
                        logMessage(err);
                        return callback(err);
                    }
                    // handle all id results
                    if (results && results.rows) {
                        results.rows.forEach(result => {
                            addCountForVolId(result.volumeid, result.count, data);
                        });
                    }
                    callback(null, data);
                });
            },
        ],
        err => {
            if (err) {
                logMessage(err);
                return cb(err, null);
            }
            cb(null, sortTotalComplianceData(data));
        });
}

/**
 * Sort the data from worst to best.
 * @param {*} data
 */
function sortTotalComplianceData(data) {
    const sortedData = data.sort((a, b) => {
        if (a.count < b.count) {
            return -1;
        }
        if (a.count > b.count) {
            return 1;
        }
        return 0;
    });
    return sortedData;
}

/**
 * Process snapshots and create service history records.
 */
function snapshotServiceHistory(snapshots) {
    /**
     * For each snapshot, add snapshot created time to array for that volume id in object
     *  For new objects, create array and add violationLevel attribute
     *
     * For each volume id, sort the array of created times
     *
     * Determine if any snapshots exceed 4 hour RPO and flag violation Error
     */
    const processedSnapshots = {};

    if (!snapshots || snapshots.length === 0) {
        return {};
    }

    snapshots.forEach(snapshot => {
        const { volumeSeriesId, meta } = snapshot;
        const { timeCreated } = meta || {};

        if (!processedSnapshots[volumeSeriesId]) {
            processedSnapshots[volumeSeriesId] = { snaptimes: [], volumeSeriesId };
        }

        // TBD could be optimized with insert sort?
        processedSnapshots[volumeSeriesId].snaptimes.push({
            timestamp: moment(timeCreated)
                .startOf('minute')
                .unix(),
            violationLevel: constants.METRIC_VIOLATION_LEVELS.OK,
            volumeSeriesId,
        });
    });

    // sort ascending
    Object.values(processedSnapshots).forEach(snapshot => {
        snapshot.snaptimes.sort((a, b) => {
            return a.timestamp - b.timestamp;
        });
    });

    // look for RPO violations
    Object.values(processedSnapshots).forEach(snapshot => {
        const { snaptimes } = snapshot;
        const violations = [];

        snaptimes.forEach((snaptime, idx) => {
            if (idx < snaptimes.length - 1) {
                if (snaptimes[idx + 1].timestamp - snaptime.timestamp > constants.RPO_MAXIMUM_SNAPSHOT_INTERVAL) {
                    snaptime.violationLevel = constants.METRIC_VIOLATION_LEVELS.ERROR;
                    snaptime.timestamp = snaptime.timestamp + constants.RPO_MAXIMUM_SNAPSHOT_INTERVAL;
                }
            } else {
                // see if last snap time was beyond 4 hours ago and no snap
                // has occurred since
                const lastSnaptime = snaptimes[idx].timestamp;
                if (lastSnaptime < moment().unix() - constants.RPO_MAXIMUM_SNAPSHOT_INTERVAL) {
                    const rpoTimestamp = {
                        violationLevel: constants.METRIC_VIOLATION_LEVELS.ERROR,
                        timestamp: lastSnaptime + constants.RPO_MAXIMUM_SNAPSHOT_INTERVAL,
                    };
                    snaptimes.push(rpoTimestamp);
                }

                // insert synthetic entry if nothing has occurred in past day
                const startTime = moment().subtract(1, 'day');
                if (lastSnaptime < moment(startTime).unix()) {
                    const rpoTimestamp = {
                        violationLevel: constants.METRIC_VIOLATION_LEVELS.ERROR,
                        timestamp: moment()
                            .subtract(1, 'hour')
                            .unix(),
                        forceSet: true,
                    };
                    snaptimes.push(rpoTimestamp);
                }
            }
        });

        snaptimes.concat(violations);
    });

    return processedSnapshots;
}

/**
 * Query the database for volume compliance information.
 * @param {*} configData
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} cb
 */
function queryComplianceVolumes(configData, startTime, endTime, cb) {
    const data = [];

    if (!configData || !configData.volumes) {
        return cb(null, data);
    }

    // build resulting array of objects
    configData.volumes.forEach(volume => {
        data.push({
            volId: volume.meta.id,
            name: volume.name,
            violationlevel: 0,
        });
    });

    // const snapshotHistory = snapshotServiceHistory(configData.snapshots);

    async.series([
            callback => {
                qComplianceVolumes(startTime, endTime, (err, results) => {
                    if (err) {
                        logMessage(err);
                        return callback(err);
                    }

                    /**
                     * For all rows, we need to check the snapshot compliance level to see
                     * if it is more severe than the metrics compliance level and raise
                     * it appropriately.
                     *
                     * We can be collecting metrics but have no snapshots in the given
                     * time period, esp. if it is for the past day.
                     */
                    if (results && results.rows) {
                        results.rows.forEach(result => {
                            /**
                             * Check snapshot violation here and adjust violationLevel.
                             */
                            addResultForVolId(result.volumeid, result.violationlevel, data);
                        });
                    }

                    /**
                     * Go through all volumes.  If no snapshot RPO entry exists and volume is mounted,
                     * we need to generate a status violation.
                     */
                    // configData.volumes.forEach(volume => {
                    //     if (checkVolumeSnapshotsAfterCreated(snapshotHistory, volume)) {
                    //         const { meta } = volume || {};
                    //         const { id } = meta || {};
                    //         const lastViolationLevel = getLastViolationLevel(id, snapshotHistory);

                    //         addResultForVolId(id, lastViolationLevel, data);
                    //     }
                    // });

                    callback(null, data);
                });
            },
        ],
        err => {
            if (err) {
                logMessage(err);
                return cb(err, null);
            }
            cb(null, data);
        });
}

/**
 * Set the result for the specified volume.
 * @param {*} volId
 * @param {*} result
 * @param {*} data
 */
function addResultForVolId(volId, result, data) {
    const index = data.findIndex(item => {
        return item.volId === volId;
    });

    if (index === -1) {
        return;
    }

    data[index].violationlevel = result;
}

// function getLastViolationLevel(id, snapshotHistory) {
//     const snapshotViolation = snapshotHistory[id];
//     const { snaptimes = [] } = snapshotViolation || {};

//     return snaptimes && snaptimes.length > 0 && snaptimes[snaptimes.length - 1]
//         ? snaptimes[snaptimes.length - 1].violationLevel
//         : constants.METRIC_VIOLATION_LEVELS.ERROR;
// }

// function checkVolumeSnapshotsAfterCreated(snapshotHistory, volume) {
//     const { volumeSeriesState, meta } = volume || {};
//     const { timeCreated } = meta || {};
//     const { id } = meta || {};

//     // if any snapshots exist, RPO will be captured elsewhere
//     if (snapshotHistory[id]) {
//         return false;
//     }

//     // check to make sure the volume creation time is within RPO range
//     return (
//         volumeSeriesState === constants.VOLUME_MOUNT_STATES.IN_USE &&
//         moment(timeCreated).isSameOrBefore(moment().subtract(constants.RPO_MAXIMUM_SNAPSHOT_INTERVAL, 'seconds'))
//     );
// }

/**
 * Query the database for application group compliance information.
 * @param {*} configData
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} cb
 */
function queryComplianceApplicationGroups(configData, startTime, endTime, cb) {
    const data = [];
    const { appGroupsConfig = [], volumes = [] } = configData || {};

    if (!configData || !appGroupsConfig) {
        return cb(null, data);
    }

    // build resulting array of objects
    appGroupsConfig.forEach(appGroup => {
        data.push({
            applicationGroupId: appGroup.id,
            name: appGroup.name,
            violationlevel: 0,
        });
    });

    const volIds = volumes.map(vol => {
        const { meta } = vol;
        const { id } = meta;
        return id;
    });

    // const snapshotHistory = snapshotServiceHistory(configData.snapshots);

    async.series([
            callback => {
                qComplianceApplicationGroups(startTime, endTime, volIds, (err, results) => {
                    if (err) {
                        logMessage(err);
                        return callback(err);
                    }
                    if (results && results.rows) {
                        results.rows.forEach(result => {
                            addResultForAppGroupId(result.applicationgroupid, result.violationlevel, data);
                        });
                    }

                    /**
                     * Go through all volumes.  If no snapshot RPO entry exists and volume is mounted,
                     * we need to generate a status violation.
                     */
                    // configData.volumes.forEach(volume => {
                    //     if (checkVolumeSnapshotsAfterCreated(snapshotHistory, volume)) {
                    //         const { meta } = volume || {};
                    //         const { id } = meta || {};
                    //         const lastViolationLevel = getLastViolationLevel(id, snapshotHistory);

                    //         /**
                    //          * Find all AG IDs that the CG is part of and add the result.
                    //          */
                    //         const cg = configData.consistencyGroupsConfig.find(cg => cg.consistencygroupid === volume.consistencyGroupId);
                    //         if (cg) {
                    //             cg.applicationGroupIds.forEach(ag => {
                    //                 addResultForAppGroupId(ag, lastViolationLevel, data);
                    //             });
                    //         }
                    //     }
                    // });

                    callback(null, data);
                });
            },
        ],
        err => {
            if (err) {
                logMessage(err);
                return cb(err, null);
            }
            cb(null, data);
        });
}

/**
 * Set the result for the application group.
 * @param {*} applicationgroupid
 * @param {*} result
 * @param {*} data
 */
function addResultForAppGroupId(applicationgroupid, result, data) {
    const index = data.findIndex(item => {
        return item.applicationGroupId === applicationgroupid;
    });

    if (index === -1) {
        return;
    }

    data[index].violationlevel = result;
}

/**
 * Set the result for the pool.
 * @param {*} serviceplanid
 * @param {*} result
 * @param {*} data
 */
function addResultForPool(result, data) {
    const index = data.findIndex(item => {
        return (
            item.serviceplanid === result.serviceplanid &&
            item.clusterid === result.clusterid &&
            item.accountid === result.accountid
        );
    });

    if (index === -1) {
        return;
    }

    if (result.violationlevel > data[index].violationlevel) {
        data[index].violationlevel = result.violationlevel;
    }
}

/**
 * Query the database for account compliance information.
 * @param {*} configData
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} cb
 */
function queryComplianceAccounts(configData, startTime, endTime, cb) {
    const data = [];
    const { accounts = [], volumes = [] } = configData || {};

    if (!configData || !accounts) {
        return cb(null, data);
    }

    // build resulting array of objects
    accounts.forEach(account => {
        data.push({
            accountId: account.id,
            name: account.name,
            violationlevel: 0,
        });
    });

    const volIds = volumes.map(vol => {
        const { meta } = vol;
        const { id } = meta;
        return id;
    });

    // const snapshotHistory = snapshotServiceHistory(configData.snapshots);

    async.series([
            callback => {
                qComplianceAccounts(startTime, endTime, volIds, (err, results) => {
                    if (err) {
                        logMessage(err);
                        return callback(err);
                    }
                    if (results && results.rows) {
                        results.rows.forEach(result => {
                            addResultForAccount(result.accountid, result.violationlevel, data);
                        });
                    }

                    /**
                     * Go through all volumes.  If no snapshot RPO entry exists and volume is mounted,
                     * we need to generate a status violation.
                     */
                    // configData.volumes.forEach(volume => {
                    //     if (checkVolumeSnapshotsAfterCreated(snapshotHistory, volume)) {
                    //         const { meta } = volume || {};
                    //         const { id } = meta || {};
                    //         const lastViolationLevel = getLastViolationLevel(id, snapshotHistory);

                    //         addResultForAccount(volume.accountId, lastViolationLevel, data);
                    //     }
                    // });
                    callback(null, data);
                });
            },
        ],
        err => {
            if (err) {
                logMessage(err);
                return cb(err, null);
            }
            cb(null, data);
        });
}

/**
 * Set the result for the account.
 * @param {*} accountid
 * @param {*} result
 * @param {*} data
 */
function addResultForAccount(accountid, result, data) {
    const index = data.findIndex(item => {
        return item.accountId === accountid;
    });

    if (index === -1) {
        return;
    }

    data[index].violationlevel = result;
}

/**
 * Query the database for cluster compliance information.
 * @param {*} configData
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} cb
 */
function queryComplianceClusters(configData, startTime, endTime, cb) {
    const data = [];
    const { clusters = [], volumes = [] } = configData || {};

    if (!configData || !clusters) {
        return cb(null, data);
    }

    // build resulting array of objects
    clusters.forEach(cluster => {
        data.push({
            clusterId: cluster.id,
            name: cluster.name,
            violationlevel: 0,
        });
    });

    const volIds = volumes.map(vol => {
        const { meta } = vol;
        const { id } = meta;
        return id;
    });

    // const snapshotHistory = snapshotServiceHistory(configData.snapshots);

    async.series([
            callback => {
                qComplianceClusters(startTime, endTime, volIds, (err, results) => {
                    if (err) {
                        logMessage(err);
                        return callback(err);
                    }
                    if (results && results.rows) {
                        results.rows.forEach(result => {
                            addResultForCluster(result.clusterid, result.violationlevel, data);
                        });
                    }

                    /**
                     * Go through all volumes.  If no snapshot RPO entry exists and volume is mounted,
                     * we need to generate a status violation.
                     */
                    // configData.volumes.forEach(volume => {
                    //     if (checkVolumeSnapshotsAfterCreated(snapshotHistory, volume)) {
                    //         const { meta } = volume || {};
                    //         const { id } = meta || {};
                    //         const lastViolationLevel = getLastViolationLevel(id, snapshotHistory);

                    //         addResultForCluster(volume.boundClusterId, lastViolationLevel, data);
                    //     }
                    // });
                    callback(null, data);
                });
            },
        ],
        err => {
            if (err) {
                logMessage(err);
                return cb(err, null);
            }
            cb(null, data);
        });
}

/**
 * Add the result for the cluster.
 * @param {*} clusterid
 * @param {*} result
 * @param {*} data
 */
function addResultForCluster(clusterid, result, data) {
    const index = data.findIndex(item => {
        return item.clusterId === clusterid;
    });

    if (index === -1) {
        return;
    }

    data[index].violationlevel = result;
}

/**
 * Query the database for pool compliance information.
 * @param {*} configData
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} cb
 */
function queryCompliancePools(configData, startTime, endTime, cb) {
    const data = [];

    const { pools = [], volumes = [] } = configData || {};

    if (!configData || !pools) {
        return cb(null, data);
    }

    pools.forEach(pool => {
        // authorizedAccountId already normalized to accountId
        data.push({
            serviceplanid: pool.servicePlanId,
            accountid: pool.accountId,
            clusterid: pool.clusterId,
            poolid: pool.poolId,
            name: pool.name,
            violationlevel: 0,
        });
    });

    const volIds = volumes.map(vol => {
        const { meta } = vol;
        const { id } = meta;
        return id;
    });

    // const snapshotHistory = snapshotServiceHistory(configData.snapshots);

    async.series([
            callback => {
                qCompliancePools(startTime, endTime, volIds, (err, results) => {
                    if (err) {
                        logMessage(err);
                        return callback(err);
                    }
                    if (results && results.rows) {
                        results.rows.forEach(result => {
                            addResultForPool(result, data);
                        });
                    }

                    /**
                     * Go through all volumes.  If no snapshot RPO entry exists and volume is mounted,
                     * we need to generate a status violation.
                     */
                    // configData.volumes.forEach(volume => {
                    //     if (checkVolumeSnapshotsAfterCreated(snapshotHistory, volume)) {
                    //         const { meta } = volume || {};
                    //         const { id } = meta || {};
                    //         const lastViolationLevel = getLastViolationLevel(id, snapshotHistory);

                    //         // construct a result that is same format as metrics db query
                    //         const result = {
                    //             serviceplanid: volume.servicePlanId,
                    //             clusterid: volume.boundClusterId,
                    //             accountid: volume.accountId,
                    //             violationlevel: lastViolationLevel,
                    //         };
                    //         addResultForPool(result, data);
                    //     }
                    // });
                    callback(null, data);
                });
            },
        ],
        err => {
            if (err) {
                logMessage(err);
                return cb(err, null);
            }
            cb(null, data);
        });
}

/**
 * Set results for Pool(SPA).  Need to match cluster/SP/account IDs.
 * @param {*} clusterid
 * @param {*} accountid
 * @param {*} serviceplanid
 * @param {*} result
 * @param {*} data
 */

/**
 * Query the database for cluster compliance information.
 * @param {*} configData
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} cb
 */
function queryComplianceVolumesByPeriod(configData, startTime, endTime, volId, cb) {
    const data = [];

    if (!configData || !configData.volumes) {
        return cb(null, data);
    }

    // build resulting array of objects
    configData.volumes.forEach(volume => {
        if (!volId || volume.meta.id === volId) {
            data.push({
                volId: volume.meta.id,
                name: volume.name,
                violationsByPeriod: [],
            });
        }
    });
    async.series([
            callback => {
                qComplianceVolumeByHour(startTime, endTime, volId, (err, results) => {
                    if (err) {
                        logMessage(err);
                        return callback(err);
                    }

                    if (results && results.rows) {
                        results.rows.forEach(result => {
                            addComplianceResultForVolId(result, data);
                        });
                    }

                    callback(null, data);
                });
            },
        ],
        err => {
            if (err) {
                logMessage(err);
                return cb(err, null);
            }
            cb(null, data);
        });
}

function addComplianceResultForVolId(result, data) {
    const { violationlevel: violationLevel, volumeid, ts } = result;
    const index = data.findIndex(item => {
        return item.volId === volumeid;
    });

    if (index === -1) {
        return;
    }

    data[index].violationsByPeriod.push([moment(ts).valueOf(), violationLevel]);
}

/**
 * Query the database for cluster compliance information.
 * @param {*} configData
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} cb
 */
function queryComplianceVolumesByViolationByPeriod(configData, startTime, endTime, volId, cb) {
    const data = [];

    if (!configData || !configData.volumes) {
        return cb(null, data);
    }

    // build resulting array of objects
    configData.volumes.forEach(volume => {
        if (!volId || volume.meta.id === volId) {
            data.push({
                volId: volume.meta.id,
                name: volume.name,
                violationsByPeriod: [],
            });
        }
    });
    async.series([
            callback => {
                qComplianceVolumeByViolationByHour(startTime, endTime, volId, (err, results) => {
                    if (err) {
                        logMessage(err);
                        return callback(err);
                    }

                    if (results && results.rows) {
                        results.rows.forEach(result => {
                            addDetailedComplianceResultForVolId(result, data);
                        });
                    }

                    callback(null);
                });
            },
        ],
        err => {
            if (err) {
                logMessage(err);
                return cb(err, null);
            }
            cb(null, data);
        });
}

function addDetailedComplianceResultForVolId(result, data) {
    const {
        volumeid,
        ts,
        violationlatencymean,
        violationlatencymax,
        violationworkloadrate,
        violationworkloadmixread,
        violationworkloadmixwrite,
        violationworkloadavgsizemin,
        violationworkloadavgsizemax,
    } = result;
    const index = data.findIndex(item => {
        return item.volId === volumeid;
    });

    if (index === -1) {
        return;
    }

    const violations = {
        violationlatencymean,
        violationlatencymax,
        violationworkloadrate,
        violationworkloadmixread,
        violationworkloadmixwrite,
        violationworkloadavgsizemin,
        violationworkloadavgsizemax,
    };
    const violation = {
        timestamp: ts,
        violations,
    };

    data[index].violationsByPeriod.push(violation);
}

/**
 * Retrieve a single volume from the configuration database.
 * @param {string} username
 */
function getVolume(req, res, username) {
    const { query } = req || {};
    const { volId = '' } = query || {};
    return getAllAccountIds(req, res, username).then(() => {
        return request(req, 'get', apiVolumeSeries + `/${volId}`).then(response => {
                const volume = response.data;
                const vols = [];

                vols.push(volume);

                return { data: vols };
            },
            err => {
                logMessage(`Cannot retrieve volume information ${getErrorMessage(err)}`);
                return { err };
            });
    });
}
