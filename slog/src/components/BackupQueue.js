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

import { getVolumeSeriesStateMsg, getVsrStateColorClassName } from './utils';
import { durationDisplay } from './utils_time';
import { backupVsrs } from './utils_vsrs';
import * as constants from '../constants';

import { backupMsgs } from '../messages/Backup';

import '../components/process.css';
import './table.css';

class BackupQueue extends Component {
    getConsistencyGroup(volumeSeriesId) {
        const { consistencyGroupsData = [] } = this.props;
        const { consistencyGroups = [] } = consistencyGroupsData;

        const consistencyGroup = consistencyGroups.find(cg => {
            return cg.meta.id === volumeSeriesId;
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
        const { consistencyGroupsData = {}, intl, volumeSeriesData = {}, volumeSeriesRequestsData = {} } = this.props;
        const { consistencyGroups = [] } = consistencyGroupsData;
        const { volumeSeriesRequests = [] } = volumeSeriesRequestsData;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const { formatMessage } = intl;

        const columns = [
            {
                Header: formatMessage(backupMsgs.tableName),
                accessor: 'name',
                width: 200,
                Cell: row => {
                    const { original, value } = row || {};
                    const { volumeSeriesId } = original || {};

                    if (volumeSeriesId) {
                        return (
                            <Link
                                className="table-name-link"
                                to={{ pathname: `/${constants.URI_VOLUME_SERIES}/${volumeSeriesId}` }}
                            >
                                {value}
                            </Link>
                        );
                    } else {
                        return value;
                    }
                },
            },
            {
                Header: formatMessage(backupMsgs.tableStartTime),
                accessor: 'startTime',
                width: 160,
                Cell: row => moment.unix(row.value).format('hh:mm:ss A'),
            },
            {
                Header: formatMessage(backupMsgs.backupPercentComplete),
                accessor: 'percentComplete',
                width: 110,
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

        const backups = backupVsrs(volumeSeriesRequests, false, consistencyGroups);
        const data = backups.map(vsr => {
            const { meta, syncPeers = {}, volumeSeriesRequestState } = vsr || {};
            const { id, timeCreated } = meta || {};
            const volumeSeriesId = Object.keys(syncPeers)[0];
            const endTime = moment().format();

            /**
             * Note: this is only looking for a single associated volume.  This will
             * have to be revisited when multi volume CGs exist.
             */
            const peerVsrId = (syncPeers[volumeSeriesId] && syncPeers[volumeSeriesId].id) || {};
            const peerVsr = volumeSeriesRequests.find(vsr => vsr.meta.id === peerVsrId);
            const { progress } = peerVsr || {};
            const { percentComplete = 0 } = progress || {};

            const volume = volumeSeries.find(v => v.meta.id === volumeSeriesId);
            const { name = '' } = volume || {};

            return {
                actions: '',
                duration: durationDisplay(timeCreated, endTime),
                estimatedDuration: 'tbd',
                id,
                name,
                percentComplete,
                startTime: moment(timeCreated).unix(),
                status: this.statusDisplay(volumeSeriesRequestState),
                volumeSeriesId,
            };
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
BackupQueue.propTypes = {
    consistencyGroupsData: PropTypes.object,
    intl: intlShape.isRequired,
    tableOnly: PropTypes.bool,
    volumeSeriesData: PropTypes.object,
    volumeSeriesRequestsData: PropTypes.object,
};

export default injectIntl(BackupQueue);
