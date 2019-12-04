/**
 * Run dependencies for sample metrics.
 */
const db = require('./testDb.js');
const async = require('async');

console.log('running dependencies for metric data');

async.series([
        callback => {
            db.volMount().then(() => {
                callback(null, []);
            });
        },
    ],
    (err, result) => {
        console.log('Operations completed:', result);
    });
