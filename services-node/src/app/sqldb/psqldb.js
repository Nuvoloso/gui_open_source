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

import fs from 'fs';
import { Pool } from 'pg';

var types = require('pg').types;

/**
 * Database client pool/debug.
 */
let psqlPool = null;
const debugMetricsDB = process.env.NUVO_DEBUG_METRICS_DB ? true : false;
function debugMessage(msg) {
    if (debugMetricsDB) {
        logMessage(msg);
    }
}

import async from 'async';
import moment from 'moment';

const DB_USER = 'postgres';
const DB_NAME_METRICS = 'nuvo_metrics';
const POSTGRES_PORT = '5432';
const DB_MAX_THREADS = 100;

import config from '../../config';
import { logMessage } from '../../utils';
import * as constants from '../../constants';

/**
 * Initialize the database as needed.  Connect to Postgres and set
 * up client error handler.
 */
export function initDB(statusCallback) {
    const metricsdbHost = process.env.METRICSDB_HOST ? process.env.METRICSDB_HOST : 'localhost';
    let connecting = true;
    const retryInterval = constants.METRICS_DB_RETRY_INTERVAL;

    /**
     * Set up connection to the pool.  Set client pool to a large
     * number mostly for sample metric loading.  Need to evaluate
     * later under testing load.
     * TODO: Expect this to be locked down at some point.
     */
    psqlPool = new Pool({
        user: DB_USER,
        host: metricsdbHost,
        database: DB_NAME_METRICS,
        port: POSTGRES_PORT,
        max: DB_MAX_THREADS,
        ...(process.env.METRICSDB_USE_SSL && {
            ssl: {
                ca: fs.readFileSync(config.CA_CRT),
                cert: fs.readFileSync(config.CLIENT_CRT),
                key: fs.readFileSync(config.CLIENT_KEY),
                rejectUnauthorized: false, // TBD specify a checkServerIdentity fn
            },
        }),
    });

    /**
     * Force bigint to numeric instead of string.
     */
    types.setTypeParser(20, function(val) {
        return parseInt(val);
    });

    /**
     * Set up periodic ping of database.
     */
    setInterval(() => {
        debugMessage('Periodic ping');
        psqlPool.connect((err, client, done) => {
            done();
            if (err) {
                return logMessage(`Metrics database ping failed: ${err.message} ${err.stack}`);
            }
        });
    }, constants.METRICS_DB_INTERVAL_PING);

    /**
     * Log any issues from the client connection.  Currently a hard
     * exit.
     */
    psqlPool.on('error', err => {
        logMessage(`Unexpected error on idle client for metrics database (${err.code}) ${err.message}`);
        reconnectToDatabase(statusCallback);
    });

    /**
     * Used for debugging connectivity to metrics database.
     */
    psqlPool.on('acquire', () => {
        debugMessage(`Metrics database client acquired (total: ${psqlPool.totalCount} idle: ${psqlPool.idleCount})`);
    });
    psqlPool.on('remove', () => {
        debugMessage(`Metrics database client removed (total: ${psqlPool.totalCount} idle: ${psqlPool.idleCount})`);
    });
    psqlPool.on('connect', () => {
        debugMessage(`Pool connect (total: ${psqlPool.totalCount} idle: ${psqlPool.idleCount})`);
    });
    psqlPool.on('end', () => {
        debugMessage(`Pool end (total: ${psqlPool.totalCount} idle: ${psqlPool.idleCount})`);
    });

    logMessage(`Waiting for metrics database service to be available at ${metricsdbHost}/${POSTGRES_PORT}`);
    connectToDatabase(statusCallback);

    function connectToDatabase(statusCallback) {
        connecting = true;
        async.whilst(() => {
                return connecting;
            },
            callback => {
                connectDB(err => {
                    if (err) {
                        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
                            logMessage(moment().format('LLL'), 'Waiting for database to start and accept connections');
                        } else {
                            logMessage(`Connect attempt to metrics database failed (${err.code}) ${err.message}`);
                        }
                        setTimeout(() => {
                            statusCallback(false);
                            callback(null);
                        }, retryInterval);
                    } else {
                        connecting = false;
                        callback(null);
                    }
                });
            },
            () => {
                logMessage('--> Connected to metrics database');
                statusCallback(true);
            });
    }

    function reconnectToDatabase(statusCallback) {
        /**
         * Multiple threads can be running.  Start the reconnect process once.
         */
        if (connecting) {
            return;
        }
        connectToDatabase(statusCallback);
    }
}

