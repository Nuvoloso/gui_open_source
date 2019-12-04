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
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment';

import Clusters from '../components/Clusters';
import ClusterYaml from '../components/ClusterYaml';
import ProtectionDomainDetailsForm from '../components/ProtectionDomainDetailsForm';

import { ATTRIBUTE_AWS, ATTRIBUTE_GCP, ATTRIBUTE_AWS_NO_CRED, ATTRIBUTE_GCP_NO_CRED } from '../reducers/csps';
import { clusterMsgs } from '../messages/Cluster';
import { accountMsgs } from '../messages/Account';
import { getClusters, getOrchestratorDeployment, patchCluster, postCluster } from '../actions/clusterActions';
import { getClustersCompliance } from '../actions/complianceActions';
import { getCSPCredentials, getCSPs, postCSPandCluster, postCredentialCSPCluster } from '../actions/cspActions';
import { getProtectionDomainMetadata } from '../actions/protectionDomainActions';
import { getRoles } from '../actions/roleActions';
import { getServicePlans } from '../actions/servicePlanActions';
import { getServicePlanAllocations } from '../actions/servicePlanAllocationActions';
import { getSystemHostname } from '../actions/systemActions';
import { openModal } from '../actions/modalActions';
import { sessionGetAccount } from '../sessionUtils';

import * as types from '../actions/types';
import * as constants from '../constants';

class ClustersContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialogOpenCreate: false,
        };

        this.clearSelectedRow = this.clearSelectedRow.bind(this);
        this.dialogSaveCluster = this.dialogSaveCluster.bind(this);
        this.dialogToggleCreate = this.dialogToggleCreate.bind(this);
        this.getClusterYaml = this.getClusterYaml.bind(this);
        this.getSystemHostname = this.getSystemHostname.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchCluster = this.patchCluster.bind(this);
    }

    clearSelectedRow(id) {
        const { dispatch } = this.props;
        dispatch({ type: `${types.REMOVE_SELECTED_ROW}_CLUSTERS_TABLE`, row: { id } });
    }

    componentDidMount() {
        const { dispatch, session } = this.props;
        const startTime = moment()
            .utc()
            .subtract(1, 'day');
        const endTime = moment().utc();
        const { metricsDatabaseConnected } = session;

        dispatch(getCSPs());
        dispatch(getCSPCredentials());
        dispatch(getClusters());
        dispatch(getServicePlans());
        dispatch(getServicePlanAllocations());
        dispatch(getRoles());
        dispatch(getProtectionDomainMetadata());

        if (metricsDatabaseConnected === constants.METRICS_SERVICE_CONNECTED) {
            dispatch(getClustersCompliance(startTime.format(), endTime.format()));
        }
    }

    protectionDetailsModal() {
        const { accountsData, dispatch, intl, session } = this.props;
        const { accountId } = session || {};
        const { formatMessage } = intl;
        const { protectionDomainsData } = this.props;
        const { protectionDomains = [] } = protectionDomainsData || {};
        const { accounts = [] } = accountsData || {};
        const account = accounts.find(acct => acct.meta.id === accountId);
        const { snapshotCatalogPolicy } = account || {};
        const { protectionDomainId } = snapshotCatalogPolicy || {};
        const protectionDomain = protectionDomains.find(pd => pd.meta.id === protectionDomainId) || {};
        const { cspsData } = this.props || {};
        const { csps = [] } = cspsData || {};
        const csp = csps.find(csp => {
            return csp.accountId === accountId;
        });
        const { cspDomainAttributes } = csp || {};
        const { aws_protection_store_bucket_name, aws_region } = cspDomainAttributes || {};
        const { value: bucketName } = aws_protection_store_bucket_name || {};
        const { value: region } = aws_region || {};

        // add the id, bucketname, region separately as the dialog is also called from the table
        // with a slightly different object
        const constructedRow = {
            ...protectionDomain,
            bucketName,
            id: protectionDomainId,
            region,
        };
        dispatch(
            openModal(
                ProtectionDomainDetailsForm,
                {
                    dark: true,
                    id: 'protectionDomainsSetActiveDomain',
                    title: formatMessage(accountMsgs.protectionInformationDialogTitle),
                },
                {
                    protectionDomain: constructedRow,
                    snapshotCatalogCreated: true,
                }
            )
        );
    }

    componentDidUpdate(prevProps) {
        const { orchestratorDeploymentData = {}, dispatch, intl } = this.props;
        const { formatMessage } = intl;
        const { orchestratorDeploymentData: prevOrchestratorDeploymentData = {} } = prevProps;
        const { accountsData } = this.props;
        const { accountsData: prevAccountsData } = prevProps;
        const { settingPolicy } = accountsData || {};
        const { settingPolicy: prevSettingPolicy } = prevAccountsData || {};

        if (prevOrchestratorDeploymentData.loading && !orchestratorDeploymentData.loading) {
            dispatch(
                openModal(ClusterYaml, {
                    dark: true,
                    title: formatMessage(clusterMsgs.clusterYamlK8s),
                })
            );
        }

        if (!settingPolicy && prevSettingPolicy) {
            this.protectionDetailsModal();
        }
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

    getSystemHostname() {
        const { dispatch } = this.props;
        dispatch(getSystemHostname());
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    patchCluster(id, cspDomainName, params) {
        const { dispatch } = this.props;
        dispatch(patchCluster(id, cspDomainName, params));
    }

    dialogToggleCreate() {
        const { dialogOpenCreate } = this.state;

        this.setState({ dialogOpenCreate: !dialogOpenCreate });
    }

    domainAttributes(options) {
        const { accessKeyId, accessRegion, accessZone, cspDomainType, gc_cred, secretKey } = options;

        switch (cspDomainType) {
            case constants.CSP_DOMAINS.AWS: {
                const cspDomainAttributes = ATTRIBUTE_AWS;

                cspDomainAttributes[constants.AWS_ACCESS_KEY_ID].value = accessKeyId;
                cspDomainAttributes[constants.AWS_SECRET_ACCESS_KEY].value = secretKey;

                cspDomainAttributes[constants.AWS_REGION].value = accessRegion;
                cspDomainAttributes[constants.AWS_AVAILABILITY_ZONE].value = accessZone;

                return cspDomainAttributes;
            }
            case constants.CSP_DOMAINS.GCP: {
                const cspDomainAttributes = ATTRIBUTE_GCP;

                cspDomainAttributes[constants.GC_CRED].value = gc_cred;

                cspDomainAttributes[constants.GC_ZONE].value = accessZone;

                return cspDomainAttributes;
            }
            default:
                return {};
        }
    }

    domainAttributesPruned(options) {
        const { accessRegion, accessZone, cspDomainType } = options;

        switch (cspDomainType) {
            case constants.CSP_DOMAINS.AWS: {
                const cspDomainAttributes = ATTRIBUTE_AWS_NO_CRED;

                cspDomainAttributes[constants.AWS_REGION].value = accessRegion;
                cspDomainAttributes[constants.AWS_AVAILABILITY_ZONE].value = accessZone;

                return cspDomainAttributes;
            }
            case constants.CSP_DOMAINS.GCP: {
                const cspDomainAttributes = ATTRIBUTE_GCP_NO_CRED;

                cspDomainAttributes[constants.GC_ZONE].value = accessZone;

                return cspDomainAttributes;
            }
            default:
                return {};
        }
    }

    /**
     * Need all the options from the dialog, including for CSP
     */
    dialogSaveCluster(options) {
        const { dispatch } = this.props;
        const {
            clusterName,
            createSnapshotCatalogPolicy,
            cspCredentialId,
            cspCredentialName,
            cspDescription: description,
            cspDomainType,
            cspId: cspDomainId,
            cspTags: tags,
            domainName,
            encryptionAlgorithmObj,
            managementHost,
            passphrase,
            selectedCredentialType,
            selectedOption,
        } = options;
        const encryptionPassphrase = {
            kind: 'SECRET',
            value: passphrase,
        };
        const { encryptionAlgorithm } = encryptionAlgorithmObj || {};
        const protectionDomainName = `SNAPSHOT_CATALOG`;

        /**
         * Need to either
         *
         * (1) Use an existing domain
         *
         * or
         *
         * (2) Create a new domain with different chained actions
         * Optionally create the CSP credential
         * Create the CSP domain
         * Create the cluster
         */
        if (selectedOption === constants.OPTION_USE_EXISTING) {
            /**
             * Create the cluster using an existing domain
             */
            const authorizedAccounts = [];
            const clusterAttributes = {};
            const params = {
                clusterType: constants.ORCHESTRATOR_TYPE_KUBERNETES,
                name: clusterName,
                cspDomainId,
                ...(clusterAttributes && { clusterAttributes }),
                ...(authorizedAccounts && { authorizedAccounts }),
                ...(description && { description }),
                ...(tags && { tags }),
            };
            dispatch(postCluster(params));
        } else {
            const name = domainName;

            const cspDomainAttributes =
                selectedCredentialType === constants.OPTION_USE_EXISTING
                    ? this.domainAttributesPruned(options)
                    : this.domainAttributes(options);

            const params = {
                ...(cspCredentialName && { cspCredentialName }),
                ...(cspDomainType && { cspDomainType }),
                ...(description && { description }),
                ...(encryptionAlgorithm && { encryptionAlgorithm }),
                ...(encryptionPassphrase && { encryptionPassphrase }),
                ...(managementHost && { managementHost }),
                ...(name && { name }),
                ...(Object.keys(cspDomainAttributes).length > 0 && { cspDomainAttributes }),
                ...(protectionDomainName && { protectionDomainName }),
                ...(selectedCredentialType === constants.OPTION_USE_EXISTING && { cspCredentialId }),
                ...(tags.length > 0 && { tags }),
                ...(createSnapshotCatalogPolicy && { createSnapshotCatalogPolicy }),
                accountId: sessionGetAccount(),
            };

            if (selectedCredentialType === constants.OPTION_CREATE_NEW) {
                dispatch(postCredentialCSPCluster(params, clusterName));
            } else {
                dispatch(postCSPandCluster(params, clusterName));
            }
        }

        this.setState({ dialogOpenCreate: false });
    }

    render() {
        const {
            accountsData,
            clusterComplianceTotalsData,
            clustersData,
            cspCredentialsData,
            cspsData,
            protectionDomainMetadataData,
            rolesData,
            servicePlanAllocationsData,
            systemData,
            tableClusters,
            userData,
            volumeSeriesData,
        } = this.props;
        const { dialogOpenCreate } = this.state;

        return (
            <Clusters
                accountsData={accountsData}
                clearSelectedRow={this.clearSelectedRow}
                clusterComplianceTotalsData={clusterComplianceTotalsData}
                clustersData={clustersData}
                cspCredentialsData={cspCredentialsData}
                cspsData={cspsData}
                deleteClusters={this.deleteClusters}
                dialogOpenCreate={dialogOpenCreate}
                dialogSaveCluster={this.dialogSaveCluster}
                dialogToggleCreate={this.dialogToggleCreate}
                getClusterYaml={this.getClusterYaml}
                getSystemHostname={this.getSystemHostname}
                openModal={this.openModal}
                patchCluster={this.patchCluster}
                protectionDomainMetadataData={protectionDomainMetadataData}
                rolesData={rolesData}
                selectedRows={tableClusters.selectedRows}
                servicePlanAllocationsData={servicePlanAllocationsData}
                systemData={systemData}
                userData={userData}
                volumeSeriesData={volumeSeriesData}
            />
        );
    }
}

ClustersContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    clusterComplianceTotalsData: PropTypes.object.isRequired,
    clustersData: PropTypes.object.isRequired,
    cspCredentialsData: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    orchestratorDeploymentData: PropTypes.object.isRequired,
    protectionDomainMetadataData: PropTypes.object.isRequired,
    protectionDomainsData: PropTypes.object.isRequired,
    rolesData: PropTypes.object,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    session: PropTypes.object,
    systemData: PropTypes.object.isRequired,
    tableClusters: PropTypes.object.isRequired,
    userData: PropTypes.object,
    volumeSeriesData: PropTypes.object,
};

function mapStateToProps(state) {
    const {
        accountsData,
        clusterComplianceTotalsData,
        clustersData,
        cspCredentialsData,
        cspsData,
        orchestratorDeploymentData,
        protectionDomainMetadataData,
        protectionDomainsData,
        rolesData,
        servicePlanAllocationsData,
        session,
        systemData,
        tableClusters,
        userData,
        volumeSeriesData,
    } = state;
    return {
        accountsData,
        clusterComplianceTotalsData,
        clustersData,
        cspCredentialsData,
        cspsData,
        orchestratorDeploymentData,
        protectionDomainMetadataData,
        protectionDomainsData,
        rolesData,
        servicePlanAllocationsData,
        session,
        systemData,
        tableClusters,
        userData,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(ClustersContainer));
