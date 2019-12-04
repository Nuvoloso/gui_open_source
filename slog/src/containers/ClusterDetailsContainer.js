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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import _ from 'lodash';

import ClusterDetails from '../components/ClusterDetails';
import ClusterYaml from '../components/ClusterYaml';
import DeleteForm from '../components/DeleteForm';

import { getAccounts } from '../actions/accountActions';
import { getAGs } from '../actions/applicationGroupActions';
import { getCGs } from '../actions/consistencyGroupActions';
import {
    deleteClusters,
    getClusterAccountSecret,
    getClusters,
    getOrchestratorDeployment,
    patchCluster,
} from '../actions/clusterActions';
import { getCSPCredentials, getCSPs, patchCSP } from '../actions/cspActions';
import { getProtectionDomains } from '../actions/protectionDomainActions';
import { getRoles } from '../actions/roleActions';
import { getServicePlans } from '../actions/servicePlanActions';
import { getVolumeSeries } from '../actions/volumeSeriesActions';
import {
    getServicePlanAllocations,
    postServicePlanAllocations,
    patchServicePlanAllocations,
} from '../actions/servicePlanAllocationActions';
import { getVolumesCompliance } from '../actions/complianceActions';
import { sessionGetAccount } from '../sessionUtils';
import { spaTagGenCost } from './spaUtils';
import { timePeriodUnit } from '../components/utils';
import { closeModal, openModal } from '../actions/modalActions';

import { clusterMsgs } from '../messages/Cluster';
import { updateNavigationList } from '../components/volume_series_utils';

import * as constants from '../constants';
import * as types from '../actions/types';

class ClusterDetailsContainer extends Component {
    constructor(props) {
        super(props);

        this.closeModal = this.closeModal.bind(this);
        this.deleteClusters = this.deleteClusters.bind(this);
        this.dispatchDeleteClusters = this.dispatchDeleteClusters.bind(this);
        this.getClusterYaml = this.getClusterYaml.bind(this);
        this.handleDetailsTabSelect = this.handleDetailsTabSelect.bind(this);
        this.handleGetClusterAccountSecret = this.handleGetClusterAccountSecret.bind(this);
        this.onFilteredChange = this.onFilteredChange.bind(this);
        this.onSortedChange = this.onSortedChange.bind(this);
        this.onSPASubmit = this.onSPASubmit.bind(this);
        this.openModal = this.openModal.bind(this);
        this.saveSettingsCSP = this.saveSettingsCSP.bind(this);
        this.saveSettingsMeta = this.saveSettingsMeta.bind(this);
    }

    componentDidMount() {
        const { clustersData, dispatch, intl, match, session, uiSettings } = this.props;
        const { formatMessage } = intl;
        const { period } = uiSettings || {};
        const startTime = moment()
            .utc()
            .subtract(1, timePeriodUnit(period));
        const endTime = moment().utc();
        const { clusters = [] } = clustersData || {};
        const { metricsDatabaseConnected } = session;

        const name = this.getName();

        if (name) {
            dispatch({
                type: types.SET_HEADER_RESOURCE_NAME,
                resourceName: formatMessage(clusterMsgs.clusterDetailsTitle, { name }),
            });
        } else {
            /**
             * No details for this cluster (likely no access), so ro
             */
            this.props.history.push(`/${constants.URI_CLUSTERS}`);
            return;
        }

        // grab the CSP for this cluster so we can get costing details
        const { params } = match || {};
        const { id } = params || {};
        const cluster = clusters.find(cluster => cluster.meta.id === id);
        const { cspDomainId = '' } = cluster || {};

        dispatch(getServicePlans(cspDomainId));
        dispatch(getRoles());
        dispatch(getAccounts());
        dispatch(getClusters());
        dispatch(getAGs());
        dispatch(getCGs());
        dispatch(getCSPs());
        dispatch(getProtectionDomains());
        dispatch(getServicePlanAllocations(id));
        if (metricsDatabaseConnected === constants.METRICS_SERVICE_CONNECTED) {
            dispatch(getVolumesCompliance(startTime.format(), endTime.format()));
        }
        dispatch(getVolumeSeries());
    }