/**
 * Connect to the metrics databases.
 * @param {*} cb
 */
function connectDB(cb) {
    async.series([
            connectedMetrics => {
                psqlPool.connect((err, client, done) => {
                    done();
                    if (err) {
                        return cb(err, null);
                    }
                    connectedMetrics(null, client);
                });
            },
        ],
        (err, result) => {
            cb(err, result);
        });
}

/**
 * Shutdown the database.  end() will wait for any pending queries to complete.
 */
export function closeDB() {
    psqlPool.end().then(() => {
        logMessage('database closed');
    });
}

/**
 * Manage query debugging.
 */
const debugQueries = false;
function debugQuery(query, values, prefix) {
    if (debugQueries) {
        logMessage(prefix ? prefix : '', 'about to execute', query, values);
    }
}

/**
 * Return handle to client pool for the database.
 */
export function dbPool() {
    return psqlPool;
}

/**
 * Query for total number of latency compliance issues by volume in the given time period.
 * @param {*} volId
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} latency
 * @param {*} callback
 */
export function queryTotalComplianceIssues(volId, startTime, endTime, latency, callback) {
    let result = 0;
    const query = `WITH q AS
        (
            SELECT M.VolumeMetadataNum, count(*) AS count
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
            WHERE VM.VolumeID = $1
                AND (
                    M.ViolationLatencyMean > 0 OR
                    M.ViolationLatencyMax > 0 OR
                    M.ViolationWorkloadRate > 0 OR
                    M.ViolationWorkloadMixRead > 0 OR
                    M.ViolationWorkloadMixWrite > 0 OR
                    M.ViolationWorkloadAvgSizeMin > 0 OR
                    M.ViolationWorkloadAvgSizeMax > 0
                )
                AND M.Timestamp >= $2
                AND M.Timestamp <= $3
        GROUP BY M.VolumeMetadataNum
        )
        SELECT q.*
        FROM q JOIN VolumeMetadata1 VM1 ON q.VolumeMetadataNum = VM1.VolumeMetadataNum
        `;
    const values = [volId, startTime, endTime];
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            return callback(err, null);
        }
        if (results) {
            if (results.rowCount > 0) {
                result = results.rows[0].count;
            }
        }
        callback(null, result);
    });
}

/**
 * Get compliance numbers for all volumes in the time range.
 * Results include count and volumeid.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} callback
 */
export function qComplianceAllVolumes(startTime, endTime, callback) {
    const query = `WITH q AS
        (
            SELECT VM.VolumeNum, count(*) AS count
            FROM VolumeMetrics M JOIN VolumeMetadata VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
            WHERE
            (
                    M.ViolationLatencyMean > 0 OR
                    M.ViolationLatencyMax > 0 OR
                    M.ViolationWorkloadRate > 0 OR
                    M.ViolationWorkloadMixRead > 0 OR
                    M.ViolationWorkloadMixWrite > 0 OR
                    M.ViolationWorkloadAvgSizeMin > 0 OR
                    M.ViolationWorkloadAvgSizeMax > 0
                )
            AND M.Timestamp >= $1
            AND M.Timestamp <= $2
        GROUP BY VM.VolumeNum
        )
        SELECT q.*, VO.VolumeID
        FROM q JOIN VolumeObjects VO ON q.VolumeNum = VO.VolumeNum
        `;
    const values = [startTime, endTime];
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Query capacity by period for a resource pool.
 * @param {*} poolId
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} period
 * @param {*} callback
 */
export function queryResourcePoolCapacityByPeriod(poolId, startTime, endTime, period, callback) {
    const query =
        " \
        SELECT \
            time_bucket ('1 day', PM.timestamp) AS TS, \
            AVG(availablebytes)::bigint AS availablebytes, \
            AVG(reservablebytes)::bigint AS reservablebytes, \
            AVG(totalbytes)::bigint AS totalbytes \
        FROM PoolMetrics PM \
        WHERE PM.poolnum = (select PO.poolnum from PoolObjects PO where PO.PoolID = $1) \
        AND PM.timestamp >= $2 and PM.timestamp <= $3 \
        GROUP BY TS ORDER BY TS";

    const values = [poolId, startTime, endTime];

    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Query for total number of latency compliance issues by application group in the given time
 * period.
 * Returns array of {applicationGroup, count} objects.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} callback
 */
