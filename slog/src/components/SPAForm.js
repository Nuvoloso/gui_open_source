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
import { Checkbox, Glyphicon, Radio } from 'react-bootstrap';
import _ from 'lodash';

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import VolumeSeriesYaml from './VolumeSeriesYaml';

import { bytesFromUnit, bytesToUnit } from './utils';
import { clusterMsgs } from '../messages/Cluster';
import { messages } from '../messages/Messages';
import { resourceMsgs } from '../messages/Resource';
import { spaTagGetCost } from '../containers/spaUtils';

import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';

import * as constants from '../constants';

class SPAForm extends Component {
    constructor(props) {
        super(props);

        /**
         * Need to keep a copy of the initial details for
         * enable/disable of save button.
         */
        this.state = {
            selectedAccount: '',
            servicePlansDetails: {},
            initialServicePlansDetails: {},
        };

        this.save = this.save.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    componentDidMount() {
        const { clusterId, servicePlanAllocationsData } = this.props;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const servicePlansDetails = {};

        servicePlanAllocations.forEach(spa => {
            const { authorizedAccountId, clusterDescriptor, servicePlanId, totalCapacityBytes, tags } = spa || {};
            const accountsDetails = servicePlansDetails[servicePlanId] || {};
            const cost = Number(spaTagGetCost(tags));

            if (spa.clusterId === clusterId) {
                const volumes = this.clusterVolumes(clusterId, servicePlanId);
                if (Number(totalCapacityBytes) || totalCapacityBytes === 0) {
                    servicePlansDetails[servicePlanId] = {
                        ...accountsDetails,
                        [authorizedAccountId]: {
                            capacity: totalCapacityBytes,
                            clusterDescriptor,
                            cost: Number(cost) || 0,
                            exists: true,
                            clusterId,
                            volumes,
                        },
                    };
                }
            }
        });

        const initialServicePlansDetails = _.cloneDeep(servicePlansDetails);

        this.setState({ servicePlansDetails, initialServicePlansDetails });
    }

    renderAccounts() {
        const { accountsData, servicePlansData } = this.props;
        const { accounts = [] } = accountsData || {};
        const { servicePlans = [] } = servicePlansData || {};

        return (
            <td className="wizard-config-table-td" rowSpan={servicePlans.length || 1}>
                {accounts.map((a, idx) => {
                    return (
                        <Radio
                            id={`spa-form-account-${a.name}`}
                            key={idx}
                            name="account"
                            onChange={e => {
                                const { target } = e || {};
                                const { checked } = target || {};

                                if (checked) {
                                    const { meta } = a || {};
                                    const { id } = meta || {};
                                    this.setState({ selectedAccount: id });
                                }
                            }}
                        >
                            {a.name}
                        </Radio>
                    );
                })}
            </td>
        );
    }

    renderActions(sp) {
        const { meta } = sp || {};
        const { id } = meta || {};

        const { selectedAccount, servicePlansDetails = {} } = this.state;
        const accountsDetails = servicePlansDetails[id] || {};
        const { clusterDescriptor } = accountsDetails[selectedAccount] || {};
        const { k8sPvcYaml } = clusterDescriptor || {};

        if (!k8sPvcYaml) {
            return null;
        }

        return (
            <td>
                <div className="table-actions-cell">
                    <Glyphicon
                        glyph="save-file"
                        id={`spaFormActionsYaml-${id}`}
                        onClick={() => {
                            const { intl, openModal } = this.props;
                            const { formatMessage } = intl;

                            if (openModal) {
                                openModal(
                                    VolumeSeriesYaml,
                                    {
                                        dark: true,
                                        info: formatMessage(clusterMsgs.clusterPoolYamlInfo),
                                        title: formatMessage(clusterMsgs.clusterPoolYamlTitle),
                                    },
                                    { k8sPvcYaml }
                                );
                            }
                        }}
                    />
                </div>
            </td>
        );
    }

    renderCapacity(sp) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { selectedAccount, servicePlansDetails = {} } = this.state;
        const { meta } = sp || {};
        const { id } = meta || {};
        const accountsDetails = servicePlansDetails[id] || {};
        const accountCapacity = accountsDetails[selectedAccount] && accountsDetails[selectedAccount].capacity;

        return (
            <td>
                {accountCapacity !== null && accountCapacity !== undefined ? (
                    <FieldGroup
                        appendLabel={formatMessage(messages.gib)}
                        className="mb0"
                        id={`spa-form-capacity-${sp.name}`}
                        name={id}
                        onChange={(servicePlanId, value) => {
                            const accountsDetailsCurrent = servicePlansDetails[servicePlanId] || {};

                            accountsDetailsCurrent[selectedAccount].capacity = bytesFromUnit(value);

                            this.setState({
                                servicePlansDetails: {
                                    ...servicePlansDetails,
                                    [servicePlanId]: {
                                        ...accountsDetailsCurrent,
                                    },
                                },
                            });
                        }}
                        type="number"
                        value={Number(accountCapacity) || accountCapacity === 0 ? bytesToUnit(accountCapacity) : ''}
                    />
                ) : null}
            </td>
        );
    }

