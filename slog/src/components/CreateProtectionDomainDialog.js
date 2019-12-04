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
import CreateProtectionDomainDialogForm from './CreateProtectionDomainDialogForm';

import moment from 'moment';

import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';

import * as constants from '../constants';

import { accountMsgs } from '../messages/Account';

class CreateProtectionDomainDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            description: '',
            encryptionAlgorithmObj: {},
            name: '',
            passphrase: '',
            tags: [],
        };

        this.cancel = this.cancel.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAlgorithm = this.handleChangeAlgorithm.bind(this);
        this.save = this.save.bind(this);
    }

    generateProtectionPasswordName(name) {
        return `${name}.${moment().format()}`;
    }

    componentDidMount() {
        const { account, protectionDomainMetadataData } = this.props;
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const defaultProtectionDomain = protectionDomainMetadata.find(
            pdm => pdm.encryptionAlgorithm === constants.PASSPHRASE_ENCRYPTION_ALGORITHMS.AES256
        );
        const { name: accountName } = account || {};
        const generatedName = this.generateProtectionPasswordName(accountName);

        this.setState({ encryptionAlgorithmObj: defaultProtectionDomain, name: generatedName });
    }

    handleChange(name, value) {
        this.setState({
            [name]: value,
        });
    }

    handleChangeAlgorithm(selectedItem) {
        if (selectedItem) {
            this.setState({ encryptionAlgorithmObj: selectedItem.value });
        } else {
            this.setState({ encryptionAlgorithmObj: {} });
        }
    }

    cancel() {
        const { cancel } = this.props;

        if (cancel) {
            cancel();
        }
    }

    save() {
        const { cancel, csp, onSubmit } = this.props;

        if (onSubmit) {
            onSubmit({ ...this.state, csp });
            cancel();
        }
    }

    render() {
        const { intl, protectionDomainMetadataData } = this.props;
        const { formatMessage } = intl;
        const { encryptionAlgorithmObj, passphrase, name, tags, description } = this.state;
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const { encryptionAlgorithm: label } = encryptionAlgorithmObj || {};
        const encryptionAlgorithmInfo = protectionDomainMetadata.find(pdm => {
            return pdm.encryptionAlgorithm === label;
        });
        const { minPassphraseLength = 0 } = encryptionAlgorithmInfo || {};
        const disabled =
            !name ||
            !encryptionAlgorithmObj ||
            ((label !== constants.PASSPHRASE_ENCRYPTION_ALGORITHMS.NONE && !passphrase) ||
                passphrase.length < minPassphraseLength);
        const passphraseDisabled = label === constants.PASSPHRASE_ENCRYPTION_ALGORITHMS.NONE;

        return (
            <div id="dialogCreateProtectionDomain" className="content-flex-column pad-15-t pad-20-l">
                <div className="content-flex-row">
                    <div>{formatMessage(accountMsgs.setProtectionPasswordDialogTitle)}</div>
                    <div className="mr10" id="dialog-save-exit">
                        <ButtonAction
                            btnUp={btnAltSaveUp}
                            btnHov={btnAltSaveHov}
                            btnDisable={btnAltSaveDisable}
                            disabled={disabled}
                            id="dialogCreateDomainSave"
                            onClick={this.save}
                        />
                        <ButtonAction
                            btnUp={btnCancelUp}
                            btnHov={btnCancelHov}
                            id="dialogCreateDomainCancel"
                            onClick={this.cancel}
                        />
                    </div>
                </div>
                <div className="dialog-help-text">{formatMessage(accountMsgs.setProtectionPasswordDialogInfo)}</div>

                <CreateProtectionDomainDialogForm
                    description={description}
                    encryptionAlgorithmObj={encryptionAlgorithmObj}
                    handleChange={this.handleChange}
                    handleChangeAlgorithm={this.handleChangeAlgorithm}
                    minPassphraseLength={minPassphraseLength}
                    name={name}
                    passphrase={passphrase}
                    passphraseDisabled={passphraseDisabled}
                    protectionDomainMetadataData={protectionDomainMetadataData}
                    tags={tags}
                />
            </div>
        );
    }
}

CreateProtectionDomainDialog.propTypes = {
    account: PropTypes.object,
    cancel: PropTypes.func,
    csp: PropTypes.object,
    cspCredentials: PropTypes.array,
    dialogCreateCredentialToggle: PropTypes.func,
    dialogSaveCredential: PropTypes.func,
    intl: intlShape.isRequired,
    onSubmit: PropTypes.func,
    protectionDomainMetadataData: PropTypes.object,
};

export default injectIntl(CreateProtectionDomainDialog);
