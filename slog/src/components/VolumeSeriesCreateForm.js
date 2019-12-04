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
import { intlShape, injectIntl } from 'react-intl';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import SelectAGsContainer from '../containers/SelectAGsContainer';
import SelectCGsContainer from '../containers/SelectCGsContainer';
import SelectOptions from './SelectOptions';
import SelectTags from './SelectTags';
import ServicePlanCard from './ServicePlanCard';
import SizeInput from './SizeInput';
import SelectServicePlan from './SelectServicePlan';

import { messages } from '../messages/Messages';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';
import { MonetizationOn, Warning } from '@material-ui/icons';
import { formatBytes } from './utils';
import { sessionGetAccount } from '../sessionUtils';
import { spaTagGetCost } from '../containers/spaUtils';
import { genServicePlanCardData } from './utilsServicePlans';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';

import './resources.css';
import './volumes.css';
import './wizard.css';

import * as constants from '../constants';

class VolumeSeriesCreateForm extends Component {
    constructor(props) {
        super(props);

        const { applicationGroupIds, clustersData, consistencyGroupId } = this.props;

        const { clusters = [] } = clustersData || {};
        const cluster = clusters[0] || {};
        const { meta, name } = cluster || {};
        const { id } = meta || {};

        this.state = {
            applicationGroupIds,
            clusterId: id,
            clusterSelectObj: { value: id, label: name },
            consistencyGroupId,
            description: '',
            name: '',
            servicePlanId: '',
            servicePlanSelectObj: null,
            sizeBytes: undefined,
            tags: [],
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAGs = this.handleChangeAGs.bind(this);
        this.handleChangeCGs = this.handleChangeCGs.bind(this);
        this.handleChangeCluster = this.handleChangeCluster.bind(this);
        this.handleChangeServicePlan = this.handleChangeServicePlan.bind(this);
        this.handleChangeSize = this.handleChangeSize.bind(this);
        this.handleChangeTags = this.handleChangeTags.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.renderServicePlanInfo = this.renderServicePlanInfo.bind(this);
    }

    disableSubmit() {
        const { servicePlansData } = this.props;
        const { servicePlans = [] } = servicePlansData || {};

        const { clusterId, name, servicePlanId, sizeBytes } = this.state;

        const servicePlan = servicePlans.find(servicePlan => {
            const { meta } = servicePlan;
            const { id } = meta || {};

            return id === servicePlanId;
        });

        const { volumeSeriesMinMaxSize } = servicePlan || {};
        const { maxSizeBytes, minSizeBytes } = volumeSeriesMinMaxSize || {};

        const isMissingRequired =
            !clusterId ||
            !name ||
            !servicePlanId ||
            !sizeBytes ||
            sizeBytes < 1 ||
            sizeBytes < minSizeBytes ||
            sizeBytes > maxSizeBytes;

        return isMissingRequired;
    }

    handleChange(name, value) {
        this.setState({
            [name]: value,
        });
    }

    handleChangeAGs(selectedItems) {
        const ids = selectedItems.map(item => {
            return item.value;
        });
        this.setState({ applicationGroupIds: ids });
    }

    handleChangeCGs(selectedItem) {
        if (selectedItem) {
            this.setState({ applicationGroupIds: [], consistencyGroupId: selectedItem.value });
        } else {
            this.setState({ consistencyGroupId: '' });
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
                servicePlanId: '',
                servicePlanSelectObj: null,
            });
        } else {
            this.setState({ clusterId: '', clusterSelectObj: {}, servicePlanId: '', servicePlanSelectObj: null });
        }
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

    handleChangeSize(sizeBytes) {
        this.setState({ sizeBytes });
    }

    handleChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ tags: value });
    }

    handleSubmit() {
        const { onSubmit } = this.props;

        if (onSubmit) {
            const {
                applicationGroupIds,
                clusterId,
                consistencyGroupId,
                description,
                name,
                servicePlanId,
                sizeBytes,
                tags,
            } = this.state;
            const params = {
                ...(consistencyGroupId && { consistencyGroupId }),
                ...(description && { description }),
                ...(name && { name }),
                ...(servicePlanId && { servicePlanId }),
                ...(sizeBytes && { sizeBytes }),
                ...(tags && { tags }),
            };
            onSubmit(params, clusterId, applicationGroupIds);
        }
    }

    renderFetchStatus() {
        const { accountsData = {}, clustersData = {}, protectionDomainsData = {} } = this.props;

        if (accountsData.loading || clustersData.loading || protectionDomainsData.loading) {
            return <Loader />;
        }
    }

    renderServicePlanInfo() {
        const { servicePlanId } = this.state;
        const { intl, servicePlansData } = this.props;
        const { formatMessage } = intl;
        const { servicePlans = {} } = servicePlansData;

        if (!servicePlanId) {
            return (
                <Popover className="info-popover" id="service-plan-info-popover" placement="bottom">
                    {formatMessage(volumeSeriesMsgs.servicePlanInfoPlaceholder)}
                </Popover>
            );
        }

        const data = genServicePlanCardData(servicePlanId, servicePlans);

        return (
            <Popover className="info-popover-card" id="service-plan-info-popover">
                <ServicePlanCard data={data} renderPools={false} />
            </Popover>
        );
    }

    renderSpaInformation(spa) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        return (
            <div className="content-flex-row-centered">
                <div className="flex-item-left">
                    {formatMessage(volumeSeriesMsgs.spaCapacityAvailable)} {formatBytes(spa.reservableCapacityBytes)}
                </div>
                <div className="ml20 text-cost flex-item-centered">
                    <MonetizationOn />
                    <div className="ml5">
                        ${spaTagGetCost(spa.tags)} / {formatMessage(messages.gib)} / {formatMessage(messages.month)}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * Render pool information specific to this user/account/cluster.
     */
    renderPoolInformation() {
        const { intl, session, servicePlanAllocationsData = {} } = this.props;
        const { formatMessage } = intl;
        const { clusterId, servicePlanId } = this.state;
        const { accountId } = session || {};
        const { servicePlanAllocations = {} } = servicePlanAllocationsData;
        const spa = servicePlanAllocations.find(spa => {
            return (
                spa.clusterId === clusterId &&
                spa.authorizedAccountId === accountId &&
                spa.servicePlanId === servicePlanId
            );
        });
        if (!spa) {
            return (
                <FieldGroup
                    type="static"
                    label={formatMessage(volumeSeriesMsgs.spaSelectionLabel)}
                    value={
                        <div className="dialog-help-text">{formatMessage(volumeSeriesMsgs.spaSelectionHelperText)}</div>
                    }
                />
            );
        } else {
            return (
                <FieldGroup
                    type="static"
                    label={formatMessage(volumeSeriesMsgs.spaSelectionLabel)}
                    value={this.renderSpaInformation(spa)}
                />
            );
        }
    }

    render() {
        const {
            cancel,
            clustersData = {},
            disableAgsField,
            headerActions,
            hideDivider,
            intl,
            servicePlanAllocationsData = {},
            servicePlansData = {},
            session = {},
        } = this.props;
        const {
            applicationGroupIds,
            clusterId,
            clusterSelectObj,
            consistencyGroupId,
            description,
            name,
            servicePlanId,
            servicePlanSelectObj,
            sizeBytes,
            tags,
        } = this.state;
        const { clusters = [] } = clustersData;
        const { accountId } = session || {};
        const { servicePlanAllocations = [] } = servicePlanAllocationsData;
        const { formatMessage } = intl;
        const { servicePlans = [] } = servicePlansData;

        const disableSubmit = this.disableSubmit();

        /**
         * Need to filter out service plans for just this cluster/account.
         */
        const filteredServicePlans = servicePlans.filter(sp => {
            const spa = servicePlanAllocations.find(
                spa =>
                    spa.servicePlanId === sp.meta.id &&
                    spa.clusterId === clusterId &&
                    spa.authorizedAccountId === accountId
            );
            return spa;
        });

        // check for existing PD
        const cluster = clusters.find(cluster => cluster.meta.id === clusterId);
        const { cspDomainId } = cluster || {};

        const { accountsData } = this.props;
        const { accounts = [] } = accountsData || {};
        const account = accounts.find(account => account.meta.id === sessionGetAccount());
        const { protectionDomains: accountProtectionDomains = {} } = account || {};
        const pdId = accountProtectionDomains[cspDomainId];

        const { protectionDomainsData } = this.props;
        const { protectionDomains = [] } = protectionDomainsData || {};
        const pd = protectionDomains.find(pd => pd.meta.id === pdId);

        return (
            <div className="vs-create-form">
                {this.renderFetchStatus()}
                {headerActions ? (
                    <div data-testid="volumeCreateFormTitle" className="collapsible-create-form-header">
                        <div>{formatMessage(volumeSeriesMsgs.createTitle)}</div>
                        <div id="dialog-save-exit">
                            <ButtonAction
                                btnUp={btnAltSaveUp}
                                btnHov={btnAltSaveHov}
                                btnDisable={btnAltSaveDisable}
                                disabled={disableSubmit}
                                id="volumeSeriesCreateSubmit"
                                onClick={this.handleSubmit}
                            />
                            <ButtonAction
                                btnUp={btnCancelUp}
                                btnHov={btnCancelHov}
                                id="volumeSeriesCreateCancel"
                                onClick={cancel}
                            />
                        </div>
                    </div>
                ) : null}
                <div className="form-row">
                    <div className="wizard-form col-1">
                        <FieldGroup
                            label={formatMessage(volumeSeriesMsgs.nameLabel)}
                            name="name"
                            onChange={this.handleChange}
                            placeholder={formatMessage(volumeSeriesMsgs.namePlaceholder)}
                            type="string"
                            value={name}
                        />
                        <FieldGroup
                            inputComponent={
                                <SelectCGsContainer
                                    createNew={true}
                                    disabled
                                    existing={consistencyGroupId}
                                    onChangeGroup={this.handleChangeCGs}
                                />
                            }
                            label={formatMessage(volumeSeriesMsgs.consistencyGroupLabel)}
                        />
                        <FieldGroup
                            inputComponent={
                                <SelectAGsContainer
                                    createNew={true}
                                    disabled={disableAgsField}
                                    existing={applicationGroupIds}
                                    onChangeGroup={this.handleChangeAGs}
                                />
                            }
                            type={consistencyGroupId ? 'static' : null}
                            label={formatMessage(volumeSeriesMsgs.applicationGroupLabel)}
                            value={consistencyGroupId ? formatMessage(volumeSeriesMsgs.consistencyGroupChosen) : null}
                        />
                    </div>
                    <div className="wizard-form col-2">
                        <div className={clusterId && !pd ? 'cluster-no-pd-input' : ''}>
                            <FieldGroup
                                appendLabel={
                                    clusterId && !pd ? (
                                        <OverlayTrigger
                                            overlay={
                                                <Popover className="info-popover" id="cluster-no-pd-popover">
                                                    {formatMessage(volumeSeriesMsgs.requiredProtectionDesc)}
                                                </Popover>
                                            }
                                            placement="top"
                                        >
                                            <Warning
                                                className="cluster-no-pd-icon"
                                                onClick={() => {
                                                    this.props.history.push(
                                                        `/${constants.URI_CSP_DOMAINS}/${cspDomainId}`,
                                                        {
                                                            openDialogCreateProtectionDomain: true,
                                                            tabKey: constants.CSP_DETAILS_TABS.PROTECTION_DOMAINS,
                                                        }
                                                    );
                                                }}
                                            />
                                        </OverlayTrigger>
                                    ) : null
                                }
                                inputComponent={
                                    <SelectOptions
                                        id="clustersSelect"
                                        initialValues={clusterSelectObj}
                                        isLoading={clustersData.loading}
                                        onChange={this.handleChangeCluster}
                                        options={clusters.map(cluster => {
                                            const { meta, name } = cluster || {};
                                            const { id } = meta || {};
                                            return { value: id, label: name };
                                        })}
                                        placeholder={formatMessage(volumeSeriesMsgs.clustersPlaceholder)}
                                    />
                                }
                                label={formatMessage(volumeSeriesMsgs.bindLabel)}
                            />
                        </div>
                        <SelectServicePlan
                            filteredServicePlans={filteredServicePlans}
                            onChangeServicePlan={this.handleChangeServicePlan}
                            servicePlanId={servicePlanId}
                            servicePlansData={servicePlansData}
                            servicePlansSelectObj={servicePlanSelectObj}
                        />
                        {this.renderPoolInformation()}
                        <SizeInput
                            id="volumeSeriesCreateSize"
                            label={formatMessage(volumeSeriesMsgs.sizeLabel)}
                            onChange={this.handleChangeSize}
                            placeholder={formatMessage(volumeSeriesMsgs.sizePlaceholder)}
                            sizeBytes={sizeBytes}
                        />
                    </div>
                </div>
                {hideDivider ? <div className="mb15" /> : <div className="divider-horizontal" />}
                <div className="form-row">
                    <div className="wizard-form col-1">
                        <FieldGroup
                            inputComponent={<SelectTags onChange={this.handleChangeTags} tags={tags} />}
                            label={formatMessage(volumeSeriesMsgs.tagsLabel)}
                        />
                    </div>
                    <div className="wizard-form col-2">
                        <FieldGroup
                            label={formatMessage(volumeSeriesMsgs.descriptionLabel)}
                            name="description"
                            onChange={this.handleChange}
                            placeholder={formatMessage(volumeSeriesMsgs.descriptionPlaceholder)}
                            type="textarea"
                            value={description}
                        />
                    </div>
                </div>
                {headerActions ? null : (
                    <div className="toolbar-footer">
                        <Button
                            bsStyle="primary"
                            disabled={this.disableSubmit()}
                            id="volumeSeriesCreateSubmit"
                            onClick={this.handleSubmit}
                        >
                            {formatMessage(volumeSeriesMsgs.saveBtn)}
                        </Button>
                    </div>
                )}
            </div>
        );
    }
}

VolumeSeriesCreateForm.propTypes = {
    accountsData: PropTypes.object,
    applicationGroupIds: PropTypes.array,
    cancel: PropTypes.func,
    clustersData: PropTypes.object,
    consistencyGroupId: PropTypes.string,
    disableAgsField: PropTypes.bool,
    disableCgField: PropTypes.bool,
    headerActions: PropTypes.bool,
    hideDivider: PropTypes.bool,
    history: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    protectionDomainsData: PropTypes.object,
    servicePlanAllocationsData: PropTypes.object,
    servicePlansData: PropTypes.object,
    session: PropTypes.object,
    onSubmit: PropTypes.func,
};

VolumeSeriesCreateForm.defaultProps = {
    applicationGroupIds: [],
    consistencyGroupId: '',
    disableAgsField: false,
    disableCgField: false,
};

export default withRouter(injectIntl(VolumeSeriesCreateForm));
