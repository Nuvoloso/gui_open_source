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
import { Collapse, OverlayTrigger, Tab, Tabs, Tooltip } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';

import ButtonAction from './ButtonAction';
import Clusters from '../components/Clusters';
import ClusterSettingsCSP from './ClusterSettingsCSP';
import CreateProtectionDomainDialog from '../components/CreateProtectionDomainDialog';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import ProtectionDomainsContainer from '../containers/ProtectionDomainsContainer';
import StorageCostsForm from './StorageCostsForm';
import { isAccountAdmin, isAccountUser, isTenantAdmin } from '../containers/userAccountUtils';

import { cspDomainMsgs } from '../messages/CSPDomain';

import { Cloud, Domain } from '@material-ui/icons';

import './resources.css';

import * as constants from '../constants';

class CSPDomainDetails extends Component {
    constructor(props) {
        super(props);

        const { tabKey } = this.props;

        this.state = {
            openDialogCreateProtectionDomain: false,
            storageCosts: {},
            tabKey,
        };

        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.renderCreateProtectionDomainDialog = this.renderCreateProtectionDomainDialog.bind(this);
        this.renderStorageCosts = this.renderStorageCosts.bind(this);
        this.toggleDialogCreateProtectionDomain = this.toggleDialogCreateProtectionDomain.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { tabKey } = this.props;
        const { tabKey: prevTabKey } = prevProps;
        const { tabKey: stateTabKey } = this.state;

        if (tabKey !== prevTabKey && tabKey !== stateTabKey) {
            this.setState({ tabKey });
        }
    }

    handleTabSelect(tabKey) {
        this.setState({ tabKey });

        const { onTabSelect } = this.props;
        if (onTabSelect) {
            onTabSelect(tabKey);
        }
    }

    /**
     * We may be coming from a Link and need to load a specific tab.
     */
    componentDidMount() {
        const { location } = this.props;
        const { state } = location || {};
        const { openDialogCreateProtectionDomain, tabKey } = state || {};

        if (openDialogCreateProtectionDomain) {
            this.setState({ openDialogCreateProtectionDomain });
        }

        if (tabKey) {
            this.setState({ tabKey });
        }
    }

    toggleDialogCreateProtectionDomain() {
        const { openDialogCreateProtectionDomain } = this.state;
        this.setState({
            openDialogCreateProtectionDomain: !openDialogCreateProtectionDomain,
        });
    }

    renderCreateProtectionDomainDialog() {
        const {
            account,
            csp,
            onProtectionDomainCreateSubmit,
            protectionDomainMetadataData,
            protectionDomainsData,
        } = this.props;
        const { openDialogCreateProtectionDomain } = this.state;

        return (
            <Collapse in={openDialogCreateProtectionDomain} unmountOnExit>
                <div className="account-details-user-dialog">
                    <CreateProtectionDomainDialog
                        account={account}
                        cancel={this.toggleDialogCreateProtectionDomain}
                        csp={csp}
                        onSubmit={onProtectionDomainCreateSubmit}
                        protectionDomainsData={protectionDomainsData}
                        protectionDomainMetadataData={protectionDomainMetadataData}
                    />
                </div>
            </Collapse>
        );
    }

    renderFetchStatus() {
        const {
            accountsData = {},
            clusterComplianceTotalsData = {},
            clustersData = {},
            cspCredentialsData = {},
            cspsData = {},
            cspStorageTypesData = {},
            protectionDomainMetadataData = {},
            protectionDomainsData = {},
            rolesData = {},
            volumeSeriesData = {},
        } = this.props;

        if (
            accountsData.loading ||
            clusterComplianceTotalsData.loading ||
            clustersData.loading ||
            cspCredentialsData.loading ||
            cspsData.loading ||
            cspStorageTypesData.loading ||
            protectionDomainMetadataData.loading ||
            protectionDomainsData.loading ||
            rolesData.loading ||
            volumeSeriesData.loading
        ) {
            return <Loader />;
        }
    }

    cspVolumes(clusters) {
        const cspVolumes = [];

        const { volumeSeriesData } = this.props;
        const { volumeSeries = [] } = volumeSeriesData;

        clusters.forEach(cluster => {
            const { meta } = cluster;
            const { id } = meta || {};

            volumeSeries.forEach(vol => {
                const { boundClusterId } = vol || {};

                if (boundClusterId === id) {
                    cspVolumes.push(vol);
                }
            });
        });

        return cspVolumes;
    }

    getAccountName(accountId) {
        const { accountsData } = this.props;
        const { accounts } = accountsData || {};

        const account = accounts.find(account => {
            return account.meta.id === accountId;
        });

        if (account) {
            return account.name;
        } else {
            return '';
        }
    }

    getRegion() {
        const { csp } = this.props;
        const { cspDomainAttributes = {}, cspDomainType } = csp || {};

        switch (cspDomainType) {
            case constants.CSP_DOMAINS.AWS: {
                const region =
                    cspDomainAttributes[constants.AWS_REGION] && cspDomainAttributes[constants.AWS_REGION].value;

                return region;
            }
            case constants.CSP_DOMAINS.GCP: {
                const region = cspDomainAttributes[constants.GC_ZONE] && cspDomainAttributes[constants.GC_ZONE].value;

                return region;
            }

            default:
                return '';
        }
    }