    componentDidUpdate(prevProps) {
        const { clustersData, cspsData, dispatch, intl, match, session } = this.props;
        const { accountId } = session || {};
        const { volumeSeriesData = {} } = this.props;
        const {
            clustersData: prevClustersData,
            cspsData: prevCspsData,
            match: prevMatch,
            session: prevSession,
            volumeSeriesData: prevVolumeSeriesData = {},
        } = prevProps;
        const { formatMessage } = intl;
        const { params } = match || {};
        const { id } = params || {};
        const { clusters = [] } = clustersData || {};
        const cluster = clusters.find(cluster => cluster.meta.id === id);
        const { cspDomainId = '', name } = cluster || {};
        const { csps = [] } = cspsData || {};
        const { params: prevParams } = prevMatch || {};
        const { id: prevId } = prevParams || {};
        const { clusters: prevClusters = [] } = prevClustersData || {};
        const prevCluster = prevClusters.find(vs => vs.meta.id === prevId);
        const { name: prevName } = prevCluster || {};
        const { csps: prevCsps = [] } = prevCspsData || {};
        const { accountId: prevAccountId } = prevSession || {};

        /**
         * Need to redirect to /clusters if
         * - no clusters are found
         * -
         */
        if (!clustersData.loading && (!clusters.length === 0 || !cluster)) {
            // nothing found or no access to this cluster, return to top level resource page
            this.props.history.push(`/${constants.URI_CLUSTERS}`);
            return;
        }

        if (name !== prevName) {
            dispatch({
                type: types.SET_HEADER_RESOURCE_NAME,
                resourceName: formatMessage(clusterMsgs.clusterDetailsTitle, { name }),
            });
        }

        const isCostChanged =
            csps.length !== prevCsps.length ||
            csps.some((csp, idx) => {
                const { storageCosts = {}, meta } = csp || {};
                const { id } = meta || {};
                const { storageCosts: prevStorageCosts = {} } = prevCsps[idx] || {};

                return !_.isEqual(storageCosts, prevStorageCosts) && id === cspDomainId;
            });

        if (isCostChanged) {
            dispatch(getServicePlans(cspDomainId));
            dispatch(getServicePlanAllocations(id));
        }

        if (!volumeSeriesData.loading && prevVolumeSeriesData.loading) {
            const { volumeSeries = [] } = volumeSeriesData || {};
            dispatch(updateNavigationList(volumeSeries));
        }

        if (accountId !== prevAccountId) {
            dispatch(getCSPCredentials());
        }
    }

    closeModal() {
        const { dispatch } = this.props;
        dispatch(closeModal())
    }

