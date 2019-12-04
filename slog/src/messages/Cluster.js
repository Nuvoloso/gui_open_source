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

export const clusterMsgs = defineMessages({
    tableTitle: {
        id: 'cluster.tableTitle',
        defaultMessage: 'Clusters',
    },
    tableName: {
        id: 'cluster.tableName',
        defaultMessage: 'Name',
    },
    tableCspDomain: {
        id: 'cluster.tableCspDomain',
        defaultMessage: 'CSP Domain',
    },
    tableCluster: {
        id: 'cluster.tableCluster',
        defaultMessage: 'Cluster',
    },
    tableClusterState: {
        id: 'cluster.tableClusterState',
        defaultMessage: 'Cluster State',
    },
    tableClusterType: {
        id: 'cluster.tableClusterType',
        defaultMessage: 'Cluster Type',
    },
    tableTags: {
        id: 'cluster.tableTags',
        defaultMessage: 'Tags',
    },
    tableDescription: {
        id: 'cluster.tableDescription',
        defaultMessage: 'Description',
    },
    tableEmptyPlaceholder: {
        id: 'cluster.tableEmptyPlaceholder',
        defaultMessage: 'No clusters have been created',
    },
    tableNode: {
        id: 'cluster.tableNode',
        defaultMessage: 'Node',
    },
    tableNodeState: {
        id: 'cluster.tableNodeState',
        defaultMessage: 'Node State',
    },
    tableServiceState: {
        id: 'cluster.tableServiceState',
        defaultMessage: 'Service State',
    },
    tableLastHeartbeat: {
        id: 'cluster.tableLastHeartbeat',
        defaultMessage: 'Last Heartbeat',
    },
    tableNodeEmptyPlaceholder: {
        id: 'cluster.tableNodeEmptyPlaceholder',
        defaultMessage: 'No nodes are associated with the cluster',
    },
    toolbarDeploy: {
        id: 'cluster.toolbarDeploy',
        defaultMessage: 'Deploy',
    },
    toolbarEdit: {
        id: 'cluster.toolbarEdit',
        defaultMessage: 'Edit',
    },
    toolbarDelete: {
        id: 'cluster.toolbarDelete',
        defaultMessage: 'Delete',
    },
    deployTitle: {
        id: 'cluster.deployTitle',
        defaultMessage: 'Deploy Cluster',
    },
    cspDomainLabel: {
        id: 'cluster.cspDomainLabel',
        defaultMessage: 'CSP Domain',
    },
    cspDomainPlaceholder: {
        id: 'cluster.cspDomainPlaceholder',
        defaultMessage: 'Select a CSP domain (required)',
    },
    deploymentConfigLabel: {
        id: 'cluster.deploymentConfigLabel',
        defaultMessage: 'Deployment Configuration',
    },
    generateButton: {
        id: 'cluster.generateButton',
        defaultMessage: 'Generate',
    },
    generateHelp: {
        id: 'cluster.generateHelp',
        defaultMessage: 'Click the Generate button to create the YAML deployment text for this CSP Domain',
    },
    editTitle: {
        id: 'cluster.editTitle',
        defaultMessage: 'Edit Cluster',
    },
    nameLabel: {
        id: 'cluster.nameLabel',
        defaultMessage: 'Name',
    },
    namePlaceholder: {
        id: 'cluster.namePlaceholder',
        defaultMessage: 'Enter name (required)',
    },
    clusterNamePlaceholder: {
        id: 'cluster.clusterNamePlaceholder',
        defaultMessage: 'Enter name of cluster (optional)',
    },
    descriptionLabel: {
        id: 'cluster.descriptionLabel',
        defaultMessage: 'Description',
    },
    descriptionPlaceholder: {
        id: 'cluster.descriptionPlaceholder',
        defaultMessage: 'Enter description',
    },
    tagsLabel: {
        id: 'cluster.tagsLabel',
        defaultMessage: 'Tags',
    },
    deleteTitle: {
        id: 'cluster.deleteTitle',
        defaultMessage: 'Delete {count, plural, one {Cluster} other {Clusters}}',
    },
    deleteMsg: {
        id: 'cluster.deleteMsg',
        defaultMessage: 'Are you sure you want to delete {count, plural, one {{name}} other {{count} clusters}}?',
    },
    messagesTitle: {
        id: 'cluster.messagesTitle',
        defaultMessage: 'Messages',
    },
    messagesNone: {
        id: 'cluster.messagesNone',
        defaultMessage: 'No messages.',
    },
    clusterSummaryError: {
        id: 'cluster.clusterSummaryError',
        defaultMessage: 'Number of clusters that have critical issues that need to be addressed',
    },
    clusterSummaryWarning: {
        id: 'cluster.clusterSummaryWarning',
        defaultMessage: 'Number of clusters that have issues that need attention soon',
    },
    clusterSummaryOk: {
        id: 'cluster.clusterSummaryOk',
        defaultMessage: 'Number of clusters that are operating normally',
    },
    createNewCluster: {
        id: 'cluster.createNewCluster',
        defaultMessage: 'Create New Cluster',
    },
    yamlErrorMsg: {
        id: 'cluster.yamlErrorMsg',
        defaultMessage: 'Error generating YAML',
    },
    yamlTextReady: {
        id: 'cluster.yamlTextReady',
        defaultMessage: 'The YAML required to deploy the cluster in Kubernetes has been generated.',
    },
    yamlTextReadyDirectionPrepend: {
        id: 'cluster.yamlTextReadyDirectionPrepend',
        defaultMessage: 'Please use the text below as input to the',
    },
    yamlTextReadyCommand: {
        id: 'cluster.yamlTextReadyCommand',
        defaultMessage: 'kubectl apply',
    },
    yamlTextReadyDirectionAppend: {
        id: 'cluster.yamlTextReadyDirectionAppend',
        defaultMessage: 'command.',
    },
    selectExistingCsp: {
        id: 'cluster.selectExistingCsp',
        defaultMessage: 'Select existing CSP',
    },
    enterNamePlaceholder: {
        id: 'cluster.enterNamePlaceholder',
        defaultMessage: 'Enter name...',
    },
    enterRegionPlaceholder: {
        id: 'cluster.enterRegionPlaceholder',
        defaultMessage: 'Enter region...',
    },
    enterZonePlaceholder: {
        id: 'cluster.enterZonePlaceholder',
        defaultMessage: 'Enter zone...',
    },
    enterHostPlaceholder: {
        id: 'cluster.enterHostPlaceholder',
        defaultMessage: 'Enter host...',
    },
    selectProviderPlaceholder: {
        id: 'cluster.selectProvider',
        defaultMessage: 'Select provider...',
    },
    useExistingCredential: {
        id: 'cluster.useExistingCredential',
        defaultMessage: 'Use existing credential',
    },
    createNewCredential: {
        id: 'cluster.createNewCredential',
        defaultMessage: 'Create new credential',
    },
    credentialLabel: {
        id: 'cluster.credentialLabel',
        defaultMessage: 'Credential',
    },
    selectCredentialPlaceholder: {
        id: 'cluster.selectCredentialPlaceholder',
        defaultMessage: 'Select credential...',
    },
    cspCredentialNameLabel: {
        id: 'cluster.cspCredentialNameLabel',
        defaultMessage: 'Credential Name',
    },
    cspCredentialNamePlaceholder: {
        id: 'cluster.cspCredentialNamePlaceholder',
        defaultMessage: 'Enter credential name...',
    },
    enterAccessKeyIDPlaceholder: {
        id: 'cluster.enterAccessKeyIDPlaceholder',
        defaultMessage: 'Enter access key ID...',
    },
    enterSecretKeyPlaceholder: {
        id: 'cluster.enterSecretKeyPlaceholder',
        defaultMessage: 'Enter secret key...',
    },
    useExistingDomain: {
        id: 'cluster.useExistingDomain',
        defaultMessage: 'Use existing domain',
    },
    createNewDomain: {
        id: 'cluster.createNewDomain',
        defaultMessage: 'Create new domain',
    },
    dialogTitle: {
        id: 'cluster.dialogTitle',
        defaultMessage: 'Create new cluster',
    },
    dialogNewDomain: {
        id: 'cluster.dialogNewDomain',
        defaultMessage: 'New domain information',
    },
    clusterYamlK8s: {
        id: 'cluster.clusterYamlK8s',
        defaultMessage: 'Cluster YAML for Kubernetes',
    },
    domainNameLabel: {
        id: 'cluster.domainNameLabel',
        defaultMessage: 'Domain Name',
    },
    accessRegionLabel: {
        id: 'cluster.accessRegionLabel',
        defaultMessage: 'Access Region',
    },
    accessZoneLabel: {
        id: 'cluster.accessZoneLabel',
        defaultMessage: 'Access Zone',
    },
    zoneLabel: {
        id: 'cluster.zoneLabel',
        defaultMessage: 'Zone',
    },
    managementHostLabel: {
        id: 'cluster.managementHostLabel',
        defaultMessage: 'Management Host',
    },
    serviceProviderLabel: {
        id: 'cluster.serviceProviderLabel',
        defaultMessage: 'Service Provider',
    },
    accessKeyIdLabel: {
        id: 'cluster.accessKeyIdLabel',
        defaultMessage: 'Access Key',
    },
    secretKeyLabel: {
        id: 'cluster.secretKeyLabel',
        defaultMessage: 'Secret Key',
    },
    cspTags: {
        id: 'cluster.cspTags',
        defaultMessage: 'Domain Tags',
    },
    cspDescription: {
        id: 'cluster.cspDescription',
        defaultMessage: 'Domain Description',
    },
    clusterNameLabel: {
        id: 'cluster.clusterNameLabel',
        defaultMessage: 'Cluster Name',
    },
    clusterDescriptionLabel: {
        id: 'cluster.clusterDescriptionLabel',
        defaultMessage: 'Cluster Description',
    },
    clusterTagsLabel: {
        id: 'cluster.clusterTagsLabel',
        defaultMessage: 'Cluster Tags',
    },
    accountsLabel: {
        id: 'cluster.accounts',
        defaultMessage: 'Accounts',
    },
    pools: {
        id: 'cluster.pools',
        defaultMessage: 'Pools',
    },
    volumesLabel: {
        id: 'cluster.volumesLabel',
        defaultMessage: 'Volumes',
    },
    actions: {
        id: 'cluster.actions',
        defaultMessage: 'Actions',
    },
    totalCluster: {
        id: 'cluster.totalCluster',
        defaultMessage: 'Total Clusters: ',
    },
    clusterDetailsTitle: {
        id: 'cluster.clusterDetailsTitle',
        defaultMessage: 'Cluster: {name}',
    },
    createdOnLabel: {
        id: 'cluster.createdOn',
        defaultMessage: 'Created on',
    },
    createdByLabel: {
        id: 'cluster.createdByLabel',
        defaultMessage: 'Created by',
    },
    settingsMetadataTitle: {
        id: 'cluster.settingsMetadataTitle',
        defaultMessage: 'Metadata Settings',
    },
    poolsLabel: {
        id: 'cluster.poolsLabel',
        defaultMessage: 'Pools',
    },
    managePoolsLabel: {
        id: 'cluster.managePoolsLabel',
        defaultMessage: 'Manage Pools',
    },
    getClusterYamlLabel: {
        id: 'cluster.getClusterYamlLabel',
        defaultMessage: 'Get Cluster YAML',
    },
    deleteClusterLabel: {
        id: 'cluster.deleteClusterLabel',
        defaultMessage: 'Delete Cluster',
    },
    clusterType: {
        id: 'cluster.clusterType',
        defaultMessage: 'Cluster Type',
    },
    accounts: {
        id: 'cluster.accounts',
        defaultMessage: 'Accounts',
    },
    volumes: {
        id: 'cluster.volumes',
        defaultMessage: 'Volumes',
    },
    titleSettings: {
        id: 'cluster.titleSettings',
        defaultMessage: 'Cluster Details',
    },
    titleVolumes: {
        id: 'cluster.titleVolumes',
        defaultMessage: 'Volumes',
    },
    titleManagePools: {
        id: 'cluster.titleManagePools',
        defaultMessage: 'Manage Pools',
    },
    managePoolsHelp: {
        id: 'cluster.managePoolsHelp',
        defaultMessage: 'Note: Existing pools may not be deleted. You can set their size to 0.',
    },
    tableAccount: {
        id: 'cluster.tableAccount',
        defaultMessage: 'Account',
    },
    tableServicePlan: {
        id: 'cluster.tableServicePlan',
        defaultMessage: 'Service Plan',
    },
    tableCapacity: {
        id: 'cluster.tableCapacity',
        defaultMessage: 'Capacity',
    },
    tableActualCost: {
        id: 'cluster.tableActualCost',
        defaultMessage: 'Actual Cost',
    },
    tableDisplayedCost: {
        id: 'cluster.tableDisplayedCost',
        defaultMessage: 'Displayed Cost',
    },
    tableVolumes: {
        id: 'cluster.tableVolumes',
        defaultMessage: 'Volumes',
    },
    tableActions: {
        id: 'cluster.tableActions',
        defaultMessage: 'Actions',
    },
    tableUsed: {
        id: 'cluster.tableUsed',
        defaultMessage: 'Used',
    },
    tablePercent: {
        id: 'cluster.tablePercent',
        defaultMessage: '% Used',
    },
    tableCost: {
        id: 'cluster.tableCost',
        defaultMessage: 'Cost',
    },
    clusterPoolTableTitle: {
        id: 'cluster.clusterPoolTableTitle',
        defaultMessage: 'Pools',
    },
    clusterPoolYamlTitle: {
        id: 'cluster.clusterPoolYamlTitle',
        defaultMessage: 'Kubernetes YAML for Dynamic Provisioning',
    },
    clusterPoolYamlInfo: {
        id: 'cluster.clusterPoolYamlInfo',
        defaultMessage: 'Sample persistent volume claim YAML for a dynamically allocated persistent volume.',
    },
    clusterTotalVolumesTitle: {
        id: 'cluster.clusterTotalVolumesTitle',
        defaultMessage: 'Total Volumes',
    },
    clusterDisplayedVolumesTitle: {
        id: 'cluster.clusterDisplayedVolumesTitle',
        defaultMessage: 'Displayed',
    },
    clusterNodesTabLabel: {
        id: 'cluster.clusterNodesTabLabel',
        defaultMessage: 'Nodes',
    },
    clusterTableStatus: {
        id: 'cluster.clusterTableStatus',
        defaultMessage: 'Status',
    },
    getClusterAccountSecretLabel: {
        id: 'cluster.getClusterAccountSecretLabel',
        defaultMessage: 'Get Account Secret',
    },
    yamlClusterAccountSecretTitle: {
        id: 'cluster.yamlClusterAccountSecretTitle',
        defaultMessage: 'Cluster Account Secret YAML',
    },
    yamlClusterAccountSecretInfo: {
        id: 'cluster.yamlClusterAccountSecretInfo',
        defaultMessage: 'The YAML required for the cluster account secret has been generated.',
    },
    cspCSPCredentialLabel: {
        id: 'cluster.cspCSPCredentialLabel',
        defaultMessage: 'CSP Credential',
    },
    stateDeployable: {
        id: 'cluster.stateDeployable',
        defaultMessage: 'Deployable',
    },
    stateDeployableDesc: {
        id: 'cluster.stateDeployableDesc',
        defaultMessage:
            'The default state of the Cluster object on creation; the cluster type specific software deployment is available for download; policy information may be re-configured',
    },
    stateManaged: {
        id: 'cluster.stateManaged',
        defaultMessage: 'Managed',
    },
    stateManagedDesc: {
        id: 'cluster.stateManagedDesc',
        defaultMessage: 'The cluster is under management; most policy properties are now immutable',
    },
    stateTimedOut: {
        id: 'cluster.stateTimedOut',
        defaultMessage: 'Timed Out',
    },
    stateTimedOutDesc: {
        id: 'cluster.stateTimedOutDesc',
        defaultMessage: 'Lost contact with the cluster service',
    },
    stateResetting: {
        id: 'cluster.stateResetting',
        defaultMessage: 'Resetting',
    },
    stateResettingDesc: {
        id: 'cluster.stateResettingDesc',
        defaultMessage:
            'The cluster is being recreated; the Cluster object will transition to DEPLOYABLE after associated resources and objects are reset',
    },
    stateTearDown: {
        id: 'cluster.stateTearDown',
        defaultMessage: 'Tear Down',
    },
    stateTearDownDesc: {
        id: 'cluster.stateTearDownDesc',
        defaultMessage:
            'The cluster has been destroyed; the Cluster object will be deleted and associated resources and objects cleaned up',
    },
    serviceStateTooltipTitle: {
        id: 'cluster.serviceStateTooltipTitle',
        defaultMessage: 'Service State: {state}',
    },
    serviceStateError: {
        id: 'cluster.serviceStateError',
        defaultMessage: 'Error',
    },
    serviceStateErrorDesc: {
        id: 'cluster.serviceStateErrorDesc',
        defaultMessage: 'The service has encountered some error',
    },
    serviceStateNotReady: {
        id: 'cluster.serviceStateNotReady',
        defaultMessage: 'Not Ready',
    },
    serviceStateNotReadyDesc: {
        id: 'cluster.serviceStateNotReadyDesc',
        defaultMessage: 'The service is waiting on external entities',
    },
    serviceStateReady: {
        id: 'cluster.serviceStateReady',
        defaultMessage: 'Ready',
    },
    serviceStateReadyDesc: {
        id: 'cluster.serviceStateReadyDesc',
        defaultMessage: 'The service is running normally',
    },
    serviceStateStarting: {
        id: 'cluster.serviceStateStarting',
        defaultMessage: 'Starting',
    },
    serviceStateStartingDesc: {
        id: 'cluster.serviceStateStartingDesc',
        defaultMessage: 'The service is initializing itself',
    },
    serviceStateStopped: {
        id: 'cluster.serviceStateStopped',
        defaultMessage: 'Stopped',
    },
    serviceStateStoppedDesc: {
        id: 'cluster.serviceStateStoppedDesc',
        defaultMessage: 'The service is terminated',
    },
    serviceStateStopping: {
        id: 'cluster.serviceStateStopping',
        defaultMessage: 'Stopping',
    },
    serviceStateStoppingDesc: {
        id: 'cluster.serviceStateStoppingDesc',
        defaultMessage: 'The service is terminating',
    },
    serviceStateUnknown: {
        id: 'cluster.serviceStateUnknown',
        defaultMessage: 'Unknown',
    },
    serviceStateUnknownDesc: {
        id: 'cluster.serviceStateUnknownDesc',
        defaultMessage: 'No heartbeat information is available',
    },
    protectionPassword: {
        id: 'cluster.protectionPassword',
        defaultMessage: 'Protection Password',
    },
    protectionPasswordPlaceholder: {
        id: 'cluster.protectionPasswordPlaceholder',
        defaultMessage: 'Enter passphrase (min. {minPassphraseLength} characters)',
    },
    createProtectionDialogFormEncryptionLabel: {
        id: 'cluster.createProtectionDialogFormEncryptionLabel',
        defaultMessage: 'Encryption algorithm',
    },
    clusterVolumesTableTitle: {
        id: 'cluster.clusterVolumesTableTitle',
        defaultMessage: 'Volumes',
    },
    requiredManagedDesc: {
        id: 'cluster.requiredManagedDesc',
        defaultMessage: 'Cluster is not being managed. Apply the cluster YAML before proceeding.',
    },
    requiredPoolsDesc: {
        id: 'cluster.requiredPoolsDesc',
        defaultMessage: 'This account has no pools. Create a pool before getting the account secret.',
    },
    requiredProtectionBtn: {
        id: 'cluster.requiredProtectionBtn',
        defaultMessage: 'Manage Protection Domains',
    },
    requiredProtectionDesc: {
        id: 'cluster.requiredProtectionDesc',
        defaultMessage:
            'This account has not set up any protection domains. Create a protection domain before getting the account secret.',
    },
    gcCredLabel: {
        id: 'cluster.gcCredLabel',
        defaultMessage: 'Credential',
    },
    enterGCCredentialPlaceholder: {
        id: 'cluster.enterGCCredentialPlaceholder',
        defaultMessage: 'Paste credential JSON here',
    },
    notSupported: {
        id: 'cluster.notSupported',
        defaultMessage: 'Not Supported',
    },
    unknownMessage: {
        id: 'cluster.unknownMessage',
        defaultMessage: 'Unknown',
    },
});
