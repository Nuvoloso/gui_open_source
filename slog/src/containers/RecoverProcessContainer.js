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

import RecoverProcessSelectSnapshot from '../components/RecoverProcessSelectSnapshot';
import RecoverProcess from '../components/RecoverProcess';
import RecoverProcessConfirm from '../components/RecoverProcessConfirm';

import { getAGs } from '../actions/applicationGroupActions';
import { getAccounts } from '../actions/accountActions';
import { getClusters } from '../actions/clusterActions';
import { getServicePlanAllocations } from '../actions/servicePlanAllocationActions';
import { getServicePlans } from '../actions/servicePlanActions';
import { getSnapshots } from '../actions/snapshotActions';
import { postVolumeSeriesRecover } from '../actions/volumeSeriesActions';
import { recoverMsgs } from '../messages/Recover';

class RecoverProcessContainer extends Component {
    constructor(props) {
        super(props);

        this.state = this.initialState = {
            recoverCluster: '',
            recoverPrefix: '',
            recoveryConfirmed: false,
            selectedCG: '',
            selectedSnapshot: {},
            selectedVolume: '',
            stepIndex: 0, // which step we are on
        };

        this.processTimeout = null;

        this.confirmRecovery = this.confirmRecovery.bind(this);
        this.nextStep = this.nextStep.bind(this);
        this.selectCG = this.selectCG.bind(this);
        this.selectSnapshot = this.selectSnapshot.bind(this);
        this.selectVolume = this.selectVolume.bind(this);
        this.setStep = this.setStep.bind(this);
        this.startRecovery = this.startRecovery.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(getAGs());
        dispatch(getAccounts());
        dispatch(getClusters());
        dispatch(getServicePlans());
        dispatch(getServicePlanAllocations());
        dispatch(getSnapshots());
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
     * Called from sub-component when snapshot is selected
     * @param {*} selectedSnapshot
     */
    selectSnapshot(selectedSnapshot) {
        this.setState({ selectedSnapshot });
    }

    /**
     * Called when confirmation items have been completed.
     * @param {*} recoveryConfirmed
     */
    confirmRecovery(recoveryConfirmed) {
        this.setState({ recoveryConfirmed });
    }

    /**
     * Called when recovery is to start.
     */
    startRecovery(prefix, newServicePlanId = '', clusterId = '') {
        const { dispatch, clustersData = {}, volumeSeriesData = {} } = this.props;
        const { selectedSnapshot, selectedVolume } = this.state;
        const { id: snapshotId } = selectedSnapshot || {};
        const { clusters = [] } = clustersData;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const volume = volumeSeries.find(vol => {
            return vol.meta.id === selectedVolume;
        });
        const params = {
            name: `${prefix}${volume.name}`,
            ...(newServicePlanId && { servicePlanId: newServicePlanId }),
        };
        const cluster = clusterId ? clusters.find(cluster => cluster.meta.id === clusterId) : clusters[0];
        const { nodes = [] } = cluster;
        const nodeId = (nodes[0] && nodes[0].meta.id) || '';

        dispatch(postVolumeSeriesRecover(params, snapshotId, nodeId));

        this.processTimeout = setTimeout(() => {
            this.setState(this.initialState);
        }, 5000);
    }

    render() {
        const { recoveryConfirmed, selectedCG, selectedSnapshot, selectedVolume, stepIndex } = this.state;
        const {
            accountsData,
            applicationGroupsData,
            clustersData,
            consistencyGroupsData,
            servicePlanAllocationsData,
            servicePlansData,
            tableSnapshots,
            volumeSeriesData,
        } = this.props;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const volume = volumeSeries.find(vol => {
            return vol.meta.id === selectedVolume;
        });
        const { name } = volume || {};

        return (
            <div className="process">
                <RecoverProcess
                    nextStep={this.nextStep}
                    selectCG={this.selectCG}
                    selectedCG={selectedCG}
                    selectedVolume={selectedVolume}
                    selectedVolumeName={name}
                    selectVolume={this.selectVolume}
                    setStep={this.setStep}
                    stepIndex={stepIndex}
                    stepNumber={0}
                    title={recoverMsgs.titleSelectCG}
                    volumeSeriesData={volumeSeriesData}
                />
                <RecoverProcessSelectSnapshot
                    nextStep={this.nextStep}
                    selectedCG={selectedCG}
                    selectedSnapshot={selectedSnapshot}
                    selectedSnapshotRows={tableSnapshots.selectedRows}
                    selectedVolume={selectedVolume}
                    selectSnapshot={this.selectSnapshot}
                    setStep={this.setStep}
                    stepIndex={stepIndex}
                    stepNumber={1}
                />
                <RecoverProcessConfirm
                    accountsData={accountsData}
                    applicationGroupsData={applicationGroupsData}
                    clustersData={clustersData}
                    confirmRecovery={this.confirmRecovery}
                    consistencyGroupsData={consistencyGroupsData}
                    nextStep={this.nextStep}
                    recoveryConfirmed={recoveryConfirmed}
                    selectedCG={selectedCG}
                    servicePlanAllocationsData={servicePlanAllocationsData}
                    servicePlansData={servicePlansData}
                    setStep={this.setStep}
                    startRecovery={this.startRecovery}
                    stepIndex={stepIndex}
                    stepNumber={2}
                    volumeSeriesData={volumeSeriesData}
                />
            </div>
        );
    }
}

RecoverProcessContainer.propTypes = {
    accountsData: PropTypes.object,
    applicationGroupsData: PropTypes.object,
    clustersData: PropTypes.object,
    consistencyGroupsData: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    servicePlanAllocationsData: PropTypes.object,
    servicePlansData: PropTypes.object,
    tableSnapshots: PropTypes.object,
    volumeSeriesData: PropTypes.object,
};

function mapStateToProps(state) {
    const {
        accountsData,
        applicationGroupsData,
        clustersData,
        consistencyGroupsData,
        servicePlanAllocationsData,
        servicePlansData,
        tableSnapshots,
        volumeSeriesData,
    } = state;
    return {
        accountsData,
        applicationGroupsData,
        clustersData,
        consistencyGroupsData,
        servicePlanAllocationsData,
        servicePlansData,
        tableSnapshots,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(RecoverProcessContainer));
