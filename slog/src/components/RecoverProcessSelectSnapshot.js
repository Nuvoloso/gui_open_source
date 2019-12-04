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
import RecoverSelectSnapshotContainer from '../containers/RecoverSelectSnapshotContainer';
import { recoverMsgs } from '../messages/Recover';

import pencil from '../pencil.svg';
import pencilUp from '../pencil-up.svg';

import './process.css';

class RecoverProcessSelectSnapshot extends Component {
    constructor(props) {
        super(props);

        this.completeStep = this.completeStep.bind(this);
    }

    /**
     * Need to store the final choice.
     */
    completeStep() {
        const { nextStep, selectSnapshot, selectedSnapshotRows } = this.props;

        selectSnapshot(selectedSnapshotRows[0]);
        nextStep();
    }

    renderStepButton() {
        const { stepIndex, stepNumber, selectedSnapshot, setStep } = this.props;

        if (stepIndex > stepNumber && selectedSnapshot) {
            return <ButtonAction btnHov={pencil} btnUp={pencilUp} onClick={() => setStep(stepNumber)} />;
        }
    }

    renderNextButton() {
        const { intl, stepIndex, stepNumber, selectedSnapshotRows } = this.props;
        const { formatMessage } = intl;

        if (stepIndex === stepNumber && selectedSnapshotRows && selectedSnapshotRows[0]) {
            return (
                <Button bsStyle="primary" className="step-button" onClick={() => this.completeStep()}>
                    {formatMessage(recoverMsgs.recoverAndRelocate)}
                </Button>
            );
        }
    }

    renderStepTitle() {
        const { intl, stepIndex, stepNumber, selectedSnapshot } = this.props;
        const { formatMessage } = intl;

        if (stepIndex <= stepNumber) {
            const className = stepIndex === stepNumber ? 'active-step' : '';
            return <div className={className}>{formatMessage(recoverMsgs.titleSelectSnapshot)}</div>;
        } else if (stepIndex >= stepNumber && selectedSnapshot) {
            return (
                <div>
                    {formatMessage(recoverMsgs.snapshot)}: {selectedSnapshot.date} {selectedSnapshot.time}
                    <span className="ml10 mr10">|</span>
                    {formatMessage(recoverMsgs.recovery)}: {formatMessage(recoverMsgs.recoveryMethodRelocate)}
                </div>
            );
        }
    }

    render() {
        const { selectedCG, selectSnapshot, selectedSnapshot, stepIndex, stepNumber } = this.props;

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
                            <RecoverSelectSnapshotContainer
                                selectedCG={selectedCG}
                                selectSnapshot={selectSnapshot}
                                selectedSnapshot={selectedSnapshot}
                            />
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

RecoverProcessSelectSnapshot.propTypes = {
    intl: intlShape.isRequired,
    nextStep: PropTypes.func.isRequired,
    selectedCG: PropTypes.string,
    selectedSnapshot: PropTypes.object.isRequired,
    selectSnapshot: PropTypes.func.isRequired,
    selectedSnapshotRows: PropTypes.array,
    setStep: PropTypes.func.isRequired,
    stepIndex: PropTypes.number.isRequired,
    stepNumber: PropTypes.number.isRequired,
};

export default injectIntl(RecoverProcessSelectSnapshot);
