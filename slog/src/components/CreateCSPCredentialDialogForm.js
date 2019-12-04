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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';

import FieldGroup from './FieldGroup';
import SelectOptions from './SelectOptions';

import { clusterMsgs } from '../messages/Cluster';

import * as constants from '../constants';

import './cspdomains.css';

class CreateCSPCredentialDialogForm extends Component {
    renderOptionsAWS() {
        const { accessKeyId, handleChange, intl, secretKey } = this.props;
        const { formatMessage } = intl;

        return (
            <Fragment>
                <FieldGroup
                    className="field-group-left"
                    label={formatMessage(clusterMsgs.accessKeyIdLabel)}
                    name="accessKeyId"
                    onChange={handleChange}
                    placeholder={formatMessage(clusterMsgs.enterAccessKeyIDPlaceholder)}
                    type="input"
                    value={accessKeyId}
                />
                <FieldGroup
                    className="field-group-left"
                    label={formatMessage(clusterMsgs.secretKeyLabel)}
                    name="secretKey"
                    onChange={handleChange}
                    placeholder={formatMessage(clusterMsgs.enterSecretKeyPlaceholder)}
                    type="input"
                    value={secretKey}
                />
            </Fragment>
        );
    }

    renderOptionsGCP() {
        const { gc_cred, handleChange, intl } = this.props;
        const { formatMessage } = intl;

        return (
            <FieldGroup
                className="field-group-left"
                label={formatMessage(clusterMsgs.gcCredLabel)}
                name="gc_cred"
                onChange={handleChange}
                placeholder={formatMessage(clusterMsgs.enterGCCredentialPlaceholder)}
                type="textarea"
                value={gc_cred}
            />
        );
    }
    renderProviderOptions() {
        const { cspDomainType } = this.props;

        switch (cspDomainType) {
            case constants.CSP_DOMAINS.AWS:
                return this.renderOptionsAWS();

            case constants.CSP_DOMAINS.GCP:
                return this.renderOptionsGCP();

            default:
                return <div>Unknown</div>;
        }
    }

    getServiceProvidersInitial() {
        const { cspDomainType } = this.props;
        return { label: cspDomainType, value: cspDomainType };
    }

    getServiceProviders() {
        const cspOptions = constants.CSP_DOMAINS;

        const options = Object.values(cspOptions).map(cspOption => {
            return { label: cspOption, value: cspOption };
        });

        return options;
    }
    render() {
        const { cspCredentialName, cspDomainType, handleChange, handleServiceProviderChange, intl } = this.props;
        const { formatMessage } = intl;

        return (
            <Fragment>
                <div className="content-flex-column pad-10-t">
                    <div className="content-flex-column-left pad-20-t">
                        <FieldGroup
                            className="field-group-left"
                            label={formatMessage(clusterMsgs.cspCredentialNameLabel)}
                            name="cspCredentialName"
                            onChange={handleChange}
                            placeholder={formatMessage(clusterMsgs.cspCredentialNamePlaceholder)}
                            type="input"
                            value={cspCredentialName}
                        />
                        <FieldGroup
                            inputComponent={
                                <SelectOptions
                                    id="selectProvider"
                                    initialValues={this.getServiceProvidersInitial()}
                                    isClearable={false}
                                    onChange={handleServiceProviderChange}
                                    options={this.getServiceProviders()}
                                    placeholder={formatMessage(clusterMsgs.selectProviderPlaceholder)}
                                    value={cspDomainType}
                                />
                            }
                            className="field-group-left"
                            label={formatMessage(clusterMsgs.serviceProviderLabel)}
                        />
                        {this.renderProviderOptions()}
                    </div>
                </div>
            </Fragment>
        );
    }
}

CreateCSPCredentialDialogForm.propTypes = {
    accessKeyId: PropTypes.string,
    cspCredentialName: PropTypes.string,
    cspDomainType: PropTypes.string,
    gc_cred: PropTypes.string,
    handleChange: PropTypes.func,
    handleServiceProviderChange: PropTypes.func,
    intl: intlShape.isRequired,
    secretKey: PropTypes.string,
};

export default injectIntl(CreateCSPCredentialDialogForm);