    onBlur(servicePlanId) {
        const { selectedAccount, servicePlansDetails = {} } = this.state;

        const accountsDetailsCurrent = servicePlansDetails[servicePlanId] || {};

        const cost = accountsDetailsCurrent[selectedAccount].cost;
        if (cost === '') {
            accountsDetailsCurrent[selectedAccount].cost = 0;

            this.setState({
                servicePlansDetails: {
                    ...servicePlansDetails,
                    [servicePlanId]: {
                        ...accountsDetailsCurrent,
                    },
                },
            });
        }
    }

    renderCost(sp) {
        const { selectedAccount, servicePlansDetails = {} } = this.state;
        const { meta } = sp || {};
        const { id } = meta || {};
        const accountsDetails = servicePlansDetails[id] || {};
        const accountCost = accountsDetails[selectedAccount] && accountsDetails[selectedAccount].cost;

        return (
            <td>
                {accountCost !== null && accountCost !== undefined ? (
                    <FieldGroup
                        className="mb0"
                        id={`spa-form-cost-${sp.name}`}
                        name={id}
                        onBlur={this.onBlur}
                        onChange={(servicePlanId, value) => {
                            const accountsDetailsCurrent = servicePlansDetails[servicePlanId] || {};

                            accountsDetailsCurrent[selectedAccount].cost = Number(value) || value === 0 ? value : '';

                            this.setState({
                                servicePlansDetails: {
                                    ...servicePlansDetails,
                                    [servicePlanId]: {
                                        ...accountsDetailsCurrent,
                                    },
                                },
                            });
                        }}
                        scale={constants.MAX_NUMBER_COST_DECIMAL_POINTS}
                        type="cost"
                        value={Number(accountCost) || accountCost === 0 ? accountCost : ''}
                    />
                ) : null}
            </td>
        );
    }

    renderActualCost(sp) {
        const costPerGiB = Number.parseFloat(sp.costPerGiB).toFixed(constants.MAX_NUMBER_COST_DECIMAL_POINTS) || '';

        return (
            <td>
                <FieldGroup
                    className="mb0"
                    id={`spa-form-actual cost-${sp.name}`}
                    name="cost"
                    scale={constants.MAX_NUMBER_COST_DECIMAL_POINTS}
                    type="static"
                    value={Number(costPerGiB) || costPerGiB === 0 ? costPerGiB : ''}
                />
            </td>
        );
    }

    clusterVolumes(clusterId, servicePlanId) {
        const { volumeSeriesData } = this.props;
        const { volumeSeries = [] } = volumeSeriesData;

        const volumes = volumeSeries.filter(volume => {
            return volume.boundClusterId === clusterId && volume.servicePlanId === servicePlanId;
        });

        return (volumes && volumes.length) || 0;
    }

    renderVolumeCount(sp) {
        const { selectedAccount, servicePlansDetails = {} } = this.state;
        const { meta } = sp || {};
        const { id } = meta || {};
        const accountsDetails = servicePlansDetails[id] || {};
        const volumes = accountsDetails[selectedAccount] && accountsDetails[selectedAccount].volumes;

        return (
            <td>
                {volumes !== null && volumes !== undefined ? (
                    <FieldGroup
                        className="mb0"
                        id={`spa-form-volumes-${sp.name}`}
                        name={id}
                        type="static"
                        value={volumes}
                    />
                ) : null}
            </td>
        );
    }

