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
import { connect } from 'react-redux';

import { cancelVolumeSeriesRequest, getVolumeSeries, getVolumeSeriesRequests } from '../actions/volumeSeriesActions';
import { openModal } from '../actions/modalActions';
import Tasks from '../components/Tasks';

class TasksContainer extends Component {
    constructor(props) {
        super(props);

        this.cancelVolumeSeriesRequest = this.cancelVolumeSeriesRequest.bind(this);
        this.openModal = this.openModal.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getVolumeSeries());
        dispatch(getVolumeSeriesRequests(false));
    }

    cancelVolumeSeriesRequest(id) {
        const { dispatch } = this.props;
        dispatch(cancelVolumeSeriesRequest(id));
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    render() {
        const { accountsData, volumeSeriesData, volumeSeriesRequestsData } = this.props;

        return (
            <Tasks
                accountsData={accountsData}
                cancelVolumeSeriesRequest={this.cancelVolumeSeriesRequest}
                openModal={this.openModal}
                volumeSeriesData={volumeSeriesData}
                volumeSeriesRequestsData={volumeSeriesRequestsData}
            />
        );
    }
}

TasksContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
    volumeSeriesRequestsData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { accountsData, volumeSeriesData, volumeSeriesRequestsData } = state;
    return {
        accountsData,
        volumeSeriesData,
        volumeSeriesRequestsData,
    };
}

export default connect(mapStateToProps)(TasksContainer);
