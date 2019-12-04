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
import _ from 'lodash';

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';

import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';

import { cspDomainMsgs } from '../messages/CSPDomain';

import * as constants from '../constants';

class StorageCostsForm extends Component {
    constructor(props) {
        super(props);

        /**
         * Need to keep a copy of the initial details for
         * enable/disable of save button.
         */
        this.state = {
            storageCostsDetails: {},
            initialStorageCostsDetails: {},
        };

        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.renderCost = this.renderCost.bind(this);
        this.renderName = this.renderName.bind(this);
    }

    componentDidMount() {
        /**
         * Scan existing CSP for all costs that are already set and add them to the object.
         *
         * Scan all storage types and add them to the object if they do not already exist.
         *
         * Clone the initial view.
         */

        const { csp } = this.props;
        const { storageCosts = {} } = csp || {};

        const storageCostsDetails = this.generateStorageCostDetails(storageCosts);

        const initialStorageCostsDetails = _.cloneDeep(storageCostsDetails);

        this.setState({ storageCostsDetails, initialStorageCostsDetails });
    }

    componentDidUpdate(prevProps) {
        const { csp } = this.props;
        const { storageCosts = {} } = csp || {};

        const { csp: prevCsp } = prevProps;
        const { storageCosts: prevStorageCosts = {} } = prevCsp || {};

        const isCostChanged = !_.isEqual(storageCosts, prevStorageCosts);

        if (isCostChanged) {
            this.setState({ initialStorageCostsDetails: this.generateStorageCostDetails(storageCosts) });
        }
    }

    generateStorageCostDetails(storageCosts = {}) {
        const { cspStorageTypesData } = this.props;
        const { cspStorageTypes = [] } = cspStorageTypesData || {};

        const storageCostsDetails = {};

        Object.keys(storageCosts).forEach(name => {
            storageCostsDetails[name] = Number(storageCosts[name].costPerGiB);
        });

        cspStorageTypes.forEach(st => {
            if (!storageCostsDetails[st.name]) {
                storageCostsDetails[st.name] = '';
            }
        });

        return storageCostsDetails;
    }

    onBlur(name) {
        const { storageCostsDetails = {} } = this.state;
        const storageCostsDetailsCurrent = storageCostsDetails || {};
        const cost = storageCostsDetailsCurrent[name];
        if (cost === '') {
            storageCostsDetailsCurrent[name] = '';
            this.setState({
                storageCostsDetails: {
                    ...storageCostsDetails,
                    ...storageCostsDetailsCurrent,
                },
            });
        }
    }

    renderName(name) {
        return (
            <td>
                <FieldGroup className="mb0" id={`csp-form-cost-${name}`} name="name" type="static" value={name} />
            </td>
        );
    }

    renderCost(name) {
        const { storageCostsDetails = {} } = this.state;
        const cost = storageCostsDetails[name];

        return (
            <td>
                <FieldGroup
                    className="mb5"
                    id={`csp-form-cost-${name}`}
                    name={name}
                    onBlur={this.onBlur}
                    onChange={(fieldName, value) => {
                        const storageCostsDetailsCurrent = storageCostsDetails || {};

                        storageCostsDetailsCurrent[name] = Number(value) || value === 0 ? value : '';

                        this.setState({
                            storageCostsDetails: {
                                ...storageCostsDetails,
                                ...storageCostsDetailsCurrent,
                            },
                        });
                    }}
                    step={0.001}
                    scale={constants.MAX_NUMBER_COST_DECIMAL_POINTS}
                    type="cost"
                    value={Number(cost) || cost === 0 ? cost : ''}
                />
            </td>
        );
    }

    disableSave() {
        const { initialStorageCostsDetails, storageCostsDetails } = this.state;

        return _.isEqual(initialStorageCostsDetails, storageCostsDetails);
    }

    save() {
        const { csp, onSubmit } = this.props;

        if (onSubmit) {
            const { storageCostsDetails } = this.state;
            const updateStorageCosts = {};
            /**
             * Convert array of storage types/costs to params.
             */
            Object.keys(storageCostsDetails).forEach(name => {
                if (storageCostsDetails[name]) {
                    updateStorageCosts[name] = {
                        costPerGiB: storageCostsDetails[name],
                    };
                }
            });
            const params = {
                storageCosts: updateStorageCosts,
            };
            onSubmit(csp.meta.id, params);
        }
    }

    cancel() {
        const { initialStorageCostsDetails } = this.state;
        this.setState({ storageCostsDetails: initialStorageCostsDetails });
    }

    render() {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { storageCostsDetails = {} } = this.state;
        const disabled = this.disableSave();

        return (
            <div>
                <form className="wizard-form storage-costs-form">
                    <table className="wizard-config-table">
                        <thead className="wizard-config-table-thead">
                            <tr>
                                <th className="wizard-config-table-th">
                                    {formatMessage(cspDomainMsgs.storageCostsTableHeaderType)}
                                </th>
                                <th className="wizard-config-table-th">
                                    {formatMessage(cspDomainMsgs.storageCostsTableHeaderCost)}
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
                                            onClick={this.cancel}
                                        />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="wizard-config-table-tbody">
                            {Object.keys(storageCostsDetails)
                                .sort()
                                .map((name, idx) => {
                                    return (
                                        <tr key={idx}>
                                            {this.renderName(name)}
                                            {this.renderCost(name)}
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

StorageCostsForm.propTypes = {
    csp: PropTypes.object,
    cspStorageTypesData: PropTypes.object,
    intl: intlShape.isRequired,
    onSubmit: PropTypes.func,
};

export default injectIntl(StorageCostsForm);
