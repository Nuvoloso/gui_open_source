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

import ButtonAction from './ButtonAction';
import CGSelectionContainer from '../containers/CGSelectionContainer';
import { cgSelectionMsgs } from '../messages/CGSelection';

import pencil from '../pencil.svg';
import pencilUp from '../pencil-up.svg';

import './process.css';

class RecoverProcess extends Component {
    constructor(props) {
        super(props);

        this.renderStepTitle = this.renderStepTitle.bind(this);
    }

    renderStepButton() {
        const { stepIndex, stepNumber, selectedCG, setStep } = this.props;

        if (stepIndex > stepNumber && selectedCG) {
            return <ButtonAction btnHov={pencil} btnUp={pencilUp} onClick={() => setStep(stepNumber)} />;
        }
    }

    renderNextButton() {
        const { intl, stepIndex, stepNumber, nextStep, selectedCG } = this.props;
        const { formatMessage } = intl;

        if (stepIndex === stepNumber && selectedCG) {
            return (
                <Button bsStyle="primary" className="step-button" onClick={() => nextStep()}>
                    {formatMessage(cgSelectionMsgs.buttonSelectCG)}
                </Button>
            );
        }
    }

    renderStepTitle() {
        const { intl, stepIndex, stepNumber, selectedVolume, selectedVolumeName, title } = this.props;
        const { formatMessage } = intl;

        if (stepIndex === stepNumber) {
            return <div className="step-info active-step">{formatMessage(title)}</div>;
        } else if (stepIndex >= stepNumber && selectedVolume) {
            return (
                <div className="step-info">
                    {formatMessage(cgSelectionMsgs.volumeLabel)}: {selectedVolumeName}
                </div>
            );
        }
    }

    render() {
        const { stepIndex, stepNumber, selectCG, selectedCG, selectVolume, selectedVolume } = this.props;

        return (
            <div>
                <div className="process-select-cg">
                    <div className="process-index">{stepNumber + 1} .</div>
                    <div className="process-title">
                        <div>{this.renderStepTitle()}</div>
                        <div className="process-buttons flex-item-left">
                            <div className="process-select-button">{this.renderStepButton()}</div>
                        </div>
                    </div>
                </div>
                {stepIndex !== stepNumber ? null : (
                    <div className="process-content">
                        <div className="process-content-index-column" />
                        <div className="process-content-panel">
                            <CGSelectionContainer
                                mounted={false}
                                selectVolume={selectVolume}
                                selectedVolume={selectedVolume}
                                selectCG={selectCG}
                                selectedCG={selectedCG}
                            />
                            <div className="divider-horizontal-margins" />
                            <div className="process-buttons mb10 mt10 flex-item-left">
                                <div className="process-select-button">{this.renderNextButton()}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

RecoverProcess.propTypes = {
    intl: intlShape.isRequired,
    nextStep: PropTypes.func,
    selectCG: PropTypes.func,
    selectedCG: PropTypes.string,
    selectVolume: PropTypes.func,
    selectedVolume: PropTypes.string,
    selectedVolumeName: PropTypes.string,
    setStep: PropTypes.func,
    stepIndex: PropTypes.number,
    stepNumber: PropTypes.number,
    title: PropTypes.object,
};

export default injectIntl(RecoverProcess);
