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
import FieldGroup from './FieldGroup';
import SelectCSPContainer from '../containers/SelectCSPContainer';
import SelectRadios from './SelectRadios';

import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';

import { clusterMsgs } from '../messages/Cluster';
import { ATTRIBUTE_AWS } from '../reducers/csps';

import * as constants from '../constants';

class DialogCreateCluster extends Component {
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
            selectedOption: constants.OPTION_USE_EXISTING,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeCSPTags = this.handleChangeCSPTags.bind(this);
        this.handleChangeCredential = this.handleChangeCredential.bind(this);
        this.handleChangeCsp = this.handleChangeCsp.bind(this);
        this.handleChangeTags = this.handleChangeTags.bind(this);
        this.handleServiceProviderChange = this.handleServiceProviderChange.bind(this);
        this.save = this.save.bind(this);
        this.handleChangeAlgorithm = this.handleChangeAlgorithm.bind(this);
    }

    componentDidMount() {
        const { createSnapshotCatalogPolicy, cspCredentials, cspsData } = this.props;
        const { csps = [] } = cspsData || {};

        /**
         * If no domains exist, only offer option to create a new domain.
         */
        if (csps.length === 0) {
            this.setState({ selectedOption: constants.OPTION_CREATE_NEW });
        }

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

    handleChange(name, value) {
        this.setState({
            [name]: value,
        });
    }

    handleChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ tags: value });
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

    handleChangeCsp(selectedItem) {
        const { value } = selectedItem || '';
        this.setState({ cspId: value });
    }

    handleChangeAlgorithm(selectedItem) {
        if (selectedItem) {
            this.setState({ encryptionAlgorithmObj: selectedItem.value });
        } else {
            this.setState({ encryptionAlgorithmObj: {} });
        }
    }

    renderUseExistingCSP() {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { cspId } = this.state;

        return (
            <div className="content-flex-row pad-20-t">
                <div className="content-flex-column-left">
                    <FieldGroup
                        className="field-group-left"
                        inputComponent={<SelectCSPContainer existing={[cspId]} onChangeCsp={this.handleChangeCsp} />}
                        label={formatMessage(clusterMsgs.tableCspDomain)}
                    />
                </div>
            </div>
        );
    }

    handleServiceProviderChange(selectedItem) {
        if (selectedItem) {
            this.setState({ cspDomainType: selectedItem.value });
        } else {
            this.setState({ cspDomainType: '' });
        }
    }

    renderCreateNewCSP() {
        const {
            createSnapshotCatalogPolicy,
            cspCredentials,
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
            cspTags,
            description,
            domainName,
            encryptionAlgorithmObj,
            gc_cred,
            managementHost,
            passphrase,
            secretKey,
            selectedCredentialType,
            cspDomainType,
        } = this.state;
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const { encryptionAlgorithm: label } = encryptionAlgorithmObj || {};
        const encryptionAlgorithmInfo = protectionDomainMetadata.find(pdm => {
            return pdm.encryptionAlgorithm === label;
        });
        const { minPassphraseLength = 0 } = encryptionAlgorithmInfo || {};

        return (
            <div className="content-flex-column">
                <div className="content-flex-row pad-20-t">
                    <div className="dialog-radio-selected">{formatMessage(clusterMsgs.dialogNewDomain)}</div>
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
                    cspTags={cspTags}
                    description={description}
                    domainName={domainName}
                    encryptionAlgorithmObj={encryptionAlgorithmObj}
                    gc_cred={gc_cred}
                    getSystemHostname={getSystemHostname}
                    handleChange={this.handleChange}
                    handleChangeAlgorithm={this.handleChangeAlgorithm}
                    handleChangeCredential={this.handleChangeCredential}
                    handleChangeCSPTags={this.handleChangeCSPTags}
                    handleChangeTags={this.handleChangeTags}
                    handleServiceProviderChange={this.handleServiceProviderChange}
                    managementHost={managementHost}
                    minPassphraseLength={minPassphraseLength}
                    passphrase={passphrase}
                    protectionDomainMetadataData={protectionDomainMetadataData}
                    secretKey={secretKey}
                    selectedCredentialType={selectedCredentialType}
                    systemData={systemData}
                />
            </div>
        );
    }

    disableSave() {
        const {
            accessKeyId,
            accessRegion,
            accessZone,
            clusterName,
            cspCredentialId,
            cspCredentialName,
            cspId,
            domainName,
            encryptionAlgorithmObj,
            gc_cred,
            managementHost,
            passphrase,
            secretKey,
            selectedCredentialType,
            selectedOption,
            cspDomainType,
        } = this.state;
        const { createSnapshotCatalogPolicy, protectionDomainMetadataData } = this.props;
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const { encryptionAlgorithm: label } = encryptionAlgorithmObj || {};
        const encryptionAlgorithmInfo = protectionDomainMetadata.find(pdm => {
            return pdm.encryptionAlgorithm === label;
        });
        const { minPassphraseLength = 0 } = encryptionAlgorithmInfo || {};

        if (selectedOption === constants.OPTION_USE_EXISTING) {
            return !clusterName || !cspId;
        } else {
            return (
                (cspDomainType === constants.CSP_DOMAINS.AWS && (!accessRegion || !accessZone)) ||
                (cspDomainType === constants.CSP_DOMAINS.GCP && !accessZone) ||
                !clusterName ||
                !domainName ||
                !managementHost ||
                !cspDomainType ||
                (selectedCredentialType === constants.OPTION_USE_EXISTING && !cspCredentialId) ||
                (selectedCredentialType === constants.OPTION_CREATE_NEW &&
                    (!cspCredentialName ||
                        (cspDomainType === constants.CSP_DOMAINS.AWS && (!accessKeyId || !secretKey)) ||
                        (cspDomainType === constants.CSP_DOMAINS.GCP && !gc_cred))) ||
                (createSnapshotCatalogPolicy &&
                    (!encryptionAlgorithmObj ||
                        ((label !== constants.PASSPHRASE_ENCRYPTION_ALGORITHMS.NONE && !passphrase) ||
                            passphrase.length < minPassphraseLength)))
            );
        }
    }

    save() {
        const { save } = this.props;

        save(this.state);
    }

    render() {
        const { clusterName, selectedOption } = this.state;
        const { cancel, cspsData, intl } = this.props;
        const { csps = [] } = cspsData || {};
        const { formatMessage } = intl;

        const disabled = this.disableSave();

        return (
            <div id="dialogCreateCluster" className="content-flex-column pad-15-t pad-20-l">
                <div className="content-flex-row-centered">
                    <div className="dialog-title">{formatMessage(clusterMsgs.dialogTitle)}</div>
                    <SelectRadios
                        id="dialogCreateClusterRadios"
                        name="selectedOption"
                        onChange={this.handleChange}
                        options={[
                            {
                                testid: 'dialog-create-cluster-use-existing',
                                disabled: csps.length < 1,
                                id: constants.OPTION_USE_EXISTING,
                                label: formatMessage(clusterMsgs.useExistingDomain),
                            },
                            {
                                testid: 'dialog-create-cluster-new',
                                id: constants.OPTION_CREATE_NEW,
                                label: formatMessage(clusterMsgs.createNewDomain),
                            },
                        ]}
                        selectedId={selectedOption}
                    />
                    <div className="mr10" id="dialog-save-exit">
                        <ButtonAction
                            btnUp={btnAltSaveUp}
                            btnHov={btnAltSaveHov}
                            btnDisable={btnAltSaveDisable}
                            disabled={disabled}
                            id="dialogCreateClusterSave"
                            onClick={this.save}
                        />
                        <ButtonAction
                            btnUp={btnCancelUp}
                            btnHov={btnCancelHov}
                            id="dialogCreateClusterCancel"
                            onClick={cancel}
                        />
                    </div>
                </div>
                <div className="content-flex-row pad-20-t">
                    <div className="content-flex-column-left">
                        <FieldGroup
                            className="field-group-left"
                            label={formatMessage(clusterMsgs.clusterNameLabel)}
                            name="clusterName"
                            onChange={this.handleChange}
                            placeholder={formatMessage(clusterMsgs.enterNamePlaceholder)}
                            type="input"
                            value={clusterName}
                        />
                    </div>
                </div>
                <div className="divider-horizontal-margins" />
                {selectedOption === constants.OPTION_USE_EXISTING ? this.renderUseExistingCSP() : null}
                {selectedOption === constants.OPTION_CREATE_NEW ? this.renderCreateNewCSP() : null}
            </div>
        );
    }
}

DialogCreateCluster.propTypes = {
    cancel: PropTypes.func,
    createSnapshotCatalogPolicy: PropTypes.bool,
    cspCredentials: PropTypes.array,
    cspsData: PropTypes.object,
    getSystemHostname: PropTypes.func,
    intl: intlShape.isRequired,
    protectionDomainMetadataData: PropTypes.object,
    save: PropTypes.func,
    systemData: PropTypes.object,
};

export default injectIntl(DialogCreateCluster);
