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

export const accountMsgs = defineMessages({
    tableAuthIdentifier: {
        id: 'account.tableAuthIdentifier',
        defaultMessage: 'Authentication Id',
    },
    tableTitle: {
        id: 'account.tableTitle',
        defaultMessage: 'Accounts',
    },
    tableName: {
        id: 'account.tableName',
        defaultMessage: 'Name',
    },
    tableUsers: {
        id: 'account.tableUsers',
        defaultMessage: 'Users',
    },
    tableDescription: {
        id: 'account.tableDescription',
        defaultMessage: 'Description',
    },
    tableTags: {
        id: 'account.tableTags',
        defaultMessage: 'Tags',
    },
    tableActions: {
        id: 'account.tableActions',
        defaultMessage: 'Actions',
    },
    toolbarCreate: {
        id: 'account.toolbarCreate',
        defaultMessage: 'Create Account',
    },
    toolbarEdit: {
        id: 'account.toolbarEdit',
        defaultMessage: 'Edit',
    },
    toolbarDelete: {
        id: 'account.toolbarDelete',
        defaultMessage: 'Delete Account',
    },
    toolbarAdd: {
        id: 'account.toolbarAdd',
        defaultMessage: 'Add',
    },
    toolbarRemove: {
        id: 'account.toolbarRemove',
        defaultMessage: 'Remove',
    },
    createTitle: {
        id: 'account.createTitle',
        defaultMessage: 'Create a New Account',
    },
    editTitle: {
        id: 'account.editTitle',
        defaultMessage: 'Edit Account',
    },
    nameLabel: {
        id: 'account.nameLabel',
        defaultMessage: 'Account Name',
    },
    namePlaceholder: {
        id: 'account.namePlaceholder',
        defaultMessage: 'Enter a name for the account (required)',
    },
    disabledLabel: {
        id: 'account.disabledLabel',
        defaultMessage: 'Disabled',
    },
    usersLabel: {
        id: 'account.usersLabel',
        defaultMessage: 'Account Users',
    },
    usersPlaceholder: {
        id: 'account.usersPlaceholder',
        defaultMessage: 'Enter users (comma separated)',
    },
    tagsLabel: {
        id: 'account.tagsLabel',
        defaultMessage: 'Tags',
    },
    descriptionLabel: {
        id: 'account.descriptionLabel',
        defaultMessage: 'Description',
    },
    descriptionPlaceholder: {
        id: 'account.descriptionPlaceholder',
        defaultMessage: 'Enter description',
    },
    deleteTitle: {
        id: 'account.deleteTitle',
        defaultMessage: 'Delete {count, plural, one {Account} other {Accounts}}',
    },
    deleteMsg: {
        id: 'account.deleteMsg',
        defaultMessage: 'Are you sure you want to delete {count, plural, one {{name}} other {{count} accounts}}?',
    },
    selectPlaceholder: {
        id: 'account.selectPlaceholder',
        defaultMessage: 'Select an account',
    },
    selectPlaceholderRequired: {
        id: 'account.selectPlaceholderRequired',
        defaultMessage: 'Select an account (required)',
    },
    accountAdminLabel: {
        id: 'account.accountAdminLabel',
        defaultMessage: 'Account Admin',
    },
    tenantAdminLabel: {
        id: 'account.tenantAdminLabel',
        defaultMessage: 'Tenant Admin',
    },
    systemAdminLabel: {
        id: 'account.systemAdminLabel',
        defaultMessage: 'System Admin',
    },
    accountTableTitle: {
        id: 'account.accountTableTitle',
        defaultMessage: 'Accounts',
    },
    noAdminRights: {
        id: 'account.noAdminRights',
        defaultMessage: 'No administrative rights',
    },
    accountDetailsTitle: {
        id: 'account.accountDetailsTitle',
        defaultMessage: 'Account: {name}',
    },
    createdOnLabel: {
        id: 'account.createdOn',
        defaultMessage: 'Created on',
    },
    createdByLabel: {
        id: 'account.createdByLabel',
        defaultMessage: 'Created by',
    },
    settingsMetadataTitle: {
        id: 'account.settingsMetadataTitle',
        defaultMessage: 'Metadata Settings',
    },
    addUserTitle: {
        id: 'account.addUserTitle',
        defaultMessage: 'Add User to Account',
    },
    adminUsersLabel: {
        id: 'account.adminUsersLabel',
        defaultMessage: 'Admin Users',
    },
    poolsLabel: {
        id: 'account.poolsLabel',
        defaultMessage: 'Pools',
    },
    volumesLabel: {
        id: 'account.volumesLabel',
        defaultMessage: 'Volumes',
    },
    toolbarAddUser: {
        id: 'account.toolbarAddUser',
        defaultMessage: 'Add User',
    },
    tabDetails: {
        id: 'account.tabDetails',
        defaultMessage: 'Account Details',
    },
    tabPools: {
        id: 'account.tabPools',
        defaultMessage: 'Pools',
    },
    tabUsers: {
        id: 'account.tabUsers',
        defaultMessage: 'Users',
    },
    poolsTableTitle: {
        id: 'account.poolsTableTitle',
        defaultMessage: 'Pools',
    },
    protectionDomainsLabel: {
        id: 'account.protectionDomainsLabel',
        defaultMessage: 'Protection Stores',
    },
    setProtectionPasswordDialogTitle: {
        id: 'account.setProtectionPasswordDialogTitle',
        defaultMessage: 'Set Protection Password',
    },
    setProtectionPasswordDialogInfo: {
        id: 'account.setProtectionPasswordDialogInfo',
        defaultMessage: 'Creates a new protection domain with provided passphrase',
    },
    createProtectionDialogFormNameLabel: {
        id: 'account.createProtectionDialogFormNameLabel',
        defaultMessage: 'Name',
    },
    createProtectionDialogFormEncryptionLabel: {
        id: 'account.createProtectionDialogFormEncryptionLabel',
        defaultMessage: 'Encryption Algorithm',
    },
    createProtectionDialogFormPassphraseLabel: {
        id: 'account.createProtectionDialogFormPassphraseLabel',
        defaultMessage: 'Encryption Passphrase',
    },
    createProtectionDialogFormPassphrasePlaceholder: {
        id: 'account.createProtectionDialogFormPassphrasePlaceholder',
        defaultMessage: 'Enter passphrase (min. {minPassphraseLength} characters)',
    },


    protectionInformationDialogInfo: {
        id: 'account.protectionInformationDialogInfo',
        defaultMessage:
            'Copy the information below to a safe place. Nuvoloso support requires this information to help you recover data after a catastrophic system event.',
    },
    protectionInformationDialogSnapshotCatalog: {
        id: 'account.protectionInformationDialogSnapshotCatalog',
        defaultMessage: 'A snapshot catalog has been created for the CSP domain.',
    },
    protectionInformationDialogSummaryName: {
        id: 'account.protectionInformationDialogSummaryName',
        defaultMessage: 'Protection Store Name',
    },
    protectionInformationDialogSummaryId: {
        id: 'account.protectionInformationDialogSummaryId',
        defaultMessage: 'Protection Store ID',
    },
    protectionInformationDialogSummaryPassphrase: {
        id: 'account.protectionInformationDialogSummaryPassphrase',
        defaultMessage: 'Encryption Passphrase',
    },
    protectionInformationDialogSummaryAlgorithm: {
        id: 'account.protectionInformationDialogSummaryAlgorithm',
        defaultMessage: 'Encryption Algorithm',
    },
    protectionInformationDialogSummaryBucketName: {
        id: 'account.protectionInformationDialogSummaryBucketName',
        defaultMessage: 'Bucket Name',
    },
    protectionInformationDialogSummaryRegion: {
        id: 'account.protectionInformationDialogSummaryRegion',
        defaultMessage: 'Region',
    },
    systemUser: {
        id: 'account.systemUser',
        defaultMessage: 'System',
    },
    protectionInformationDialogTitle: {
        id: 'account.protectionInformationDialogTitle',
        defaultMessage: 'Protection Store Details',
    },
});
