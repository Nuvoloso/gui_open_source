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
import { Collapse, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { withRouter, Link } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';

import Alert from './Alert';
import BindPublishForm from './BindPublishForm';
import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import MountVolumeForm from '../dev/MountVolumeForm';
import SelectOptions from './SelectOptions';
import SelectTags from './SelectTags';
import TableActionIcon from './TableActionIcon';
import TableContainer from '../containers/TableContainer';
import VolumeSeriesCreateForm from './VolumeSeriesCreateForm';
import VolumeSeriesDeleteForm from './VolumeSeriesDeleteForm';
import VolumeSeriesYaml from './VolumeSeriesYaml';

import { cacheStatus, formatBytes, metricStatusSortMethod, renderTags } from './utils';
import { applicationGroupsNamesAsArray, findApplicationGroupIds } from './utils_ags';
import { violationLevelColor } from './utils_styles';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';
import { vsrMsgs } from '../messages/VolumeSeriesRequest';
import { hasFilteredColumns } from './table_utils';
import { getViolationLevels } from './utils_metrics';

import * as constants from '../constants';

import './table.css';

import { DeleteForever, Edit, ErrorOutline, Publish } from '@material-ui/icons';
import { ReactComponent as Volumes } from '../assets/menu/ico-volume.svg';
import btnAddNewVolumeHov from '../btn-add-new-volume-hov.svg';
import btnAddNewVolumeUp from '../btn-add-new-volume-up.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnDeleteAllDisable from '../assets/btn-delete-all-disable.svg';
import btnDeleteAllHov from '../assets/btn-delete-all-hov.svg';
import btnDeleteAllUp from '../assets/btn-delete-all-up.svg';
import volumeIcon from '../volume.svg';

class VolumeSeries extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialogOpenCreate: false,
            editVolume: null,
            editClusterId: '',
            editConsistencyGroupId: '',
            editName: '',
            editTags: [],
        };

        this.dialogToggleCreate = this.dialogToggleCreate.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.handleEditChange = this.handleEditChange.bind(this);
        this.handleEditChangeCGs = this.handleEditChangeCGs.bind(this);
        this.handleEditChangeCluster = this.handleEditChangeCluster.bind(this);
        this.handleEditChangeTags = this.handleEditChangeTags.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.handleFilteredChange = this.handleFilteredChange.bind(this);
        this.handlePublish = this.handlePublish.bind(this);
        this.handleSortedChange = this.handleSortedChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.renderActions = this.renderActions.bind(this);
    }

    getConsistencyGroupName(consistencyGroupId) {
        const { consistencyGroupsData = [] } = this.props;
        const { consistencyGroups = [] } = consistencyGroupsData;

        const consistencyGroup = consistencyGroups.find(cg => {
            return cg.meta.id === consistencyGroupId;
        });

        return (consistencyGroup && consistencyGroup.name) || '';
    }

    getServicePlanName(servicePlanId) {
        const { servicePlansData } = this.props;
        const { servicePlans = [] } = servicePlansData || {};

        const servicePlan = servicePlans.find(sp => sp.meta.id === servicePlanId);

        return (servicePlan && servicePlan.name) || '';
    }

    dialogToggleCreate() {
        const { dialogOpenCreate } = this.state;

        this.setState({ dialogOpenCreate: !dialogOpenCreate });
    }

    disableEditSubmit() {
        const { editClusterId, editConsistencyGroupId, editName, editTags, editVolume } = this.state;
        const { _original } = editVolume || {};
        const { boundClusterId, consistencyGroupId, name, tags } = _original || {};

        return (
            editClusterId === boundClusterId &&
            editConsistencyGroupId === consistencyGroupId &&
            editName === name &&
            _.isEqual(editTags, tags)
        );
    }

    getStatus(violationLevel) {
        const { intl, session } = this.props;
        const { formatMessage } = intl;
        const { metricsDatabaseConnected } = session || {};

        if (metricsDatabaseConnected !== constants.METRICS_SERVICE_CONNECTED) {
            return '';
        }

        switch (violationLevel) {
            case constants.METRIC_VIOLATION_LEVELS.ERROR:
                return formatMessage(volumeSeriesMsgs.statusError);
            case constants.METRIC_VIOLATION_LEVELS.WARNING:
                return formatMessage(volumeSeriesMsgs.statusWarning);
            case constants.METRIC_VIOLATION_LEVELS.OK:
                return formatMessage(volumeSeriesMsgs.statusOk);
            default:
                return '';
        }
    }

    getViolationLevel(id) {
        const { volumeComplianceTotalsData } = this.props;
        const { metrics = [] } = volumeComplianceTotalsData || {};
        const { violationlevel = 0 } = metrics.find(metric => metric.volId === id) || {};

        return violationlevel;
    }

    handleDelete(volume) {
        const {
            applicationGroupsData,
            consistencyGroupsData,
            deleteVolumeSeries,
            intl,
            openModal,
            selectedRows,
            volumeSeriesData,
        } = this.props;
        const { formatMessage } = intl;
        const { volumeSeries = [] } = volumeSeriesData || {};

        openModal(
            VolumeSeriesDeleteForm,
            {
                dark: true,
                deleteFunc: () => deleteVolumeSeries(volume),
                title: formatMessage(volumeSeriesMsgs.deleteTitle),
            },
            {
                applicationGroupsData,
                consistencyGroupsData,
                message: formatMessage(volumeSeriesMsgs.deleteMsg, {
                    count: volume ? 1 : selectedRows.length,
                    name: volume ? volume.name : selectedRows[0].name,
                }),
                volumeSeries: volume
                    ? [volume]
                    : volumeSeries.filter(vs => selectedRows.some(row => row.id === vs.meta.id)),
            }
        );
    }

    handleEdit(selectedRow) {
        const { _original } = selectedRow || {};
        const { boundClusterId = '', consistencyGroupId = '', name = '', tags = [] } = _original || {};

        this.setState({
            editClusterId: boundClusterId,
            editConsistencyGroupId: consistencyGroupId,
            editVolume: selectedRow,
            editName: name,
            editTags: tags,
        });
    }

    handleEditChange(name, value) {
        this.setState({ [name]: value });
    }

    handleEditChangeCluster(selectedItem) {
        const { value = '' } = selectedItem || {};
        this.setState({ editClusterId: value });
    }

    handleEditChangeCGs(selectedItem) {
        const { value = '' } = selectedItem || {};
        this.setState({ editConsistencyGroupId: value });
    }

    handleEditChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ editTags: value });
    }

    handleEditSubmit() {
        const { patchVolumeSeries } = this.props;
        const { editClusterId, editConsistencyGroupId, editName, editTags, editVolume } = this.state;

        const { _original } = editVolume || {};
        const { boundClusterId, consistencyGroupId, id, name, tags, snapTags } = _original || {};
        const params = {
            ...(editConsistencyGroupId !== consistencyGroupId && { consistencyGroupId: editConsistencyGroupId }),
            ...(editName !== name && { name: editName }),
            ...(!_.isEqual(editTags, tags) && { tags: editTags }),
        };

        if (params.tags) {
            params.tags = [...params.tags, ...snapTags];
        }

        if (patchVolumeSeries) {
            patchVolumeSeries(id, params, !boundClusterId ? editClusterId : null);
        }

        this.handleEdit(null);
    }

    handleSubmit(volumeSeriesCreateSpec, clusterId, applicationGroupIds) {
        const { postVolumeSeries } = this.props;

        if (postVolumeSeries) {
            postVolumeSeries(volumeSeriesCreateSpec, clusterId, applicationGroupIds);
            this.dialogToggleCreate();
        }
    }

    renderFetchStatus() {
        const {
            volumeComplianceTotalsData = {},
            volumeSeriesData = {},
            applicationGroupsData = {},
            clustersData = {},
            consistencyGroupsData = {},
            servicePlanAllocationsData = {},
            servicePlansData = {},
        } = this.props;

        if (
            applicationGroupsData.loading ||
            clustersData.loading ||
            consistencyGroupsData.loading ||
            servicePlanAllocationsData.loading ||
            servicePlansData.loading ||
            volumeComplianceTotalsData.loading ||
            volumeSeriesData.loading
        ) {
            return <Loader />;
        }
    }

    renderMountIcon(volume) {
        const { clustersData, intl, mountVolumeSeries, openModal, unmountVolumeSeries } = this.props;
        const { formatMessage } = intl;
        const { id, name, state } = volume || {};
        switch (state) {
            case 'MOUNTED': {
                const { _original } = volume || {};
                const { mounts = [] } = _original || {};
                const nodeIds = mounts
                    .filter(mount => mount.mountState === 'MOUNTED')
                    .map(mount => mount.mountedNodeId);
                return (
                    <TableActionIcon
                        className="fa fa-eject glyphicon"
                        id={`volumeSeriesToolbarUnmount-${id}`}
                        onClick={() => {
                            openModal(Alert, {
                                dark: true,
                                submit: () => {
                                    unmountVolumeSeries(id, nodeIds, name);
                                },
                                title: `${formatMessage(vsrMsgs.unmountDesc)} ${name}`,
                            });
                        }}
                        tooltip={formatMessage(vsrMsgs.unmountDesc)}
                    />
                );
            }
            default:
                return (
                    <TableActionIcon
                        className="fa fa-hdd-o glyphicon"
                        id={`volumeSeriesToolbarMount-${id}`}
                        onClick={() => {
                            openModal(
                                MountVolumeForm,
                                {
                                    dark: true,
                                    mountVolumeSeries,
                                    title: formatMessage(vsrMsgs.mountDesc),
                                },
                                {
                                    clustersData,
                                    volume,
                                }
                            );
                        }}
                        tooltip={formatMessage(vsrMsgs.mountDesc)}
                    />
                );
        }
    }

    renderToolbar() {
        const { enableDelete, intl, openModal, selectedRows = [] } = this.props;
        const { formatMessage } = intl;
        const { _original } = selectedRows[0] || {};
        const { name } = _original || {};

        const disableYaml =
            selectedRows.length < 1 ||
            selectedRows.some(selectedRow => {
                const { _original } = selectedRow || {};
                const { clusterDescriptor } = _original || {};
                const { k8sPvcYaml } = clusterDescriptor || {};

                return !k8sPvcYaml;
            });

        return (
            <div className="table-header-actions">
                <ButtonAction
                    disabled={disableYaml}
                    icon={<Glyphicon glyph="save-file" />}
                    id="volumeSeriesToolbarYaml"
                    onClick={() => {
                        openModal(
                            VolumeSeriesYaml,
                            {
                                dark: true,
                                title: formatMessage(volumeSeriesMsgs.yamlTitle, {
                                    count: selectedRows.length,
                                    name,
                                }),
                            },
                            {
                                count: selectedRows.length,
                                k8sPvcYaml: {
                                    value: selectedRows
                                        .map(selectedRow => {
                                            const { _original } = selectedRow || {};
                                            const { clusterDescriptor, name } = _original || {};
                                            const { k8sPvcYaml } = clusterDescriptor || {};
                                            const { value = '' } = k8sPvcYaml || {};

                                            if (selectedRows.length > 1) {
                                                return `---\n#\n# ${name}\n#\n${value}`;
                                            }

                                            return value;
                                        })
                                        .join(''),
                                },
                            }
                        );
                    }}
                    tooltip={formatMessage(volumeSeriesMsgs.toolbarGetYaml)}
                />
                {enableDelete ? (
                    <ButtonAction
                        btnDisable={btnDeleteAllDisable}
                        btnHov={btnDeleteAllHov}
                        btnUp={btnDeleteAllUp}
                        disabled={selectedRows.length < 1}
                        id="volumeSeriesToolbarDelete"
                        onClick={() => this.handleDelete()}
                    />
                ) : null}
            </div>
        );
    }

    renderHeader() {
        const {
            accountsData,
            clustersData,
            intl,
            protectionDomainsData,
            servicePlanAllocationsData,
            servicePlansData,
            session,
            tableOnly,
            volumeComplianceTotalsData,
        } = this.props;
        const { formatMessage } = intl;

        const { dialogOpenCreate } = this.state;

        if (tableOnly) {
            return null;
        }

        const violationLevels = getViolationLevels(volumeComplianceTotalsData.metrics);

        return (
            <Fragment>
                <div className="content-flex-column">
                    <div className="content-flex-row">
                        <div className="layout-icon-background">
                            <img className="layout-icon" alt="" src={volumeIcon} />
                        </div>
                        <div className="content-flex-row layout-summary">
                            <div className="flex-item-centered pad-20-l pad-10-r">
                                <div className="summary-error">{violationLevels.error}</div>
                                <div className="summary-text nuvo-summary-text-14">
                                    {formatMessage(volumeSeriesMsgs.summaryStatusError)}
                                </div>
                            </div>
                            <div className="flex-item-centered pad-10-l pad-10-r">
                                <div className="summary-warning">{violationLevels.warning}</div>
                                <div className="summary-text nuvo-summary-text-14">
                                    {formatMessage(volumeSeriesMsgs.summaryStatusWarning)}
                                </div>
                            </div>
                            <div className="flex-item-centered pad-10-l pad-20-r">
                                <div className="summary-ok">{violationLevels.ok}</div>
                                <div className="summary-text nuvo-summary-text-14">
                                    {formatMessage(volumeSeriesMsgs.summaryStatusOk)}
                                </div>
                            </div>
                        </div>
                        <div className="layout-actions">
                            <div>
                                <ButtonAction
                                    btnUp={btnAddNewVolumeUp}
                                    btnHov={btnAddNewVolumeHov}
                                    id="volumeSeriesButtonCreate"
                                    onClick={this.dialogToggleCreate}
                                    label={formatMessage(volumeSeriesMsgs.toolbarCreate)}
                                />
                            </div>
                        </div>
                    </div>
                    <div />
                </div>
                <div className="divider-horizontal" />
                <Collapse in={dialogOpenCreate} unmountOnExit>
                    <div>
                        <VolumeSeriesCreateForm
                            accountsData={accountsData}
                            cancel={this.dialogToggleCreate}
                            clustersData={clustersData}
                            headerActions
                            hideDivider
                            onSubmit={this.handleSubmit}
                            protectionDomainsData={protectionDomainsData}
                            servicePlanAllocationsData={servicePlanAllocationsData}
                            servicePlansData={servicePlansData}
                            session={session}
                        />
                        <div className="divider-horizontal mt5" />
                    </div>
                </Collapse>
            </Fragment>
        );
    }

    cacheWarningText() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return <div>{formatMessage(volumeSeriesMsgs.insufficientCacheWarning)}</div>;
    }

    handleFilteredChange(data, filtered) {
        const { onFilteredChange } = this.props;
        const filteredData = data.filter(currData => this.hasFiltered(currData, filtered));

        if (onFilteredChange) {
            onFilteredChange(filteredData);
        }
    }

    handleSortedChange(data) {
        const { onSortedChange } = this.props;

        if (onSortedChange) {
            onSortedChange(data);
        }
    }

    // mimic table filtering behavior
    hasFiltered(currData, filtered) {
        return hasFilteredColumns(currData, this.getColumnInfo(), filtered);
    }

    handlePublish(volume, clusterId) {
        const { handlePublish } = this.props;
        if (handlePublish) {
            handlePublish(volume, clusterId);
        }
    }

    renderActions(row, original) {
        const { clustersData = {}, enableDelete, enableMount, intl, openModal } = this.props;
        const { formatMessage } = intl;
        const { editVolume } = this.state;
        const { clusterDescriptor, id, name, state } = original || {};
        const { k8sPvcYaml } = clusterDescriptor || {};
        const disableYaml = k8sPvcYaml ? false : true;
        const disableBind = state !== constants.VOLUME_MOUNT_STATES.UNBOUND;

        if (editVolume && editVolume.id === id) {
            return (
                <Fragment>
                    <ButtonAction
                        btnUp={btnAltSaveUp}
                        btnHov={btnAltSaveHov}
                        btnDisable={btnAltSaveDisable}
                        disabled={this.disableEditSubmit()}
                        onClick={this.handleEditSubmit}
                    />
                    <ButtonAction btnUp={btnCancelUp} btnHov={btnCancelHov} onClick={() => this.handleEdit(null)} />
                </Fragment>
            );
        } else {
            return (
                <Fragment>
                    {enableMount ? this.renderMountIcon(row) : null}
                    <TableActionIcon
                        id={`volumeSeriesToolbarEdit-${id}`}
                        materialIcon={Edit}
                        onClick={() => this.handleEdit(row)}
                        tooltip={formatMessage(volumeSeriesMsgs.toolbarEdit)}
                    />

                    <TableActionIcon
                        disabled={disableYaml}
                        glyph="save-file"
                        id={`volumeSeriesToolbarYaml-${id}`}
                        onClick={() => {
                            openModal(
                                VolumeSeriesYaml,
                                {
                                    dark: true,
                                    title: formatMessage(volumeSeriesMsgs.yamlTitle, {
                                        count: 1,
                                        name,
                                    }),
                                },
                                { k8sPvcYaml }
                            );
                        }}
                        tooltip={formatMessage(volumeSeriesMsgs.toolbarGetYaml)}
                    />
                    <TableActionIcon
                        disabled={disableBind}
                        id={`volumeSeriesToolbarBind-${id}`}
                        materialIcon={Publish}
                        onClick={() => {
                            openModal(
                                BindPublishForm,
                                {
                                    dark: true,
                                    handlePublish: this.handlePublish,
                                    id: 'volumeSeriesBindPublishForm',
                                    title: formatMessage(volumeSeriesMsgs.bindClusterTitle),
                                },
                                {
                                    clustersData,
                                    volume: row._original,
                                }
                            );
                        }}
                        tooltip={formatMessage(volumeSeriesMsgs.toolbarBind)}
                    />
                    {enableDelete ? (
                        <TableActionIcon
                            id={`volumeSeriesToolbarDelete-${id}`}
                            materialIcon={DeleteForever}
                            onClick={() => this.handleDelete(row._original)}
                            tooltip={formatMessage(volumeSeriesMsgs.toolbarDelete)}
                        />
                    ) : null}
                </Fragment>
            );
        }
    }

    getColumnInfo() {
        const { clustersData = {}, enableDelete, enableMount, hideColumns, intl } = this.props;
        const { formatMessage } = intl;
        const { editVolume } = this.state;
        const { clusters = [] } = clustersData || {};

        const columns = [
            {
                Header: formatMessage(volumeSeriesMsgs.tableName),
                accessor: 'name',
                editable: true,
                minWidth: 150,
                show: !hideColumns.includes('name'),
                Cell: row => {
                    const { editName } = this.state;
                    const { original } = row || {};
                    const { id = '' } = original || {};
                    const { id: editVolumeId } = editVolume || {};

                    if (id === editVolumeId) {
                        return (
                            <FieldGroup name="editName" onChange={this.handleEditChange} type="text" value={editName} />
                        );
                    } else {
                        return (
                            <Link
                                className="table-name-link"
                                to={{ pathname: `/${constants.URI_VOLUME_SERIES}/${id}`, state: { name: row.value } }}
                            >
                                {row.value}
                            </Link>
                        );
                    }
                },
            },
            {
                Header: formatMessage(volumeSeriesMsgs.createdOnLabel),
                accessor: 'timeCreated',
                minWidth: 120,
                show: !hideColumns.includes('timeCreated'),
                Cell: row => moment(row.value).format('lll'),
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableServicePlan),
                accessor: 'servicePlanName',
                minWidth: 100,
                show: !hideColumns.includes('servicePlanName'),
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableSize),
                accessor: 'sizeBytes',
                getDisplayValue: value => formatBytes(value),
                minWidth: 50,
                show: !hideColumns.includes('sizeBytes'),
                Cell: row => <div>{formatBytes(row.value)}</div>,
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableCapacity),
                accessor: 'performanceCapacityBytes',
                getDisplayValue: value => formatBytes(value),
                minWidth: 70,
                show: !hideColumns.includes('performanceCapacityBytes'),
                Cell: row => <div>{formatBytes(row.value)}</div>,
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableState),
                accessor: 'state',
                editable: true,
                show: !hideColumns.includes('state'),
                Cell: row => {
                    const { original, value } = row || {};
                    const { boundClusterId, id = '' } = original || {};
                    const { id: editVolumeId } = editVolume || {};

                    if (id === editVolumeId) {
                        if (boundClusterId) {
                            return <div className="ml5">{value}</div>;
                        }

                        return (
                            <SelectOptions
                                id="clustersSelect"
                                isLoading={clustersData.loading}
                                onChange={this.handleEditChangeCluster}
                                options={clusters.map(cluster => {
                                    const { meta, name } = cluster || {};
                                    const { id } = meta || {};
                                    return { value: id, label: name };
                                })}
                                placeholder={formatMessage(volumeSeriesMsgs.clustersPlaceholder)}
                            />
                        );
                    } else {
                        return value;
                    }
                },
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableCluster),
                accessor: 'boundClusterName',
                minWidth: 120,
                show: !hideColumns.includes('boundClusterName'),
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableApplicationGroup),
                accessor: 'applicationGroupName',
                minWidth: 150,
                show: !hideColumns.includes('applicationGroupName'),
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableConsistencyGroup),
                accessor: 'consistencyGroupName',
                minWidth: 150,
                show: !hideColumns.includes('consistencyGroupName'),
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableStatus),
                accessor: 'status',
                minWidth: 75,
                show: !hideColumns.includes('status'),
                sortMethod: metricStatusSortMethod,
                Cell: row => {
                    const { original, value } = row || {};
                    const { cacheStatus, violationLevel } = original || {};

                    return (
                        <div className={`content-flex-row-centered ${violationLevelColor(violationLevel)}`}>
                            {value}
                            {cacheStatus !== constants.METRIC_VIOLATION_LEVELS.OK ? (
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="cache-warning-text">{this.cacheWarningText()}</Tooltip>}
                                >
                                    <ErrorOutline className="field-warning-icon" />
                                </OverlayTrigger>
                            ) : (
                                ''
                            )}
                        </div>
                    );
                },
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableTags),
                accessor: 'tags',
                minWidth: 140,
                show: !hideColumns.includes('tags'),
                Cell: row => {
                    const { editTags } = this.state;
                    const { original } = row || {};
                    const { id } = original || {};
                    const { id: editVolumeId } = editVolume || {};

                    if (id === editVolumeId) {
                        return <SelectTags onChange={this.handleEditChangeTags} tags={editTags} />;
                    } else {
                        const displayTags = row.value.filter(tag => !tag.startsWith('snap-'));
                        return renderTags(displayTags);
                    }
                },
            },
            {
                Header: 'snaptags',
                accessor: 'snaptags',
                minWidth: 140,
                show: false,
            },
            {
                Header: 'Actions',
                accessor: 'actions',
                minWidth: enableDelete || enableMount ? 140 : 90,
                show: !hideColumns.includes('actions'),
                sortable: false,
                Cell: (selected = {}) => {
                    const { original, row } = selected || {};
                    return <div className="table-actions-cell">{this.renderActions(row, original)}</div>;
                },
            },
            {
                Header: 'ID',
                accessor: 'id',
                show: false,
            },
        ];

        return columns;
    }

    getData() {
        const {
            applicationGroupsData,
            clustersData,
            consistencyGroupsData,
            volumeSeriesData,
            volumeSeriesFilter,
        } = this.props;

        const { applicationGroups = [] } = applicationGroupsData || {};
        const { clusters = [] } = clustersData || {};
        const { consistencyGroups = [] } = consistencyGroupsData || {};
        const { volumeSeries = [] } = volumeSeriesData || {};
        const { editVolume } = this.state;

        const data =
            volumeSeries.length > 0
                ? volumeSeries.filter(volumeSeriesFilter).map(vol => {
                      const {
                          accountId,
                          accountName,
                          boundClusterId,
                          clusterDescriptor,
                          consistencyGroupId,
                          description,
                          meta,
                          mounts = [],
                          name,
                          servicePlanId,
                          sizeBytes,
                          spaAdditionalBytes,
                          tags = [],
                          volumeSeriesState,
                      } = vol || {};
                      const { id, timeCreated } = meta || {};
                      const { mountState, mountedNodeId } = mounts.find(mount => mount.snapIdentifier === 'HEAD') || {};

                      const cluster =
                          clusters.find(cluster => {
                              const { meta } = cluster || {};
                              const { id } = meta || {};

                              return id === boundClusterId;
                          }) || {};

                      const applicationGroupIds = findApplicationGroupIds(consistencyGroups, consistencyGroupId);
                      const violationLevel = this.getViolationLevel(vol.meta.id);

                      const { id: editVolumeId } = editVolume || {};

                      return {
                          id,
                          accountId,
                          accountName,
                          applicationGroupIds,
                          applicationGroupName: applicationGroupsNamesAsArray(applicationGroups, applicationGroupIds),
                          boundClusterId,
                          boundClusterName: cluster.name,
                          cacheStatus: cacheStatus(vol),
                          clusterDescriptor,
                          consistencyGroupId,
                          consistencyGroupName: this.getConsistencyGroupName(consistencyGroupId),
                          description,
                          edit: id === editVolumeId ? true : false,
                          mountedNodeId,
                          mounts,
                          name,
                          performanceCapacityBytes: sizeBytes + spaAdditionalBytes,
                          servicePlanId,
                          servicePlanName: this.getServicePlanName(servicePlanId),
                          sizeBytes,
                          snapTags: tags.filter(tag => tag.startsWith('snap-')),
                          state: mountState || volumeSeriesState,
                          status: this.getStatus(violationLevel),
                          tags: tags.filter(tag => !tag.startsWith('snap-')),
                          timeCreated: moment(timeCreated)
                              .utc()
                              .valueOf(),
                          violationLevel,
                      };
                  })
                : [];

        return data;
    }

    render() {
        const {
            hideHeader,
            intl,
            location,
            multiSelect,
            noHeader,
            selectable = true,
            selectedRows,
            tableOnly,
        } = this.props;
        const { formatMessage } = intl;

        const { pathname = '', search, state = {} } = location;
        const page = pathname.split('/')[1];
        const params = new URLSearchParams(search);
        const defaultFiltered = params.get('filter') || state.filter || '';

        const columns = this.getColumnInfo();
        const data = this.getData();

        return (
            <div className={`dark ${tableOnly ? '' : 'component-page'}`}>
                {this.renderFetchStatus()}
                {noHeader ? null : this.renderHeader()}
                <TableContainer
                    columns={columns}
                    columnsCustomizable={page === constants.URI_VOLUME_SERIES}
                    component="VOLUME_SERIES_TABLE"
                    componentSelectedRows={selectedRows}
                    data={data}
                    dataTestId="volume-series-table"
                    defaultFiltered={defaultFiltered}
                    defaultSorted={[{ id: 'timeCreated', desc: true }]}
                    emptyPlaceholder={{
                        icon: Volumes,
                        text: formatMessage(volumeSeriesMsgs.tableEmptyPlaceholder),
                    }}
                    filterLeft
                    hideHeader={hideHeader}
                    id="volume-series"
                    multiSelect={multiSelect}
                    onFilteredChange={this.handleFilteredChange}
                    onSortedChange={this.handleSortedChange}
                    selectable={selectable && !tableOnly}
                    title={formatMessage(volumeSeriesMsgs.tableTitle)}
                    toolbar={!tableOnly ? this.renderToolbar() : null}
                />
            </div>
        );
    }
}

