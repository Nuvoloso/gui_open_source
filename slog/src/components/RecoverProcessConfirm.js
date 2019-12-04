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

import FieldGroup from './FieldGroup';
import RecoverApplicationGroupInfo from './RecoverApplicationGroupInfo';
import SelectServicePlan from './SelectServicePlan';
import SelectOptions from './SelectOptions';

import { sessionGetAccount } from '../sessionUtils';

import { volumeSeriesMsgs } from '../messages/VolumeSeries';
import { recoverMsgs } from '../messages/Recover';

import './process.css';
import './recoverselect.css';

class RecoverProcessConfirm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            clusterId: '',
            clusterSelectObj: null,
            prefix: '',
            servicePlanId: '',
            servicePlanSelectObj: null,
        };

        this.handleChangeCluster = this.handleChangeCluster.bind(this);
        this.handleChangeServicePlan = this.handleChangeServicePlan.bind(this);
        this.onChangePrefix = this.onChangePrefix.bind(this);
        this.startRecovery = this.startRecovery.bind(this);
    }

    startRecovery() {
        const { startRecovery } = this.props;
        const { clusterId, prefix, servicePlanId } = this.state;

        startRecovery(prefix, servicePlanId, clusterId);
        this.setState({ prefix: '' });
    }

    renderButton() {
        const { intl, stepIndex, stepNumber } = this.props;
        const { prefix } = this.state;
        const { formatMessage } = intl;

        if (stepIndex === stepNumber && prefix) {
            return (
                <Button bsStyle="primary" className="step-button" onClick={this.startRecovery}>
                    {formatMessage(recoverMsgs.buttonConfirm)}
                </Button>
            );
        }
    }

    onChangePrefix(name, value) {
        this.setState({ prefix: value });
    }

    renderStepTitle() {
        const { intl, stepIndex, stepNumber } = this.props;
        const { formatMessage } = intl;

        if (stepIndex <= stepNumber) {
            const className = stepIndex === stepNumber ? 'active-step' : '';
            return <div className={className}>{formatMessage(recoverMsgs.titleConfirm)}</div>;
        }
    }

    /**
     * Need to filter out service plans for just this cluster/account.
     */
    filterServicePlans(volume) {
        const { servicePlanAllocationsData, servicePlansData } = this.props;
        const { servicePlans = [] } = servicePlansData || {};
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const { boundClusterId } = volume || {};
        const accountId = sessionGetAccount();
        const { clusterId } = this.state;
        const matchClusterId = clusterId || boundClusterId;

        const filteredServicePlans = servicePlans.filter(sp => {
            const { meta } = sp || {};
            const { id } = meta || {};
            const spa = servicePlanAllocations.find(
                spa =>
                    spa.servicePlanId === id &&
                    spa.clusterId === matchClusterId &&
                    spa.authorizedAccountId === accountId
            );
            // we won't list out the existing service plan as an option
            if (id === volume.servicePlanId) {
                return false;
            }

            return spa;
        });

        return filteredServicePlans;
    }

    handleChangeServicePlan(selectedItem) {
        if (selectedItem) {
            this.setState({
                servicePlanId: selectedItem.value,
                servicePlanSelectObj: selectedItem,
            });
        } else {
            this.setState({ servicePlanId: '', servicePlanSelectObj: null });
        }
    }

    handleChangeCluster(selectedItem) {
        /**
         * Need to reset the service plan as it may not be available in a different cluster.
         */
        if (selectedItem) {
            this.setState({
                clusterId: selectedItem.value,
                clusterSelectObj: selectedItem,
            });
        } else {
            this.setState({ clusterId: '', clusterSelectObj: {} });
        }
    }

    render() {
        const {
            accountsData,
            applicationGroupsData,
            clustersData,
            consistencyGroupsData,
            intl,
            selectedCG,
            servicePlansData,
            stepIndex,
            stepNumber,
            volumeSeriesData,
        } = this.props;
        const { servicePlanId, servicePlanSelectObj } = this.state;
        const { formatMessage } = intl;
        const { servicePlans = [] } = servicePlansData || {};
        const { volumeSeries = [] } = volumeSeriesData || {};
        const cgVolumes = volumeSeries.filter(volume => {
            return volume.consistencyGroupId === selectedCG;
        });
        const volume = cgVolumes[0] || {};
        const filteredServicePlans = this.filterServicePlans(volume);
        const servicePlan = servicePlans.find(sp => sp.meta.id === volume.servicePlanId);
        const { clusters = [], loading } = clustersData || {};
        const { clusterId } = this.state;
        // default to cluster that volume is a member of if not chosen already
        const priorCluster = clusters.find(cluster => cluster.meta.id === volume.boundClusterId);
        const cluster = clusters.find(cluster => cluster.meta.id === (clusterId || volume.boundClusterId));
        const { meta, name } = cluster || {};
        const { name: priorName } = priorCluster || {};
        const { id } = meta || {};
        const initialValues = cluster ? { value: id, label: name } : [];

        return (
            <div>
                <div className="process-select-cg">
                    <div className="process-index">{stepNumber + 1} .</div>
                    <div className="process-title">
                        <div>{this.renderStepTitle()}</div>
                    </div>
                </div>
                {stepIndex !== stepNumber ? null : (
                    <div className="process-content">
                        <div className="process-content-index-column" />
                        <div className="process-content-panel">
                            <div className="dark process-confirm content-flex-column mt10 mr10 mb10 ml10">
                                <div className="divider-horizontal" />
                                <div className="content-flex-column-left mt10">
                                    <div className="content-flex-row">
                                        <div className="section-label">
                                            {formatMessage(recoverMsgs.locationInformation)}:
                                        </div>
                                    </div>
                                    <div className="content-flex-row-centered section-value mt10">
                                        <FieldGroup
                                            className="content-flex-row-left"
                                            label={formatMessage(recoverMsgs.locationPrefix)}
                                            name="locationPrefix"
                                            onChange={this.onChangePrefix}
                                            placeholder={formatMessage(recoverMsgs.placeholderPrefix)}
                                        />
                                    </div>
                                    <div className="content-flex-row mt10">
                                        <div className="section-label">
                                            {formatMessage(recoverMsgs.servicePlanOptionalLabel)}
                                        </div>
                                    </div>
                                    <div className="content-flex-row-centered section-value">
                                        <FieldGroup
                                            className="content-flex-left"
                                            type="static"
                                            label={formatMessage(recoverMsgs.existingServicePlanLabel)}
                                            value={servicePlan.name}
                                        />
                                        <div className="content-flex-row-centered mt10">
                                            <SelectServicePlan
                                                filteredServicePlans={filteredServicePlans}
                                                onChangeServicePlan={this.handleChangeServicePlan}
                                                servicePlanLabel={formatMessage(volumeSeriesMsgs.newServicePlanLabel)}
                                                placeholderLabel={formatMessage(
                                                    volumeSeriesMsgs.servicePlanPlaceholderOptional
                                                )}
                                                servicePlanId={servicePlanId}
                                                servicePlansData={servicePlansData}
                                                servicePlansSelectObj={servicePlanSelectObj}
                                            />
                                        </div>
                                    </div>
                                    <div className="content-flex-row mt10">
                                        <div className="section-label">
                                            {formatMessage(recoverMsgs.recoverProcessLabelCluster)}
                                        </div>
                                    </div>
                                    <div className="content-flex-row-centered section-value">
                                        <FieldGroup
                                            className="content-flex-left"
                                            type="static"
                                            label={formatMessage(recoverMsgs.priorClusterNameLabel)}
                                            value={priorName}
                                        />
                                        <div className="content-flex-row-centered mt10">
                                            <FieldGroup
                                                inputComponent={
                                                    <SelectOptions
                                                        existing={clusterId}
                                                        id="recoverProcessConfirmCluster"
                                                        initialValues={initialValues}
                                                        isLoading={loading}
                                                        isClearable={false}
                                                        onChange={this.handleChangeCluster}
                                                        options={clusters.map(cluster => {
                                                            const { meta, name } = cluster || {};
                                                            const { id } = meta || {};
                                                            return { value: id, label: name };
                                                        })}
                                                        placeholder={formatMessage(
                                                            recoverMsgs.recoverProcessClusterDefaults
                                                        )}
                                                        value={clusterId}
                                                    />
                                                }
                                                label={formatMessage(recoverMsgs.targetClusterNameLabel)}
                                            />
                                        </div>
                                    </div>
                                    <div className="divider-horizontal-margins" />
                                    <div className="content-flex-column ml10">
                                        <RecoverApplicationGroupInfo
                                            accountsData={accountsData}
                                            applicationGroupsData={applicationGroupsData}
                                            consistencyGroupsData={consistencyGroupsData}
                                            selectedCG={selectedCG}
                                            volumeSeriesData={volumeSeriesData}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="process-buttons mb10 mt10 flex-item-left">
                                <div className="process-select-button">{this.renderButton()}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

RecoverProcessConfirm.propTypes = {
    accountsData: PropTypes.object,
    applicationGroupsData: PropTypes.object,
    clustersData: PropTypes.object,
    confirmRecovery: PropTypes.func,
    consistencyGroupsData: PropTypes.object,
    intl: intlShape.isRequired,
    nextStep: PropTypes.func,
    recoveryConfirmed: PropTypes.bool,
    selectedCG: PropTypes.string,
    servicePlanAllocationsData: PropTypes.object,
    servicePlansData: PropTypes.object,
    setStep: PropTypes.func,
    startRecovery: PropTypes.func,
    stepIndex: PropTypes.number,
    stepNumber: PropTypes.number,
    volumeSeriesData: PropTypes.object,
};

export default injectIntl(RecoverProcessConfirm);
