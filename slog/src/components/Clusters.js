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
import { Collapse, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { intlShape, injectIntl } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
import _ from 'lodash';

import ButtonAction from './ButtonAction';
import DialogCreateCluster from './DialogCreateCluster';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import SelectTags from './SelectTags';
import TableActionIcon from './TableActionIcon';
import TableContainer from '../containers/TableContainer';

import { clusterMsgs } from '../messages/Cluster';
import { getViolationLevels } from './utils_metrics';
import { isAccountUser, isTenantAdmin } from '../containers/userAccountUtils';
import { messages } from '../messages/Messages';
import {
    getClusterStateDescriptionMsg,
    getClusterStateMsg,
    getServiceStateDescriptionMsg,
    getServiceStateMsg,
    renderServiceStateIcon,
    renderTags,
} from './utils';
import { sessionGetAccount } from '../sessionUtils';

import { Edit } from '@material-ui/icons';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import clusterIcon from '../assets/cluster.svg';
import { ReactComponent as ClusterIconSm } from '../assets/ico-cluster-sm.svg';
import { ReactComponent as ClusterIconEmptyPlaceholder } from '../assets/menu/ico-cluster.svg';

import * as constants from '../constants';

import './clusters.css';

class Clusters extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editCluster: null,
            editName: '',
            editTags: [],
        };

        this.clusterVolumes = this.clusterVolumes.bind(this);
        this.getClusterStatus = this.getClusterStatus.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.handleChangeTags = this.handleChangeTags.bind(this);
        this.handleEditChange = this.handleEditChange.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
    }

    componentDidUpdate() {
        const { selectedRows } = this.props;
        const { editCluster } = this.state;

        if (editCluster && selectedRows.length > 0 && selectedRows[0].id !== editCluster.id) {
            this.handleEdit(null);
        }
    }

    renderFetchStatus() {
        const {
            accountsData = {},
            clustersData = {},
            clusterComplianceTotalsData = {},
            cspCredentialsData = {},
            cspsData = {},
            protectionDomainMetadataData = {},
            rolesData = {},
            userData = {},
            volumeSeriesData = {},
        } = this.props;

        if (
            accountsData.loading ||
            clustersData.loading ||
            clusterComplianceTotalsData.loading ||
            cspCredentialsData.loading ||
            cspsData.loading ||
            protectionDomainMetadataData.loading ||
            rolesData.loading ||
            userData.loading ||
            volumeSeriesData.loading
        ) {
            return <Loader />;
        }
    }

    disableEditSubmit() {
        const { editCluster, editName, editTags } = this.state;
        const { _original } = editCluster || {};
        const { name, tags } = _original || {};

        return editName === name && _.isEqual(editTags, tags);
    }

    handleEdit(selectedRow) {
        const { selectedRows, clearSelectedRow } = this.props;
        const { _original } = selectedRow || {};
        const { id, name = '', tags = [] } = _original || {};

        this.setState({
            editCluster: selectedRow,
            editName: name,
            editTags: tags,
        });

        /**
         * If a row is currently selected, clear it for the edit operation.
         */
        const { id: currentId } = (selectedRows && selectedRows[0]) || '';
        if (clearSelectedRow && currentId && id && currentId !== id) {
            clearSelectedRow(currentId);
        }
    }

    handleEditChange(name, value) {
        this.setState({ [name]: value });
    }

    handleChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ editTags: value });
    }

    handleEditSubmit() {
        const { patchCluster } = this.props;
        const { editCluster, editName, editTags } = this.state;

        const { _original } = editCluster || {};
        const { cspDomainName, id, name, tags } = _original || {};
        const params = {
            ...(editName !== name && { name: editName }),
            ...(!_.isEqual(editTags, tags) && { tags: editTags }),
        };

        if (patchCluster) {
            patchCluster(id, cspDomainName, params);
        }

        this.handleEdit(null);
    }

    /**
     * Count # accounts in cluster...then users??
     */
    clusterAccounts(cluster) {
        return cluster.authorizedAccounts.length;
    }

    /**
     * Count # of unique plans in cluster
     */
    clusterPools(clusterId) {
        const { servicePlanAllocationsData = {} } = this.props;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};

        return servicePlanAllocations.filter(spa => spa.clusterId === clusterId).length;
    }

    /**
     * Count # of volumes in cluster
     */
    clusterVolumes(clusterId) {
        const { volumeSeriesData = {} } = this.props;
        const { volumeSeries = [] } = volumeSeriesData;

        const volumes = volumeSeries.filter(volume => {
            return volume.boundClusterId === clusterId;
        });

        return (volumes && volumes.length) || 0;
    }

    /**
     * Get the status div for this level.
     */
    getStatus(violationLevel) {
        return <div className={this.getStatusClassName(violationLevel)}>{this.getStatusText(violationLevel)}</div>;
    }

    getStatusClassName(violationLevel) {
        switch (violationLevel) {
            case constants.METRIC_VIOLATION_LEVELS.ERROR:
                return 'nuvo-color-critical-red';
            case constants.METRIC_VIOLATION_LEVELS.WARNING:
                return 'nuvo-color-neutral-yellow';
            case constants.METRIC_VIOLATION_LEVELS.OK:
                return 'nuvo-color-safe-green';
            default:
                return '';
        }
    }

    getStatusText(violationLevel) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (violationLevel) {
            case constants.METRIC_VIOLATION_LEVELS.ERROR:
                return formatMessage(messages.error);
            case constants.METRIC_VIOLATION_LEVELS.WARNING:
                return formatMessage(messages.warning);
            case constants.METRIC_VIOLATION_LEVELS.OK:
                return formatMessage(messages.ok);
            default:
                return '';
        }
    }

    /**
     * Look up the status for this particular cluster.
     * @param {*} clusterId
     */
    getClusterStatus(clusterId) {
        const { clusterComplianceTotalsData = {} } = this.props;
        const { metrics = [] } = clusterComplianceTotalsData;

        const compliance = metrics.find(metric => metric.clusterId === clusterId);
        if (compliance) {
            return compliance.violationlevel;
        }
    }

    getClusterServiceStateDescription(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const message = getServiceStateDescriptionMsg(state);

        return message ? formatMessage(message) : null;
    }

    getClusterServiceStateString(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const message = getServiceStateMsg(state);

        return message ? formatMessage(message) : state;
    }

    getClusterStateDescription(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const message = getClusterStateDescriptionMsg(state);

        return message ? formatMessage(message) : null;
    }

    getClusterStateString(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const message = getClusterStateMsg(state);

        return message ? formatMessage(message) : state;
    }

    renderClusterServiceState(state) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        const stateStr = this.getClusterServiceStateString(state);
        const description = this.getClusterServiceStateDescription(state);
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

    renderClusterState(state) {
        const stateStr = this.getClusterStateString(state);
        const description = this.getClusterStateDescription(state);

        if (description) {
            return (
                <OverlayTrigger overlay={<Tooltip id="cluster-table-state-cell-tooltip">{description}</Tooltip>}>
                    <span style={{ cursor: 'help' }}>{stateStr}</span>
                </OverlayTrigger>
            );
        }

        return stateStr;
    }

    renderSummaryTable() {
        const { clustersData = {}, hideColumns, intl, location, pivotBy, selectedRows } = this.props;
        const { clusters = [] } = clustersData || {};
        const { formatMessage } = intl;
        const { search } = location;
        const params = new URLSearchParams(search);
        const filter = params.get('filter');
        const { editCluster } = this.state;

        const columns = [
            {
                Header: formatMessage(clusterMsgs.tableName),
                accessor: 'name',
                Cell: row => {
                    const { editName } = this.state;
                    const { original } = row || {};
                    const { id = '' } = original || {};
                    const { id: editClusterId } = editCluster || {};

                    if (original) {
                        if (id === editClusterId) {
                            return (
                                <FieldGroup
                                    name="editName"
                                    onChange={this.handleEditChange}
                                    type="text"
                                    value={editName}
                                />
                            );
                        } else {
                            return (
                                <Link
                                    id={`cluster-link-${row.value}`}
                                    className="table-name-link"
                                    to={{
                                        pathname: `/${constants.URI_CLUSTERS}/${id}`,
                                        state: { name: row.value },
                                    }}
                                >
                                    {row.value}
                                </Link>
                            );
                        }
                    } else {
                        return row.row._pivotVal ? row.row._pivotVal : row.name;
                    }
                },
            },
            {
                Header: formatMessage(clusterMsgs.tableCspDomain),
                accessor: 'cspDomainName',
            },
            {
                Header: formatMessage(clusterMsgs.tableClusterState),
                accessor: 'state',
                minWidth: 120,
                Cell: row => {
                    const { original } = row || {};
                    const { service, state } = original || {};
                    const { state: serviceState } = service || {};

                    return (
                        <div className="cluster-table-state-cell">
                            <div className="cluster-table-state-text">{this.renderClusterState(state)}</div>
                            {this.renderClusterServiceState(serviceState)}
                        </div>
                    );
                },
            },
            {
                Header: formatMessage(clusterMsgs.clusterType),
                accessor: 'clusterType',
                minWidth: 110,
            },
            {
                Header: formatMessage(clusterMsgs.accounts),
                accessor: 'accounts',
                minWidth: 90,
            },
            {
                Header: formatMessage(clusterMsgs.pools),
                accessor: 'pools',
                minWidth: 60,
            },
            {
                Header: formatMessage(clusterMsgs.volumes),
                accessor: 'volumes',
                minWidth: 80,
            },
            {
                Header: formatMessage(clusterMsgs.clusterTableStatus),
                accessor: 'status',
                getDisplayValue: value => this.getStatusText(value),
                minWidth: 70,
                Cell: row => this.getStatus(row.value),
            },
            {
                Header: formatMessage(clusterMsgs.tableTags),
                accessor: 'tags',
                width: 400,
                Cell: row => {
                    const { editTags } = this.state;
                    const { original } = row || {};
                    const { id = '' } = original || {};
                    const { id: editClusterId } = editCluster || {};

                    if (id === editClusterId) {
                        return <SelectTags onChange={this.handleChangeTags} tags={editTags} />;
                    } else {
                        return <span>{renderTags(row.value)}</span>;
                    }
                },
            },
            {
                Header: formatMessage(clusterMsgs.actions),
                accessor: 'actions',
                show: !hideColumns.includes('actions'),
                sortable: false,
                Cell: (selected = {}) => {
                    const { rolesData, userData } = this.props;
                    const { user } = userData || {};

                    const { original, row } = selected || {};
                    const { id } = original || {};

                    return (
                        <div className="table-actions-cell">
                            {editCluster && editCluster.id === id ? (
                                <Fragment>
                                    <ButtonAction
                                        btnUp={btnAltSaveUp}
                                        btnHov={btnAltSaveHov}
                                        btnDisable={btnAltSaveDisable}
                                        disabled={this.disableEditSubmit()}
                                        onClick={this.handleEditSubmit}
                                    />
                                    <ButtonAction
                                        btnUp={btnCancelUp}
                                        btnHov={btnCancelHov}
                                        onClick={() => this.handleEdit(null)}
                                    />
                                </Fragment>
                            ) : (
                                <Fragment>
                                    {!isAccountUser(user, rolesData) ? (
                                        <TableActionIcon
                                            materialIcon={Edit}
                                            onClick={() => this.handleEdit(row)}
                                            tooltip={formatMessage(clusterMsgs.toolbarEdit)}
                                        />
                                    ) : null}
                                    {isTenantAdmin(user, rolesData) ? (
                                        <TableActionIcon
                                            glyph="save-file"
                                            onClick={() => {
                                                const { getClusterYaml } = this.props;

                                                if (getClusterYaml) {
                                                    getClusterYaml(id);
                                                }
                                            }}
                                            tooltip={formatMessage(clusterMsgs.getClusterYamlLabel)}
                                        />
                                    ) : null}
                                </Fragment>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'id',
                accessor: 'id',
                show: false,
            },
            {
                Header: 'cspDomainId',
                accessor: 'cspDomainId',
                show: false,
            },
        ];

        const data =
            clusters.length > 0
                ? clusters.map(cluster => {
                      const { id: editClusterId } = editCluster || {};
                      const {
                          clusterAttributes,
                          clusterType,
                          cspDomainId,
                          cspDomainName,
                          description,
                          meta,
                          name,
                          nodes,
                          service,
                          state,
                          tags,
                      } = cluster;
                      const { id } = meta;

                      return {
                          accounts: this.clusterAccounts(cluster),
                          clusterAttributes,
                          clusterType,
                          cspDomainId,
                          cspDomainName,
                          description,
                          edit: cluster.meta.id === editClusterId,
                          id,
                          name,
                          nodes,
                          pools: this.clusterPools(id),
                          service,
                          state,
                          status: this.getClusterStatus(id),
                          tags,
                          volumes: this.clusterVolumes(id),
                      };
                  })
                : [];

        return (
            <div>
                {this.renderFetchStatus()}
                <TableContainer
                    cardsMode={false}
                    columns={columns}
                    component="CLUSTERS_TABLE"
                    componentSelectedRows={selectedRows}
                    data={data}
                    dataTestId="clusters-table"
                    defaultFiltered={filter}
                    defaultSorted={[{ id: 'name' }]}
                    emptyPlaceholder={{
                        icon: ClusterIconEmptyPlaceholder,
                        text: formatMessage(clusterMsgs.tableEmptyPlaceholder),
                    }}
                    filterLeft
                    multiSelect={false}
                    pivotBy={pivotBy}
                    startExpanded={{}}
                    title={formatMessage(clusterMsgs.tableTitle)}
                />
            </div>
        );
    }

    renderHeader() {
        const { clusterComplianceTotalsData, dialogToggleCreate, intl, rolesData, tableOnly, userData } = this.props;
        const { formatMessage } = intl;
        const { user } = userData || {};
        const { metrics } = clusterComplianceTotalsData || {};
        const violationLevels = getViolationLevels(metrics);
        const tenantAdmin = isTenantAdmin(user, rolesData);

        if (tableOnly) {
            return;
        }

        return (
            <Fragment>
                <div className="content-flex-column">
                    <div className="content-flex-row">
                        <div className="layout-icon-background">
                            <img className="layout-icon" alt="" src={clusterIcon} />
                        </div>
                        <div className="content-flex-row layout-summary">
                            <div className="flex-item-centered pad-20-l pad-10-r">
                                <div className="summary-error">{violationLevels.error}</div>
                                <div className="summary-text nuvo-summary-text-14">
                                    {formatMessage(clusterMsgs.clusterSummaryError)}
                                </div>
                            </div>
                            <div className="flex-item-centered pad-10-l pad-10-r">
                                <div className="summary-warning">{violationLevels.warning}</div>
                                <div className="summary-text nuvo-summary-text-14">
                                    {formatMessage(clusterMsgs.clusterSummaryWarning)}
                                </div>
                            </div>
                            <div className="flex-item-centered pad-10-l pad-20-r">
                                <div className="summary-ok">{violationLevels.ok}</div>
                                <div className="summary-text nuvo-summary-text-14">
                                    {formatMessage(clusterMsgs.clusterSummaryOk)}
                                </div>
                            </div>
                        </div>
                        <div className="layout-actions">
                            {tenantAdmin ? (
                                <div>
                                    <ButtonAction
                                        icon={<ClusterIconSm />}
                                        id="clusterButtonCreate"
                                        onClick={dialogToggleCreate}
                                        label={formatMessage(clusterMsgs.createNewCluster)}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div />
                </div>
                <div className="divider-horizontal" />
            </Fragment>
        );
    }

    render() {
        const {
            accountsData,
            clusterComplianceTotalsData = {},
            clustersData = {},
            cspCredentialsData = {},
            cspsData = {},
            dialogOpenCreate,
            dialogSaveCluster,
            dialogToggleCreate,
            getSystemHostname,
            protectionDomainMetadataData,
            servicePlanAllocationsData = {},
            systemData,
            volumeSeriesData = {},
        } = this.props;
        const { cspCredentials = [] } = cspCredentialsData;
        const loading =
            clustersData.loading ||
            clusterComplianceTotalsData.loading ||
            cspCredentialsData.loading ||
            servicePlanAllocationsData.loading ||
            volumeSeriesData.loading;
        // need to determine if a policy already exists if creating a domain
        const accountId = sessionGetAccount();
        const { accounts = [] } = accountsData || {};
        const account = accounts.find(acct => acct.meta.id === accountId);
        const { snapshotCatalogPolicy } = account || {};
        const { protectionDomainId = '' } = snapshotCatalogPolicy || {};

        return (
            <div className="clusters dark">
                <div className="component-page">
                    {this.renderHeader()}
                    <Collapse in={dialogOpenCreate} unmountOnExit>
                        <div>
                            <DialogCreateCluster
                                cancel={dialogToggleCreate}
                                createSnapshotCatalogPolicy={!protectionDomainId}
                                cspCredentials={cspCredentials}
                                cspsData={cspsData}
                                getSystemHostname={getSystemHostname}
                                protectionDomainMetadataData={protectionDomainMetadataData}
                                save={dialogSaveCluster}
                                systemData={systemData}
                            />
                        </div>
                    </Collapse>
                    {loading ? <Loader /> : this.renderSummaryTable()}
                </div>
            </div>
        );
    }
}

Clusters.defaultProps = {
    hideColumns: [],
    pivotBy: ['cspDomainName'],
};

Clusters.propTypes = {
    accountsData: PropTypes.object,
    clearSelectedRow: PropTypes.func,
    clusterComplianceTotalsData: PropTypes.object.isRequired,
    clustersData: PropTypes.object.isRequired,
    cspCredentialsData: PropTypes.object,
    cspsData: PropTypes.object.isRequired,
    dialogOpenCreate: PropTypes.bool,
    dialogSaveCluster: PropTypes.func,
    dialogToggleCreate: PropTypes.func,
    getClusterYaml: PropTypes.func,
    getSystemHostname: PropTypes.func,
    hideColumns: PropTypes.array,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    openModal: PropTypes.func,
    patchCluster: PropTypes.func,
    pivotBy: PropTypes.array,
    protectionDomainMetadataData: PropTypes.object,
    rolesData: PropTypes.object,
    selectedRows: PropTypes.array,
    servicePlanAllocationsData: PropTypes.object,
    systemData: PropTypes.object,
    tableOnly: PropTypes.bool,
    userData: PropTypes.object,
    volumeSeriesData: PropTypes.object,
};

export default withRouter(injectIntl(Clusters));
