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

export const setupMsgs = defineMessages({
    menuRequiredSetupLabel: {
        id: 'setup.menuRequiredSetupLabel',
        defaultMessage: '* Required Setup',
    },
    configureServicePlansTitle: {
        id: 'setup.configureServicePlansTitle',
        defaultMessage: 'Configure Service Plans (Tenant)',
    },
    configureServicePlansDesc: {
        id: 'setup.configureServicePlansDesc',
        defaultMessage:
            'Configuring Service Plans allows your users to select plans that will be within their needs and your budget.',
    },
    menuEnableServicePlans: {
        id: 'setup.menuEnableServicePlans',
        defaultMessage: '1. Enable Service Plans for Accounts',
    },
    menuSetCostAccounts: {
        id: 'setup.menuSetCostAccounts',
        defaultMessage: '2. Set Accounts Cost - Displayed',
    },
    spaDescription: {
        id: 'setup.spaDescription',
        defaultMessage:
            "For each Account, the Tenant Administrator sets a quota for one or more Service Plans. Account users can then provision volumes for that Service Plan. Nuvoloso dynamically allocates resources to meet the Service Plan's service levels.",
    },
    spaDirection: {
        id: 'setup.spaDirection',
        defaultMessage: 'Please provision storage for the Normal Account for one or more of the Service Plans.',
    },
    spaHeaderAccounts: {
        id: 'setup.spaHeaderAccounts',
        defaultMessage: 'Accounts',
    },
    spaHeaderServicePlans: {
        id: 'setup.spaHeaderServicePlans',
        defaultMessage: 'Service Plans',
    },
    spaHeaderCapacity: {
        id: 'setup.spaHeaderCapacity',
        defaultMessage: 'Capacity',
    },
    spaSave: {
        id: 'setup.spaSave',
        defaultMessage: 'SAVE SERVICE PLAN GROUPS',
    },
    createGroupsAndVolumesTitle: {
        id: 'setup.createGroupsAndVolumesTitle',
        defaultMessage: 'Create Groups & Volumes (User)',
    },
    createGroupsAndVolumesDesc: {
        id: 'setup.createGroupsAndVolumesDesc',
        defaultMessage: 'Creating a volume allows you to run and manage applications through Nuvoloso.',
    },
    menuCreateGroups: {
        id: 'setup.menuCreateGroups',
        defaultMessage: '1. Create First Application',
    },
    menuCreateVolumes: {
        id: 'setup.menuCreateVolumes',
        defaultMessage: '2. Create & Organize Volumes',
    },
    agTitle: {
        id: 'setup.agTitle',
        defaultMessage: 'Application Group',
    },
    agNameLabel: {
        id: 'setup.agNameLabel',
        defaultMessage: 'Application Group Name',
    },
    agDescription: {
        id: 'setup.agDescription',
        defaultMessage:
            'Users and administrators create Application Groups to record the relationship of volumes to their business applications. Application Groups show them a volume in the context of its application.',
    },
    agDirection: {
        id: 'setup.agDirection',
        defaultMessage: 'Please choose an Application Group name for the WordPress application you are creating.',
    },
    cgTitle: {
        id: 'setup.cgTitle',
        defaultMessage: 'Consistency Groups',
    },
    cgWebsiteNameLabel: {
        id: 'setup.cgWebsiteNameLabel',
        defaultMessage: 'Website Group Name',
    },
    cgDatabaseNameLabel: {
        id: 'setup.cgDatabaseNameLabel',
        defaultMessage: 'Database Group Name',
    },
    groupNamePlaceholder: {
        id: 'setup.groupNamePlaceholder',
        defaultMessage: 'Enter name',
    },
    groupCreateBtn: {
        id: 'setup.groupCreateBtn',
        defaultMessage: 'CREATE GROUP',
    },
    volumesTitle: {
        id: 'setup.volumesTitle',
        defaultMessage: '{cg} - Volume {index}',
    },
    volumesDescription: {
        id: 'setup.volumesDescription',
        defaultMessage: 'Users create Volumes from Service Plans that have available capacity for their Account.',
    },
    volumesDirection: {
        id: 'setup.volumesDirection',
        defaultMessage: 'Please allocate 2 volumes for the WordPress application:',
    },
    volumesWordPressDescription: {
        id: 'setup.volumesWordPressDescription',
        defaultMessage: '1) WordPress Front End: Stores blog post images and WordPress data.',
    },
    volumesMySQLDescription: {
        id: 'setup.volumesMySQLDescription',
        defaultMessage: '2) MySQL Database: Stores blog post text and WordPress configuration.',
    },
    volumesYAMLDescription: {
        id: 'setup.volumesYAMLDescription',
        defaultMessage:
            'You have successfully created the volumes for the WordPress application. Please generate the sample persistent volume claim YAMLs and transition to the Kubernetes cluster to deploy your WordPress application with those volumes.',
    },
    volumesTitleDefault: {
        id: 'setup.volumesTitleDefault',
        defaultMessage: 'Volumes',
    },
    volumesTitleToolbar: {
        id: 'setup.volumesTitleToolbar',
        defaultMessage: 'CREATE VOLUME',
    },
    setupCompleteBtn: {
        id: 'setup.setupCompleteBtn',
        defaultMessage: 'PROCEED TO DASHBOARD',
    },
    setupCompleteText: {
        id: 'setup.setupCompleteText',
        defaultMessage: 'All required configurations are complete!',
    },
});
