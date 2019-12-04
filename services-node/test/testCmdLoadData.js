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
 * Initialize and load the database with sample metrics.
 */
const db = require('./testDb.js');
const async = require('async');

console.log('loading metric data');

async.series([
        callback => {
            db.initDB().then(() => {
                callback(null, []);
            });
        },
        callback => {
            console.log('creating metadata');
            db.createMetadata(callback);
        },
        callback => {
            console.log('loading metric data');
            db.loadMetricData(callback);
        },
        callback => {
            console.log('closing down database');
            db.closeDB(callback);
        },
    ],
    (err, result) => {
        console.log('Database operations completed:', result);
    });
