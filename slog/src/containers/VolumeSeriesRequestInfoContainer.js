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
import { intlShape, injectIntl } from 'react-intl';

import { closeModal, openModal } from '../actions/modalActions';
import { cancelVolumeSeriesRequest } from '../actions/volumeSeriesActions';
import { vsrMsgs } from '../messages/VolumeSeriesRequest';
import Alert from '../components/Alert';
import VolumeSeriesRequestInfo from '../components/VolumeSeriesRequestInfo';

class VolumeSeriesRequestInfoContainer extends Component {
    constructor(props) {
        super(props);

        this.cancelVolumeSeriesRequest = this.cancelVolumeSeriesRequest.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleVsrCancel = this.handleVsrCancel.bind(this);
    }

    cancelVolumeSeriesRequest(id) {
        const { dispatch } = this.props;
        dispatch(cancelVolumeSeriesRequest(id));
    }

    handleVsrCancel(id) {
        const { dispatch, intl } = this.props;
        const { formatMessage } = intl;

        dispatch(
            openModal(Alert, {
                dark: true,
                small: true,
                submit: () => this.cancelVolumeSeriesRequest(id),
                title: formatMessage(vsrMsgs.confirmCancelTitle),
            })
        );
    }

    closeModal() {
        const { dispatch } = this.props;
        dispatch(closeModal());
    }

    render() {
        const { values, volumeSeriesRequestsData } = this.props;
        const { id, vs } = values;
        const { volumeSeriesRequests = [] } = volumeSeriesRequestsData;
        const vsr = volumeSeriesRequests.find(vsr => id === vsr.meta.id) || {};

        return (
            <VolumeSeriesRequestInfo
                closeModal={this.closeModal}
                handleVsrCancel={this.handleVsrCancel}
                vs={vs}
                vsr={vsr}
            />
        );
    }
}

VolumeSeriesRequestInfoContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.shape({
        id: PropTypes.string.isRequired,
        vs: PropTypes.object.isRequired,
    }).isRequired,
    volumeSeriesRequestsData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { volumeSeriesRequestsData } = state;
    return {
        volumeSeriesRequestsData,
    };
}

export default connect(mapStateToProps)(injectIntl(VolumeSeriesRequestInfoContainer));
