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

export const cspDomainMsgs = defineMessages({
    cspTableTitle: {
        id: 'cspDomainMsgs.cspTableTitle',
        defaultMessage: 'CSP Domains',
    },
    cspCredentialTableTitle: {
        id: 'cspDomainMsgs.cspCredentialTableTitle',
        defaultMessage: 'CSP Credentials',
    },
    cspDialogCreateDomainName: {
        id: 'cspDomainMsgs.cspDialogCreateDomainName',
        defaultMessage: 'New CSP Information',
    },
    cspDetailNameLabel: {
        id: 'cspDomainMsgs.cspDetailNameLabel',
        defaultMessage: 'CSP Domain: {name}',
    },
    tableName: {
        id: 'cspDomainMsgs.tableName',
        defaultMessage: 'Name',
    },
    tableProvider: {
        id: 'cspDomainMsgs.tableProvider',
        defaultMessage: 'Provider',
    },
    tableRegion: {
        id: 'cspDomainMsgs.tableRegion',
        defaultMessage: 'Region',
    },
    tableZone: {
        id: 'cspDomainMsgs.tableZone',
        defaultMessage: 'Zone',
    },
    tableManagementHost: {
        id: 'cspDomainMsgs.tableManagementHost',
        defaultMessage: 'Management Host',
    },
    tableKey: {
        id: 'cspDomainMsgs.tableKey',
        defaultMessage: 'Access Key',
    },
    tableSecret: {
        id: 'cspDomainMsgs.tableSecret',
        defaultMessage: 'Access Secret',
    },
    tableCred: {
        id: 'cspDomainMsgs.tableCred',
        defaultMessage: 'Credential',
    },
    tableActions: {
        id: 'cspDomainMsgs.tableActions',
        defaultMessage: 'Actions',
    },
    tableCSP: {
        id: 'cspDomainMsgs.tableCSP',
        defaultMessage: 'CSP',
    },
    tableDetails: {
        id: 'cspDomainMsgs.tableDetails',
        defaultMessage: 'Details',
    },
    tableCSPCredentials: {
        id: 'cspDomainMsgs.tableCSPCredentials',
        defaultMessage: 'CSP Credential',
    },
    tableType: {
        id: 'cspDomainMsgs.tableType',
        defaultMessage: 'Type',
    },
    tableTypeData: {
        id: 'cspDomainMsgs.tableTypeData',
        defaultMessage: 'DATA',
    },
    tableTypeCatalog: {
        id: 'cspDomainMsgs.tableTypeCatalog',
        defaultMessage: 'CATALOG',
    },
    tableEmptyDomainsPlaceholder: {
        id: 'cspDomainMsgs.tableEmptyDomainsPlaceholder',
        defaultMessage: 'No CSP domains have been created',
    },
    tableEmptyCredentialsPlaceholder: {
        id: 'cspDomainMsgs.tableEmptyCredentialsPlaceholder',
        defaultMessage: 'No credentials have been created',
    },
    dialogCreateDomainLabel: {
        id: 'cspDomainMsgs.dialogCreateDomainLabel',
        defaultMessage: 'Create Domain',
    },
    dialogCreateCredentialLabel: {
        id: 'cspDomainMsgs.dialogCreateCredentialLabel',
        defaultMessage: 'Create Credential',
    },
    cspDeleteDomain: {
        id: 'cspDomainMsgs.cspDeleteDomain',
        defaultMessage: 'Are you sure you want to delete the CSP Domain {name}?',
    },
    cspDeleteCSPCredential: {
        id: 'cspDomainMsgs.cspDeleteCSPCredential',
        defaultMessage: 'Are you sure you want to delete the CSP Credential {name}?',
    },
    cspDeleteDomainTitle: {
        id: 'cspDomainMsgs.cspDeleteDomainTitle',
        defaultMessage: 'Delete CSP Domain',
    },
    cspDeleteCSPCredentialTitle: {
        id: 'cspDomainMsgs.cspDeleteCSPCredentialTitle',
        defaultMessage: 'Delete CSP Credential',
    },
    cspDetailsTitle: {
        id: 'cspDomainMsgs.cspDetailsTitle',
        defaultMessage: 'CSP Domain: {name}',
    },
    detailsTabLabel: {
        id: 'cspDomainMsgs.detailsTabLabel',
        defaultMessage: 'Details',
    },
    clustersTabLabel: {
        id: 'cspDomainMsgs.clustersTabLabel',
        defaultMessage: 'Clusters',
    },
    credentialsTabLabel: {
        id: 'cspDomainMsgs.credentialsTabLabel',
        defaultMessage: 'Credentials',
    },
    credentialsTabLabelAWS: {
        id: 'cspDomainMsgs.credentialsTabLabelAWS',
        defaultMessage: 'Credentials (AWS)',
    },
    credentialsTabLabelGCP: {
        id: 'cspDomainMsgs.credentialsTabLabelGCP',
        defaultMessage: 'Credentials (GCP)',
    },
    credentialsTabLabelAzure: {
        id: 'cspDomainMsgs.credentialsTabLabelAzure',
        defaultMessage: 'Credentials (Azure)',
    },
    domainsTabLabel: {
        id: 'cspDomainMsgs.domainsTabLabel',
        defaultMessage: 'Domains',
    },
    domainTypeLabel: {
        id: 'cspDomainMsgs.domainTypeLabel',
        defaultMessage: 'Domain Type',
    },
    regionLabel: {
        id: 'cspDomainMsgs.regionLabel',
        defaultMessage: 'Region',
    },
    zoneLabel: {
        id: 'cspDomainMsgs.zoneLabel',
        defaultMessage: 'Zone',
    },
    createdOnLabel: {
        id: 'cspDomainMsgs.createdOnLabel',
        defaultMessage: 'Created on',
    },
    createdByLabel: {
        id: 'cspDomainMsgs.createdByLabel',
        defaultMessage: 'Created by',
    },
    accountsLabel: {
        id: 'cspDomainMsgs.accountsLabel',
        defaultMessage: 'Accounts',
    },
    volumesLabel: {
        id: 'cspDomainMsgs.volumesLabel',
        defaultMessage: 'Volumes',
    },
    storageTabLabel: {
        id: 'cspDomainMsgs.storageTabLabel',
        defaultMessage: 'Storage Costs',
    },
    storageCostsTableHeaderName: {
        id: 'cspDomainMsgs.storageCostsTableHeaderName',
        defaultMessage: 'Name',
    },
    storageCostsTableHeaderCost: {
        id: 'cspDomainMsgs.storageCostsTableHeaderCost',
        defaultMessage: 'Cost ($/GiB/month)',
    },
    storageCostsTableHeaderType: {
        id: 'cspDomainMsgs.storageCostsTableHeaderType',
        defaultMessage: 'Type',
    },
    cspDialogCreateCredentialName: {
        id: 'cspDomainMsgs.cspDialogCreateCredentialName',
        defaultMessage: 'New CSP Credential Information',
    },
    cspTags: {
        id: 'cspDomainMsgs.cspTags',
        defaultMessage: 'Credential Tags',
    },
    cspDescription: {
        id: 'cspDomainMsgs.cspDescription',
        defaultMessage: 'Credential Description',
    },
    cspDomainsTableTitle: {
        id: 'cspDomainMsgs.cspDomainsTableTitle',
        defaultMessage: 'CSP Domains',
    },
    cspCredentialsTableTitle: {
        id: 'cspDomainMsgs.cspCredentialsTableTitle',
        defaultMessage: 'CSP Credentials',
    },
    setProtectionPasswordLabel: {
        id: 'cspDomainMsgs.setProtectionPasswordLabel',
        defaultMessage: 'Set Protection Password',
    },
    tabProtectionDomainsLabel: {
        id: 'cspDomainMsgs.tabProtectionDomainsLabel',
        defaultMessage: 'Protection Stores',
    },
    deleteProtectionDomainTitle: {
        id: 'cspDomainMsgs.deleteProtectionDomainTitle',
        defaultMessage: 'Delete {count, plural, one {Protection Domain} other {Protection Domains}}',
    },
    deleteProtectionDomainMsg: {
        id: 'cspDomainMsgs.deleteProtectionDomainMsg',
        defaultMessage:
            'Are you sure you want to delete {count, plural, one {{name}} other {{count} protection domains}}?',
    },
    protectionInformationDialogTitle: {
        id: 'cspDomainMsgs.protectionInformationDialogTitle',
        defaultMessage: 'Protection Store Details',
    },
    protectionInformationActionTooltip: {
        id: 'cspDomainMsgs.protectionInformationActionTooltip',
        defaultMessage: 'Protection Store Details',
    },
    protectionDomainTableHeaderName: {
        id: 'cspDomainMsgs.protectionDomainTableHeaderName',
        defaultMessage: 'Name',
    },
    protectionDomainTableHeaderActive: {
        id: 'cspDomainMsgs.protectionDomainTableHeaderActive',
        defaultMessage: 'Active',
    },
    protectionDomainTableHeaderEncryption: {
        id: 'cspDomainMsgs.protectionDomainTableHeaderEncryption',
        defaultMessage: 'Encryption',
    },
    protectionDomainTableHeaderPassphrase: {
        id: 'cspDomainMsgs.protectionDomainTableHeaderPassphrase',
        defaultMessage: 'Passphrase',
    },
    protectionDomainTableHeaderTags: {
        id: 'cspDomainMsgs.protectionDomainTableHeaderTags',
        defaultMessage: 'Tags',
    },
    protectionDomainTableHeaderBucket: {
        id: 'cspDomainMsgs.protectionDomainTableHeaderBucket',
        defaultMessage: 'Bucket Name',
    },
    protectionDomainTableHeaderRegion: {
        id: 'cspDomainMsgs.protectionDomainTableHeaderRegion',
        defaultMessage: 'Region',
    },
    protectionDomainsTableTitle: {
        id: 'cspDomainMsgs.protectionDomainsTableTitle',
        defaultMessage: 'Protection Domains',
    },
});
