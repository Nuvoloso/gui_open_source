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
import { combineReducers } from 'redux';
import accountComplianceTotalsData from './accountComplianceTotals';
import accountsData from './accounts';
import alertMessages from './alertMessages';
import appGroupComplianceTotalsData from './appGroupComplianceTotals';
import applicationGroupsData from './applicationGroups';
import auditLogData from './auditLog';
import auth from './auth';
import clusterAccountSecretData from './clusterAccountSecret';
import clusterComplianceTotalsData from './clusterComplianceTotals';
import clustersData from './clusters';
import consistencyGroupComplianceTotalsData from './consistencyGroupComplianceTotals';
import consistencyGroupsData from './consistencyGroups';
import cspCredentialsData from './cspCredentials';
import cspMetadataData from './cspMetadata';
import cspsData from './csps';
import cspStorageTypesData from './cspStorageTypes';
import headerData from './header';
import modal from './modal';
import orchestratorDeploymentData from './orchestratorDeployment';
import poolsData from './pools';
import protectionDomainHistoryData from './protectionDomainHistory';
import protectionDomainMetadataData from './protectionDomainMetadata';
import protectionDomainsData from './protectionDomains';
import pvSpecData from './pvSpec';
import resourceNavigation from './resourceNavigation';
import resourceUtilizationData from './resourceUtilization';
import rolesData from './roles';
import servicePlanAllocationsData from './servicePlanAllocations';
import servicePlanComplianceTotalsData from './servicePlanComplianceTotals';
import servicePlansData from './servicePlans';
import session from './session';
import settings from './settings';
import SLOComplianceData from './sloCompliance';
import SLOSummaryData from './sloSummary';
import snapshotsData from './snapshots';
import socket from './socket';
import storageData from './storage';
import storageMetricsData from './storageMetrics';
import systemData from './system';
import table from './table';
import tableAccounts from './tableAccounts';
import tableAccountUsers from './tableAccountUsers';
import tableAGs from './tableAGs';
import tableCGs from './tableCGs';
import tableClusters from './tableClusters';
import tableCsps from './tableCsps';
import tableProtectionDomains from './tableProtectionDomains';
import tableSnapshots from './tableSnapshots';
import tableTags from './tableTags';
import tableUsers from './tableUsers';
import tableVolumeSeries from './tableVolumeSeries';
import uiSettings from './uiSettings';
import userData from './user';
import usersData from './users';
import volumeCapacityMetricsData from './volumeCapacity';
import volumeComplianceTotalsData from './volumeComplianceTotals';
import volumeMetricsData from './volumeMetrics';
import volumeSeriesData from './volumeSeries';
import volumeSeriesRequestsCompletedData from './volumeSeriesRequestsCompleted';
import volumeSeriesRequestsData from './volumeSeriesRequests';
import volumeServiceHistoryData from './volumeServiceHistory';
import volumeStatusData from './volumeStatus';

const rootReducer = combineReducers({
    accountComplianceTotalsData,
    accountsData,
    alertMessages,
    appGroupComplianceTotalsData,
    applicationGroupsData,
    auditLogData,
    auth,
    clusterAccountSecretData,
    clusterComplianceTotalsData,
    clustersData,
    consistencyGroupComplianceTotalsData,
    consistencyGroupsData,
    cspCredentialsData,
    cspMetadataData,
    cspsData,
    cspStorageTypesData,
    headerData,
    modal,
    orchestratorDeploymentData,
    poolsData,
    protectionDomainHistoryData,
    protectionDomainMetadataData,
    protectionDomainsData,
    pvSpecData,
    resourceNavigation,
    resourceUtilizationData,
    rolesData,
    servicePlanAllocationsData,
    servicePlanComplianceTotalsData,
    servicePlansData,
    session,
    settings,
    SLOComplianceData,
    SLOSummaryData,
    snapshotsData,
    socket,
    storageData,
    storageMetricsData,
    systemData,
    table,
    tableAccounts,
    tableAccountUsers,
    tableAGs,
    tableCGs,
    tableClusters,
    tableCsps,
    tableProtectionDomains,
    tableSnapshots,
    tableTags,
    tableUsers,
    tableVolumeSeries,
    uiSettings,
    userData,
    usersData,
    volumeCapacityMetricsData,
    volumeComplianceTotalsData,
    volumeMetricsData,
    volumeSeriesData,
    volumeSeriesRequestsCompletedData,
    volumeSeriesRequestsData,
    volumeServiceHistoryData,
    volumeStatusData,
});

export default rootReducer;
