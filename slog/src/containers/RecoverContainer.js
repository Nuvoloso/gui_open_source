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

import * as types from '../actions/types';

import Loader from '../components/Loader';
import RecoverHistoryContainer from './RecoverHistoryContainer';
import RecoverProcessContainer from './RecoverProcessContainer';
import RecoveryQueueContainer from './RecoveryQueueContainer';

import { getCGs } from '../actions/consistencyGroupActions';
import {
    getVolumeSeries,
    getVolumeSeriesRequests,
    getVolumeSeriesRequestsCompleted,
} from '../actions/volumeSeriesActions';
import { recoverVsrsCount } from '../components/utils_vsrs';

import { recoverMsgs } from '../messages/Recover';

class RecoverContainer extends Component {
    constructor(props) {
        super(props);

        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(getVolumeSeries());
        dispatch(getCGs());
        dispatch(getVolumeSeriesRequests(false));
        dispatch(getVolumeSeriesRequestsCompleted());
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_RECOVER_TAB, tab: 0 });
    }

    handleSelect(key) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_RECOVER_TAB, tab: key });
    }

    recoverQueueCount() {
        const { volumeSeriesRequestsData = {} } = this.props;
        const { volumeSeriesRequests = [] } = volumeSeriesRequestsData;

        if (volumeSeriesRequestsData.loading) {
            return <Loader />;
        }

        const recovers = recoverVsrsCount(volumeSeriesRequests, false);
        return recovers.length;
    }

    recoverHistoryCount(isTerminated) {
        const { volumeSeriesRequestsCompletedData = {} } = this.props;
        const { volumeSeriesRequestsCompleted = [] } = volumeSeriesRequestsCompletedData;

        if (volumeSeriesRequestsCompletedData.loading) {
            return <Loader />;
        }

        const recovers = recoverVsrsCount(volumeSeriesRequestsCompleted, isTerminated);
        return recovers.length;
    }

    recoverHistoryTitle() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="content-flex-row-centered">
                <div>{formatMessage(recoverMsgs.tabRecoveryHistory)} </div>
                <div className="tab-count color-history ml10">{this.recoverHistoryCount(true)}</div>
            </div>
        );
    }

    recoverQueueTitle() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="content-flex-row-centered">
                <div>{formatMessage(recoverMsgs.tabRecoveryQueue)} </div>
                <div className="tab-count color-queue ml10">{this.recoverQueueCount()}</div>
            </div>
        );
    }

    render() {
        const { intl, uiSettings } = this.props;
        const { formatMessage } = intl;
        const { recoverTab } = uiSettings;

        return (
            <Tabs
                activeKey={recoverTab}
                className="tabs-container"
                id="recover-tabs"
                mountOnEnter
                onSelect={this.handleSelect}
            >
                <Tab eventKey={0} title={formatMessage(recoverMsgs.tabRecover)}>
                    <div>
                        <RecoverProcessContainer />
                    </div>
                </Tab>
                <Tab eventKey={1} title={this.recoverQueueTitle()}>
                    <div>
                        <RecoveryQueueContainer />
                    </div>
                </Tab>
                <Tab eventKey={2} title={this.recoverHistoryTitle()}>
                    <div>
                        <RecoverHistoryContainer />
                    </div>
                </Tab>
            </Tabs>
        );
    }
}

RecoverContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    uiSettings: PropTypes.object,
    volumeSeriesRequestsCompletedData: PropTypes.object.isRequired,
    volumeSeriesRequestsData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { uiSettings, volumeSeriesRequestsCompletedData, volumeSeriesRequestsData } = state;
    return {
        uiSettings,
        volumeSeriesRequestsCompletedData,
        volumeSeriesRequestsData,
    };
}

export default connect(mapStateToProps)(injectIntl(RecoverContainer));
