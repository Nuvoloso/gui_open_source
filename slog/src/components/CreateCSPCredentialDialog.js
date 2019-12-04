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

import ButtonAction from './ButtonAction';
import CreateCSPCredentialDialogForm from './CreateCSPCredentialDialogForm';

import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';

import { cspDomainMsgs } from '../messages/CSPDomain';
import { ATTRIBUTE_AWS } from '../reducers/csps';

import * as constants from '../constants';

class CreateCSPCredentialDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accessKeyId: '',
            cspCredentialName: '',
            cspDescription: '',
            cspDomainAttributes: ATTRIBUTE_AWS,
            cspDomainType: constants.CSP_DOMAINS.AWS,
            cspTags: [],
            gc_cred: '',
            secretKey: '',
        };

        this.cancel = this.cancel.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeCSPTags = this.handleChangeCSPTags.bind(this);
        this.handleChangeCredential = this.handleChangeCredential.bind(this);
        this.handleServiceProviderChange = this.handleServiceProviderChange.bind(this);
        this.save = this.save.bind(this);
    }

    handleChange(name, value) {
        this.setState({
            [name]: value,
        });
    }

    handleChangeCSPTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ cspTags: value });
    }

    handleChangeCredential(selectedItem) {
        const { value = '' } = selectedItem || {};
        this.setState({ cspCredentialId: value });
    }

    handleServiceProviderChange(selectedItem) {
        if (selectedItem) {
            this.setState({ cspDomainType: selectedItem.value });
        } else {
            this.setState({ cspDomainType: '' });
        }
    }

    cancel() {
        const { dialogCreateCredentialToggle } = this.props;

        if (dialogCreateCredentialToggle) {
            dialogCreateCredentialToggle();
        }
    }

    save() {
        const { dialogSaveCredential } = this.props;

        if (dialogSaveCredential) {
            dialogSaveCredential(this.state);
        }
    }

    render() {
        const { cspCredentials, intl } = this.props;
        const { formatMessage } = intl;
        const {
            accessKeyId,
            accessRegion,
            accessZone,
            cspCredentialId,
            cspCredentialName,
            cspDomainType,
            cspTags,
            description,
            domainName,
            gc_cred,
            managementHost,
            secretKey,
            selectedCredentialType,
        } = this.state;

        const disabled =
            (cspDomainType === constants.CSP_DOMAINS.AWS && (accessKeyId === '' || secretKey === '')) ||
            (cspDomainType === constants.CSP_DOMAINS.GCP && gc_cred === '') ||
            cspDomainType === '' ||
            (selectedCredentialType === constants.OPTION_USE_EXISTING
                ? !cspCredentialId
                : !cspCredentialName ||
                  ((cspDomainType === constants.CSP_DOMAINS.AWS && (accessKeyId === '' || secretKey === '')) ||
                      (cspDomainType === constants.CSP_DOMAINS.GCP && gc_cred === '')));

        return (
            <div id="dialogCreateCSPCredential" className="content-flex-column pad-15-t pad-20-l">
                <div className="content-flex-row">
                    <div className="dialog-title">{formatMessage(cspDomainMsgs.cspDialogCreateCredentialName)}</div>
                    <div className="mr10" id="dialog-save-exit">
                        <ButtonAction
                            btnUp={btnAltSaveUp}
                            btnHov={btnAltSaveHov}
                            btnDisable={btnAltSaveDisable}
                            disabled={disabled}
                            id="dialogCreateCredentialSave"
                            onClick={this.save}
                        />
                        <ButtonAction
                            btnUp={btnCancelUp}
                            btnHov={btnCancelHov}
                            id="dialogCreateCredentialCancel"
                            onClick={this.cancel}
                        />
                    </div>
                </div>

                <CreateCSPCredentialDialogForm
                    accessKeyId={accessKeyId}
                    accessRegion={accessRegion}
                    accessZone={accessZone}
                    cspCredentialId={cspCredentialId}
                    cspCredentialName={cspCredentialName}
                    cspCredentials={cspCredentials}
                    cspDomainType={cspDomainType}
                    cspTags={cspTags}
                    description={description}
                    domainName={domainName}
                    gc_cred={gc_cred}
                    handleChange={this.handleChange}
                    handleChangeCredential={this.handleChangeCredential}
                    handleChangeCredentialType={this.handleChangeCredentialType}
                    handleChangeCSPTags={this.handleChangeCSPTags}
                    handleServiceProviderChange={this.handleServiceProviderChange}
                    managementHost={managementHost}
                    onChangeCsp={this.onChangeCsp}
                    secretKey={secretKey}
                    selectedCredentialType={selectedCredentialType}
                />
            </div>
        );
    }
}

CreateCSPCredentialDialog.propTypes = {
    cspCredentials: PropTypes.array,
    dialogCreateCredentialToggle: PropTypes.func,
    dialogSaveCredential: PropTypes.func,
    intl: intlShape.isRequired,
};

export default injectIntl(CreateCSPCredentialDialog);
