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

export const cspMsgs = defineMessages({
    accountLabel: {
        id: 'cspMsgs.accountLabel',
        defaultMessage: 'Account',
    },
    tableAccount: {
        id: 'cspMsgs.tableAccount',
        defaultMessage: 'Account',
    },
    tableTitle: {
        id: 'cspMsgs.tableTitle',
        defaultMessage: 'Cloud Service Provider Domains',
    },
    tableName: {
        id: 'cspMsgs.tableName',
        defaultMessage: 'Name',
    },
    tableCSP: {
        id: 'cspMsgs.tableCSP',
        defaultMessage: 'CSP',
    },
    tableTags: {
        id: 'cspMsgs.tableTags',
        defaultMessage: 'Tags',
    },
    tableManagementHost: {
        id: 'cspMsgs.tableManagementHost',
        defaultMessage: 'Management Host',
    },
    toolbarCreate: {
        id: 'cspMsgs.toolbarCreate',
        defaultMessage: 'Create CSP Domain',
    },
    toolbarEdit: {
        id: 'cspMsgs.toolbarEdit',
        defaultMessage: 'Edit',
    },
    toolbarDelete: {
        id: 'cspMsgs.toolbarDelete',
        defaultMessage: 'Delete',
    },
    createTitle: {
        id: 'cspMsgs.createTitle',
        defaultMessage: 'Create Cloud Service Provider (CSP) Domain',
    },
    editTitle: {
        id: 'cspMsgs.editTitle',
        defaultMessage: 'Edit Cloud Service Provider (CSP) Domain',
    },
    nameLabel: {
        id: 'cspMsgs.nameLabel',
        defaultMessage: 'Name',
    },
    namePlaceholder: {
        id: 'cspMsgs.namePlaceholder',
        defaultMessage: 'Enter name (required)',
    },
    cspLabel: {
        id: 'cspMsgs.cspLabel',
        defaultMessage: 'CSP',
    },
    managementHostLabel: {
        id: 'cspMsgs.managementHostLabel',
        defaultMessage: 'Management Host',
    },
    managementHostPlaceholder: {
        id: 'cspMsgs.managementHostPlaceholder',
        defaultMessage: 'Enter management host IP/name',
    },
    tagsLabel: {
        id: 'cspMsgs.tagsLabel',
        defaultMessage: 'Tags',
    },
    descriptionLabel: {
        id: 'cspMsgs.descriptionLabel',
        defaultMessage: 'Description',
    },
    descriptionPlaceholder: {
        id: 'cspMsgs.descriptionPlaceholder',
        defaultMessage: 'Enter description',
    },
    deleteTitle: {
        id: 'cspMsgs.deleteTitle',
        defaultMessage: 'Delete Cloud Service Provider {count, plural, one {Domain} other {Domains}}',
    },
    deleteMsg: {
        id: 'cspMsgs.deleteMsg',
        defaultMessage: 'Are you sure you want to delete {count, plural, one {{name}} other {{count} CSP domains}}?',
    },
    aws: {
        id: 'cspMsgs.aws',
        defaultMessage: 'AWS',
    },
    awsPermissionsRequired: {
        id: 'cspMsgs.awsPermissionsRequired',
        defaultMessage: 'For AWS, a user is required to be created for Nuvoloso with the following permissions:',
    },
    awsPermissionEc2: {
        id: 'cspMsgs.awsPermissionEc2',
        defaultMessage: 'AmazonEC2FullAccess',
    },
    awsPermissionS3: {
        id: 'cspMsgs.awsPermissionS3',
        defaultMessage: 'AmazonS3FullAccess',
    },
    awsPermissionVpc: {
        id: 'cspMsgs.awsPermissionVpc',
        defaultMessage: 'AmazonVPCFullAccess',
    },
    awsPermissionRoute53: {
        id: 'cspMsgs.awsPermissionRoute53',
        defaultMessage: 'AmazonRoute53FullAccess',
    },
    awsAccessKeyIdLabel: {
        id: 'cspMsgs.awsAccessKeyIdLabel',
        defaultMessage: 'AWS Access Key ID',
    },
    awsAccessKeyIdPlaceholder: {
        id: 'cspMsgs.awsAccessKeyIdPlaceholder',
        defaultMessage: 'Enter AWS access key ID (required)',
    },
    awsAvailabilityZoneLabel: {
        id: 'cspMsgs.awsAvailabilityZoneLabel',
        defaultMessage: 'AWS Availability Zone',
    },
    awsAvailabilityZonePlaceholder: {
        id: 'cspMsgs.awsAvailabilityZonePlaceholder',
        defaultMessage: 'Enter AWS availability zone (required)',
    },
    awsRegionLabel: {
        id: 'cspMsgs.awsRegionLabel',
        defaultMessage: 'AWS Region',
    },
    awsRegionPlaceholder: {
        id: 'cspMsgs.awsRegionPlaceholder',
        defaultMessage: 'Enter AWS region (required)',
    },
    awsSecretAccessKeyLabel: {
        id: 'cspMsgs.awsSecretAccessKeyLabel',
        defaultMessage: 'AWS Secret Access Key',
    },
    awsSecretAccessKeyPlaceholder: {
        id: 'cspMsgs.awsSecretAccessKeyPlaceholder',
        defaultMessage: 'Enter AWS access key secret (required)',
    },
    selectStorageType: {
        id: 'cspMsgs.selectStorageType',
        defaultMessage: 'Select CSP storage type (required)',
    },
});
