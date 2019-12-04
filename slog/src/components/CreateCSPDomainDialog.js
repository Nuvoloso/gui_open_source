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
import CreateCSPDomainDialogForm from './CreateCSPDomainDialogForm';

import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';

import { cspDomainMsgs } from '../messages/CSPDomain';
import { ATTRIBUTE_AWS } from '../reducers/csps';

import * as constants from '../constants';

class CreateCSPDomainDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accessKeyId: '',
            accessRegion: '',
            accessZone: '',
            clusterName: '',
            createSnapshotCatalogPolicy: false,
            cspCredentialId: '',
            cspCredentialName: '',
            cspDescription: '',
            cspDomainAttributes: ATTRIBUTE_AWS,
            cspDomainType: constants.CSP_DOMAINS.AWS,
            cspId: '',
            cspTags: [],
            domainName: '',
            encryptionAlgorithmObj: {},
            gc_cred: '',
            managementHost: '',
            passphrase: '',
            secretKey: '',
            selectedCredentialType: constants.OPTION_USE_EXISTING,
        };

        this.cancel = this.cancel.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAlgorithm = this.handleChangeAlgorithm.bind(this);
        this.handleChangeCredential = this.handleChangeCredential.bind(this);
        this.handleChangeCSPTags = this.handleChangeCSPTags.bind(this);
        this.handleServiceProviderChange = this.handleServiceProviderChange.bind(this);
        this.save = this.save.bind(this);
    }

    componentDidMount() {
        const { createSnapshotCatalogPolicy, cspCredentials = [] } = this.props;

        if (cspCredentials.length === 0) {
            this.setState({ selectedCredentialType: constants.OPTION_CREATE_NEW });
        }

        const { protectionDomainMetadataData } = this.props;
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const defaultProtectionDomain = protectionDomainMetadata.find(
            pdm => pdm.encryptionAlgorithm === constants.PASSPHRASE_ENCRYPTION_ALGORITHMS.AES256
        );

        this.setState({ encryptionAlgorithmObj: defaultProtectionDomain, createSnapshotCatalogPolicy });
    }

    componentDidUpdate(prevProps) {
        const { protectionDomainMetadataData } = this.props;
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const defaultProtectionDomain = protectionDomainMetadata.find(
            pdm => pdm.encryptionAlgorithm === constants.PASSPHRASE_ENCRYPTION_ALGORITHMS.AES256
        );

        const { protectionDomainMetadataData: prevProtectionDomainMetadataData = {} } = prevProps;

        const { loading } = protectionDomainMetadataData || {};
        const { loading: prevLoading } = prevProtectionDomainMetadataData || {};

        if (loading !== prevLoading) {
            this.setState({ encryptionAlgorithmObj: defaultProtectionDomain });
        }
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
        const { handleServiceProviderChange } = this.props;
        if (selectedItem) {
            this.setState({ cspDomainType: selectedItem.value });
            if (handleServiceProviderChange) {
                handleServiceProviderChange(selectedItem.value);
            }
        } else {
            this.setState({ cspDomainType: '' });
        }
    }

    handleChangeAlgorithm(selectedItem) {
        if (selectedItem) {
            this.setState({ encryptionAlgorithmObj: selectedItem.value });
        } else {
            this.setState({ encryptionAlgorithmObj: {} });
        }
    }

    cancel() {
        const { dialogToggleCreate } = this.props;

        if (dialogToggleCreate) {
            dialogToggleCreate();
        }
    }

    save() {
        const { dialogSaveDomain } = this.props;

        if (dialogSaveDomain) {
            dialogSaveDomain(this.state);
        }
    }

    isDisabled() {
        const {
            createSnapshotCatalogPolicy,
            protectionDomainMetadataData,
        } = this.props;
        const {
            accessKeyId,
            accessRegion,
            accessZone,
            cspCredentialId,
            cspCredentialName,
            cspDomainType,
            domainName,
            encryptionAlgorithmObj,
            gc_cred,
            passphrase,
            secretKey,
            selectedCredentialType,
        } = this.state;
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const { encryptionAlgorithm: label } = encryptionAlgorithmObj || {};
        const encryptionAlgorithmInfo = protectionDomainMetadata.find(pdm => {
            return pdm.encryptionAlgorithm === label;
        });
        const { minPassphraseLength = 0 } = encryptionAlgorithmInfo || {};

        return (
            (cspDomainType === constants.CSP_DOMAINS.AWS && (!accessRegion || !accessZone)) ||
            (cspDomainType === constants.CSP_DOMAINS.GCP && !accessZone) ||
            !domainName ||
            !cspDomainType ||
            (createSnapshotCatalogPolicy &&
                (!encryptionAlgorithmObj ||
                    ((label !== constants.PASSPHRASE_ENCRYPTION_ALGORITHMS.NONE && !passphrase) ||
                        passphrase.length < minPassphraseLength))) ||
            (selectedCredentialType === constants.OPTION_USE_EXISTING && !cspCredentialId) ||
            (selectedCredentialType === constants.OPTION_CREATE_NEW &&
                (!cspCredentialName ||
                    (cspDomainType === constants.CSP_DOMAINS.AWS && (!accessKeyId || !secretKey)) ||
                    (cspDomainType === constants.CSP_DOMAINS.GCP && !gc_cred)))
        );
    }

    render() {
        const {
            createSnapshotCatalogPolicy,
            cspCredentials,
            cspMetadataData,
            getSystemHostname,
            intl,
            protectionDomainMetadataData,
            systemData,
        } = this.props;
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
            encryptionAlgorithmObj,
            managementHost,
            passphrase,
            secretKey,
            selectedCredentialType,
        } = this.state;
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const { encryptionAlgorithm: label } = encryptionAlgorithmObj || {};
        const encryptionAlgorithmInfo = protectionDomainMetadata.find(pdm => {
            return pdm.encryptionAlgorithm === label;
        });
        const { minPassphraseLength = 0 } = encryptionAlgorithmInfo || {};

        const disabled = this.isDisabled();

        return (
            <div id="dialogCreateCSPDomain" className="content-flex-column pad-15-t pad-20-l">
                <div className="content-flex-row">
                    <div className="dialog-title">{formatMessage(cspDomainMsgs.cspDialogCreateDomainName)}</div>
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

                <CreateCSPDomainDialogForm
                    accessKeyId={accessKeyId}
                    accessRegion={accessRegion}
                    accessZone={accessZone}
                    createSnapshotCatalogPolicy={createSnapshotCatalogPolicy}
                    cspCredentialId={cspCredentialId}
                    cspCredentialName={cspCredentialName}
                    cspCredentials={cspCredentials}
                    cspDomainType={cspDomainType}
                    cspMetadataData={cspMetadataData}
                    cspTags={cspTags}
                    description={description}
                    domainName={domainName}
                    encryptionAlgorithmObj={encryptionAlgorithmObj}
                    getSystemHostname={getSystemHostname}
                    handleChange={this.handleChange}
                    handleChangeAlgorithm={this.handleChangeAlgorithm}
                    handleChangeCredential={this.handleChangeCredential}
                    handleChangeCSPTags={this.handleChangeCSPTags}
                    handleServiceProviderChange={this.handleServiceProviderChange}
                    managementHost={managementHost}
                    minPassphraseLength={minPassphraseLength}
                    onChangeCsp={this.onChangeCsp}
                    passphrase={passphrase}
                    protectionDomainMetadataData={protectionDomainMetadataData}
                    secretKey={secretKey}
                    selectedCredentialType={selectedCredentialType}
                    systemData={systemData}
                />
            </div>
        );
    }
}

CreateCSPDomainDialog.propTypes = {
    createSnapshotCatalogPolicy: PropTypes.bool,
    cspCredentials: PropTypes.array,
    cspMetadataData: PropTypes.object,
    dialogSaveDomain: PropTypes.func,
    dialogToggleCreate: PropTypes.func,
    getSystemHostname: PropTypes.func,
    handleServiceProviderChange: PropTypes.func,
    intl: intlShape.isRequired,
    protectionDomainMetadataData: PropTypes.object,
    systemData: PropTypes.object,
};

export default injectIntl(CreateCSPDomainDialog);
