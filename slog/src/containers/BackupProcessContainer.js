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
import { connect } from 'react-redux';

import BackupProcess from '../components/BackupProcess';

import { getAGs } from '../actions/applicationGroupActions';
import { postVolumeSeriesCGSnapshot } from '../actions/volumeSeriesActions';
import { getClusters } from '../actions/clusterActions';
import { getAccounts } from '../actions/accountActions';
import { backupMsgs } from '../messages/Backup';
import { getServicePlans } from '../actions/servicePlanActions';

class BackupProcessContainer extends Component {
    constructor(props) {
        super(props);

        this.state = this.initialState = {
            stepIndex: 0, // which step we are on
            selectedCG: '',
            selectedVolume: '',
            confirmed: false,
        };

        this.processTimeout = null;

        this.nextStep = this.nextStep.bind(this);
        this.setStep = this.setStep.bind(this);
        this.selectCG = this.selectCG.bind(this);
        this.selectVolume = this.selectVolume.bind(this);

        this.confirm = this.confirm.bind(this);
        this.startProcess = this.startProcess.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(getAGs());
        dispatch(getAccounts());
        dispatch(getClusters());
        dispatch(getServicePlans());
    }

    componentWillUnmount() {
        if (this.processTimeout) {
            clearTimeout(this.processTimeout);
        }
    }

    /**
     * Invoked when next step should be shown in process
     */
    nextStep() {
        this.setState({ stepIndex: this.state.stepIndex + 1 });
    }

    /**
     * Called from sub-component when edit button clicked.
     * @param {*} step
     */
    setStep(stepIndex) {
        this.setState({ stepIndex });
    }

    /**
     * Called from sub-component when CG is selected
     * @param {*} selectedCG
     */
    selectCG(selectedCG) {
        this.setState({ selectedCG });
    }

    selectVolume(selectedVolume) {
        this.setState({ selectedVolume });
    }

    /**
     * Called when confirmation items have been completed.
     * @param {*} recoveryConfirmed
     */
    confirm(confirmed) {
        this.setState({ confirmed });
    }

    /**
     * Called when backup is to start.
     */
    startProcess() {
        const { consistencyGroupsData = {}, volumeSeriesData = {}, dispatch } = this.props;
        const { selectedVolume } = this.state;
        const { consistencyGroups = [] } = consistencyGroupsData || {};
        const { volumeSeries = [] } = volumeSeriesData || {};

        const volume = volumeSeries.find(vol => {
            return vol.meta.id === selectedVolume;
        });

        const { consistencyGroupId: selectedCG, boundClusterId: clusterId, name } = volume;

        const cg = consistencyGroups.find(cg => {
            return cg.meta.id === selectedCG;
        });

        dispatch(postVolumeSeriesCGSnapshot(cg, clusterId, name));

        this.processTimeout = setTimeout(() => {
            this.setState(this.initialState);
        }, 5000);
    }

    render() {
        const { selectedCG, selectedVolume, stepIndex } = this.state;
        const { consistencyGroupsData, volumeSeriesData } = this.props;

        return (
            <BackupProcess
                consistencyGroupsData={consistencyGroupsData}
                nextStep={this.nextStep}
                selectVolume={this.selectVolume}
                selectedVolume={selectedVolume}
                selectCG={this.selectCG}
                selectedCG={selectedCG}
                setStep={this.setStep}
                startProcess={this.startProcess}
                stepIndex={stepIndex}
                stepNumber={0}
                title={backupMsgs.titleSelectCG}
                volumeSeriesData={volumeSeriesData}
            />
        );
    }
}

BackupProcessContainer.propTypes = {
    accountsData: PropTypes.object,
    applicationGroupsData: PropTypes.object,
    clustersData: PropTypes.object,
    consistencyGroupsData: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    tableSnapshots: PropTypes.object,
    volumeSeriesData: PropTypes.object,
};

function mapStateToProps(state) {
    const {
        accountsData,
        applicationGroupsData,
        clustersData,
        consistencyGroupsData,
        tableSnapshots,
        volumeSeriesData,
    } = state;
    return {
        accountsData,
        applicationGroupsData,
        clustersData,
        consistencyGroupsData,
        tableSnapshots,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(BackupProcessContainer));
