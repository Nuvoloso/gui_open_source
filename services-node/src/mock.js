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
 * generate a random whole number in the specified range
 * @param {number} min Minimum of range.
 * @param {number} max Maximum of range
 * @return {number} Random number in the range.
 */
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * generate random mock data for highcharts
 * @param {number} count Number of datapoints
 * @param {number} min Minimum of range
 * @param {number} max Maximum of range
 * @param {boolean} down Values trend downward
 * @return {array} Array of random numbers in the range
 */
function getRandomChartData(count, min = 0, max = 100, down = false) {
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

module.exports = {
    slos: [
        {
            accountId: 'acct-1',
            meta: {
                id: 'slo-1',
                objType: 'slo',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            name: 'Marketing DB Data',
            description: 'TBD',
            properties: [
                {
                    name: 'description',
                    value: 'marketing db data',
                },
                {
                    name: 'SLOType',
                    value: 'OLTP Data',
                },
                {
                    name: 'variance',
                    value: '1',
                },
                {
                    name: 'snapInterval',
                    value: '1h',
                },
                {
                    name: 'snapLifetime',
                    value: '3mo',
                },
                {
                    name: 'snapCount',
                    value: '1000',
                },
                {
                    name: 'residency',
                    value: 'DC-1',
                },
            ],
        },
        {
            name: 'Marketing DB Logs',
            type: 'OLTP Logs',
            description: 'database log data',
            meta: {
                id: 'slo-2',
                objType: 'slo',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            properties: [
                {
                    name: 'description',
                    value: 'marketing db logs',
                },
                {
                    name: 'SLOType',
                    value: 'OLTP Logs',
                },
                {
                    name: 'variance',
                    value: '2',
                },
                {
                    name: 'snapInterval',
                    value: '1h',
                },
                {
                    name: 'snapLifetime',
                    value: '3mo',
                },
                {
                    name: 'snapCount',
                    value: '1000',
                },
                {
                    name: 'residency',
                    value: 'DC-1',
                },
            ],
        },
        {
            name: 'Marketing Web Server',
            type: 'Web Server',
            description: 'web server data',
            meta: {
                id: 'slo-3',
                objType: 'slo',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            properties: [
                {
                    name: 'description',
                    value: 'web server data',
                },
                {
                    name: 'SLOType',
                    value: 'Web Server',
                },
                {
                    name: 'variance',
                    value: '2',
                },
                {
                    name: 'snapInterval',
                    value: '1h',
                },
                {
                    name: 'snapLifetime',
                    value: '3mo',
                },
                {
                    name: 'snapCount',
                    value: '1000',
                },
                {
                    name: 'residency',
                    value: 'DC-1',
                },
            ],
        },
        {
            name: 'Gold',
            type: 'Gold',
            description: 'Very shiny',
            meta: {
                id: 'slo-4',
                objType: 'slo',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            properties: [
                {
                    name: 'description',
                    value: 'very shiny',
                },
                {
                    name: 'SLOType',
                    value: 'Gold',
                },
                {
                    name: 'variance',
                    value: '2',
                },
                {
                    name: 'snapInterval',
                    value: '1h',
                },
                {
                    name: 'snapLifetime',
                    value: '1mo',
                },
                {
                    name: 'snapCount',
                    value: '50',
                },
                {
                    name: 'residency',
                    value: 'DC-1',
                },
            ],
        },
        {
            name: 'Silver',
            type: 'Silver',
            description: 'Slightly tarnished',
            meta: {
                id: 'slo-5',
                objType: 'slo',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            properties: [
                {
                    name: 'description',
                    value: 'slightly tarnished',
                },
                {
                    name: 'SLOType',
                    value: 'Silver',
                },
                {
                    name: 'variance',
                    value: '2',
                },
                {
                    name: 'snapInterval',
                    value: '1h',
                },
                {
                    name: 'snapLifetime',
                    value: '1mo',
                },
                {
                    name: 'snapCount',
                    value: '50',
                },
                {
                    name: 'residency',
                    value: 'DC-1',
                },
            ],
        },
        {
            name: 'Tin',
            type: 'Tin',
            description: 'Rather tinny',
            meta: {
                id: 'slo-6',
                objType: 'slo',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            properties: [
                {
                    name: 'description',
                    value: 'rather tinny',
                },
                {
                    name: 'SLOType',
                    value: 'Tin',
                },
                {
                    name: 'variance',
                    value: '2',
                },
                {
                    name: 'snapInterval',
                    value: '1h',
                },
                {
                    name: 'snapLifetime',
                    value: '1mo',
                },
                {
                    name: 'snapCount',
                    value: '50',
                },
                {
                    name: 'residency',
                    value: 'DC-1',
                },
            ],
        },
        {
            name: 'DB Data',
            type: 'OLTP Data',
            description: 'database data',
            meta: {
                id: 'slo-7',
                objType: 'slo',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            properties: [
                {
                    name: 'description',
                    value: 'db data',
                },
                {
                    name: 'SLOType',
                    value: 'DB Data',
                },
                {
                    name: 'variance',
                    value: '5',
                },
                {
                    name: 'snapInterval',
                    value: '4h',
                },
                {
                    name: 'snapLifetime',
                    value: '2w',
                },
                {
                    name: 'snapCount',
                    value: '60',
                },
                {
                    name: 'residency',
                    value: 'DC-1',
                },
            ],
        },
        {
            name: 'DB Logs',
            type: 'OLTP Logs',
            description: 'database log data',
            meta: {
                id: 'slo-8',
                objType: 'slo',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            properties: [
                {
                    name: 'description',
                    value: 'database logs',
                },
                {
                    name: 'SLOType',
                    value: 'DB Logs',
                },
                {
                    name: 'variance',
                    value: '3',
                },
                {
                    name: 'snapInterval',
                    value: '4h',
                },
                {
                    name: 'snapLifetime',
                    value: '2w',
                },
                {
                    name: 'snapCount',
                    value: '60',
                },
                {
                    name: 'residency',
                    value: 'DC-1',
                },
            ],
        },
        {
            name: 'Application',
            type: 'Application',
            description: 'web server data',
            meta: {
                id: 'slo-9',
                objType: 'slo',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            properties: [
                {
                    name: 'description',
                    value: 'application data',
                },
                {
                    name: 'SLOType',
                    value: 'Application',
                },
                {
                    name: 'variance',
                    value: '20',
                },
                {
                    name: 'snapInterval',
                    value: '1d',
                },
                {
                    name: 'snapLifetime',
                    value: '1w',
                },
                {
                    name: 'snapCount',
                    value: '10',
                },
                {
                    name: 'residency',
                    value: 'DC-1',
                },
            ],
        },
    ],
    sloSummaries: [
        {
            accountId: 'acct-1',
            meta: {
                id: 'slosummary-1',
                objType: 'slosummary',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            description: 'TBD',
            name: 'Marketing DB Data',
            properties: [
                {
                    name: 'numVolumes',
                    value: '23',
                },
                {
                    name: 'allocated',
                    value: 89,
                },
                {
                    name: 'provisioned',
                    value: '180',
                },
            ],
            tags: [
                {
                    name: 'string',
                    value: 'string',
                },
            ],
        },
        {
            accountId: 'acct-1',
            meta: {
                id: 'slosummary-2',
                objType: 'slosummary',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            description: 'TBD',
            name: 'Marketing DB Logs',
            properties: [
                {
                    name: 'numVolumes',
                    value: '12',
                },
                {
                    name: 'allocated',
                    value: 42,
                },
                {
                    name: 'provisioned',
                    value: '90',
                },
            ],
            tags: [
                {
                    name: 'string',
                    value: 'string',
                },
            ],
        },
        {
            accountId: 'acct-1',
            meta: {
                id: 'slosummary-3',
                objType: 'slosummary',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            description: 'TBD',
            name: 'Marketing Web Server',
            properties: [
                {
                    name: 'numVolumes',
                    value: '52',
                },
                {
                    name: 'allocated',
                    value: 17,
                },
                {
                    name: 'provisioned',
                    value: '80',
                },
            ],
            tags: [
                {
                    name: 'string',
                    value: 'string',
                },
            ],
        },
        {
            accountId: 'acct-1',
            meta: {
                id: 'slosummary-4',
                objType: 'slosummary',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            description: 'TBD',
            name: 'DB Data',
            properties: [
                {
                    name: 'numVolumes',
                    value: getRandomIntInclusive(1, 50),
                },
                {
                    name: 'allocated',
                    value: getRandomIntInclusive(1, 100),
                },
                {
                    name: 'provisioned',
                    value: getRandomIntInclusive(100, 300),
                },
            ],
            tags: [
                {
                    name: 'string',
                    value: 'string',
                },
            ],
        },
        {
            accountId: 'acct-1',
            meta: {
                id: 'slosummary-5',
                objType: 'slosummary',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            description: 'TBD',
            name: 'DB Logs',
            properties: [
                {
                    name: 'numVolumes',
                    value: getRandomIntInclusive(1, 50),
                },
                {
                    name: 'allocated',
                    value: getRandomIntInclusive(1, 100),
                },
                {
                    name: 'provisioned',
                    value: getRandomIntInclusive(100, 300),
                },
            ],
            tags: [
                {
                    name: 'string',
                    value: 'string',
                },
            ],
        },
        {
            accountId: 'acct-1',
            meta: {
                id: 'slosummary-6',
                objType: 'slosummary',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            description: 'TBD',
            name: 'Application',
            properties: [
                {
                    name: 'numVolumes',
                    value: getRandomIntInclusive(1, 50),
                },
                {
                    name: 'allocated',
                    value: getRandomIntInclusive(1, 100),
                },
                {
                    name: 'provisioned',
                    value: getRandomIntInclusive(100, 300),
                },
            ],
            tags: [
                {
                    name: 'string',
                    value: 'string',
                },
            ],
        },
        {
            accountId: 'acct-1',
            meta: {
                id: 'slosummary-7',
                objType: 'slosummary',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            description: 'TBD',
            name: 'Gold',
            properties: [
                {
                    name: 'numVolumes',
                    value: 0,
                },
                {
                    name: 'allocated',
                    value: 0,
                },
                {
                    name: 'provisioned',
                    value: 0,
                },
            ],
            tags: [
                {
                    name: 'string',
                    value: 'string',
                },
            ],
        },
        {
            accountId: 'acct-1',
            meta: {
                id: 'slosummary-8',
                objType: 'slosummary',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            description: 'TBD',
            name: 'Silver',
            properties: [
                {
                    name: 'numVolumes',
                    value: 0,
                },
                {
                    name: 'allocated',
                    value: 0,
                },
                {
                    name: 'provisioned',
                    value: 0,
                },
            ],
            tags: [
                {
                    name: 'string',
                    value: 'string',
                },
            ],
        },
        {
            accountId: 'acct-1',
            meta: {
                id: 'slosummary-9',
                objType: 'slosummary',
                timeCreated: '2017-09-07T22:23:14Z',
                timeModified: '2017-09-07T22:23:14Z',
            },
            description: 'TBD',
            name: 'Tin',
            properties: [
                {
                    name: 'numVolumes',
                    value: 0,
                },
                {
                    name: 'allocated',
                    value: 0,
                },
                {
                    name: 'provisioned',
                    value: 0,
                },
            ],
            tags: [
                {
                    name: 'string',
                    value: 'string',
                },
            ],
        },
    ],
    volumes: [],
    getRandomChartData,
};
