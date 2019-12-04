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
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import moment from 'moment';
import TableContainer from '../containers/TableContainer';

import { formatDuration } from './utils_time';
import { backupVsrs } from './utils_vsrs';
import { getVolumeSeriesStateMsg, getVsrStateColorClassName } from './utils';

import { backupMsgs } from '../messages/Backup';

import '../components/process.css';
import '../styles.css';
import './table.css';
import * as constants from '../constants';

class BackupHistory extends Component {
    getConsistencyGroupName(consistencyGroupId) {
        const { consistencyGroupsData = [] } = this.props;
        const { consistencyGroups = [] } = consistencyGroupsData;

        const consistencyGroup = consistencyGroups.find(cg => {
            return cg.meta.id === consistencyGroupId;
        });

        return (consistencyGroup && consistencyGroup.name) || '';
    }

    getConsistencyGroupVolumeId(consistencyGroupId) {
        const { volumeSeriesData } = this.props;
        const { volumeSeries = [] } = volumeSeriesData || {};

        const volume = volumeSeries.find(vol => {
            return vol.consistencyGroupId === consistencyGroupId;
        });

        const { meta } = volume || {};
        const { id = '' } = meta || {};

        return id;
    }

    statusDisplay(volumeSeriesRequestState) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const displayClass = getVsrStateColorClassName(volumeSeriesRequestState);

        return <div className={displayClass}>{formatMessage(getVolumeSeriesStateMsg(volumeSeriesRequestState))}</div>;
    }

    render() {
        const {
            consistencyGroupsData,
            intl,
            snapshotsData,
            volumeSeriesData,
            volumeSeriesRequestsCompleted = [],
        } = this.props;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const { consistencyGroups = [] } = consistencyGroupsData || {};
        const { snapshots = [] } = snapshotsData || {};
        const { formatMessage } = intl;

        const columns = [
            {
                Header: formatMessage(backupMsgs.tableName),
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
                Header: formatMessage(backupMsgs.tableStartTime),
                accessor: 'startTime',
                width: 160,
                Cell: row => moment.unix(row.value).format('MM/DD/YYYY hh:mm:ss A'),
            },
            {
                Header: formatMessage(backupMsgs.tableEndTime),
                accessor: 'endTime',
                width: 160,
                Cell: row => moment.unix(row.value).format('MM/DD/YYYY hh:mm:ss A'),
            },
            {
                Header: formatMessage(backupMsgs.tableDuration),
                accessor: 'duration',
                width: 100,
                Cell: row => formatDuration(row.value, null, true),
            },
            {
                Header: formatMessage(backupMsgs.tableStatus),
                accessor: 'status',
                width: 200,
            },
            {
                Header: formatMessage(backupMsgs.tableActions),
                accessor: 'actions',
                sortable: false,
            },
            {
                Header: 'id',
                accessor: 'id',
                show: false,
            },
        ];

        let data = [];
        const backups = backupVsrs(volumeSeriesRequestsCompleted, true, consistencyGroups);
        const unsuccessfulBackups = backups.filter(
            backup => backup.volumeSeriesRequestState !== constants.VSR_COMPLETED_STATES.SUCCEEDED
        );

        if (unsuccessfulBackups.length > 0) {
            unsuccessfulBackups.forEach(vsr => {
                const { consistencyGroupId, meta, volumeSeriesRequestState } = vsr || {};
                const { id, timeCreated: startTime, timeModified: endTime } = meta || {};
                const volumeSeriesId = this.getConsistencyGroupVolumeId(consistencyGroupId);
                const volume = volumeSeries.find(v => v.meta.id === volumeSeriesId);
                const { name = '' } = volume || {};

                data.push({
                    actions: '',
                    duration: moment(endTime).diff(moment(startTime)),
                    endTime: moment(endTime).unix(),
                    id,
                    name,
                    startTime: moment(startTime).unix(),
                    status: this.statusDisplay(volumeSeriesRequestState),
                    volumeSeriesId,
                });
            });
        }

        snapshots.forEach(snapshot => {
            const { meta, snapTime: startTime, volumeSeriesId } = snapshot || {};
            const { id, timeCreated: endTime } = meta || {};
            const volume = volumeSeries.find(v => v.meta.id === volumeSeriesId);
            const { name = '' } = volume || {};

            data.push({
                actions: '',
                duration: moment(endTime).diff(moment(startTime)),
                endTime: moment(endTime).unix(),
                id,
                name,
                startTime: moment(startTime).unix(),
                status: this.statusDisplay(constants.VSR_COMPLETED_STATES.SUCCEEDED),
                volumeSeriesId,
            });
        });

        return (
            <div className="content-flex-column history">
                <div className="process-title">
                    {formatMessage(backupMsgs.tabBackupHistory)} ({data.length})
                </div>
                <TableContainer
                    cardsMode={false}
                    columns={columns}
                    component="TASK_HISTORY_TABLE"
                    data={data}
                    noDataText={formatMessage(backupMsgs.backupNoTasks)}
                    defaultSorted={[{ id: 'startTime', desc: true }]}
                />
            </div>
        );
    }
}

// Property type validation
BackupHistory.propTypes = {
    consistencyGroupsData: PropTypes.object,
    intl: intlShape.isRequired,
    selectedRows: PropTypes.array,
    snapshotsData: PropTypes.object,
    tableOnly: PropTypes.bool,
    volumeSeriesData: PropTypes.object,
    volumeSeriesRequestsCompleted: PropTypes.array,
};

export default injectIntl(BackupHistory);