    onFilteredChange(data) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_RESOURCE_NAVIGATION_DATA, data });
    }

    onSortedChange(data) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_RESOURCE_NAVIGATION_DATA, data });
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_HEADER_RESOURCE_NAME, resourceName: null });
        this.handleDetailsTabSelect(constants.CLUSTER_DETAILS_TABS.SETTINGS);
    }

    getName() {
        const { match, clustersData } = this.props;
        const { params } = match || {};
        const { id } = params || {};
        const { clusters = [] } = clustersData || {};
        const cluster = clusters.find(cluster => cluster.meta.id === id);
        const { name } = cluster || {};

        return name;
    }

    handleDetailsTabSelect(clusterDetailsTab) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_CLUSTER_DETAILS_TAB, clusterDetailsTab });
    }

    saveSettingsMeta(id, name, description, tags, cspName) {
        const { dispatch } = this.props;
        const params = {
            ...(name && { name }),
            ...(description && { description }),
            ...(tags && { tags }),
        };
        dispatch(patchCluster(id, cspName, params));
    }

    saveSettingsCSP(id, params) {
        const { dispatch } = this.props;
        dispatch(patchCSP(id, params));
    }

    onSPASubmit(selectedCluster, servicePlansDetails) {
        const { dispatch, servicePlanAllocationsData } = this.props;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const accountId = sessionGetAccount();

        Object.keys(servicePlansDetails).forEach(servicePlanId => {
            const patchList = [];
            const postList = [];
            Object.keys(servicePlansDetails[servicePlanId]).forEach(authorizedAccountId => {
                /**
                 * Need to determine if SPA needs to be created or modified.
                 * Look at all existing SPAs:
                 * - if does not exist, post it
                 * - if it exists but a field has been modified,
                 * -- if cost changed, patch the SPA
                 * -- if capacity changed, post the SPA
                 */
                const totalCapacityBytes = servicePlansDetails[servicePlanId][authorizedAccountId].capacity;
                const cost = servicePlansDetails[servicePlanId][authorizedAccountId].cost;

                const found = servicePlanAllocations.find(
                    spa =>
                        spa.authorizedAccountId === authorizedAccountId &&
                        spa.servicePlanId === servicePlanId &&
                        spa.clusterId === selectedCluster
                );

                if (!found) {
                    postList.push({
                        authorizedAccountId,
                        clusterId: selectedCluster,
                        totalCapacityBytes,
                        cost,
                    });
                } else {
                    const capacityFound = servicePlanAllocations.find(
                        spa =>
                            spa.authorizedAccountId === authorizedAccountId &&
                            spa.servicePlanId === servicePlanId &&
                            spa.clusterId === selectedCluster &&
                            spa.totalCapacityBytes === totalCapacityBytes
                    );

                    const costFound = servicePlanAllocations.find(
                        spa =>
                            spa.authorizedAccountId === authorizedAccountId &&
                            spa.servicePlanId === servicePlanId &&
                            spa.clusterId === selectedCluster &&
                            spa.tags.includes(spaTagGenCost(cost))
                    );

                    if (!capacityFound) {
                        postList.push({
                            authorizedAccountId,
                            clusterId: selectedCluster,
                            totalCapacityBytes,
                            cost,
                        });
                    }
                    if (!costFound) {
                        patchList.push({
                            id: found.meta.id,
                            authorizedAccountId,
                            clusterId: selectedCluster,
                            tags: [spaTagGenCost(cost)],
                        });
                    }
                }
            });

            if (patchList.length > 0) {
                patchList.forEach(spa => {
                    const { id, tags } = spa;
                    const params = {
                        tags,
                    };
                    dispatch(patchServicePlanAllocations(id, params));
                });
            }
            if (postList.length > 0) {
                dispatch(postServicePlanAllocations(accountId, servicePlanId, postList));
            }
        });
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    handleGetClusterAccountSecret(id, authorizedAccountId) {
        const { dispatch, intl } = this.props;
        const { formatMessage } = intl;

        dispatch(getClusterAccountSecret(id, authorizedAccountId));
        dispatch(
            openModal(ClusterYaml, {
                accountSecretMode: true,
                dark: true,
                info: formatMessage(clusterMsgs.yamlClusterAccountSecretInfo),
                title: formatMessage(clusterMsgs.yamlClusterAccountSecretTitle),
            })
        );
    }

    getClusterYaml(clusterId) {
        const { dispatch, intl } = this.props;
        const { formatMessage } = intl;

        dispatch(getOrchestratorDeployment(clusterId));

        this.openModal(ClusterYaml, {
            dark: true,
            title: formatMessage(clusterMsgs.clusterYamlK8s),
        });
    }

    dispatchDeleteClusters(clusters) {
        const { dispatch } = this.props;
        dispatch(deleteClusters(clusters));
    }

    deleteClusters(clusters) {
        const { dispatch, intl } = this.props;
        const { formatMessage } = intl;

        dispatch(
            openModal(
                DeleteForm,
                {
                    title: formatMessage(clusterMsgs.deleteTitle, { count: clusters.length }),
                    deleteFunc: this.dispatchDeleteClusters,
                },
                {
                    data: clusters,
                    message: formatMessage(clusterMsgs.deleteMsg, {
                        count: clusters.length,
                        name: clusters[0].name,
                    }),
                }
            )
        );
    }

    render() {
        const {
            accountsData,
            applicationGroupsData,
            clustersData,
            consistencyGroupsData,
            cspCredentialsData,
            cspsData,
            match,
            protectionDomainsData,
            rolesData = {},
            servicePlanAllocationsData,
            servicePlansData,
            session,
            tableVolumeSeries,
            uiSettings,
            userData = {},
            volumeComplianceTotalsData,
            volumeSeriesData,
        } = this.props;

        const { params } = match || {};
        const { id } = params || {};
        const { clusterDetailsTab } = uiSettings || {};
        const { clusters = [] } = clustersData || {};
        const { volumeSeries = [] } = volumeSeriesData || {};
        const cluster = (Array.isArray(clusters) && clusters.find(cluster => cluster.meta.id === id)) || {};
        const { servicePlanAllocations } = servicePlanAllocationsData || {};
        const poolCount = servicePlanAllocations.filter(spa => spa.clusterId === id).length;
        const volumeCount = volumeSeries.filter(volume => volume.boundClusterId === id).length;

        const { csps = [] } = cspsData || {};
        const csp = csps.find(csp => csp.meta.id === cluster.cspDomainId);

        /**
         * Need to pass
         * - Meta info
         * - Audit log info (create on date by X)
         * - Cluster type
         * - Number pools/spas
         * - Number of accounts (with link to accounts, probably need to add query)
         * - Number of volumes (with link to volumes, probably need to add query)
         * - Associated CSP metadata
         */

        return (
            <ClusterDetails
                accountsData={accountsData}
                applicationGroupsData={applicationGroupsData}
                closeModal={this.closeModal}
                cluster={cluster}
                clustersData={clustersData}
                consistencyGroupsData={consistencyGroupsData}
                csp={csp}
                cspCredentialsData={cspCredentialsData}
                deleteClusters={this.deleteClusters}
                dialogTogglePools={this.dialogTogglePools}
                getClusterAccountSecret={this.getClusterAccountSecret}
                getClusterYaml={this.getClusterYaml}
                onFilteredChange={this.onFilteredChange}
                onGetClusterAccountSecret={this.handleGetClusterAccountSecret}
                onSortedChange={this.onSortedChange}
                onSPASubmit={this.onSPASubmit}
                onTabSelect={this.handleDetailsTabSelect}
                openModal={this.openModal}
                poolCount={poolCount}
                protectionDomainsData={protectionDomainsData}
                rolesData={rolesData}
                saveSettingsCSP={this.saveSettingsCSP}
                saveSettingsMeta={this.saveSettingsMeta}
                servicePlanAllocationsData={servicePlanAllocationsData}
                servicePlansData={servicePlansData}
                session={session}
                tabKey={clusterDetailsTab}
                tableVolumeSeries={tableVolumeSeries}
                userData={userData}
                volumeComplianceTotalsData={volumeComplianceTotalsData}
                volumeCount={volumeCount}
                volumeSeriesData={volumeSeriesData}
            />
        );
    }
}

ClusterDetailsContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    applicationGroupsData: PropTypes.object,
    clustersData: PropTypes.object.isRequired,
    consistencyGroupsData: PropTypes.object,
    cspCredentialsData: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    protectionDomainsData: PropTypes.object.isRequired,
    rolesData: PropTypes.object,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    servicePlansData: PropTypes.object.isRequired,
    session: PropTypes.object,
    tableVolumeSeries: PropTypes.object,
    uiSettings: PropTypes.object,
    userData: PropTypes.object,
    volumeComplianceTotalsData: PropTypes.object,
    volumeSeriesData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const {
        accountsData,
        applicationGroupsData,
        clustersData,
        consistencyGroupsData,
        cspCredentialsData,
        cspsData,
        protectionDomainsData,
        rolesData,
        servicePlanAllocationsData,
        servicePlansData,
        session,
        tableVolumeSeries,
        uiSettings,
        userData,
        volumeComplianceTotalsData,
        volumeSeriesData,
    } = state;
    return {
        accountsData,
        applicationGroupsData,
        clustersData,
        consistencyGroupsData,
        cspCredentialsData,
        cspsData,
        protectionDomainsData,
        rolesData,
        servicePlanAllocationsData,
        servicePlansData,
        session,
        tableVolumeSeries,
        uiSettings,
        userData,
        volumeComplianceTotalsData,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(ClusterDetailsContainer));
