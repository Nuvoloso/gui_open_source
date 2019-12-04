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
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';

import Alert from './Alert';
import TableActionIcon from './TableActionIcon';

import { getVolumeSeriesStateMsg } from './utils';
import { includeRecoverInfoParent } from './utils_recover';
import { messages } from '../messages/Messages';
import { vsrMsgs } from '../messages/VolumeSeriesRequest';

import * as constants from '../constants';

import { ReactComponent as Volumes } from '../assets/menu/ico-volume.svg';
import { DeleteForever, Inbox } from '@material-ui/icons';

import './tasks.css';

class Tasks extends Component {
    getVsrTasks() {
        const { volumeSeriesRequestsData } = this.props;
        const { volumeSeriesRequests } = volumeSeriesRequestsData || {};

        return volumeSeriesRequests.filter(vsr => {
            const { volumeSeriesRequestState } = vsr;

            return !Object.keys(constants.VSR_COMPLETED_STATES)
                .map(key => constants.VSR_COMPLETED_STATES[key])
                .includes(volumeSeriesRequestState);
        });
    }

    taskDropdownItems(vsrTasks) {
        const { accountsData, intl, openModal, volumeSeriesData } = this.props;
        const { accounts = [] } = accountsData || {};
        const { formatMessage } = intl;
        const { volumeSeries = [] } = volumeSeriesData || {};

        const items = [];
        vsrTasks.forEach((vsr, idx) => {
            const {
                cancelRequested,
                creator,
                meta,
                requestedOperations,
                volumeSeriesCreateSpec,
                volumeSeriesId,
                volumeSeriesRequestState,
            } = vsr;
            const { id, timeCreated } = meta || {}; // parent task id

            /**
             * There can be just the coordinating task without any subtasks.
             * There can be a coordinating task with one (for now) subtask.
             */
            let searchId = '';
            if (volumeSeriesId) {
                /**
                 * Subtask
                 */
                searchId = volumeSeriesId;
            } else {
                /**
                 * Parent task - may or may not be subtasks.
                 */
                const subtask = vsrTasks.find(vsr => vsr.syncCoordinatorId === id);
                if (subtask) {
                    searchId = subtask.volumeSeriesId;
                }
            }
            const vs = volumeSeries.find(vs => vs.meta.id === searchId);
            const { name: specName } = volumeSeriesCreateSpec || {};
            const { name = '' } = vs || {};
            const displayName = name || specName || formatMessage(vsrMsgs.request);
            const vsStateMsg = getVolumeSeriesStateMsg(volumeSeriesRequestState);

            if (requestedOperations.includes(constants.VSR_OPERATIONS.CREATE_FROM_SNAPSHOT)) {
                if (!includeRecoverInfoParent(vsrTasks, vsr)) {
                    return;
                }
            }

            // get account name
            const { accountId } = creator || {};
            const { name: accountName = '' } = accounts.find(account => account.meta.id === accountId) || {};

            // diff for date/time display
            const mNow = moment();
            const mCreated = moment(timeCreated);
            const mDiff = mNow.diff(mCreated);
            const mDays = moment.duration(mDiff).as('days');

            items.push(
                <div className="task-item" key={idx}>
                    <div className="task-icon-column">
                        <div className="task-icon-bg">
                            <Volumes className="task-icon-volume" />
                        </div>
                    </div>
                    <div className="task-main">
                        <div className="task-main-title">{displayName}</div>
                        <div className={`task-main-body ${cancelRequested ? 'task-canceled' : ''}`}>{`${
                            cancelRequested ? `(${formatMessage(vsrMsgs.canceledDesc)}): ` : ''
                        }${vsStateMsg ? formatMessage(vsStateMsg) : ''}`}</div>
                        <div className="task-main-footer">
                            <div className="task-main-footer-account">
                                <Link
                                    className="value-link"
                                    to={{ pathname: `/${constants.URI_ACCOUNTS}/${accountId || ''}` }}
                                >
                                    {accountName}
                                </Link>
                            </div>
                            <div className="task-main-footer-datetime">
                                {mDays > 1 ? mCreated.format('l') : mCreated.fromNow()}
                            </div>
                        </div>
                    </div>
                    <div className="task-actions">
                        <TableActionIcon
                            className={`task-actions-item ${cancelRequested ? 'task-actions-item-disabled' : ''}`}
                            materialIcon={DeleteForever}
                            onClick={() => {
                                openModal(
                                    Alert,
                                    {
                                        dark: true,
                                        submit: () => {
                                            const { cancelVolumeSeriesRequest } = this.props;

                                            if (cancelVolumeSeriesRequest) {
                                                cancelVolumeSeriesRequest(id);
                                            }
                                        },
                                        title: formatMessage(vsrMsgs.confirmCancelTitle),
                                    },
                                    {
                                        content: `${
                                            name || specName
                                                ? formatMessage(vsrMsgs.cancelAlertName, { name: name || specName })
                                                : formatMessage(vsrMsgs.cancelAlert)
                                        } ${formatMessage(messages.alertMsg)}`,
                                    }
                                );
                            }}
                            tooltip={formatMessage(vsrMsgs.cancelBtn)}
                        />
                    </div>
                </div>
            );
        });

        return items;
    }

    countTasks(vsrTasks) {
        const countedTasks =
            vsrTasks.filter(vsr => {
                const { requestedOperations } = vsr;

                if (requestedOperations.includes(constants.VSR_OPERATIONS.CREATE_FROM_SNAPSHOT)) {
                    if (!includeRecoverInfoParent(vsrTasks, vsr)) {
                        return false;
                    }
                }

                return true;
            }) || [];

        return countedTasks.length;
    }

    renderEmpty() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="empty-placeholder">
                <div className="empty-placeholder-icon">
                    <Inbox />
                </div>
                <div className="empty-placeholder-text">{formatMessage(vsrMsgs.noVolumeSeriesRequests)}</div>
            </div>
        );
    }

    render() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        const vsrTasks = this.getVsrTasks();
        const tasksCount = this.countTasks(vsrTasks);

        return (
            <Dropdown className="nv-dropdown header-tasks-dropdown" id="tasks-dropdown" pullRight>
                <Dropdown.Toggle bsStyle="link" className="header-tasks-dropdown-btn" id="tasks-dropdown-btn" noCaret>
                    <div>
                        <i
                            id="headerStatusIcon"
                            className={tasksCount > 0 ? 'fa fa-refresh fa-spin mr5' : ''}
                            aria-hidden="true"
                        />
                        {tasksCount}
                    </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <MenuItem header>{formatMessage(vsrMsgs.volumeSeriesRequests)}</MenuItem>
                    <div className="task-items">
                        {tasksCount > 0 ? this.taskDropdownItems(vsrTasks) : this.renderEmpty()}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}

Tasks.propTypes = {
    accountsData: PropTypes.object.isRequired,
    cancelVolumeSeriesRequest: PropTypes.func,
    intl: intlShape.isRequired,
    openModal: PropTypes.func.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
    volumeSeriesRequestsData: PropTypes.object.isRequired,
};

export default injectIntl(Tasks);
