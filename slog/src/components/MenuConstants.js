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

import { CloudQueue, Group, Settings, SettingsBackupRestore } from '@material-ui/icons';
import { ReactComponent as Clusters } from '../assets/menu/ico-cluster.svg';
import { ReactComponent as Dashboard } from '../assets/menu/diagnostic-bundle-leap-labs-icon-font-v-01.svg';
import { ReactComponent as Recover } from '../assets/menu/ico-recovery.svg';
import { ReactComponent as ServicePlans } from '../assets/menu/collection-policy.svg';
import { ReactComponent as Volumes } from '../assets/menu/ico-volume.svg';

import * as constants from '../constants';

// uses id to get menu item name string from messages/Menu.js with formatMessage(menuMsgs[id])
export const MENU_ITEMS = [
    {
        id: 'dashboard',
        Icon: Dashboard,
        href: '/',
        exact: true,
    },
    {
        divider: true,
    },
    {
        id: 'backup',
        Icon: SettingsBackupRestore,
        href: `/${constants.URI_BACKUP}`,
    },
    {
        id: 'recover',
        Icon: Recover,
        href: `/${constants.URI_RECOVER}`,
    },
    {
        divider: true,
    },
    {
        id: 'volumesOverview',
        Icon: Volumes,
        href: `/${constants.URI_VOLUME_SERIES}`,
    },
    {
        divider: true,
    },
    {
        id: 'servicePlansOverview',
        Icon: ServicePlans,
        href: `/${constants.URI_SERVICE_PLANS}`,
    },
    {
        id: 'clustersOverview',
        Icon: Clusters,
        href: `/${constants.URI_CLUSTERS}`,
    },
    {
        id: 'accountsOverview',
        Icon: Group,
        href: `/${constants.URI_ACCOUNTS}`,
    },
    {
        divider: true,
    },
    {
        id: 'cspOverview',
        Icon: CloudQueue,
        href: `/${constants.URI_CSP_DOMAINS}`,
        restrictedRoles: [constants.ROLE_TYPES.ROLE_TENANT, constants.ROLE_TYPES.ROLE_ACCOUNT_ADMIN],
    },
    {
        id: 'settings',
        Icon: Settings,
        href: `/${constants.URI_SETTINGS}`,
    },
];
