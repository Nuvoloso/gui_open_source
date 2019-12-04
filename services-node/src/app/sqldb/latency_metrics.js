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
import { dbPool } from './psqldb';

import { bucketSize } from './utils_metric_routes';
import { logMessage } from '../../utils';

/**
 * Query volume metrics with timestmaps.
 * @param {string} startTime
 * @param {string} endTime
 * @param {string} volId
 * @param {function} callback
 */
export function qVolumeMetrics(startTime, endTime, volId, callback) {
    const psqlPool = dbPool();

    /**
     * Need to divide by sampleduration for sampled fields.
     *
     * Columns pulled from static references should not be divided by sampleduration.
     * - responsetimeaverage
     * - responsetimemax
     *
     * Some metrics are reported in MB/sec
     * - maxthroughput
     * - costthroughput
     */
    const query = `WITH Q AS
        (
            SELECT
                time_bucket($1, M.timestamp) AS data_timestamp,
                VM.VolumeNum,
                VM.ServicePlanId,
                AVG(M.latencyMean)::int AS latencymean,
                AVG(M.latencyMax)::int  AS latencymax,
                AVG(M.NumberReads + M.NumberWrites)::int AS iops,
                AVG((M.BytesRead + M.BytesWritten) / 1000/1000)::int AS throughput,
                AVG(VM.totalbytes)::bigint AS totalbytes,
                AVG(VM.costbytes)::bigint AS costbytes,
                AVG(M.numberreads)::bigint AS numberreads,
                AVG(M.numberwrites)::bigint AS numberwrites,
                AVG(M.bytesread)::bigint as bytesread,
                AVG(M.byteswritten)::bigint as byteswritten,
                AVG(sampleduration)::bigint as sampleduration
            FROM VolumeMetrics M JOIN VolumeMetadata1 VM ON M.volumemetadatanum = VM.volumemetadatanum
            WHERE
                M.Timestamp >= $2
                AND M.Timestamp <= $3
                AND VM.VolumeID = $4
            GROUP BY VM.VolumeNum, data_timestamp, VM.ServicePlanId
                ORDER BY data_timestamp ASC
        )
        SELECT
            data_timestamp, 
            latencymean,
            latencymax,
            responsetimeaverage as responsetimeaverage,
            responsetimemax as responsetimemax,
            iops / sampleduration as iops,
            throughput / sampleduration as throughput,
            IOPSPerGiB,
            BytesPerSecPerGiB,
            iops / sampleduration as iopspersec,
            IOPSPerGiB * (totalbytes / 1024/1024/1024) as maxiops,
            IOPSPerGiB * ((totalbytes + costbytes) / 1024/1024/1024) as costiops,
            BytesPerSecPerGiB * (totalbytes / 1024/1024/1024) / 1000/1000 as maxthroughput,
            BytesPerSecPerGiB * ((totalbytes + costbytes) / 1024/1024/1024) / 1000/1000 as costthroughput,
            numberreads,
            numberwrites,
            ((bytesread + byteswritten)  ) / NULLIF(numberreads + numberwrites, 0) as blocksize,
            minavgsizebytes,
            maxavgsizebytes
        FROM q
        JOIN VolumeObjects VO ON q.VolumeNum = VO.VolumeNum
        JOIN ServicePlanData1 SPD1 ON q.ServicePlanID = SPD1.serviceplanid
        ORDER BY data_timestamp ASC
        `;

    const values = [bucketSize(startTime, endTime), startTime, endTime, volId];
    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

/**
 * Query storage metrics with timestamps.
 * @param {string} startTime
 * @param {string} endTime
 * @param {string} storageId
 * @param {function} callback
 */
export function qStorageMetrics(startTime, endTime, storageId, callback) {
    const psqlPool = dbPool();

    const query = `WITH Q AS
        (
            SELECT
                time_bucket($1, M.timestamp) as data_timestamp,
                SM.StorageNum,
                AVG(M.LatencyMean)::int as latencymean,
                AVG(M.LatencyMax)::int  as latencymax
            FROM StorageMetrics M JOIN StorageMetadata1 SM ON M.storagemetadatanum = SM.storagemetadatanum
            WHERE
                M.Timestamp >= $2
                AND M.Timestamp <= $3
                AND SM.StorageID = $4
            GROUP BY SM.StorageNum, data_timestamp
            ORDER BY data_timestamp ASC
        )
        SELECT data_timestamp, latencymean, latencymax
        FROM q
        JOIN StorageObjects SO ON q.StorageNum = SO.StorageNum
        ORDER BY data_timestamp ASC
        `;

    const values = [bucketSize(startTime, endTime), startTime, endTime, storageId];

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}

export function qCapacityMetrics(startTime, endTime, volId, callback) {
    const psqlPool = dbPool();
    const query =
        'SELECT VM.timestamp, VM.VolumeNum, VM.bytesallocated, VM.totalbytes \
        FROM VolumeMetadata1 VM \
        WHERE VM.VolumeID = $3  \
            AND VM.Timestamp >= $1 \
            AND VM.Timestamp <= $2 \
            AND VM.totalbytes > 0 \
        ORDER BY VM.timestamp ASC';

    const values = [startTime, endTime, volId];

    psqlPool.query(query, values, (err, results) => {
        if (err) {
            logMessage(err);
            return callback(err, null);
        }
        callback(null, results);
    });
}
