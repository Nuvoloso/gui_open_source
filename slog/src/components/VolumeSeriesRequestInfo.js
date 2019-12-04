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
import { injectIntl, intlShape } from 'react-intl';
import { Button, Col, Row } from 'react-bootstrap';

import { VSR_COMPLETED_STATES } from '../constants';
import { getVolumeSeriesStateMsg, formatBytes } from '../components/utils';
import { messages } from '../messages/Messages';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';
import { vsrMsgs } from '../messages/VolumeSeriesRequest';

import './tasks.css';

class VolumeSeriesRequestInfo extends Component {
    getCancelBtnMsg() {
        const { intl, vsr } = this.props;
        const { formatMessage } = intl;
        const { cancelRequested } = vsr || {};

        if (this.isVsrCompleted()) {
            return formatMessage(vsrMsgs.canceledBtn);
        }

        if (cancelRequested) {
            return formatMessage(vsrMsgs.cancelingBtn);
        }

        return formatMessage(vsrMsgs.cancelBtn);
    }

    isVsrCompleted() {
        const { vsr } = this.props;
        const { volumeSeriesRequestState } = vsr || {};

        return Object.keys(VSR_COMPLETED_STATES)
            .map(key => VSR_COMPLETED_STATES[key])
            .includes(volumeSeriesRequestState);
    }

    render() {
        const { closeModal, handleVsrCancel, intl, vs, vsr } = this.props;
        const { formatMessage } = intl;
        const { accountName, applicationGroupTag, consistencyGroupTag, description, servicePlanName, sizeBytes } =
            vs || {};
        const { cancelRequested, meta, volumeSeriesRequestState } = vsr || {};
        const { id } = meta || {};

        const labelWidth = 6;
        const vsStateMsg = getVolumeSeriesStateMsg(volumeSeriesRequestState);

        const data = [];
        if (servicePlanName) {
            data.push({ label: formatMessage(volumeSeriesMsgs.tableServicePlan), value: servicePlanName });
        }
        if (sizeBytes) {
            data.push({ label: formatMessage(volumeSeriesMsgs.tableSize), value: formatBytes(sizeBytes) });
        }
        if (applicationGroupTag) {
            data.push({ label: formatMessage(volumeSeriesMsgs.tableApplicationGroup), value: applicationGroupTag });
        }
        if (consistencyGroupTag) {
            data.push({ label: formatMessage(volumeSeriesMsgs.tableConsistencyGroup), value: consistencyGroupTag });
        }
        if (accountName) {
            data.push({ label: formatMessage(volumeSeriesMsgs.tableAccount), value: accountName });
        }
        if (description) {
            data.push({ label: formatMessage(volumeSeriesMsgs.tableDescription), value: description });
        }

        return (
            <Fragment>
                <div className="modalContent">
                    <div className="card-body">
                        {data.map((row, idx) => {
                            const { label, value } = row;
                            return (
                                <Row className="mb5" key={idx}>
                                    <Col className="card-label" xs={labelWidth}>
                                        {label}:
                                    </Col>
                                    <Col className="card-value" xs={12 - labelWidth}>
                                        {value}
                                    </Col>
                                </Row>
                            );
                        })}
                        <div className="task-info-vsr mt20">
                            {vsStateMsg ? <div className="mb15">{formatMessage(vsStateMsg)}</div> : null}
                            <Button
                                bsStyle="danger"
                                disabled={cancelRequested || this.isVsrCompleted()}
                                onClick={() => {
                                    handleVsrCancel(id);
                                }}
                            >
                                {this.getCancelBtnMsg()}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <Button id="volumeSeriesRequestInfoConfirm" bsStyle="primary" onClick={closeModal}>
                        {formatMessage(messages.close)}
                    </Button>
                </div>
            </Fragment>
        );
    }
}

VolumeSeriesRequestInfo.propTypes = {
    closeModal: PropTypes.func.isRequired,
    handleVsrCancel: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    vs: PropTypes.object.isRequired,
    vsr: PropTypes.object.isRequired,
};

export default injectIntl(VolumeSeriesRequestInfo);