    zoneRegionHeader() {
        const { csp, intl } = this.props;
        const { formatMessage } = intl;
        const { cspDomainType } = csp || {};
        const region = this.getRegion();

        switch (cspDomainType) {
            case constants.CSP_DOMAINS.AWS: {
                return (
                    <FieldGroup
                        className="mb5"
                        label={formatMessage(cspDomainMsgs.regionLabel)}
                        labelMinWidth="105px"
                        inputComponent={<div className="resource-details-value">{region}</div>}
                    />
                );
            }
            case constants.CSP_DOMAINS.GCP: {
                return (
                    <FieldGroup
                        className="mb5"
                        label={formatMessage(cspDomainMsgs.zoneLabel)}
                        labelMinWidth="105px"
                        inputComponent={<div className="resource-details-value">{region}</div>}
                    />
                );
            }

            default:
                return '';
        }
    }

    renderHeader() {
        const { clustersData, csp, intl, rolesData, userData } = this.props;
        const { accountId, authorizedAccounts = [], cspDomainType, meta, name = '' } = csp || {};
        const { id, timeCreated } = meta || {};
        const accountName = this.getAccountName(accountId);
        const { formatMessage } = intl;
        const { user } = userData || {};
        const tenantAdmin = isTenantAdmin(user, rolesData);

        const { clusters = [] } = clustersData || {};
        const clustersInDomain = clusters.filter(cluster => cluster.cspDomainId === id);
        const cspVolumes = this.cspVolumes(clustersInDomain);

        return (
            <div className="resource-details-header">
                <div className="layout-icon-background">
                    <div className="layout-icon">
                        <Cloud />
                    </div>
                </div>
                <div className="resource-details-header-attributes-container">
                    <div className="resource-details-title mt20">
                        {formatMessage(cspDomainMsgs.cspDetailsTitle, { name })}
                    </div>
                    <div className="resource-details-header-attributes">
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(cspDomainMsgs.createdOnLabel)}
                                inputComponent={
                                    <div className="resource-details-value">{moment(timeCreated).format('l')}</div>
                                }
                            />
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(cspDomainMsgs.createdByLabel)}
                                inputComponent={
                                    tenantAdmin ? (
                                        <Link
                                            className="value-link"
                                            to={{ pathname: `/${constants.URI_ACCOUNTS}/${accountId || ''}` }}
                                        >
                                            {accountName}
                                        </Link>
                                    ) : (
                                        accountName
                                    )
                                }
                            />
                        </div>
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(cspDomainMsgs.domainTypeLabel)}
                                labelMinWidth="105px"
                                inputComponent={<div className="resource-details-value">{cspDomainType}</div>}
                            />
                            {this.zoneRegionHeader()}
                        </div>
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(cspDomainMsgs.accountsLabel)}
                                inputComponent={
                                    authorizedAccounts.length > 0 ? (
                                        <OverlayTrigger
                                            overlay={
                                                <Tooltip id="resource-details-header-tooltip">
                                                    {authorizedAccounts.map(accountId => {
                                                        const { accountsData } = this.props;
                                                        const { accounts = [] } = accountsData || {};
                                                        const account = accounts.find(
                                                            account => account.meta.id === accountId
                                                        );
                                                        const { name } = account || {};

                                                        return <div key={accountId}>{name}</div>;
                                                    })}
                                                </Tooltip>
                                            }
                                        >
                                            <div className="resource-details-value">{authorizedAccounts.length}</div>
                                        </OverlayTrigger>
                                    ) : (
                                        <div className="resource-details-value">{authorizedAccounts.length}</div>
                                    )
                                }
                            />
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(cspDomainMsgs.volumesLabel)}
                                inputComponent={
                                    cspVolumes.length > 0 ? (
                                        <OverlayTrigger
                                            overlay={
                                                <Tooltip id="resource-details-header-tooltip">
                                                    {cspVolumes.map(vol => {
                                                        const { meta, name } = vol || {};
                                                        const { id } = meta || {};

                                                        return <div key={id}>{name}</div>;
                                                    })}
                                                </Tooltip>
                                            }
                                        >
                                            <div className="resource-details-value">{cspVolumes.length}</div>
                                        </OverlayTrigger>
                                    ) : (
                                        <div className="resource-details-value">{cspVolumes.length}</div>
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="layout-actions">
                    <ButtonAction
                        icon={<Domain />}
                        id="accountCreateProtectionDomain"
                        label={formatMessage(cspDomainMsgs.setProtectionPasswordLabel)}
                        onClick={this.toggleDialogCreateProtectionDomain}
                    />
                </div>
            </div>
        );
    }

    clusterTabTitle(clustersInDomain) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="content-flex-row-centered">
                <div>{formatMessage(cspDomainMsgs.clustersTabLabel)} </div>
                <div className="tab-count color-queue ml10">{clustersInDomain.length}</div>
            </div>
        );
    }

    renderStorageCosts() {
        const { csp, cspStorageTypesData, saveSettingsCSP } = this.props;

        return <StorageCostsForm csp={csp} cspStorageTypesData={cspStorageTypesData} onSubmit={saveSettingsCSP} />;
    }

    renderTabs() {
        const {
            account,
            cluster,
            clusterComplianceTotalsData,
            clustersData,
            csp = {},
            cspCredentialsData,
            cspsData,
            intl,
            rolesData,
            saveSettingsCSP,
            userData,
            volumeSeriesData,
        } = this.props;
        const { formatMessage } = intl;
        const { tabKey } = this.state;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const { meta } = csp || {};
        const { id } = meta || {};
        const { clusters = [] } = clustersData || {};
        const { loading } = cspsData || {};
        const { openDialogCreateProtectionDomain } = this.state;
        const { user } = userData || {};
        const tenantAdmin = isTenantAdmin(user, rolesData);
        const normalAccount = isAccountAdmin(user, rolesData);
        const filteredVolumeSeriesData = _.cloneDeep(volumeSeriesData);
        filteredVolumeSeriesData.volumeSeries = volumeSeries.filter(volume => {
            return volume.boundClusterId === id;
        });
        const disableEdit = isAccountUser(user, rolesData) || isAccountAdmin(user, rolesData);
        const filteredClustersData = _.cloneDeep(clustersData);
        filteredClustersData.clusters = clusters.filter(cluster => cluster.cspDomainId === id);
        const { clusters: clustersInDomain = [] } = filteredClustersData || {};

        return (
            <Tabs
                activeKey={tabKey}
                className="tabs-container"
                id="resource-details-tabs"
                mountOnEnter
                onSelect={this.handleTabSelect}
            >
                <Tab
                    eventKey={constants.CSP_DETAILS_TABS.SETTINGS}
                    title={formatMessage(cspDomainMsgs.detailsTabLabel)}
                >
                    <ClusterSettingsCSP
                        cluster={cluster}
                        csp={csp}
                        cspCredentialsData={cspCredentialsData}
                        disableEdit={disableEdit}
                        hideCredential={normalAccount}
                        loading={loading}
                        saveSettings={saveSettingsCSP}
                    />
                </Tab>
                <Tab eventKey={constants.CSP_DETAILS_TABS.CLUSTERS} title={this.clusterTabTitle(clustersInDomain)}>
                    <Clusters
                        clearSelectedRow={this.clearSelectedRow}
                        clustersData={filteredClustersData}
                        cspsData={cspsData}
                        clusterComplianceTotalsData={clusterComplianceTotalsData}
                        deleteClusters={this.deleteClusters}
                        dialogSaveCluster={this.dialogSaveCluster}
                        dialogToggleCreate={this.dialogToggleCreate}
                        filterLeft
                        hideColumns={['actions']}
                        openModal={this.openModal}
                        patchCluster={this.patchCluster}
                        pivotBy={[]} // no pivot, single domain
                        rolesData={rolesData}
                        tableOnly={true}
                        userData={userData}
                        volumeSeriesData={filteredVolumeSeriesData}
                    />
                </Tab>
                {tenantAdmin ? (
                    <Tab
                        eventKey={constants.CSP_DETAILS_TABS.STORAGE}
                        title={formatMessage(cspDomainMsgs.storageTabLabel)}
                    >
                        <div className="content-flex-column">{this.renderStorageCosts()}</div>
                    </Tab>
                ) : null}
                <Tab
                    eventKey={constants.CSP_DETAILS_TABS.PROTECTION_DOMAINS}
                    title={formatMessage(cspDomainMsgs.tabProtectionDomainsLabel)}
                >
                    <ProtectionDomainsContainer
                        account={account}
                        csp={csp}
                        dialogOpenCreate={openDialogCreateProtectionDomain}
                        tableOnly
                    />
                </Tab>
            </Tabs>
        );
    }

    render() {
        return (
            <div className="resource-details dark">
                <div className="component-page">
                    {this.renderFetchStatus()}
                    {this.renderHeader()}
                    {this.renderCreateProtectionDomainDialog()}
                    {this.renderTabs()}
                </div>
            </div>
        );
    }
}

CSPDomainDetails.propTypes = {
    account: PropTypes.object,
    accountsData: PropTypes.object,
    cluster: PropTypes.object,
    clusterComplianceTotalsData: PropTypes.object,
    clustersData: PropTypes.object,
    csp: PropTypes.object,
    cspCredentialsData: PropTypes.object,
    cspsData: PropTypes.object,
    cspStorageTypesData: PropTypes.object,
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
    location: PropTypes.object.isRequired,
    onProtectionDomainCreateSubmit: PropTypes.func,
    onTabSelect: PropTypes.func,
    openModal: PropTypes.func,
    protectionDomainMetadataData: PropTypes.object,
    protectionDomainsData: PropTypes.object,
    rolesData: PropTypes.object,
    saveSettingsCSP: PropTypes.func,
    tabKey: PropTypes.string,
    userData: PropTypes.object,
    volumeSeriesData: PropTypes.object,
};

export default withRouter(injectIntl(CSPDomainDetails));