// Property type validation
VolumeSeries.propTypes = {
    accountsData: PropTypes.object,
    applicationGroupsData: PropTypes.object,
    clustersData: PropTypes.object,
    consistencyGroupsData: PropTypes.object,
    deleteVolumeSeries: PropTypes.func,
    enableDelete: PropTypes.bool,
    enableMount: PropTypes.bool,
    getPVSpec: PropTypes.func,
    handlePublish: PropTypes.func,
    hideColumns: PropTypes.array,
    hideHeader: PropTypes.bool,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    mountVolumeSeries: PropTypes.func,
    multiSelect: PropTypes.bool,
    noHeader: PropTypes.bool,
    onFilteredChange: PropTypes.func,
    onSortedChange: PropTypes.func,
    openModal: PropTypes.func,
    patchVolumeSeries: PropTypes.func,
    postVolumeSeries: PropTypes.func,
    protectionDomainsData: PropTypes.object,
    selectable: PropTypes.bool,
    selectedRows: PropTypes.array,
    servicePlanAllocationsData: PropTypes.object,
    servicePlansData: PropTypes.object,
    session: PropTypes.object,
    tableOnly: PropTypes.bool,
    toolbar: PropTypes.object,
    unmountVolumeSeries: PropTypes.func,
    volumeComplianceTotalsData: PropTypes.object,
    volumeSeriesData: PropTypes.object,
    volumeSeriesFilter: PropTypes.func,
};

VolumeSeries.defaultProps = {
    hideColumns: [],
    tableOnly: false,
    volumeSeriesFilter: () => true,
};

export default withRouter(injectIntl(VolumeSeries));
