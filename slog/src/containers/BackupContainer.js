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
import { Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';

import BackupHistoryContainer from './BackupHistoryContainer';
import BackupProcessContainer from './BackupProcessContainer';
import BackupQueueContainer from './BackupQueueContainer';
import Loader from '../components/Loader';

import { backupVsrs } from '../components/utils_vsrs';
import { getCGs } from '../actions/consistencyGroupActions';
import { getSnapshots } from '../actions/snapshotActions';
import { getVolumeSeries, getVolumeSeriesRequestsCompleted } from '../actions/volumeSeriesActions';

import * as constants from '../constants';
import * as types from '../actions/types';

import { backupMsgs } from '../messages/Backup';

class BackupContainer extends Component {
    constructor(props) {
        super(props);

        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(getSnapshots());
        dispatch(getVolumeSeries());
        dispatch(getVolumeSeriesRequestsCompleted());
        dispatch(getCGs());
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_BACKUP_TAB, tab: 0 });
    }

    handleSelect(key) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_BACKUP_TAB, tab: key });
    }

    backupHistoryCount(isTerminated) {
        const {
            consistencyGroupsData = {},
            snapshotsData = {},
            volumeSeriesRequestsCompletedData = {},
            volumeSeriesRequestsData = {},
        } = this.props;
        const { consistencyGroups = [] } = consistencyGroupsData;
        const { snapshots = [] } = snapshotsData;
        const { volumeSeriesRequests = [] } = volumeSeriesRequestsData || {};
        const { volumeSeriesRequestsCompleted = [] } = volumeSeriesRequestsCompletedData || {};

        if (volumeSeriesRequestsCompletedData.loading || consistencyGroupsData.loading || snapshotsData.loading) {
            return <Loader />;
        }

        const backups = backupVsrs(
            isTerminated ? volumeSeriesRequestsCompleted : volumeSeriesRequests,
            isTerminated,
            consistencyGroups
        );

        if (!isTerminated) {
            return backups.length;
        }

        const unsuccessfulBackups = backups.filter(
            backup => backup.volumeSeriesRequestState !== constants.VSR_COMPLETED_STATES.SUCCEEDED
        );

        return snapshots.length + unsuccessfulBackups.length;
    }

    backupHistoryTitle() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="content-flex-row-centered">
                <div>{formatMessage(backupMsgs.tabBackupHistory)} </div>
                <div className="tab-count color-history ml10">{this.backupHistoryCount(true)}</div>
            </div>
        );
    }

    backupQueueTitle() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="content-flex-row-centered">
                <div>{formatMessage(backupMsgs.tabBackupQueue)} </div>
                <div className="tab-count color-queue ml10">{this.backupHistoryCount(false)}</div>
            </div>
        );
    }

    render() {
        const { intl, uiSettings } = this.props;
        const { formatMessage } = intl;
        const { backupTab } = uiSettings;

        return (
            <Tabs activeKey={backupTab} className="tabs-container" id="backup-tabs" onSelect={this.handleSelect}>
                <Tab eventKey={0} title={formatMessage(backupMsgs.tabBackup)}>
                    <div>
                        <BackupProcessContainer />
                    </div>
                </Tab>
                <Tab eventKey={1} title={this.backupQueueTitle()}>
                    <div>
                        <BackupQueueContainer />
                    </div>
                </Tab>
                <Tab eventKey={2} title={this.backupHistoryTitle()}>
                    <div>
                        <BackupHistoryContainer />
                    </div>
                </Tab>
            </Tabs>
        );
    }
}

BackupContainer.propTypes = {
    consistencyGroupsData: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    snapshotsData: PropTypes.object.isRequired,
    uiSettings: PropTypes.object,
    volumeSeriesRequestsCompletedData: PropTypes.object.isRequired,
    volumeSeriesRequestsData: PropTypes.object,
};

function mapStateToProps(state) {
    const {
        consistencyGroupsData,
        snapshotsData,
        uiSettings,
        volumeSeriesRequestsCompletedData,
        volumeSeriesRequestsData,
    } = state;
    return {
        consistencyGroupsData,
        snapshotsData,
        uiSettings,
        volumeSeriesRequestsCompletedData,
        volumeSeriesRequestsData,
    };
}

export default connect(mapStateToProps)(injectIntl(BackupContainer));
