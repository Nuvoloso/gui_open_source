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
import { Link, withRouter } from 'react-router-dom';
import { Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { DeleteForever } from '@material-ui/icons';
import { ReactComponent as PoolIcon } from '../assets/pool.svg';

import DeleteForm from './DeleteForm';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import SelectOptions from './SelectOptions';
import TableContainer from '../containers/TableContainer';
import VolumeSeriesYaml from './VolumeSeriesYaml';
import { clusterMsgs } from '../messages/Cluster';
import { messages } from '../messages/Messages';
import { servicePlanMsgs } from '../messages/ServicePlan';
import { spaTagGetCost } from '../containers/spaUtils';
import { formatBytes } from './utils';
import { isTenantAdmin } from '../containers/userAccountUtils';
import * as constants from '../constants';
import './poolsTable.css';

class PoolsTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnFilter: '',
            filterPercentEnd: 100,
            filterPercentStart: 0,
        };

        this.handleChangeColumnFilter = this.handleChangeColumnFilter.bind(this);
        this.handleChangeField = this.handleChangeField.bind(this);
    }

    componentDidMount() {
        const { location } = this.props;
        const { search } = location;
        const params = new URLSearchParams(search);
        const filterPercentEndString = params.get('filterPercentEnd');
        const filterPercentStartString = params.get('filterPercentStart');

        if (filterPercentEndString || filterPercentStartString) {
            this.setState({
                columnFilter: 'percent',
                filterPercentEnd: Number(filterPercentEndString) || 100,
                filterPercentStart: Number(filterPercentStartString) || 0,
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { columnFilter } = this.state;
        const { columnFilter: prevColumnFilter } = prevState;

        if (prevColumnFilter === 'percent' && columnFilter !== 'percent') {
            this.setState({ filterPercentEnd: 100, filterPercentStart: 0 });
        }
    }

    deletePools(ids = []) {
        const { intl, deletePools, openModal } = this.props;
        const { formatMessage } = intl;

        if (openModal) {
            openModal(
                DeleteForm,
                {
                    title: formatMessage(servicePlanMsgs.deletePoolsTitle, { count: ids.length }),
                    deleteFunc: deletePools,
                },
                {
                    data: ids,
                    message: formatMessage(servicePlanMsgs.deletePoolsMsg, { count: ids.length }),
                }
            );
        }
    }

    getColumnFilterOptions() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return [
            {
                value: 'percent',
                label: formatMessage(clusterMsgs.tablePercent),
            },
        ];
    }

    renderFetchStatus() {
        const {
            accountsData = {},
            rolesData = {},
            servicePlanAllocationsData = {},
            servicePlansData = {},
            userData = {},
            volumeSeriesData = {},
        } = this.props;

        if (
            accountsData.loading ||
            rolesData.loading ||
            servicePlanAllocationsData.loading ||
            servicePlansData.loading ||
            userData.loading ||
            volumeSeriesData.loading
        ) {
            return <Loader />;
        }
    }

    getName(objId, arr = []) {
        const obj = arr.find(obj => {
            const { meta } = obj || {};
            const { id } = meta || {};

            return id === objId;
        });

        const { name = '' } = obj || {};

        return name;
    }

    getFixedValue(value, digits = 1) {
        return Number(Number.parseFloat(value).toFixed(digits));
    }

    getPercentUsed(spa) {
        const { reservableCapacityBytes, totalCapacityBytes } = spa || {};

        return !totalCapacityBytes ? 0 : (totalCapacityBytes - reservableCapacityBytes) / totalCapacityBytes;
    }

    handleChangeColumnFilter(selectedItem) {
        const { value = '' } = selectedItem || {};
        this.setState({ columnFilter: value });
    }

    handleChangeField(name, value) {
        this.setState({ [name]: value });
    }

    /**
     * Count # of volumes in cluster
     */
    numPoolVolumes(servicePlanAllocationId) {
        const { volumeSeriesData = {} } = this.props;
        const { volumeSeries = [] } = volumeSeriesData;

        const volumes = volumeSeries.filter(volume => {
            return volume.servicePlanAllocationId === servicePlanAllocationId;
        });

        return (volumes && volumes.length) || 0;
    }

    renderColumnFilter() {
        const { columnFilter } = this.state;
        const { intl } = this.props;
        const { formatMessage } = intl;
        const options = this.getColumnFilterOptions();
        const filter = options.find(option => option.value === columnFilter);

        return (
            <div className="pools-table-column-filter dark">
                <div className="pools-table-column-filter-label">
                    {formatMessage(servicePlanMsgs.columnFilterLabel)}
                </div>
                <SelectOptions
                    id="pools-table-column-filter-options"
                    initialValues={filter}
                    onChange={this.handleChangeColumnFilter}
                    options={options}
                    placeholder={formatMessage(servicePlanMsgs.columnFilterPlaceholder)}
                />
                <div className="pools-table-column-filter-append">{this.renderColumnFilterAppend()}</div>
            </div>
        );
    }

    renderColumnFilterAppend() {
        const { columnFilter, filterPercentEnd, filterPercentStart } = this.state;
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (columnFilter) {
            case 'percent':
                return (
                    <div className="column-filter-percent">
                        <FieldGroup
                            className="column-filter-percent-field"
                            label={formatMessage(servicePlanMsgs.filterPercentLabel)}
                            max={100}
                            name="filterPercentStart"
                            onChange={this.handleChangeField}
                            step={0.1}
                            type="number"
                            value={Number.isNaN(filterPercentStart) ? '' : filterPercentStart}
                        />
                        <FieldGroup
                            className="column-filter-percent-field"
                            hideLabelColon
                            label="-"
                            max={100}
                            name="filterPercentEnd"
                            onChange={this.handleChangeField}
                            step={0.1}
                            type="number"
                            value={Number.isNaN(filterPercentEnd) ? '' : filterPercentEnd}
                        />
                    </div>
                );
            default:
                return null;
        }
    }

    renderDelete(id, disableDelete) {
        return (
            <DeleteForever
                className={disableDelete ? 'disabled' : ''}
                id={`pools-table-delete-${id}`}
                onClick={disableDelete ? null : () => this.deletePools([id])}
            />
        );
    }

    renderToolbar() {
        const { hideColumnFilter } = this.props;

        return <div className="content-flex-row-centered">{hideColumnFilter ? null : this.renderColumnFilter()}</div>;
    }

    render() {
        const {
            account,
            accountsData,
            cluster,
            clustersData,
            intl,
            location,
            rolesData,
            servicePlanAllocationsData,
            servicePlansData,
            tableComponentName,
            title,
            userData,
        } = this.props;
        const { meta: accountMeta } = account || {};
        const { id: accountId } = accountMeta || {};
        const { accounts = [] } = accountsData || {};
        const { meta: clusterMeta } = cluster || {};
        const { id: clusterId } = clusterMeta || {};
        const { clusters = [] } = clustersData || {};
        const { formatMessage } = intl;
        const { state } = location;
        const { filter } = state || {};
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const { servicePlans = [] } = servicePlansData || {};
        const { user } = userData || {};
        const tenantAdmin = isTenantAdmin(user, rolesData);
        const costAppend = ` / ${formatMessage(messages.gib)} / ${formatMessage(messages.month)}`;

        const columns = [
            {
                Header: formatMessage(clusterMsgs.tableServicePlan),
                accessor: 'servicePlan',
                Cell: row => {
                    const { original } = row || {};
                    if (original) {
                        return (
                            <Link
                                id={`pool-link-${row.value}`}
                                className="table-name-link"
                                onClick={() => {
                                    const { onClickServicePlanLink } = this.props;

                                    if (onClickServicePlanLink) {
                                        onClickServicePlanLink();
                                    }
                                }}
                                to={{ pathname: `/${constants.URI_SERVICE_PLANS}`, state: { clusterId } }}
                            >
                                {row.value}
                            </Link>
                        );
                    } else {
                        return row.row._pivotVal ? row.row._pivotVal : row.name;
                    }
                },
                width: 140,
            },
            ...(!cluster
                ? [
                      {
                          Header: formatMessage(clusterMsgs.tableCluster),
                          accessor: 'clusterName',
                          width: 140,
                      },
                  ]
                : []),
            ...(!account
                ? [
                      {
                          Header: formatMessage(clusterMsgs.tableAccount),
                          accessor: 'account',
                          width: 140,
                      },
                  ]
                : []),
            {
                Header: formatMessage(clusterMsgs.tableUsed),
                accessor: 'used',
                width: 70,
            },
            {
                Header: formatMessage(clusterMsgs.tableCapacity),
                accessor: 'capacity',
                width: 85,
            },
            {
                Header: formatMessage(clusterMsgs.tablePercent),
                accessor: 'percent',
                width: 70,
                Cell: row => (
                    <span className="table-percent">
                        {row.value > 0 ? Number.parseFloat(row.value * 100).toFixed(1) : 0}
                    </span>
                ),
            },
            {
                Header: formatMessage(clusterMsgs.tableActualCost),
                accessor: 'actualCost',
                width: 200,
                show: tenantAdmin,
            },
            {
                Header: tenantAdmin
                    ? formatMessage(clusterMsgs.tableDisplayedCost)
                    : formatMessage(clusterMsgs.tableCost),
                accessor: 'displayedCost',
                width: 200,
            },
            {
                Header: formatMessage(clusterMsgs.tableVolumes),
                accessor: 'volumes',
            },
            {
                Header: formatMessage(clusterMsgs.actions),
                accessor: 'actions',
                sortable: false,
                Cell: row => {
                    const { original } = row || {};
                    const { clusterDescriptor, id, percent } = original || {};
                    const { k8sPvcYaml } = clusterDescriptor || {};
                    const disableYaml = k8sPvcYaml ? false : true;
                    const disableDelete = percent > 0;
                    const deleteBtn = this.renderDelete(id, disableDelete);

                    return (
                        <div className="table-actions-cell">
                            <Glyphicon
                                className={disableYaml ? 'disabled' : ''}
                                glyph="save-file"
                                id={`pools-table-yaml-${id}`}
                                onClick={
                                    disableYaml
                                        ? null
                                        : () => {
                                              const { openModal } = this.props;

                                              if (openModal) {
                                                  openModal(
                                                      VolumeSeriesYaml,
                                                      {
                                                          dark: true,
                                                          info: formatMessage(clusterMsgs.clusterPoolYamlInfo),
                                                          title: formatMessage(clusterMsgs.clusterPoolYamlTitle),
                                                      },
                                                      { k8sPvcYaml }
                                                  );
                                              }
                                          }
                                }
                            />
                            {tenantAdmin ? (
                                disableDelete ? (
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id="delete-pool-tooltip">
                                                {formatMessage(servicePlanMsgs.deletePoolDisabledTooltip)}
                                            </Tooltip>
                                        }
                                        placement="left"
                                    >
                                        {deleteBtn}
                                    </OverlayTrigger>
                                ) : (
                                    deleteBtn
                                )
                            ) : null}
                        </div>
                    );
                },
            },
            {
                accessor: 'id',
                show: false,
            },
        ];

        const data = servicePlanAllocations
            .filter(spa => {
                if (!accountId) {
                    return true;
                }

                return spa.authorizedAccountId === accountId;
            })
            .filter(spa => {
                if (!clusterId) {
                    return true;
                }

                return spa.clusterId === clusterId;
            })
            .filter(spa => {
                const { filterPercentEnd = 100, filterPercentStart = 0 } = this.state;
                const end = Number.isNaN(filterPercentEnd) ? 100 : filterPercentEnd;
                const fixedEnd = this.getFixedValue(end);
                const start = Number.isNaN(filterPercentStart) ? 0 : filterPercentStart;
                const fixedStart = this.getFixedValue(start);
                const percentUsed = this.getPercentUsed(spa) * 100;
                const fixedPercentUsed = this.getFixedValue(percentUsed);

                return fixedPercentUsed >= fixedStart && fixedPercentUsed <= fixedEnd;
            })
            .map(spa => {
                const {
                    authorizedAccountId,
                    clusterDescriptor,
                    clusterId,
                    costPerGiB = 0,
                    meta,
                    reservableCapacityBytes,
                    servicePlanId,
                    tags,
                    totalCapacityBytes,
                } = spa || {};
                const { id } = meta || {};

                return {
                    account: this.getName(authorizedAccountId, accounts),
                    actualCost: `${Number.parseFloat(costPerGiB).toFixed(
                        constants.MAX_NUMBER_COST_DECIMAL_POINTS
                    )}${costAppend}`,
                    capacity: formatBytes(totalCapacityBytes),
                    clusterDescriptor,
                    clusterName: this.getName(clusterId, clusters),
                    displayedCost: `${spaTagGetCost(tags)}${costAppend}`,
                    id: spa.meta.id,
                    percent: this.getPercentUsed(spa),
                    servicePlan: this.getName(servicePlanId, servicePlans),
                    used: formatBytes(totalCapacityBytes - reservableCapacityBytes),
                    volumes: this.numPoolVolumes(id),
                };
            });

        return (
            <div>
                {this.renderFetchStatus()}
                <TableContainer
                    columns={columns}
                    component={tableComponentName}
                    data={data}
                    defaultFiltered={filter}
                    defaultSorted={[{ id: 'servicePlan' }]}
                    emptyPlaceholder={{
                        icon: PoolIcon,
                        text: formatMessage(servicePlanMsgs.tableEmptyPoolsPlaceholder),
                    }}
                    filterLeft={true}
                    title={title || formatMessage(servicePlanMsgs.poolsTableTitle)}
                    toolbar={this.renderToolbar()}
                />
            </div>
        );
    }
}

PoolsTable.propTypes = {
    account: PropTypes.object,
    accountsData: PropTypes.object,
    cluster: PropTypes.object,
    clustersData: PropTypes.object,
    deletePools: PropTypes.func,
    hideColumnFilter: PropTypes.bool,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    onClickServicePlanLink: PropTypes.func,
    openModal: PropTypes.func,
    rolesData: PropTypes.object,
    servicePlanAllocationsData: PropTypes.object,
    servicePlansData: PropTypes.object,
    table: PropTypes.object,
    tableComponentName: PropTypes.string,
    title: PropTypes.string,
    uiSettings: PropTypes.object,
    userData: PropTypes.object,
    volumeSeriesData: PropTypes.object,
};

PoolsTable.defaultProps = {
    tableComponentName: 'POOLS',
};

export default withRouter(injectIntl(PoolsTable));
