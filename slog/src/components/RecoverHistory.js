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
import { intlShape, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import PropTypes from 'prop-types';

import moment from 'moment';
import TableContainer from '../containers/TableContainer';

import { formatDuration } from './utils_time';
import { getVolumeSeriesStateMsg, getVsrStateColorClassName } from './utils';
import { recoverVsrs } from './utils_vsrs';
import { includeRecoverInfoParent, recoverInfo, recoverInfoParent, recoverInfoSubordinate } from './utils_recover';

import { recoverMsgs } from '../messages/Recover';

import * as constants from '../constants';

import '../components/process.css';
import './table.css';

class RecoverHistory extends Component {
    getConsistencyGroup(volumeSeriesId) {
        const { consistencyGroupsData = [], volumeSeriesData = {} } = this.props;
        const { volumeSeries = [] } = volumeSeriesData;
        const { consistencyGroups = [] } = consistencyGroupsData;

        const volume = volumeSeries.find(volume => {
            return volume.meta.id === volumeSeriesId;
        });

        const consistencyGroup =
            volume &&
            consistencyGroups.find(cg => {
                return cg.meta.id === volume.consistencyGroupId;
            });

        return (consistencyGroup && consistencyGroup.name) || '';
    }

    statusDisplay(volumeSeriesRequestState) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const displayClass = getVsrStateColorClassName(volumeSeriesRequestState);

        return <div className={displayClass}>{formatMessage(getVolumeSeriesStateMsg(volumeSeriesRequestState))}</div>;
    }

    render() {
        const { intl, volumeSeriesData, volumeSeriesRequestsCompleted = [] } = this.props;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const { formatMessage } = intl;

        const columns = [
            {
                Header: formatMessage(recoverMsgs.recoverTableName),
                accessor: 'name',
                width: 200,
                Cell: row => {
                    const { original } = row || {};
                    const { volumeSeriesId = '', name = '' } = original || {};
                    return (
                        <Link
                            className="table-name-link"
                            to={{ pathname: `/${constants.URI_VOLUME_SERIES}/${volumeSeriesId}`, state: { name } }}
                        >
                            {row.value}
                        </Link>
                    );
                },
            },
            {
                Header: formatMessage(recoverMsgs.recoverTableRecoveredName),
                accessor: 'relocateName',
                Cell: row => {
                    const { original } = row || {};
                    const { relocateVolId = '', relocateName = '', relocatedVolumeExists } = original || {};
                    if (relocatedVolumeExists) {
                        return (
                            <Link
                                className="table-name-link"
                                to={{
                                    pathname: `/${constants.URI_VOLUME_SERIES}/${relocateVolId}`,
                                    state: { name: relocateName },
                                }}
                            >
                                {row.value}
                            </Link>
                        );
                    } else {
                        return <div className="text-deleted">{relocateName}</div>;
                    }
                },
                width: 200,
            },
            {
                Header: formatMessage(recoverMsgs.recoverTableStartTime),
                accessor: 'startTime',
                width: 160,
                Cell: row => moment.unix(row.value).format('MM/DD/YYYY hh:mm:ss A'),
            },
            {
                Header: formatMessage(recoverMsgs.recoverTableEndTime),
                accessor: 'endTime',
                width: 160,
                Cell: row => moment.unix(row.value).format('MM/DD/YYYY hh:mm:ss A'),
            },
            {
                Header: formatMessage(recoverMsgs.recoverTableDuration),
                accessor: 'duration',
                width: 100,
                Cell: row => formatDuration(row.value, null, true),
            },
            {
                Header: formatMessage(recoverMsgs.recoverTableResult),
                accessor: 'result',
                width: 200,
            },
            {
                Header: formatMessage(recoverMsgs.recoverTableActions),
                accessor: 'actions',
                sortable: false,
            },
            {
                accessor: 'id',
                show: false,
            },
        ];

        const data = [];
        const recovers = recoverVsrs(volumeSeriesRequestsCompleted, true);
        if (recovers.length > 0) {
            recovers.forEach(vsr => {
                const { meta, requestedOperations, volumeSeriesId, volumeSeriesRequestState } = vsr;
                const { id, timeCreated: startTime, timeModified: endTime } = meta;

                /**
                 * Note: this is only looking for a single associated volume.  This will
                 * have to be revisited when multi volume CGs exist.
                 * CREATE_FROM_SNAPSHOT
                 * volumeSeriesCreateSpec.volumeSeriesId === id for original volume
                 * systemTags[1] === "vsr.newVolumeSeries:newvolumeseriesUUID"
                 *
                 * VOL_SNAPSHOT_RESTORE (from CREATE_FROM_SNAPSHOT)
                 * volumeSeriesId === newvolumeseriesUUID
                 * volumeSeriesCreateSpec.name === name of new volume
                 * syncCoordinatorId:"2ab16dd9-42d4-4cdb-99e5-4b574011029b"
                 *   ==> look up parent to find the original volume name
                 *
                 * VOL_SNAPSHOT_RESTORE (from k8s recover)
                 * volumeSeriesId === existing volume recover
                 * volume name does not change, need to look up from store using volumeSeriesId
                 */

                if (requestedOperations.includes(constants.VSR_OPERATIONS.CREATE_FROM_SNAPSHOT)) {
                    if (includeRecoverInfoParent(recovers, vsr)) {
                        const recoverInfo = recoverInfoParent(volumeSeries, recovers, vsr);
                        data.push({
                            duration: moment(endTime).diff(moment(startTime)),
                            endTime: moment(endTime).unix(),
                            id,
                            name: recoverInfo.originalVolumeName,
                            relocateName: recoverInfo.relocateVolumeName,
                            relocateVolId: recoverInfo.relocateVolId,
                            result: this.statusDisplay(volumeSeriesRequestState),
                            startTime: moment(startTime).unix(),
                            volumeSeriesId,
                        });
                    }
                    return;
                }

                const info = vsr.syncCoordinatorId
                    ? recoverInfoSubordinate(volumeSeries, recovers, vsr)
                    : recoverInfo(volumeSeries, vsr);

                const relocatedVolumeExists = volumeSeries.find(vol => {
                    const { meta } = vol || {};
                    const { id = '' } = meta || {};
                    return id === info.relocateVolId;
                });

                data.push({
                    duration: moment(endTime).diff(moment(startTime)),
                    endTime: moment(endTime).unix(),
                    id,
                    name: info.originalVolumeName,
                    relocatedVolumeExists,
                    relocateName: info.relocateVolumeName,
                    relocateVolId: info.relocateVolId,
                    result: this.statusDisplay(volumeSeriesRequestState),
                    startTime: moment(startTime).unix(),
                    volumeSeriesId,
                });
            });
        }

        return (
            <div className="content-flex-column history">
                <div className="process-title">
                    {formatMessage(recoverMsgs.tabRecoveryHistory)} ({data.length})
                </div>
                <TableContainer
                    cardsMode={false}
                    columns={columns}
                    component="TASK_HISTORY_TABLE"
                    data={data}
                    noDataText={formatMessage(recoverMsgs.recoverNoTasks)}
                    defaultSorted={[{ id: 'startTime', desc: true }]}
                />
            </div>
        );
    }
}

// Property type validation
RecoverHistory.propTypes = {
    consistencyGroupsData: PropTypes.object,
    intl: intlShape.isRequired,
    tableOnly: PropTypes.bool,
    volumeSeriesData: PropTypes.object,
    volumeSeriesRequestsCompleted: PropTypes.array,
};

export default injectIntl(RecoverHistory);
