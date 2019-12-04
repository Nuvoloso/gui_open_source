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
import { defineMessages } from 'react-intl';

export const dashboardMsgs = defineMessages({
    applicationGroups: {
        id: 'dashboard.applicationGroups',
        defaultMessage: 'Application Groups',
    },
    accounts: {
        id: 'dashboard.accounts',
        defaultMessage: 'Accounts',
    },
    clusters: {
        id: 'dashboard.clusters',
        defaultMessage: 'Clusters',
    },
    servicePlans: {
        id: 'dashboard.servicePlans',
        defaultMessage: 'Pools',
    },
    volumes: {
        id: 'dashboard.volumes',
        defaultMessage: 'Volumes',
    },
    poolsCapacity: {
        id: 'dashboard.poolsCapacity',
        defaultMessage: 'Pool Capacity Levels',
    },
    poolsCapacityOver90: {
        id: 'dashboard.poolsCapacityOver90',
        defaultMessage: 'Over 90%',
    },
    poolsCapacityOver80Below90: {
        id: 'dashboard.poolsCapacityOver80Below90',
        defaultMessage: 'Over 80% Below 90%',
    },
    poolsCapacityOver70Below80: {
        id: 'dashboard.poolsCapacityOver70Below80',
        defaultMessage: 'Over 70% Below 80%',
    },
    poolsCapacityBelow70: {
        id: 'dashboard.poolsCapacityBelow70',
        defaultMessage: 'Below 70%',
    },
    poolsCapacityOver90Tooltip: {
        id: 'dashboard.poolsCapacityOver90Tooltip',
        defaultMessage: 'Count inclusive of 90% capacity',
    },
    poolsCapacityOver80Below90Tooltip: {
        id: 'dashboard.poolsCapacityOver80Below90Tooltip',
        defaultMessage: 'Count inclusive of 80% capacity',
    },
    poolsCapacityOver70Below80Tooltip: {
        id: 'dashboard.poolsCapacityOver70Below80Tooltip',
        defaultMessage: 'Count inclusive of 70% capacity',
    },
});
