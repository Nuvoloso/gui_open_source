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
import { Button } from 'react-bootstrap';

import { backupMsgs } from '../messages/Backup';

import './process.css';
import CGSelectionContainer from '../containers/CGSelectionContainer';

class BackupProcess extends Component {
    constructor(props) {
        super(props);

        this.renderStepTitle = this.renderStepTitle.bind(this);
        this.state = {
            clusterId: '',
        };
    }

    renderButton() {
        const { intl, startProcess, selectedVolume } = this.props;
        const { formatMessage } = intl;

        if (selectedVolume) {
            return (
                <Button bsStyle="primary" className="step-button" onClick={() => startProcess(selectedVolume)}>
                    {formatMessage(backupMsgs.backupVolumeButton)}
                </Button>
            );
        }
    }

    renderStepTitle() {
        const { intl, title } = this.props;
        const { formatMessage } = intl;

        return <div className="active-step">{formatMessage(title)}</div>;
    }

    render() {
        const { selectCG, selectedCG, selectVolume, selectedVolume } = this.props;

        return (
            <div className="process">
                <div className="process-select-cg">
                    <div className="process-title">
                        <div>{this.renderStepTitle()}</div>
                    </div>
                </div>
                <div className="process-content">
                    <div className="process-content-index-column" />
                    <div className="process-content-panel">
                        <CGSelectionContainer
                            selectVolume={selectVolume}
                            selectedVolume={selectedVolume}
                            selectCG={selectCG}
                            selectedCG={selectedCG}
                        />
                        <div className="divider-horizontal-margins" />
                        <div className="process-buttons mb10 mt10 flex-item-left">
                            <div className="process-select-button">{this.renderButton()}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

BackupProcess.propTypes = {
    consistencyGroupsData: PropTypes.object,
    intl: intlShape.isRequired,
    nextStep: PropTypes.func,
    selectCG: PropTypes.func,
    selectVolume: PropTypes.func,
    selectedVolume: PropTypes.string,
    selectedCG: PropTypes.string,
    setStep: PropTypes.func,
    startProcess: PropTypes.func,
    stepIndex: PropTypes.number,
    stepNumber: PropTypes.number,
    title: PropTypes.object,
    volumeSeriesData: PropTypes.object,
};

export default injectIntl(BackupProcess);