export function queryTotalComplianceIssuesGroupAG(startTime, endTime, callback) {
    const query = `
        WITH q AS
        (
            SELECT M.VolumeMetadataNum, COUNT(*) AS count
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM USING (VolumeMetadataNum)
            WHERE
                M.timestamp > $1::timestamptz AND
                M.timestamp < $2::timestamptz AND
                (
                    M.ViolationLatencyMean > 0 OR
                    M.ViolationLatencyMax > 0 OR
                    M.ViolationWorkloadRate > 0 OR
                    M.ViolationWorkloadMixRead > 0 OR
                    M.ViolationWorkloadMixWrite > 0 OR
                    M.ViolationWorkloadAvgSizeMin > 0 OR
                    M.ViolationWorkloadAvgSizeMax > 0
                )
            GROUP BY
                M.VolumeMetadataNum
            )
        SELECT SUM(count)::bigint AS count, ApplicationGroupID
        FROM q
        JOIN AGMember USING (VolumeMetadataNum) JOIN ApplicationGroupObjects USING (ApplicationGroupNum)
        GROUP BY ApplicationGroupID, ApplicationGroupNum;`;
    const values = [startTime, endTime];

    debugQuery(query, '==> compliance by AG');
    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Query for total number of latency compliance issues by consistency group in the given time
 * period.
 * Returns array of {consistencygroup, count} objects.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} callback
 */
export function queryTotalComplianceIssuesGroupCG(startTime, endTime, callback) {
    const query = `
        WITH q AS
        (
            SELECT M.VolumeMetadataNum, COUNT(*) AS count, VM.consistencygroupid
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM USING (VolumeMetadataNum)
            WHERE
                M.timestamp > $1::timestamptz AND
                M.timestamp < $2::timestamptz AND
                (
                    M.ViolationLatencyMean > 0 OR
                    M.ViolationLatencyMax > 0 OR
                    M.ViolationWorkloadRate > 0 OR
                    M.ViolationWorkloadMixRead > 0 OR
                    M.ViolationWorkloadMixWrite > 0 OR
                    M.ViolationWorkloadAvgSizeMin > 0 OR
                    M.ViolationWorkloadAvgSizeMax > 0
                )
            GROUP BY
                M.VolumeMetadataNum, VM.consistencygroupid
        )
        SELECT SUM(count)::bigint AS COUNT, ConsistencyGroupId
        FROM q
        GROUP BY ConsistencyGroupId`;
    const values = [startTime, endTime];

    debugQuery(query, '==> compliance by CG');
    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Query for distinct application groups for the volume in the specified time range.
 * Returns array of application group names in result.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} callback
 */
export function queryAppGroups(startTime, endTime, callback) {
    const query = `
        WITH q AS
        (
            SELECT M.VolumeMetadataNum
            FROM VolumeMetrics M JOIN VolumeMetadata VM USING (VolumeMetadataNum)
            WHERE
                M.timestamp > $1::timestamptz AND
                M.timestamp < $2::timestamptz
        )
        SELECT ApplicationGroupID
        FROM q
        JOIN AGMember USING (VolumeMetadataNum) JOIN ApplicationGroupObjects USING (ApplicationGroupNum)
        GROUP BY ApplicationGroupID, ApplicationGroupNum
        ;`;
    const values = [startTime, endTime];
    debugQuery(query);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Query for distinct consistency groups for the volume in the specified time range.
 * Returns array of consistency group names in result.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} callback
 */
export function queryConsistencyGroups(startTime, endTime, callback) {
    const query = `
        WITH q AS
        (
            SELECT M.VolumeMetadataNum, COUNT(*) AS count, VM.consistencygroupid
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM USING (VolumeMetadataNum)
            WHERE
                M.timestamp > $1::timestamptz AND
                M.timestamp < $2::timestamptz
            GROUP BY
                M.VolumeMetadataNum, VM.consistencygroupid
        )
        SELECT SUM(count)::bigint, ConsistencyGroupId
        FROM q
        GROUP BY ConsistencyGroupId`;
    const values = [startTime, endTime];
    debugQuery(query);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Query severity by period for all service plans.
 * Returns array of {serviceplanid, warning, error} objects.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} callback
 */
