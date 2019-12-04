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
import moment from 'moment';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
// import RelatedVolumes from './RelatedVolumes';
import TableContainer from '../containers/TableContainer';
import TimePeriodSelector from './TimePeriodSelector';

import { volumeSeriesMsgs } from '../messages/VolumeSeries';

import { AccessTime, NoteAdd, Notes } from '@material-ui/icons';

// import btnVolumeDisable from '../assets/btn-volume-disable.svg';
// import btnVolumeHov from '../assets/btn-volume-hov.svg';
// import btnVolumeUp from '../assets/btn-volume-up.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import { ArrowRightAlt, ShowChart } from '@material-ui/icons';

import * as constants from '../constants';

const ITEM_TYPE_SNAPSHOTS = 'ITEM_TYPE_SNAPSHOTS';
const ITEM_TYPE_VIOLATIONS = 'ITEM_TYPE_VIOLATIONS';
const ITEM_TYPE_INFO = 'ITEM_TYPE_INFO';
const ITEM_TYPE_ANNOTATION = 'ITEM_TYPE_ANNOTATION';

const VIEW_NOTES = 'VIEW_NOTES';
const VIEW_TIME = 'VIEW_TIME';

class VolumeServiceHistory extends Component {
    constructor(props) {
        super(props);

        /**
         * Filters: start with some of them enabled by default.
         */
        this.state = {
            // dialogOpenRelatedVolumes: false,
            editIndex: null,
            editItem: null,
            filters: {
                ITEM_TYPE_ANNOTATION: true,
                ITEM_TYPE_INFO: true,
                ITEM_TYPE_SNAPSHOTS: false,
                ITEM_TYPE_VIOLATIONS: true,
            },
            view: VIEW_TIME,
        };

        // this.handleClickRelated = this.handleClickRelated.bind(this);
        this.handleEditChange = this.handleEditChange.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.selectChart = this.selectChart.bind(this);
        this.selectTimePeriod = this.selectTimePeriod.bind(this);

        // used when inserting an additional row into the table
        this.rowIndex = 0;
    }