    renderServicePlan(sp) {
        const { selectedAccount, servicePlansDetails = {}, initialServicePlansDetails } = this.state;
        const { meta, name } = sp || {};
        const { id } = meta || {};
        const accountsDetails = servicePlansDetails[id] || {};
        const accountCapacity = accountsDetails[selectedAccount] && accountsDetails[selectedAccount].capacity;

        // Do not allow removing existing pools
        const disabled =
            !selectedAccount || (accountsDetails[selectedAccount] && accountsDetails[selectedAccount].exists);

        return (
            <td className="wizard-config-table-td">
                <Checkbox
                    disabled={disabled}
                    id={`spa-form-service-plan-${sp.name}`}
                    name={name}
                    onChange={e => {
                        const { target } = e || {};
                        const { checked } = target || {};

                        const emptyDetails = checked
                            ? {
                                  cost: 0,
                                  capacity: 0,
                              }
                            : null;

                        /**
                         * If freshly checked, we need to add a placeholder with
                         * size/cost of 0.
                         *
                         * If unchecked, need to remove the account element from the
                         * state.  Only new pools can be removed from the dialog.
                         */
                        if (checked) {
                            const accountsDetails = servicePlansDetails[id];
                            this.setState({
                                servicePlansDetails: {
                                    ...servicePlansDetails,
                                    [id]: {
                                        ...accountsDetails,
                                        [selectedAccount]: emptyDetails,
                                    },
                                },
                            });
                        } else {
                            const servicePlanDetails = servicePlansDetails[id];

                            delete servicePlanDetails[selectedAccount];

                            /**
                             * Need to see if the SP was not in the original data set.  If it was not,
                             * then we remove it as well.
                             */
                            if (Object.keys(servicePlanDetails).length === 0 && !initialServicePlansDetails[id]) {
                                delete servicePlansDetails[id];
                            }

                            this.setState({ servicePlansDetails });
                        }
                    }}
                    // only have to check for capacity as it is must have (cost is optional)
                    checked={accountCapacity !== null && accountCapacity !== undefined}
                >
                    {name}
                </Checkbox>
            </td>
        );
    }

    disableSave() {
        const { initialServicePlansDetails, servicePlansDetails } = this.state;

        return _.isEqual(initialServicePlansDetails, servicePlansDetails);
    }

    save() {
        const { cancel, clusterId, onSubmit } = this.props;

        if (onSubmit) {
            const { servicePlansDetails } = this.state;
            onSubmit(clusterId, servicePlansDetails);
        }

        if (cancel) {
            cancel();
        }
    }

    render() {
        const { cancel, intl, servicePlansData } = this.props;
        const { formatMessage } = intl;
        const { servicePlans = [] } = servicePlansData || {};
        const disabled = this.disableSave();

        return (
            <div>
                <form className="wizard-form spa-form">
                    <table className="wizard-config-table">
                        <thead className="wizard-config-table-thead">
                            <tr>
                                <th className="wizard-config-table-th">
                                    {formatMessage(resourceMsgs.spaHeaderAccounts)}
                                </th>
                                <th className="wizard-config-table-th">
                                    {formatMessage(resourceMsgs.spaHeaderServicePlans)}
                                </th>
                                <th className="wizard-config-table-th">
                                    {formatMessage(resourceMsgs.spaHeaderCapacity)}
                                </th>
                                <th className="wizard-config-table-th">{formatMessage(resourceMsgs.spaHeaderCost)}</th>
                                <th className="wizard-config-table-th">
                                    {formatMessage(resourceMsgs.spaHeaderActualCost)}
                                </th>
                                <th className="wizard-config-table-th">
                                    {formatMessage(resourceMsgs.spaHeaderVolumes)}
                                </th>
                                <th className="wizard-config-table-th">
                                    {formatMessage(resourceMsgs.spaHeaderActions)}
                                </th>
                                <th>
                                    <div id="dialog-save-exit">
                                        <ButtonAction
                                            btnUp={btnAltSaveUp}
                                            btnHov={btnAltSaveHov}
                                            btnDisable={btnAltSaveDisable}
                                            disabled={disabled}
                                            id="button-save"
                                            onClick={this.save}
                                        />
                                        <ButtonAction
                                            btnUp={btnCancelUp}
                                            btnHov={btnCancelHov}
                                            id="button-cancel"
                                            onClick={cancel}
                                        />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="wizard-config-table-tbody">
                            {servicePlans.map((sp, idx) => {
                                return (
                                    <tr key={idx}>
                                        {idx === 0 && this.renderAccounts()}
                                        {this.renderServicePlan(sp)}
                                        {this.renderCapacity(sp)}
                                        {this.renderCost(sp)}
                                        {this.renderActualCost(sp)}
                                        {this.renderVolumeCount(sp)}
                                        {this.renderActions(sp)}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </form>
            </div>
        );
    }
}

SPAForm.propTypes = {
    accountsData: PropTypes.object.isRequired,
    cancel: PropTypes.func,
    clusterId: PropTypes.string,
    intl: intlShape.isRequired,
    onSubmit: PropTypes.func,
    openModal: PropTypes.func,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    servicePlansData: PropTypes.object.isRequired,
    volumeSeriesData: PropTypes.object,
};

export default injectIntl(SPAForm);