export function qSeverityByPeriod(startTime, endTime, callback) {
    const query = `WITH
    q
    AS
    (
        SELECT
            time_bucket ('1 hour', M.timestamp) AS TS,
            VM.serviceplanid,
            COUNT (*) as volumecount,
            COUNT (CASE WHEN
                M.ViolationLatencyMax > 0 OR
                M.ViolationLatencyMean > 0 OR
                M.ViolationWorkloadRate > 0 OR
                M.ViolationWorkloadMixRead > 0 OR
                M.ViolationWorkloadMixWrite > 0 OR
                M.ViolationWorkloadAvgSizeMin > 0 OR
                M.ViolationWorkloadAvgSizeMax > 0 THEN 1 END) as violationsum
        FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
        WHERE
            M.TIMESTAMP >= $1 AND
            M.TIMESTAMP <= $2
        GROUP BY
            TS,
            VM.serviceplanid
        ORDER BY VM.serviceplanid, TS ASC
    )
SELECT
    COUNT(CASE WHEN (100 * q.violationsum / q.volumecount) BETWEEN 6 and 10  THEN 1 END) as warning,
    COUNT(CASE WHEN (100 * q.violationsum / q.volumecount) > 10 THEN 1 END) as error,
    q.serviceplanid
from q
GROUP BY q.serviceplanid;
        `;
    const values = [startTime, endTime];
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Get compliance numbers for all volumes in the time range.
 * Results include count and volumeid.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} callback
 */
