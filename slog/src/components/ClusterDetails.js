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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Collapse, FormControl, Glyphicon, OverlayTrigger, Tab, Tabs, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import { Link, withRouter } from 'react-router-dom';
import _ from 'lodash';

import Alert from './Alert';
import ButtonAction from './ButtonAction';
import ClusterSettings from './ClusterSettings';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import PoolsTableContainer from '../containers/PoolsTableContainer';
import SPAForm from './SPAForm';
import TableContainer from '../containers/TableContainer';
import TableWrapper from './Table';
import VolumeSeries from './VolumeSeries';

import {
    formatTime,
    getClusterStateDescriptionMsg,
    getClusterStateMsg,
    getServiceStateDescriptionMsg,
    getServiceStateMsg,
    renderServiceStateIcon,
    renderTags,
} from './utils';
import { isTenantAdmin } from '../containers/userAccountUtils';
import { clusterMsgs } from '../messages/Cluster';
import { messages } from '../messages/Messages';
import { sessionGetAccount } from '../sessionUtils';

import btnAddAccountHov from '../assets/btn-add-account-hov.svg';
import btnAddAccountUp from '../assets/btn-add-account-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnPoolHov from '../assets/btn-pool-hov.svg';
import btnPoolUp from '../assets/btn-pool-up.svg';
import clusterIcon from '../assets/cluster.svg';

import './clusters.css';
import './resources.css';

import * as constants from '../constants';

class ClusterDetails extends Component {
    constructor(props) {
        super(props);

        const { tabKey } = this.props;

        this.state = {
            dialogOpenPools: false,
            tabKey,
        };

        this.clusterTabNodes = this.clusterTabNodes.bind(this);
        this.deleteCluster = this.deleteCluster.bind(this);
        this.dialogTogglePools = this.dialogTogglePools.bind(this);
        this.getAccountName = this.getAccountName.bind(this);
        this.getClusterYaml = this.getClusterYaml.bind(this);
        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.renderNodes = this.renderNodes.bind(this);
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
        const { tabKey } = state || {};

        if (tabKey) {
            this.setState({ tabKey });
        }
    }

    handleClusterDeployable(missingRequiredItems) {
        const { cluster, getClusterYaml, intl } = this.props;
        const { meta, state } = cluster || {};
        const { id } = meta || {};
        const { formatMessage } = intl;

        const deployable = state === constants.CLUSTER_STATES.DEPLOYABLE;

        if (deployable) {
            missingRequiredItems.push({
                actionHandler: () => {
                    if (getClusterYaml) {
                        getClusterYaml(id);
                    }
                },
                actionLabel: formatMessage(clusterMsgs.getClusterYamlLabel),
                description: formatMessage(clusterMsgs.requiredManagedDesc),
            });
        }

        return deployable;
    }

    renderFetchStatus() {
        const {
            accountsData = {},
            applicationGroupsData = {},
            clustersData = {},
            consistencyGroupsData = {},
            cspCredentialsData = {},
            servicePlanAllocationsData = {},
            volumeSeriesData = {},
            volumeComplianceTotalsData = {},
        } = this.props;

        if (
            accountsData.loading ||
            applicationGroupsData.loading ||
            clustersData.loading ||
            cspCredentialsData.loading ||
            consistencyGroupsData.loading ||
            servicePlanAllocationsData.loading ||
            volumeComplianceTotalsData.loading ||
            volumeSeriesData.loading
        ) {
            return <Loader />;
        }
    }

