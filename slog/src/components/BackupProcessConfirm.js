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

// import FieldGroup from './FieldGroup';
import SelectOptions from './SelectOptions';
import BackupConsistencyGroupInfo from './BackupConsistencyGroupInfo';

import { backupMsgs } from '../messages/Backup';
import './process.css';
import './recoverselect.css';

class BackupProcessSelectConfirm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            clusterId: '',
        };
        this.onChangeCluster = this.onChangeCluster.bind(this);
        this.onChangeNode = this.onChangeNode.bind(this);
    }

    renderButton() {
        const { intl, stepIndex, stepNumber, startProcess } = this.props;
        const { clusterId } = this.state;
        const { formatMessage } = intl;

        if (stepIndex === stepNumber && clusterId) {
            return (
                <Button bsStyle="primary" className="step-button" onClick={() => startProcess(clusterId)}>
                    {formatMessage(backupMsgs.buttonConfirm)}
                </Button>
            );
        }
    }

    onChangeCluster(value) {
        this.setState({ clusterId: value });
    }

    onChangeNode(value) {
        this.setState({ nodeId: value });
    }

    renderStepTitle() {
        const { intl, stepIndex, stepNumber } = this.props;
        const { formatMessage } = intl;

        if (stepIndex <= stepNumber) {
            const className = stepIndex === stepNumber ? 'active-step' : '';
            return <div className={className}>{formatMessage(backupMsgs.titleConfirm)}</div>;
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
            stepIndex,
            stepNumber,
            volumeSeriesData,
        } = this.props;
        const { clusters = [] } = clustersData || {};
        const { loading: clustersLoading } = clustersData || {};
        const { clusterId } = this.state;
        const { formatMessage } = intl;

        const clusterOptions = clusters.map(cluster => {
            return {
                label: cluster.name,
                value: cluster.meta.id,
            };
        });

        // const nodeOptions = this.getNodeOptions();

        return (
            <div>
                <div className="process-select-cg">
                    <div className="process-index">{stepNumber + 1} .</div>
                    <div className="process-title">
                        <div>{this.renderStepTitle()}</div>
                        <div className="process-select-button">{this.renderButton()}</div>{' '}
                    </div>
                </div>
                {stepIndex !== stepNumber ? null : (
                    <div className="process-content">
                        <div className="process-content-index-column" />
                        <div className="process-content-panel">
                            <div className="dark process-confirm content-flex-column ml10">
                                <div className="divider-horizontal-margins mt20" />
                                <div className="content-flex-column mt10 mb10 ml10">
                                    <div className="content-flex-row">
                                        <div className="section-label">
                                            {formatMessage(backupMsgs.backupLocationInformation)}:
                                        </div>
                                    </div>
                                    <div className="content-flex-row-centered section-value mt10">
                                        <div className="ml40">Cluster </div>

                                        <div className="div-w200 ml10">
                                            <SelectOptions
                                                id={'process-confirm-cluster-select'}
                                                initialValues={
                                                    clusterOptions.find(option => option.value === clusterId) || null
                                                }
                                                isLoading={clustersLoading}
                                                onChange={option => {
                                                    const { value } = option || {};
                                                    this.onChangeCluster(value);
                                                }}
                                                options={clusterOptions.filter(cluster => {
                                                    return cluster.value !== clusterId;
                                                })}
                                                placeholder={formatMessage(backupMsgs.backupPlaceholderCluster)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="content-flex-column ml10">
                                    <BackupConsistencyGroupInfo
                                        accountsData={accountsData}
                                        applicationGroupsData={applicationGroupsData}
                                        consistencyGroupsData={consistencyGroupsData}
                                        selectedCG={selectedCG}
                                        volumeSeriesData={volumeSeriesData}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

BackupProcessSelectConfirm.propTypes = {
    accountsData: PropTypes.object,
    applicationGroupsData: PropTypes.object,
    consistencyGroupsData: PropTypes.object,
    confirmRecovery: PropTypes.func,
    clustersData: PropTypes.object,
    intl: intlShape.isRequired,
    nextStep: PropTypes.func,
    recoveryConfirmed: PropTypes.bool,
    selectedCG: PropTypes.string,
    setStep: PropTypes.func,
    startProcess: PropTypes.func,
    stepIndex: PropTypes.number,
    stepNumber: PropTypes.number,
    volumeSeriesData: PropTypes.object,
};

export default injectIntl(BackupProcessSelectConfirm);