export function qComplianceVolumes(startTime, endTime, callback) {
    const query = `
        WITH
            Q
        AS
        (
            SELECT
                time_bucket ('1 hour', M.timestamp) AS TS,
                VM.volumeid as volumeid,
                VM.accountid,
                COUNT(CASE WHEN M.ViolationLatencyMean > 0 THEN 1 END) AS ViolationLatencyMean,
                COUNT(CASE WHEN M.ViolationLatencyMax > 0 THEN 1 END) AS ViolationLatencyMax,
                COUNT(CASE WHEN M.ViolationWorkloadRate > 0 THEN 1 END) AS ViolationWorkloadRate,
                COUNT(CASE WHEN M.ViolationWorkloadMixRead > 0 THEN 1 END) AS ViolationWorkloadMixRead,
                COUNT(CASE WHEN M.ViolationWorkloadMixWrite > 0 THEN 1 END) AS ViolationWorkloadMixWrite,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMin > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMin,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMax > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMax
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
            WHERE
                M.TIMESTAMP >= $1 AND M.TIMESTAMP <= $2
            GROUP BY
                volumeid,
                TS,
                VM.accountid
            ORDER BY  TS ASC
        )
        SELECT
            MAX(CASE WHEN
                ViolationLatencyMean > 6 OR
                ViolationLatencyMax > 6 OR
                ViolationWorkloadRate > 6 OR
                ViolationWorkloadMixRead > 6 OR
                ViolationWorkloadMixWrite > 6 OR
                ViolationWorkloadAvgSizeMin > 6 OR
                ViolationWorkloadAvgSizeMax > 6 THEN 2
            WHEN
                ViolationLatencyMean > 3 OR
                ViolationLatencyMax > 3 OR
                ViolationWorkloadRate > 3 OR
                ViolationWorkloadMixRead > 3 OR
                ViolationWorkloadMixWrite > 3 OR
                ViolationWorkloadAvgSizeMin > 3 OR
                ViolationWorkloadAvgSizeMax > 3 THEN 1
            ELSE
                0
            END) AS violationlevel,
            q.volumeid
        FROM
            q
        GROUP BY
            q.volumeid
        `;
    const values = [startTime, endTime];
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Generate string to use in queries for a limited number of volume ids.
 * @param {*} volIds
 */
function genVolidStr(volIds) {
    let volIdStr = '';

    if (volIds && Array.isArray(volIds) && volIds.length > 0) {
        volIdStr += `AND VM.volumeid IN (`;
        volIds.forEach((volId, idx) => {
            volIdStr += `'${volId}'`;
            if (idx < volIds.length - 1) {
                volIdStr += ',';
            }
        });
        volIdStr += `) `;
    }

    return volIdStr;
}

export function qComplianceApplicationGroups(startTime, endTime, volIds, callback) {
    const volIdStr = genVolidStr(volIds);

    const query = `
        WITH
            Q
        AS
        (
            SELECT
                volumeid,
                time_bucket ('1 hour', M.timestamp) AS TS,
                COUNT(CASE WHEN M.ViolationLatencyMean > 0 THEN 1 END) AS ViolationLatencyMean,
                COUNT(CASE WHEN M.ViolationLatencyMax > 0 THEN 1 END) AS ViolationLatencyMax,
                COUNT(CASE WHEN M.ViolationWorkloadRate > 0 THEN 1 END) AS ViolationWorkloadRate,
                COUNT(CASE WHEN M.ViolationWorkloadMixRead > 0 THEN 1 END) AS ViolationWorkloadMixRead,
                COUNT(CASE WHEN M.ViolationWorkloadMixWrite > 0 THEN 1 END) AS ViolationWorkloadMixWrite,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMin > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMin,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMax > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMax
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
            WHERE
                M.TIMESTAMP >= $1 AND M.TIMESTAMP <= $2
                ${volIdStr}
            GROUP BY
                volumeid,
                TS
            ORDER BY  TS ASC
        )
        SELECT
            MAX(CASE WHEN
                ViolationLatencyMean > 6 OR
                ViolationLatencyMax > 6 OR
                ViolationWorkloadRate > 6 OR
                ViolationWorkloadMixRead > 6 OR
                ViolationWorkloadMixWrite > 6 OR
                ViolationWorkloadAvgSizeMin > 6 OR
                ViolationWorkloadAvgSizeMax > 6 THEN 2
            WHEN
                ViolationLatencyMean > 3 OR
                ViolationLatencyMax > 3 OR
                ViolationWorkloadRate > 3 OR
                ViolationWorkloadMixRead > 3 OR
                ViolationWorkloadMixWrite > 3 OR
                ViolationWorkloadAvgSizeMin > 3 OR
                ViolationWorkloadAvgSizeMax > 3 THEN 1
            ELSE
                0
            END) AS violationlevel,
            ApplicationGroupObjects.applicationgroupid as applicationgroupid
        FROM
            q
            JOIN volumemetadata1 VM2 ON q.volumeid = VM2.volumeid
            JOIN AGMember USING (VolumeMetadataNum)
            JOIN ApplicationGroupObjects USING (ApplicationGroupNum)
        GROUP BY
            applicationgroupid
        `;
    const values = [startTime, endTime];
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

export function qComplianceAccounts(startTime, endTime, volIds, callback) {
    const volIdStr = genVolidStr(volIds);

    const query = `
        WITH
            Q
        AS
        (
            SELECT
                time_bucket ('1 hour', M.timestamp) AS TS,
                VM.accountid,
                VM.volumeid as volumeid,
                COUNT(CASE WHEN M.ViolationLatencyMean > 0 THEN 1 END) AS ViolationLatencyMean,
                COUNT(CASE WHEN M.ViolationLatencyMax > 0 THEN 1 END) AS ViolationLatencyMax,
                COUNT(CASE WHEN M.ViolationWorkloadRate > 0 THEN 1 END) AS ViolationWorkloadRate,
                COUNT(CASE WHEN M.ViolationWorkloadMixRead > 0 THEN 1 END) AS ViolationWorkloadMixRead,
                COUNT(CASE WHEN M.ViolationWorkloadMixWrite > 0 THEN 1 END) AS ViolationWorkloadMixWrite,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMin > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMin,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMax > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMax
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
            WHERE
                M.TIMESTAMP >= $1 AND M.TIMESTAMP <= $2
                ${volIdStr}
            GROUP BY
                TS,
                volumeid,
                VM.accountid
            ORDER BY  TS ASC
        )
        SELECT
            MAX(CASE WHEN
                ViolationLatencyMean > 6 OR
                ViolationLatencyMax > 6 OR
                ViolationWorkloadRate > 6 OR
                ViolationWorkloadMixRead > 6 OR
                ViolationWorkloadMixWrite > 6 OR
                ViolationWorkloadAvgSizeMin > 6 OR
                ViolationWorkloadAvgSizeMax > 6 THEN 2
            WHEN
                ViolationLatencyMean > 3 OR
                ViolationLatencyMax > 3 OR
                ViolationWorkloadRate > 3 OR
                ViolationWorkloadMixRead > 3 OR
                ViolationWorkloadMixWrite > 3 OR
                ViolationWorkloadAvgSizeMin > 3 OR
                ViolationWorkloadAvgSizeMax > 3 THEN 1
            ELSE
                0
            END) AS violationlevel,
            accountid
        FROM
            q
        GROUP BY
            accountid
        `;
    const values = [startTime, endTime];
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

export function qComplianceClusters(startTime, endTime, volIds, callback) {
    const volIdStr = genVolidStr(volIds);

    const query = `
        WITH
            Q
        AS
        (
            SELECT
                time_bucket ('1 hour', M.timestamp) AS TS,
                VM.clusterid as clusterid,
                VM.volumeid as volumeid,
                COUNT(CASE WHEN M.ViolationLatencyMean > 0 THEN 1 END) AS ViolationLatencyMean,
                COUNT(CASE WHEN M.ViolationLatencyMax > 0 THEN 1 END) AS ViolationLatencyMax,
                COUNT(CASE WHEN M.ViolationWorkloadRate > 0 THEN 1 END) AS ViolationWorkloadRate,
                COUNT(CASE WHEN M.ViolationWorkloadMixRead > 0 THEN 1 END) AS ViolationWorkloadMixRead,
                COUNT(CASE WHEN M.ViolationWorkloadMixWrite > 0 THEN 1 END) AS ViolationWorkloadMixWrite,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMin > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMin,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMax > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMax
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
            WHERE
                M.TIMESTAMP >= $1 AND M.TIMESTAMP <= $2
                ${volIdStr}
            GROUP BY
                TS,
                volumeid,
                clusterid
            ORDER BY  TS ASC
        )
        SELECT
            MAX(CASE WHEN
                ViolationLatencyMean > 6 OR
                ViolationLatencyMax > 6 OR
                ViolationWorkloadRate > 6 OR
                ViolationWorkloadMixRead > 6 OR
                ViolationWorkloadMixWrite > 6 OR
                ViolationWorkloadAvgSizeMin > 6 OR
                ViolationWorkloadAvgSizeMax > 6 THEN 2
            WHEN
                ViolationLatencyMean > 3 OR
                ViolationLatencyMax > 3 OR
                ViolationWorkloadRate > 3 OR
                ViolationWorkloadMixRead > 3 OR
                ViolationWorkloadMixWrite > 3 OR
                ViolationWorkloadAvgSizeMin > 3 OR
                ViolationWorkloadAvgSizeMax > 3 THEN 1
            ELSE
                0
            END) AS violationlevel,
            clusterid
        FROM
            q
        GROUP BY
            clusterid
            `;
    const values = [startTime, endTime];
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

export function qCompliancePools(startTime, endTime, volIds, callback) {
    const volIdStr = genVolidStr(volIds);

    const query = `
        WITH
            Q
        AS
        (
            SELECT
                time_bucket ('1 hour', M.timestamp) AS TS,
                VM.serviceplanid as serviceplanid,
                VM.accountid as accountid,
                VM.clusterid as clusterid,
                VM.volumeid as volumeid,
                COUNT(CASE WHEN M.ViolationLatencyMean > 0 THEN 1 END) AS ViolationLatencyMean,
                COUNT(CASE WHEN M.ViolationLatencyMax > 0 THEN 1 END) AS ViolationLatencyMax,
                COUNT(CASE WHEN M.ViolationWorkloadRate > 0 THEN 1 END) AS ViolationWorkloadRate,
                COUNT(CASE WHEN M.ViolationWorkloadMixRead > 0 THEN 1 END) AS ViolationWorkloadMixRead,
                COUNT(CASE WHEN M.ViolationWorkloadMixWrite > 0 THEN 1 END) AS ViolationWorkloadMixWrite,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMin > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMin,
                COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMax > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMax
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
            WHERE
                M.TIMESTAMP >= $1 AND
                M.TIMESTAMP <= $2
                ${volIdStr}
            GROUP BY
                TS,
                volumeid, serviceplanid, accountid, clusterid
            ORDER BY  TS DESC
        )
        SELECT
            MAX(CASE WHEN
                ViolationLatencyMean > 6 OR
                ViolationLatencyMax > 6 OR
                ViolationWorkloadRate > 6 OR
                ViolationWorkloadMixRead > 6 OR
                ViolationWorkloadMixWrite > 6 OR
                ViolationWorkloadAvgSizeMin > 6 OR
                ViolationWorkloadAvgSizeMax > 6 THEN 2
            WHEN
                ViolationLatencyMean > 3 OR
                ViolationLatencyMax > 3 OR
                ViolationWorkloadRate > 3 OR
                ViolationWorkloadMixRead > 3 OR
                ViolationWorkloadMixWrite > 3 OR
                ViolationWorkloadAvgSizeMin > 3 OR
                ViolationWorkloadAvgSizeMax > 3 THEN 1
            ELSE
                0
            END) AS violationlevel,
            serviceplanid,
            accountid,
            clusterid
        FROM
            q
        GROUP BY
            serviceplanid, accountid, clusterid
        `;
    const values = [startTime, endTime];
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

export function qComplianceVolumeByHour(startTime, endTime, volId, callback) {
    const volQueryStr = volId ? 'AND VM.volumeid = $3' : '';
    const query = `
        WITH
            Q
            AS
            (
                SELECT
                    time_bucket ('1 hour', M.timestamp) AS TS,
                    VM.volumeid as volumeid,
                    VM.accountid,
                    COUNT(CASE WHEN M.ViolationLatencyMean > 0 THEN 1 END) AS ViolationLatencyMean,
                    COUNT(CASE WHEN M.ViolationLatencyMax > 0 THEN 1 END) AS ViolationLatencyMax,
                    COUNT(CASE WHEN M.ViolationWorkloadRate > 0 THEN 1 END) AS ViolationWorkloadRate,
                    COUNT(CASE WHEN M.ViolationWorkloadMixRead > 0 THEN 1 END) AS ViolationWorkloadMixRead,
                    COUNT(CASE WHEN M.ViolationWorkloadMixWrite > 0 THEN 1 END) AS ViolationWorkloadMixWrite,
                    COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMin > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMin,
                    COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMax > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMax
                FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
                WHERE
                    M.TIMESTAMP >= $1 AND
                    M.TIMESTAMP <= $2
                    ${volQueryStr}
                GROUP BY
                    volumeid,
                    TS,
                    VM.accountid
                ORDER BY  TS ASC
            )
        SELECT
            MAX(CASE WHEN
                ViolationLatencyMean > 6 OR
                ViolationLatencyMax > 6 OR
                ViolationWorkloadRate > 6 OR
                ViolationWorkloadMixRead > 6 OR
                ViolationWorkloadMixWrite > 6 OR
                ViolationWorkloadAvgSizeMin > 6 OR
                ViolationWorkloadAvgSizeMax > 6 THEN 2
            WHEN
                ViolationLatencyMean > 3 OR
                ViolationLatencyMax > 3 OR
                ViolationWorkloadRate > 3 OR
                ViolationWorkloadMixRead > 3 OR
                ViolationWorkloadMixWrite > 3 OR
                ViolationWorkloadAvgSizeMin > 3 OR
                ViolationWorkloadAvgSizeMax > 3 THEN 1
            ELSE
                0
            END)
            AS
                violationLevel,
                q.volumeid,
                q.ts
        FROM
            q
        GROUP BY
            q.volumeid,
            q.TS
        ORDER BY
            TS ASC
                `;
    const values = [startTime, endTime];
    if (volId) {
        values.push(volId);
    }
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Query for compliance issues and changes.
 * Return results by time bucket by compliance violation level.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} volId (optional)
 * @param {*} callback
 */
export function qComplianceVolumeByViolationByHour(startTime, endTime, volId, callback) {
    const volQueryStr = volId ? 'AND VM.volumeid = $3' : '';
    const query = `
        WITH
            Q
            AS
            (
                SELECT
                    time_bucket ('1 hour', M.timestamp) AS TS,
                    VM.volumeid as volumeid,
                    VM.accountid,
                    COUNT(CASE WHEN M.ViolationLatencyMean > 0 THEN 1 END) AS ViolationLatencyMean,
                    COUNT(CASE WHEN M.ViolationLatencyMax > 0 THEN 1 END) AS ViolationLatencyMax,
                    COUNT(CASE WHEN M.ViolationWorkloadRate > 0 THEN 1 END) AS ViolationWorkloadRate,
                    COUNT(CASE WHEN M.ViolationWorkloadMixRead > 0 THEN 1 END) AS ViolationWorkloadMixRead,
                    COUNT(CASE WHEN M.ViolationWorkloadMixWrite > 0 THEN 1 END) AS ViolationWorkloadMixWrite,
                    COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMin > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMin,
                    COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMax > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMax
                FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
                WHERE
                    M.TIMESTAMP >= $1 AND M.TIMESTAMP <= $2
                    ${volQueryStr}
                GROUP BY
                    volumeid,
                    TS,
                    VM.accountid
                ORDER BY  TS ASC
            )
        SELECT
            q.volumeid,
            q.ts,
            MAX(CASE WHEN
                ViolationLatencyMean > 6 THEN 2
            WHEN
                ViolationLatencyMean > 3 THEN 1
            ELSE
                0
            END) AS ${constants.VIOLATION_LATENCY_MEAN},
                MAX(CASE WHEN
                ViolationLatencyMax > 6 THEN 2
            WHEN
                ViolationLatencyMax > 3 THEN 1
            ELSE
                0
            END) AS ${constants.VIOLATION_LATENCY_MAX},
                MAX(CASE WHEN
                ViolationWorkloadRate > 6 THEN 2
            WHEN
                ViolationWorkloadRate > 3 THEN 1
            ELSE
                0
            END) AS ${constants.VIOLATION_WORKLOAD_RATE},
                MAX(CASE WHEN
                ViolationWorkloadMixRead > 6 THEN 2
            WHEN
                ViolationWorkloadMixRead > 3 THEN 1
            ELSE
                0
            END) AS ${constants.VIOLATION_WORKLOAD_MIXREAD},
                MAX(CASE WHEN
                ViolationWorkloadMixWrite > 6 THEN 2
            WHEN
                ViolationWorkloadMixWrite > 3 THEN 1
            ELSE
                0
            END) AS ${constants.VIOLATION_WORKLOAD_MIXWRITE},
                MAX(CASE WHEN
                ViolationWorkloadAvgSizeMin > 6 THEN 2
            WHEN
                ViolationWorkloadAvgSizeMin > 3 THEN 1
            ELSE
                0
            END) AS ${constants.VIOLATION_WORKLOAD_AVG_SIZE_MIN},
                MAX(CASE WHEN
                ViolationWorkloadAvgSizeMax > 6 THEN 2
            WHEN
                ViolationWorkloadAvgSizeMax > 3 THEN 1
            ELSE
                0
            END) AS ${constants.VIOLATION_WORKLOAD_AVG_SIZE_MAX}
        FROM
            q
        GROUP BY
            q.volumeid,
            TS
        ORDER BY
            TS ASC
        `;
    const values = [startTime, endTime];
    if (volId) {
        values.push(volId);
    }
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Query for compliance issues and changes.
 * Return results by time bucket by compliance violation level.
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} volId (optional)
 * @param {*} callback
 */
export function qComplianceVolumeByViolation(startTime, endTime, volId, callback) {
    const volQueryStr = volId ? 'AND VM.volumeid = $3' : '';
    const query = `
        SELECT
            M.timestamp AS TS,
            VM.volumeid as volumeid,
            VM.accountid,
            COUNT(CASE WHEN M.ViolationLatencyMean > 0 THEN 1 END) AS ViolationLatencyMean,
            COUNT(CASE WHEN M.ViolationLatencyMax > 0 THEN 1 END) AS ViolationLatencyMax,
            COUNT(CASE WHEN M.ViolationWorkloadRate > 0 THEN 1 END) AS ViolationWorkloadRate,
            COUNT(CASE WHEN M.ViolationWorkloadMixRead > 0 THEN 1 END) AS ViolationWorkloadMixRead,
            COUNT(CASE WHEN M.ViolationWorkloadMixWrite > 0 THEN 1 END) AS ViolationWorkloadMixWrite,
            COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMin > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMin,
            COUNT(CASE WHEN M.ViolationWorkloadAvgSizeMax > 0 THEN 1 END) AS ViolationWorkloadAvgSizeMax
        FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.VolumeMetadataNum = VM.VolumeMetadataNum
        WHERE
            M.TIMESTAMP >= $1 AND M.TIMESTAMP <= $2
            ${volQueryStr}
        GROUP BY
            volumeid,
            TS,
            VM.accountid
        ORDER BY  TS ASC
        `;
    const values = [startTime, endTime];
    if (volId) {
        values.push(volId);
    }
    debugQuery(query, values);

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}