    clusterVolumes(clusterId) {
        const { volumeSeriesData } = this.props;
        const { volumeSeries = [] } = volumeSeriesData;

        const volumes = volumeSeries.filter(volume => {
            return volume.boundClusterId === clusterId;
        });

        return (volumes && volumes.length) || 0;
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

    dialogTogglePools() {
        const { dialogOpenPools } = this.state;

        this.setState({ dialogOpenPools: !dialogOpenPools });
    }

    getClusterYaml() {
        const { cluster, getClusterYaml } = this.props;
        const { meta } = cluster || {};
        const { id } = meta;

        if (getClusterYaml) {
            getClusterYaml(id);
        }
    }

    getServiceStateClassName(state) {
        switch (state) {
            case constants.SERVICE_STATES.ERROR:
            case constants.SERVICE_STATES.STOPPED:
            case constants.SERVICE_STATES.STOPPING:
                return 'nuvo-color-critical-red';
            case constants.SERVICE_STATES.NOT_READY:
            case constants.SERVICE_STATES.STARTING:
            case constants.SERVICE_STATES.UNKNOWN:
                return 'nuvo-color-neutral-yellow';
            case constants.SERVICE_STATES.READY:
                return 'nuvo-color-safe-green';
            default:
                return '';
        }
    }

    deleteCluster() {
        const { cluster, deleteClusters } = this.props;
        const { meta = {}, name = '' } = cluster || {};
        const { id } = meta || '';

        const clusters = [
            {
                id,
                name,
            },
        ];

        deleteClusters(clusters);
    }

    renderHeader() {
        const { cluster, intl, onGetClusterAccountSecret, poolCount, rolesData, userData, volumeCount } = this.props;
        const { accountId, authorizedAccounts = [], clusterType, meta, name = '' } = cluster || {};
        const { id, timeCreated } = meta || {};
        const accountName = this.getAccountName(accountId);
        const { formatMessage } = intl;
        const { user } = userData || {};
        const tenantAdmin = isTenantAdmin(user, rolesData);

        return (
            <div className="resource-details-header">
                <div className="layout-icon-background">
                    <img className="layout-icon" alt="" src={clusterIcon} />
                </div>
                <div className="resource-details-header-attributes-container">
                    <div className="resource-details-title mt20">
                        {formatMessage(clusterMsgs.clusterDetailsTitle, { name })}
                    </div>
                    <div className="resource-details-header-attributes">
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(clusterMsgs.createdOnLabel)}
                                inputComponent={
                                    <div className="resource-details-value">{moment(timeCreated).format('l')}</div>
                                }
                            />
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(clusterMsgs.createdByLabel)}
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
                                label={formatMessage(clusterMsgs.tableClusterType)}
                                inputComponent={<div className="resource-details-value">{clusterType}</div>}
                            />
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(clusterMsgs.poolsLabel)}
                                inputComponent={
                                    <Link
                                        className="value-link"
                                        to={{
                                            pathname: `/${constants.URI_SERVICE_PLANS}`,
                                            state: {
                                                filter: name,
                                                tabKey: constants.SERVICE_PLANS_OVERVIEW_TABS.POOLS,
                                            },
                                        }}
                                    >
                                        {poolCount}
                                    </Link>
                                }
                            />
                        </div>
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(clusterMsgs.accountsLabel)}
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
                                label={formatMessage(clusterMsgs.volumesLabel)}
                                inputComponent={
                                    <Link
                                        className="value-link"
                                        to={{
                                            pathname: `/${constants.URI_VOLUME_SERIES}`,
                                            state: {
                                                filter: name,
                                                tabKey: constants.VOLUMES_TABS.VOLUMES,
                                            },
                                        }}
                                    >
                                        {volumeCount}
                                    </Link>
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="layout-actions">
                    {tenantAdmin ? (
                        <Fragment>
                            <div>
                                <ButtonAction
                                    btnHov={btnPoolHov}
                                    btnUp={btnPoolUp}
                                    id="clusters-details-manage-pools"
                                    label={formatMessage(clusterMsgs.managePoolsLabel)}
                                    onClick={() => {
                                        const missingRequiredItems = [];

                                        // check if cluster is managed
                                        this.handleClusterDeployable(missingRequiredItems);

                                        if (missingRequiredItems.length > 0) {
                                            this.renderRequiredModal(missingRequiredItems);
                                        } else {
                                            this.dialogTogglePools();
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <ButtonAction
                                    btnHov={btnCancelHov}
                                    btnUp={btnCancelUp}
                                    id="cluster-delete"
                                    label={formatMessage(clusterMsgs.deleteClusterLabel)}
                                    onClick={this.deleteCluster}
                                />
                            </div>
                            <div>
                                <ButtonAction
                                    icon={<Glyphicon glyph="save-file" />}
                                    id="cluster-get-yaml"
                                    label={formatMessage(clusterMsgs.getClusterYamlLabel)}
                                    onClick={this.getClusterYaml}
                                />
                            </div>
                        </Fragment>
                    ) : null}
                    <div>
                        <ButtonAction
                            btnHov={btnAddAccountHov}
                            btnUp={btnAddAccountUp}
                            id="cluster-get-secret-yaml"
                            label={formatMessage(clusterMsgs.getClusterAccountSecretLabel)}
                            onClick={() => {
                                const missingRequiredItems = [];

                                // check if cluster is managed
                                const deployable = this.handleClusterDeployable(missingRequiredItems);

                                // if cluster is in DEPLOYABLE state, no need to display other requirements, make sure user applies cluster into MANAGED state first.
                                if (!deployable) {
                                    // check for pools
                                    if (poolCount < 1) {
                                        missingRequiredItems.push({
                                            actionHandler: () => {
                                                const { closeModal } = this.props;

                                                if (closeModal) {
                                                    closeModal();
                                                }

                                                this.setState({
                                                    dialogOpenPools: true,
                                                    tabKey: constants.CLUSTER_DETAILS_TABS.POOLS,
                                                });
                                            },
                                            actionLabel: formatMessage(clusterMsgs.managePoolsLabel),
                                            description: formatMessage(clusterMsgs.requiredPoolsDesc),
                                        });
                                    }

                                    // check for PDs
                                    const { accountsData } = this.props;
                                    const { accounts = [] } = accountsData || {};
                                    const account = accounts.find(account => account.meta.id === sessionGetAccount());
                                    const { protectionDomains: accountProtectionDomains = {} } = account || {};

                                    const { csp } = this.props;
                                    const { meta } = csp || {};
                                    const { id: cspId } = meta || {};
                                    const pdId = accountProtectionDomains[cspId];

                                    const { protectionDomainsData } = this.props;
                                    const { protectionDomains = [] } = protectionDomainsData || {};
                                    const pd = protectionDomains.find(pd => pd.meta.id === pdId);

                                    if (!pd) {
                                        missingRequiredItems.push({
                                            actionHandler: () => {
                                                const { closeModal } = this.props;

                                                if (closeModal) {
                                                    closeModal();
                                                }

                                                this.props.history.push(`/${constants.URI_CSP_DOMAINS}/${cspId}`, {
                                                    openDialogCreateProtectionDomain: true,
                                                    tabKey: constants.CSP_DETAILS_TABS.PROTECTION_DOMAINS,
                                                });
                                            },
                                            actionLabel: formatMessage(clusterMsgs.requiredProtectionBtn),
                                            description: formatMessage(clusterMsgs.requiredProtectionDesc),
                                        });
                                    }
                                }

                                if (missingRequiredItems.length > 0) {
                                    this.renderRequiredModal(missingRequiredItems);
                                } else {
                                    if (onGetClusterAccountSecret) {
                                        onGetClusterAccountSecret(id, sessionGetAccount());
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    renderDialog() {
        const {
            accountsData,
            cluster,
            intl,
            onSPASubmit,
            openModal,
            servicePlanAllocationsData,
            servicePlansData,
            volumeSeriesData,
        } = this.props;
        const { dialogOpenPools } = this.state;
        const { formatMessage } = intl;
        const { meta } = cluster || {};
        const { id } = meta || {};

        return (
            <Collapse in={dialogOpenPools} unmountOnExit>
                <div className="spa-form-dialog">
                    <div className="dialog-title">
                        {formatMessage(clusterMsgs.titleManagePools)}
                        <div className="ml20 dialog-help-text">{formatMessage(clusterMsgs.managePoolsHelp)}</div>
                    </div>
                    <SPAForm
                        accountsData={accountsData}
                        cancel={this.dialogTogglePools}
                        clusterId={id}
                        onSubmit={onSPASubmit}
                        openModal={openModal}
                        servicePlanAllocationsData={servicePlanAllocationsData}
                        servicePlansData={servicePlansData}
                        volumeSeriesData={volumeSeriesData}
                    />
                </div>
            </Collapse>
        );
    }

    renderRequiredModal(missingRequiredItems) {
        const { intl, openModal } = this.props;
        const { formatMessage } = intl;

        if (openModal) {
            openModal(
                Alert,
                {
                    dark: true,
                    title: formatMessage(messages.missingRequired, {
                        count: missingRequiredItems.length,
                    }),
                },
                {
                    content: (
                        <div>
                            {missingRequiredItems.map((item, idx) => {
                                const { actionHandler, actionLabel, description } = item || {};

                                return (
                                    <div className="cluster-details-modal-required-item" key={idx}>
                                        {description ? <div>{description}</div> : null}
                                        {actionHandler && actionLabel ? (
                                            <Button
                                                bsStyle="primary"
                                                className="cluster-details-required-action-btn"
                                                onClick={actionHandler}
                                            >
                                                {actionLabel}
                                            </Button>
                                        ) : null}
                                        {idx < missingRequiredItems.length - 1 ? <div className="mb40" /> : null}
                                    </div>
                                );
                            })}
                        </div>
                    ),
                }
            );
        }
    }

    clusterTabPoolsTitle() {
        const { cluster = {}, intl, servicePlanAllocationsData = {} } = this.props;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData;
        const { formatMessage } = intl;
        const { meta } = cluster || {};
        const { id } = meta || {};

        const filteredSpas = servicePlanAllocations.filter(spa => spa.clusterId === id);

        return (
            <div className="content-flex-row-centered">
                <div>{formatMessage(clusterMsgs.poolsLabel)} </div>
                <div className="tab-count color-queue ml10">{filteredSpas.length}</div>
            </div>
        );
    }

    clusterTabNodes(id) {
        const { clustersData, intl } = this.props;
        const { formatMessage } = intl;
        const { clusters = [] } = clustersData || {};
        const { nodes = [] } = (Array.isArray(clusters) && clusters.find(cluster => cluster.meta.id === id)) || {};
        const count = (nodes && nodes.length) || 0;

        return (
            <div className="content-flex-row-centered">
                <div>{formatMessage(clusterMsgs.clusterNodesTabLabel)} </div>
                <div className="tab-count color-queue ml10">{count}</div>
            </div>
        );
    }

    getNodeServiceStateDescription(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const message = getServiceStateDescriptionMsg(state);

        return message ? formatMessage(message) : null;
    }

    getNodeServiceStateString(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const message = getServiceStateMsg(state);

        return message ? formatMessage(message) : state;
    }

    getNodeStateDescription(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const message = getClusterStateDescriptionMsg(state);

        return message ? formatMessage(message) : null;
    }

    getNodeStateString(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const message = getClusterStateMsg(state);

        return message ? formatMessage(message) : state;
    }

    renderNodeServiceState(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        const stateStr = this.getNodeServiceStateString(state);
        const description = this.getNodeServiceStateDescription(state);
        const icon = <div className="cluster-table-status-icon">{renderServiceStateIcon(state)}</div>;

        return (
            <OverlayTrigger
                overlay={
                    <Tooltip id="cluster-table-state-cell-tooltip">
                        <div>{formatMessage(clusterMsgs.serviceStateTooltipTitle, { state: stateStr })}</div>
                        <div>{description}</div>
                    </Tooltip>
                }
            >
                {icon}
            </OverlayTrigger>
        );
    }

    renderNodeState(state) {
        const stateStr = this.getNodeStateString(state);
        const description = this.getNodeStateDescription(state);

        if (description) {
            return (
                <OverlayTrigger overlay={<Tooltip id="cluster-table-state-cell-tooltip">{description}</Tooltip>}>
                    <span style={{ cursor: 'help' }}>{stateStr}</span>
                </OverlayTrigger>
            );
        }

        return stateStr;
    }

    renderNodes(id) {
        const { clustersData, intl } = this.props;
        const { clusters = [] } = clustersData || {};
        const { formatMessage } = intl;

        const { nodes = [] } = clusters.find(cluster => cluster.meta.id === id) || {};

        const columns = [
            {
                Header: formatMessage(clusterMsgs.tableNode),
                accessor: 'name',
            },
            {
                Header: formatMessage(clusterMsgs.tableNodeState),
                accessor: 'state',
                Cell: row => {
                    const { original } = row || {};
                    const { service, state } = original || {};
                    const { state: serviceState } = service || {};

                    return (
                        <div className="cluster-table-state-cell">
                            <div className="cluster-table-state-text">{this.renderNodeState(state)}</div>
                            {this.renderNodeServiceState(serviceState)}
                        </div>
                    );
                },
            },
            {
                Header: formatMessage(clusterMsgs.tableLastHeartbeat),
                accessor: 'heartbeatTime',
                Cell: row => <div>{formatTime(row.value)}</div>,
            },
            {
                Header: formatMessage(clusterMsgs.tableTags),
                accessor: 'tags',
                Cell: row => <span>{renderTags(row.value)}</span>,
            },
        ];

        const data = nodes.map(node => {
            const { description, meta, name, service = {}, state, tags } = node;
            const { id } = meta || {};
            const { heartbeatTime, messages } = service || {};

            return {
                id,
                description,
                heartbeatTime,
                messages,
                name,
                service,
                state,
                tags,
            };
        });

        return (
            <div className="mt20">
                <TableContainer
                    columns={columns}
                    data={data}
                    emptyPlaceholder={{
                        iconClassName: 'icon-node',
                        text: formatMessage(clusterMsgs.tableNodeEmptyPlaceholder),
                    }}
                    id="cluster-nodes"
                    subrow={this.renderSubrow.bind(this)}
                />
            </div>
        );
    }

    renderSubrow(row) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { original } = row;
        const { description, messages = [] } = original || {};

        return (
            <div className="subrow">
                <div className="mb10 subrow-description">{description}</div>
                <TableWrapper
                    columns={[
                        {
                            Header: formatMessage(clusterMsgs.messagesTitle),
                            accessor: 'messages',
                            Cell: row => (
                                <FormControl
                                    className="subrow-messages"
                                    componentClass="textarea"
                                    readOnly
                                    value={
                                        Array.isArray(row.original) && row.original.length > 0
                                            ? row.original
                                                  .map(item => `${formatTime(item.time)} - ${item.message}`)
                                                  .join('\n')
                                            : formatMessage(clusterMsgs.messagesNone)
                                    }
                                />
                            ),
                            sortable: false,
                        },
                    ]}
                    data={[messages]}
                    minRows={1}
                />
            </div>
        );
    }

    clusterTabVolumesTitle() {
        const { cluster, intl, volumeSeriesData } = this.props;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const { formatMessage } = intl;
        const { meta } = cluster || {};
        const { id } = meta || {};

        const volumeCount = volumeSeries.filter(volume => volume.boundClusterId === id).length;

        return (
            <div className="content-flex-row-centered">
                <div>{formatMessage(clusterMsgs.volumesLabel)} </div>
                <div className="tab-count color-queue ml10">{volumeCount}</div>
            </div>
        );
    }

    renderToolbar(total, filtered) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="content-flex-row-centered">
                <div className="dialog-title mr20">
                    <div className="mr20">
                        {formatMessage(clusterMsgs.clusterTotalVolumesTitle)}: {total}
                    </div>
                    <div>
                        {formatMessage(clusterMsgs.clusterDisplayedVolumesTitle)}: {filtered}
                    </div>
                </div>
            </div>
        );
    }

    renderTabs() {
        const {
            applicationGroupsData,
            cluster,
            clustersData,
            consistencyGroupsData,
            csp = {},
            cspCredentialsData,
            intl,
            onFilteredChange,
            onSortedChange,
            rolesData,
            saveSettingsCSP,
            saveSettingsMeta,
            servicePlansData,
            session,
            tableVolumeSeries,
            userData,
            volumeComplianceTotalsData = {},
            volumeSeriesData,
        } = this.props;
        const { formatMessage } = intl;
        const { tabKey } = this.state;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const { meta } = cluster || {};
        const { id } = meta || {};

        const filteredVolumeSeriesData = _.cloneDeep(volumeSeriesData);
        filteredVolumeSeriesData.volumeSeries = volumeSeries.filter(volume => {
            return volume.boundClusterId === id;
        });

        return (
            <Tabs
                activeKey={tabKey}
                className="tabs-container"
                id="resource-details-tabs"
                mountOnEnter
                onSelect={this.handleTabSelect}
            >
                <Tab
                    eventKey={constants.CLUSTER_DETAILS_TABS.SETTINGS}
                    title={formatMessage(clusterMsgs.titleSettings)}
                >
                    <ClusterSettings
                        cluster={cluster}
                        csp={csp}
                        cspCredentialsData={cspCredentialsData}
                        rolesData={rolesData}
                        saveSettingsCSP={saveSettingsCSP}
                        saveSettingsMeta={saveSettingsMeta}
                        userData={userData}
                    />
                </Tab>
                <Tab eventKey={constants.CLUSTER_DETAILS_TABS.POOLS} title={this.clusterTabPoolsTitle()}>
                    <PoolsTableContainer
                        cluster={cluster}
                        disableHandleCostChange
                        hideColumnFilter
                        tableComponentName="CLUSTER_POOLS"
                        title={formatMessage(clusterMsgs.clusterPoolTableTitle)}
                    />
                </Tab>
                <Tab eventKey={constants.CLUSTER_DETAILS_TABS.VOLUMES} title={this.clusterTabVolumesTitle()}>
                    <VolumeSeries
                        applicationGroupsData={applicationGroupsData}
                        cardsMode={false}
                        clustersData={clustersData}
                        consistencyGroupsData={consistencyGroupsData}
                        filterLeft
                        hideColumns={['boundClusterName', 'actions']}
                        multiSelect={false}
                        noHeader
                        onFilteredChange={onFilteredChange}
                        onSortedChange={onSortedChange}
                        selectable={false}
                        selectedRows={tableVolumeSeries.selectedRows}
                        servicePlansData={servicePlansData}
                        session={session}
                        tableOnly={true}
                        title={formatMessage(clusterMsgs.clusterVolumesTableTitle)}
                        volumeComplianceTotalsData={volumeComplianceTotalsData}
                        volumeSeriesData={filteredVolumeSeriesData}
                    />
                </Tab>
                <Tab eventKey={constants.CLUSTER_DETAILS_TABS.NODES} title={this.clusterTabNodes(id)}>
                    {this.renderNodes(id)}
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
                    {this.renderDialog()}
                    {this.renderTabs()}
                </div>
            </div>
        );
    }
}

ClusterDetails.propTypes = {
    accountsData: PropTypes.object,
    applicationGroupsData: PropTypes.object,
    closeModal: PropTypes.func,
    cluster: PropTypes.object,
    clustersData: PropTypes.object,
    consistencyGroupsData: PropTypes.object,
    csp: PropTypes.object,
    cspCredentialsData: PropTypes.object,
    deleteClusters: PropTypes.func,
    getClusterYaml: PropTypes.func,
    history: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
    location: PropTypes.object.isRequired,
    onFilteredChange: PropTypes.func,
    onSortedChange: PropTypes.func,
    onGetClusterAccountSecret: PropTypes.func,
    onSPASubmit: PropTypes.func,
    onTabSelect: PropTypes.func,
    openModal: PropTypes.func,
    poolCount: PropTypes.number,
    protectionDomainsData: PropTypes.object,
    rolesData: PropTypes.object,
    saveSettingsCSP: PropTypes.func,
    saveSettingsMeta: PropTypes.func,
    servicePlanAllocationsData: PropTypes.object,
    servicePlansData: PropTypes.object,
    session: PropTypes.object,
    tabKey: PropTypes.string,
    tableVolumeSeries: PropTypes.object,
    userData: PropTypes.object,
    volumeComplianceTotalsData: PropTypes.object,
    volumeCount: PropTypes.number,
    volumeSeriesData: PropTypes.object,
};

export default withRouter(injectIntl(ClusterDetails));