    /**
     * Map the given compliance violation key to its text representation.
     * @param {*} key
     */
    violationMessage(key) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (key) {
            case constants.VIOLATION_LATENCY_MEAN:
                return formatMessage(volumeSeriesMsgs.violationLatencyMean);
            case constants.VIOLATION_LATENCY_MAX:
                return formatMessage(volumeSeriesMsgs.violationLatencyMax);

            case constants.VIOLATION_WORKLOAD_RATE:
                return formatMessage(volumeSeriesMsgs.violationWorkloadRate);

            case constants.VIOLATION_WORKLOAD_MIXREAD:
                return formatMessage(volumeSeriesMsgs.violationWorkloadMixRead);

            case constants.VIOLATION_WORKLOAD_MIXWRITE:
                return formatMessage(volumeSeriesMsgs.violationWorkloadMixWrite);

            case constants.VIOLATION_WORKLOAD_AVG_SIZE_MIN:
                return formatMessage(volumeSeriesMsgs.violationWorkloadAvgSizeMin);

            case constants.VIOLATION_WORKLOAD_AVG_SIZE_MAX:
                return formatMessage(volumeSeriesMsgs.violationWorkloadAvgSizeMax);

            case constants.VIOLATION_RPO:
                return formatMessage(volumeSeriesMsgs.violationRPO);

            default:
        }
    }

    /**
     * Determine text for violation level change.
     * @param {*} level
     */
    violationLevelText(level) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (level) {
            case constants.METRIC_VIOLATION_LEVELS.WARNING:
                return formatMessage(volumeSeriesMsgs.violationChangeWarning);
            case constants.METRIC_VIOLATION_LEVELS.ERROR:
                return formatMessage(volumeSeriesMsgs.violationChangeError);
            default:
                return formatMessage(volumeSeriesMsgs.violationChangeCleared);
        }
    }

    /**
     * Toggle the filter when a user clicks the corresponding button.
     * @param {*} filter
     */
    filterClick(filter) {
        const { filters } = this.state;

        filters[filter] = !filters[filter];

        // abort any adds in progress
        this.setState({
            editIndex: null,
            editItem: null,
            editMessage: '',
            editTimestamp: '',
            filters,
        });
    }

    viewClick(view) {
        this.setState({ view });
    }

    renderTooltip(view) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        if (view === VIEW_NOTES) {
            return (
                <Tooltip id="volume-service-history-tooltip-notes">
                    {formatMessage(volumeSeriesMsgs.viewTooltipNotes)}
                </Tooltip>
            );
        } else {
            return (
                <Tooltip id="volume-service-history-tooltip-time">
                    {formatMessage(volumeSeriesMsgs.viewTooltipTime)}
                </Tooltip>
            );
        }
    }

    renderToolbar() {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { filters, view } = this.state;

        return (
            <div className="content-flex-row-centered">
                <div className="dialog-title">{formatMessage(volumeSeriesMsgs.serviceHistoryFiltersLabel)}</div>
                <div
                    className={`group-button ml10 ${filters[ITEM_TYPE_INFO] ? 'group-button-selected' : ''}`}
                    onClick={() => this.filterClick(ITEM_TYPE_INFO)}
                >
                    <div>{formatMessage(volumeSeriesMsgs.filterLabelInfo)}</div>
                </div>
                <div
                    className={`group-button ml10 ${filters[ITEM_TYPE_VIOLATIONS] ? 'group-button-selected' : ''}`}
                    onClick={() => this.filterClick(ITEM_TYPE_VIOLATIONS)}
                >
                    <div>{formatMessage(volumeSeriesMsgs.tableServiceHistoryViolations)}</div>
                </div>
                <div
                    className={`group-button ml10 ${filters[ITEM_TYPE_ANNOTATION] ? 'group-button-selected' : ''}`}
                    onClick={() => this.filterClick(ITEM_TYPE_ANNOTATION)}
                >
                    <div>{formatMessage(volumeSeriesMsgs.tableServiceHistoryNotes)}</div>
                </div>
                <div
                    className={`group-button ml10 ${filters[ITEM_TYPE_SNAPSHOTS] ? 'group-button-selected' : ''}`}
                    onClick={() => this.filterClick(ITEM_TYPE_SNAPSHOTS)}
                >
                    <div>{formatMessage(volumeSeriesMsgs.tableServiceHistorySnapshots)}</div>
                </div>
                <div className="flex-item-centered">
                    <div className="dialog-title ml20">{formatMessage(volumeSeriesMsgs.viewLabel)}</div>
                    <OverlayTrigger placement="top" overlay={this.renderTooltip(VIEW_TIME)}>
                        <div
                            className={`group-button group-icon  ${view === VIEW_TIME ? 'group-button-selected' : ''}`}
                            onClick={() => this.viewClick(VIEW_TIME)}
                        >
                            <AccessTime />
                        </div>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={this.renderTooltip(VIEW_NOTES)}>
                        <div
                            className={`group-button group-icon  ${view === VIEW_NOTES ? 'group-button-selected' : ''}`}
                            onClick={() => this.viewClick(VIEW_NOTES)}
                        >
                            <Notes />
                        </div>
                    </OverlayTrigger>
                </div>
            </div>
        );
    }

    componentDidUpdate() {
        const { editIndex, editItem } = this.state;

        if (editItem) {
            const el = document.getElementById(`rowid_${editIndex}`);
            if (el) {
                el.scrollIntoView();
            }
        }
    }

    violationChangeColor(level) {
        switch (level) {
            case constants.METRIC_VIOLATION_LEVELS.WARNING:
                return 'level-warning';
            case constants.METRIC_VIOLATION_LEVELS.ERROR:
                return 'level-error';
            default:
                return 'level-clear';
        }
    }

    itemType(type) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (type) {
            case ITEM_TYPE_SNAPSHOTS:
                return <div>{formatMessage(volumeSeriesMsgs.tableServiceHistorySnapshots)}</div>;

            case ITEM_TYPE_VIOLATIONS:
                return <div>{formatMessage(volumeSeriesMsgs.tableServiceHistoryViolations)}</div>;

            case ITEM_TYPE_INFO:
                return <div>{formatMessage(volumeSeriesMsgs.tableServiceHistoryInfo)}</div>;

            case ITEM_TYPE_ANNOTATION:
                return <div>{formatMessage(volumeSeriesMsgs.tableServiceHistoryNote)}</div>;

            default:
                return '';
        }
    }

    /**
     * Add an id to the list
     * @param {*} id
     * @param {*} uuids
     */
    addIdToList(id, uuids) {
        if (id !== '') {
            uuids.push(id);
        }
    }

    /**
     * Find all entries associated with the volume.  All volume service history
     * items returned will be included.  We need to explicitly add associated entries
     * with the volume
     * - cluster
     * - nodes
     * - SPA (TBD)
     * - CG
     * - AGs (TBD)
     * @param {*} volume
     * @param {*} volumeServiceHistory
     * @param {*} clusters
     * @param {*} consistencyGroups
     * @param {*} filteredHistory
     */
    filterServiceHistory(volume, volumeServiceHistory, clusters, consistencyGroups, filteredHistory) {
        const uuids = [];

        const { boundClusterId = '', consistencyGroupId = '', meta, servicePlanAllocationId = '' } = volume || {};
        const { id = '' } = meta;

        this.addIdToList(id, uuids);
        this.addIdToList(boundClusterId, uuids);
        this.addIdToList(servicePlanAllocationId, uuids);
        this.addIdToList(consistencyGroupId, uuids);

        const cluster = clusters.find(cluster => cluster.meta.id === boundClusterId);
        const { nodes = [] } = cluster || {};
        nodes.forEach(node => {
            const { meta } = node;
            const { id } = meta;
            this.addIdToList(id, uuids);
        });

        consistencyGroups.forEach(consistencyGroup => {
            const { applicationGroupIds = [] } = consistencyGroup;
            applicationGroupIds.forEach(id => {
                this.addIdToList(id, uuids);
            });
        });

        volumeServiceHistory.forEach(item => {
            const { classification, objectId = '', objectType } = item;
            if (
                objectType === constants.SERVICE_HISTORY_METRICS_VIOLATION ||
                classification === constants.SERVICE_HISTORY_ANNOTATION
            ) {
                filteredHistory.push(item);
            } else if (objectType === constants.SERVICE_HISTORY_RPO_VIOLATION) {
                filteredHistory.push(item);
            } else {
                if (uuids.includes(objectId)) {
                    filteredHistory.push(item);
                }
            }
        });
    }

    /**
     * We need to find an audit log entry for the volume
     * that exists in the audit log database since metrics
     * violations are currently synthesized on the client.
     */
    findLastParentNumVolume(filteredHistory, volume, timestamp) {
        let lastVolumeEntryIndex = -1;

        for (let i = filteredHistory.length - 1; i > 0; i--) {
            const { objectType, timestamp: recordTimestamp } = filteredHistory[i];
            if (objectType === 'volumeseries' && recordTimestamp <= timestamp) {
                lastVolumeEntryIndex = i;
                break;
            }
        }
        return filteredHistory && lastVolumeEntryIndex >= 0 && filteredHistory[lastVolumeEntryIndex].recordNum;
    }

    /**
     * Determine if a timestamp is in the required range.
     */
    inTimeRange(timestamp, startTime, endTime) {
        return moment(timestamp).isSameOrAfter(startTime) && moment(timestamp).isSameOrBefore(endTime);
    }

    /**
     * Add violations to the data set.
     * @param {*} volume
     * @param {*} volumeServiceHistory
     * @param {*} data
     */
    addViolations(volume, volumeServiceHistory, data) {
        const { clustersData, consistencyGroupsData, endTime, startTime } = this.props;
        const { clusters = [] } = clustersData || {};
        const { consistencyGroups = [] } = consistencyGroupsData || {};
        const filteredHistory = [];
        const { meta } = volume || {};
        const { id } = meta || {};

        this.filterServiceHistory(volume, volumeServiceHistory, clusters, consistencyGroups, filteredHistory);

        filteredHistory.forEach(history => {
            const { levels, objectType, timestamp, violationLevelChanges } = history;
            const violationsExist =
                violationLevelChanges && Object.values(violationLevelChanges).find(value => value !== null);

            if (this.inTimeRange(timestamp, startTime, endTime)) {
                if (violationsExist) {
                    const keys = Object.keys(violationLevelChanges);
                    keys.forEach(key => {
                        if (violationLevelChanges[key]) {
                            /**
                             * Violations will have the objectid set to the volume's id.
                             * The parent is the last audit log entry for the volume.
                             */
                            const parentNum = this.findLastParentNumVolume(filteredHistory, volume, timestamp);
                            data.push({
                                index: this.rowIndex++,
                                key: key,
                                level: levels[key],
                                levels,
                                levelText: this.violationLevelText(levels[key]),
                                message: this.violationMessage(key),
                                objectId: id,
                                objectType,
                                parentNum,
                                timestamp,
                                type: ITEM_TYPE_VIOLATIONS,
                                violationLevelChange: violationLevelChanges[key],
                            });
                        }
                    });
                }
            }
        });
    }

    /**
     * Add audit log entries to the data set.
     * @param {*} volume
     * @param {*} volumeServiceHistory
     * @param {*} data
     */
    addAudit(filter, volume, volumeServiceHistory, data) {
        const { clustersData, consistencyGroupsData, endTime, startTime } = this.props;
        const { filters } = this.state;
        const { clusters = [] } = clustersData || {};
        const { consistencyGroups = [] } = consistencyGroupsData || {};
        const filteredHistory = [];

        this.filterServiceHistory(volume, volumeServiceHistory, clusters, consistencyGroups, filteredHistory);

        filteredHistory.forEach(history => {
            const {
                classification,
                message,
                name = '',
                objectId,
                objectType,
                parentNum,
                recordNum,
                timestamp,
            } = history;

            if (this.inTimeRange(timestamp, startTime, endTime)) {
                if (message) {
                    const msgObjectType = objectType === 'serviceplanallocation' ? 'pool' : objectType;
                    const msg =
                        classification === constants.SERVICE_HISTORY_ANNOTATION
                            ? `${message}`
                            : `${msgObjectType} ${name}: ${message}`;
                    if (
                        ((classification === 'audit' || classification === 'event') &&
                            filters.ITEM_TYPE_INFO &&
                            filter === ITEM_TYPE_INFO) ||
                        (classification === constants.SERVICE_HISTORY_ANNOTATION &&
                            filters.ITEM_TYPE_ANNOTATION &&
                            filter === ITEM_TYPE_ANNOTATION)
                    ) {
                        data.push({
                            index: this.rowIndex++,
                            message: msg,
                            name,
                            objectId,
                            objectType,
                            parentNum,
                            recordNum,
                            timestamp,
                            type:
                                classification === constants.SERVICE_HISTORY_ANNOTATION
                                    ? ITEM_TYPE_ANNOTATION
                                    : ITEM_TYPE_INFO,
                        });
                    }
                }
            }
        });
    }

    /**
     * Add snapshots to the data set.
     * @param {*} data
     */
    addSnapshots(data) {
        const { endTime, intl, snapshotsData, startTime } = this.props;
        const { formatMessage } = intl;
        const { snapshots = [] } = snapshotsData || {};

        snapshots.forEach(snapshot => {
            const { meta } = snapshot || {};
            const { timeCreated } = meta || {};
            const message = formatMessage(volumeSeriesMsgs.snapshotCreated);
            if (this.inTimeRange(timeCreated, startTime, endTime)) {
                data.push({
                    index: this.rowIndex++,
                    message,
                    objectType: 'snapshot',
                    timestamp: timeCreated,
                    type: ITEM_TYPE_SNAPSHOTS,
                });
            }
        });
    }

    /**
     * Count summary 'things' for the volume for day/week/month.
     * @param {*} volume
     * @param {*} volumeServiceHistory
     * @param {*} data
     * @param {*} errorCounter
     */
    countSummaryViolations(volume, volumeServiceHistory, data, errorCounter) {
        if (!volumeServiceHistory) {
            return 0;
        }
        volumeServiceHistory.forEach(history => {
            const { timestamp, violationLevelChanges } = history;
            const violationsExist =
                violationLevelChanges && Object.values(violationLevelChanges).find(value => value !== null);

            if (violationsExist) {
                const keys = Object.keys(violationLevelChanges);
                keys.forEach(key => {
                    if (violationLevelChanges[key]) {
                        if (violationLevelChanges[key] === 'VIOLATION_SET') {
                            if (moment(timestamp).isAfter(moment(new Date()).subtract('1', 'day'))) {
                                errorCounter.errorsDay++;
                            }
                            if (moment(timestamp).isAfter(moment(new Date()).subtract('1', 'week'))) {
                                errorCounter.errorsWeek++;
                            }
                            if (moment(timestamp).isAfter(moment(new Date()).subtract('1', 'month'))) {
                                errorCounter.errorsMonth++;
                            }
                        }
                    }
                });
            }
        });
    }

    /**
     * Open/close the related volumes dialog.
     */
    // handleClickRelated() {
    //     const { dialogOpenRelatedVolumes } = this.state;

    //     this.setState({
    //         dialogOpenRelatedVolumes: !dialogOpenRelatedVolumes,
    //     });
    // }

    /**
     * Render the related volumes dialog.
     */
    // renderRelatedVolumesDialog() {
    //     const { volume = {}, volumeSeriesData, volumeComplianceTotalsData } = this.props;
    //     const { dialogOpenRelatedVolumes } = this.state;

    //     return (
    //         <Collapse in={dialogOpenRelatedVolumes} unmountOnExit>
    //             <div className="ml20">
    //                 <RelatedVolumes
    //                     cancel={this.handleClickRelated}
    //                     volumeSeriesData={volumeSeriesData}
    //                     volumeComplianceTotalsData={volumeComplianceTotalsData}
    //                     volume={volume}
    //                 />
    //             </div>
    //         </Collapse>
    //     );
    // }

    /**
     * Callback from container in higher level component.
     * @param {*} timePeriod
     */
    selectTimePeriod(timePeriod) {
        const { selectTimePeriod } = this.props;

        if (selectTimePeriod) {
            selectTimePeriod(timePeriod);
        }
    }

    handleEdit(selectedRow) {
        const { _original } = selectedRow || {};
        const { name = '', objectType = '', timestamp = '', type } = _original || {};
        const editMessage = type === ITEM_TYPE_ANNOTATION ? `` : `${objectType} ${name}: `;

        this.setState({
            editTimestamp: timestamp,
            editIndex: this.rowIndex,
            editItem: selectedRow,
            editMessage,
        });
    }

    disableEditSubmit() {
        const { editMessage } = this.state;

        return editMessage === '';
    }

    handleEditChange(name, value) {
        this.setState({ [name]: value });
    }

    handleEditSubmit() {
        const { editItem, editMessage, editTimestamp } = this.state;
        const { _original } = editItem || {};
        const { objectId, parentNum, recordNum } = _original || {};
        const { postAuditLog } = this.props;

        /**
         * If there is a recordNum, we are attaching to that specific audit log entry.
         * If there is not a recordNum, it is a violation and we will have set the
         * parentNum explicitly to the last volume series audit log entry before the
         * violation.
         */
        const params = {
            classification: constants.SERVICE_HISTORY_ANNOTATION,
            message: editMessage,
            objectId,
            parentNum: recordNum || parentNum,
            timestamp: editTimestamp,
        };

        postAuditLog(params);

        this.setState({
            editIndex: null,
            editItem: null,
            editMessage: '',
            editTimestamp: '',
        });
    }

    /**
     * Map object types to details for the link to include in the table.
     */
    getLink(objectType, objectId, name) {
        const { clustersData = {} } = this.props;
        switch (objectType) {
            case 'applicationgroup':
                return {};

            case 'cluster':
                return {
                    url: `clusters/${objectId}`,
                    id: objectId,
                    icon: <ArrowRightAlt />,
                };

            case 'consistencygroup':
                return {
                    url: `volumes`,
                    filter: name,
                    id: '',
                    tabKey: constants.VOLUMES_TABS.CONSISTENCY_GROUPS,
                    icon: <ArrowRightAlt />,
                };

            case 'cspdomain':
                return {
                    url: `csp-domain/${objectId}`,
                    id: objectId,
                    tab: '',
                    icon: <ArrowRightAlt />,
                };

            case 'node': {
                /**
                 * Look up parent cluster and set Nodes tab as destination.
                 */
                const { clusters = [] } = clustersData || {};
                const cluster = clusters.find(cluster => {
                    const { nodes = [] } = cluster;
                    return nodes.find(node => node.meta.id === objectId);
                });
                const id = (cluster && cluster.meta.id) || '';
                return {
                    url: `clusters/${id}`,
                    id,
                    tabKey: constants.CLUSTER_DETAILS_TABS.NODES,
                    icon: <ArrowRightAlt />,
                    state: { nodeId: objectId },
                };
            }
            case 'user':
                return {
                    url: `users/${objectId}`,
                    id: objectId,
                    tab: '',
                    icon: <ArrowRightAlt />,
                };

            default:
                return {};
        }
    }

    /**
     * Map the violation to the target chart type.
     */
    chartKey(key) {
        switch (key) {
            case constants.VIOLATION_LATENCY_MEAN:
                return constants.SLO_KEYS.RESPONSE_TIME_AVERAGE;

            case constants.VIOLATION_LATENCY_MAX:
                return constants.SLO_KEYS.RESPONSE_TIME_MAXIMUM;

            case constants.VIOLATION_WORKLOAD_RATE:
                return constants.IO_KEYS.PROVISIONING_UNIT;

            case constants.VIOLATION_WORKLOAD_MIXREAD:
            case constants.VIOLATION_WORKLOAD_MIXWRITE:
                return constants.IO_KEYS.READ_WRITE_MIX;

            case constants.VIOLATION_WORKLOAD_AVG_SIZE_MIN:
            case constants.VIOLATION_WORKLOAD_AVG_SIZE_MAX:
                return constants.IO_KEYS.IO_PATTERN;

            case constants.VIOLATION_RPO:
                return constants.SLO_KEYS.RPO;

            default:
                return constants.SLO_KEYS.RESPONSE_TIME_AVERAGE;
        }
    }

    /**
     * New chart selected.  Set local state and invoke parent handler.
     * @param {*} key
     */
    selectChart(key) {
        const { selectChart } = this.props;
        if (selectChart) {
            const chartKey = this.chartKey(key);
            selectChart(chartKey);
        }
    }

    render() {
        const { endTime, startTime, intl, timePeriod, timeShift, volume, volumeServiceHistoryData } = this.props;
        // add back in dialogOpenRelatedVolumes
        const { editIndex, editTimestamp, editMessage, editItem, filters, view } = this.state;
        const { volumeServiceHistory = [] } = volumeServiceHistoryData || {};
        const { formatMessage } = intl;
        const data = [];
        const errorCounter = {
            errorsDay: 0,
            errorsWeek: 0,
            errorsMonth: 0,
        };
        const { meta } = volume || {};
        const { id: volumeId = '' } = meta || {};

        this.rowIndex = 0;

        const columns = [
            {
                Header: formatMessage(volumeSeriesMsgs.tableServiceHistoryTime),
                accessor: 'timestamp',
                Cell: row => {
                    const { original } = row;
                    const { bucketId, index, recordNum, timestamp } = original;
                    /**
                     * Do not show a timestamp for the note that is going to be added.  It will have the
                     * current time the note is created.
                     */
                    const indent = view === VIEW_NOTES && bucketId && bucketId !== recordNum;

                    if (editIndex && editIndex === index) {
                        return '';
                    } else {
                        return <div className={`${indent ? 'ml40' : ''}`}>{moment(timestamp).format('lll')}</div>;
                    }
                },
                width: 175,
                sortMethod: (a, b) => {
                    // ts is a string
                    const secsA = moment(a).valueOf();
                    const secsB = moment(b).valueOf();
                    if (secsA < secsB) {
                        return -1;
                    }
                    if (secsA > secsB) {
                        return 1;
                    }

                    return 0;
                },
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableServiceHistoryType),
                accessor: 'type',
                Cell: row => {
                    const { original } = row;
                    const { type } = original;
                    return this.itemType(type);
                },
                width: 100,
            },
            {
                Header: 'rowIndex',
                accessor: 'index',
                width: 30,
                show: false,
            },
            {
                Header: '',
                accessor: 'link',
                sortable: false,
                Cell: row => {
                    const { original } = row;
                    const { objectId, objectType, name, key, type } = original;

                    if (type === ITEM_TYPE_VIOLATIONS) {
                        return (
                            <div className="chart-link">
                                <ShowChart onClick={() => this.selectChart(key)} />
                            </div>
                        );
                    } else {
                        const link = this.getLink(objectType, objectId, name, key, volumeId);

                        if (link) {
                            const { filter, icon, tabKey, url } = link;
                            return (
                                <Link
                                    className="table-name-link"
                                    to={{
                                        pathname: `/${url}`,
                                        state: {
                                            name,
                                            tabKey,
                                            filter,
                                        },
                                    }}
                                >
                                    {icon}
                                </Link>
                            );
                        }
                    }
                },
                width: 50,
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableServiceHistoryMessages),
                accessor: 'message',
                Cell: row => {
                    const { original } = row;
                    const { index = '', level, levelText, message, violationLevelChange } = original || {};

                    if (index === editIndex) {
                        return (
                            <FieldGroup
                                name="editMessage"
                                onChange={this.handleEditChange}
                                type="text"
                                value={editMessage}
                            />
                        );
                    } else {
                        const color = this.violationChangeColor(level);
                        return (
                            <div className="content-flex-row">
                                {violationLevelChange ? (
                                    <Fragment>
                                        <div className={color}>{levelText}</div>
                                        <div className="ml10">{message}</div>
                                    </Fragment>
                                ) : (
                                    <div>{message}</div>
                                )}
                            </div>
                        );
                    }
                },
            },
            {
                Header: formatMessage(volumeSeriesMsgs.tableServiceHistoryActions),
                accessor: 'actions',
                Cell: (selected = {}) => {
                    const { original, row } = selected || {};
                    const { index, id } = original || {};

                    return (
                        <div className="table-actions-cell">
                            {editItem && index === editIndex ? (
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
                                    <NoteAdd
                                        id={`volumeSeriesToolbarEdit-${id}`}
                                        onClick={() => this.handleEdit(row)}
                                    />
                                </Fragment>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'bucketId',
                accessor: 'bucketId',
                show: false,
            },
        ];

        this.countSummaryViolations(volume, volumeServiceHistory, data, errorCounter);

        if (filters[ITEM_TYPE_INFO]) {
            this.addAudit(ITEM_TYPE_INFO, volume, volumeServiceHistory, data);
        }

        if (filters[ITEM_TYPE_VIOLATIONS]) {
            this.addViolations(volume, volumeServiceHistory, data, errorCounter);
        }

        if (filters[ITEM_TYPE_SNAPSHOTS]) {
            this.addSnapshots(data);
        }

        if (filters[ITEM_TYPE_ANNOTATION]) {
            this.addAudit(ITEM_TYPE_ANNOTATION, volume, volumeServiceHistory, data);
        }

        /**
         * Need to bucket data if viewing by note.  We rely on time ordering
         * to bucket properly.
         */
        const buckets = {};
        const sortedData = data.sort((a, b) => {
            // ts is a string
            const secsA = moment(a).valueOf();
            const secsB = moment(b).valueOf();
            if (secsA < secsB) {
                return -1;
            }
            if (secsA > secsB) {
                return 1;
            }

            return 0;
        });

        // only need to go through bucketing exercise if viewing by notes
        if (view === VIEW_NOTES) {
            sortedData.forEach(item => {
                const { parentNum, recordNum } = item;
                if (!item.parentNum) {
                    buckets[recordNum] = {};
                    buckets[recordNum].notes = [];
                    item.bucketId = recordNum;
                } else {
                    /**
                     * Find the bucket with its parent record
                     */
                    const parentBucket = buckets[parentNum];
                    if (parentBucket) {
                        parentBucket.notes.push(recordNum);
                        item.bucketId = parentNum;
                    } else {
                        /**
                         * Find the bucket that has the parentNum.
                         */
                        if (buckets) {
                            // find the bucket that has the parent
                            const bucket = Object.entries(buckets).find(bucket => {
                                const value = bucket[1];
                                const { notes } = value;
                                return notes.some(n => n === parentNum);
                            });
                            if (bucket) {
                                // parent bucket found, add this record to the bucket
                                const key = bucket[0];
                                const value = bucket[1];
                                const { notes } = value;
                                notes.push(recordNum);
                                item.bucketId = Number(key);
                            } else {
                                // no bucket found, create a new one
                                buckets[recordNum] = {};
                                buckets[recordNum].notes = [];
                                item.bucketId = recordNum;
                            }
                        } else {
                            // first object in bucket
                            buckets[recordNum] = {};
                            buckets[recordNum].notes = [];
                            item.bucketId = recordNum;
                        }
                    }
                }
            });
        }

        /**
         * Add the additional item into the table data.
         */
        if (editItem) {
            data.push({
                message: editMessage,
                type: ITEM_TYPE_ANNOTATION,
                index: editIndex,
                timestamp: editTimestamp,
                bucketId: editItem.bucketId,
            });
        }

        // view influences sorting
        const defaultSorted =
            view === VIEW_TIME ? [{ id: 'timestamp' }] : view === VIEW_NOTES ? [{ id: 'bucketId' }] : [];
        if (view === VIEW_NOTES) {
            columns.forEach(column => (column.sortable = false));
        }

        return (
            <div className="volume-service-history mt10 mb10 content-flex-column">
                <div className="resource-settings-header">
                    <div className="layout-summary">
                        <div className="layout-summary-item">
                            <div className="summary-normal">{errorCounter.errorsDay}</div>
                            <div className="summary-text nuvo-summary-text-14">
                                {formatMessage(volumeSeriesMsgs.historyTodayLabel)}
                            </div>
                        </div>
                        <div className="layout-summary-item">
                            <div className="summary-normal">{errorCounter.errorsWeek}</div>
                            <div className="summary-text nuvo-summary-text-14">
                                {formatMessage(volumeSeriesMsgs.historyWeekLabel)}
                            </div>
                        </div>
                        <div className="layout-summary-item">
                            <div className="summary-normal">{errorCounter.errorsMonth}</div>
                            <div className="summary-text nuvo-summary-text-14">
                                {formatMessage(volumeSeriesMsgs.historyMonthLabel)}
                            </div>
                        </div>
                    </div>
                    <div className="content-flex-row-centered dialog-save-exit">
                        <TimePeriodSelector
                            endTime={endTime}
                            onClick={this.selectTimePeriod}
                            startTime={startTime}
                            timePeriod={timePeriod}
                            timeShift={timeShift}
                        />
                        {/* <ButtonAction
                            btnUp={btnVolumeUp}
                            btnHov={btnVolumeHov}
                            btnDisable={btnVolumeDisable}
                            onClick={this.handleClickRelated}
                            disabled={dialogOpenRelatedVolumes}
                        /> */}
                    </div>
                </div>
                {/* {this.renderRelatedVolumesDialog()} */}
                <div className="mt10 divider-horizontal" />
                <div className="mb20">
                    <TableContainer
                        columns={columns}
                        component="VOLUME_SERVICE_HISTORY_TABLE"
                        data={sortedData}
                        dataTestId="volume-series-table"
                        defaultSorted={defaultSorted}
                        toolbar={this.renderToolbar()}
                    />
                </div>
            </div>
        );
    }
}

VolumeServiceHistory.propTypes = {
    clustersData: PropTypes.object,
    consistencyGroupsData: PropTypes.object,
    endTime: PropTypes.object,
    intl: intlShape.isRequired,
    postAuditLog: PropTypes.func,
    selectChart: PropTypes.func,
    selectTimePeriod: PropTypes.func,
    snapshotsData: PropTypes.object,
    startTime: PropTypes.object,
    timePeriod: PropTypes.string,
    timeShift: PropTypes.func,
    volume: PropTypes.object.isRequired,
    volumeComplianceTotalsData: PropTypes.object,
    volumeSeriesData: PropTypes.object,
    volumeServiceHistoryData: PropTypes.object.isRequired,
};

export default injectIntl(VolumeServiceHistory);
