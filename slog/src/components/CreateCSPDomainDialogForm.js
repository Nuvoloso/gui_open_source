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
import Loader from './Loader';
import SelectOptions from './SelectOptions';
import SelectRadios from './SelectRadios';
import SelectTags from './SelectTags';
import CreateCSPCredentialDialogForm from './CreateCSPCredentialDialogForm';

import { clusterMsgs } from '../messages/Cluster';
import * as constants from '../constants';

import './cspdomains.css';

class CreateCSPDomainDialogForm extends Component {
    componentDidMount() {
        const { getSystemHostname } = this.props;

        if (getSystemHostname) {
            getSystemHostname();
        }
    }

    componentDidUpdate(prevProps) {
        const { handleChange, systemData } = this.props;
        const { loadingHostname, systemHostname } = systemData || {};

        const { systemData: prevSystemData } = prevProps;
        const { loadingHostname: prevLoadingHostname } = prevSystemData || {};

        if (prevLoadingHostname && !loadingHostname && handleChange) {
            handleChange('managementHost', systemHostname);
        }
    }

    renderCredentialOptions() {
        const { cspCredentialId, cspCredentials = [], handleChangeCredential, intl } = this.props;
        const { name } = cspCredentials.find(c => c.meta.id === cspCredentialId) || {};
        const { formatMessage } = intl;
        const labelMinWidth = '150px';

        return (
            <FieldGroup
                inputComponent={
                    <SelectOptions
                        id="selectCredential"
                        initialValues={cspCredentialId ? { label: name, value: cspCredentialId } : null}
                        isClearable={false}
                        value={cspCredentialId}
                        options={cspCredentials.map(cspCredential => {
                            const { meta, name } = cspCredential || {};
                            const { id } = meta || {};

                            return { label: name, value: id };
                        })}
                        placeholder={formatMessage(clusterMsgs.selectCredentialPlaceholder)}
                        onChange={handleChangeCredential}
                    />
                }
                className="field-group-left"
                label={formatMessage(clusterMsgs.credentialLabel)}
                labelMinWidth={labelMinWidth}
            />
        );
    }

    renderCredentialSelect() {
        const { cspCredentials = [], handleChange, intl, selectedCredentialType } = this.props;
        const { formatMessage } = intl;

        return (
            <SelectRadios
                id="selectCredentialType"
                name="selectedCredentialType"
                onChange={handleChange}
                options={[
                    {
                        disabled: cspCredentials.length < 1,
                        id: constants.OPTION_USE_EXISTING,
                        label: formatMessage(clusterMsgs.useExistingCredential),
                        testid: 'select-credent-type-use-existing',
                    },
                    {
                        id: constants.OPTION_CREATE_NEW,
                        label: formatMessage(clusterMsgs.createNewCredential),
                        testid: 'select-credent-type-create-new',
                    },
                ]}
                selectedId={selectedCredentialType}
            />
        );
    }

    renderCSPOptions() {
        const {
            accessKeyId,
            accessRegion,
            accessZone,
            cspCredentialId,
            cspCredentialName,
            cspCredentials,
            cspDomainType,
            cspTags,
            description,
            domainName,
            gc_cred,
            handleChange,
            handleChangeCredential,
            handleChangeCSPTags,
            handleServiceProviderChange,
            managementHost,
            secretKey,
            selectedCredentialType,
        } = this.props;
        return (
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
                handleChange={handleChange}
                handleChangeCredential={handleChangeCredential}
                handleChangeCSPTags={handleChangeCSPTags}
                handleServiceProviderChange={handleServiceProviderChange}
                managementHost={managementHost}
                onChangeCsp={this.onChangeCsp}
                secretKey={secretKey}
                selectedCredentialType={selectedCredentialType}
            />
        );
    }

    renderKeyFields() {
        const { accessKeyId, cspCredentialName, handleChange, intl, secretKey } = this.props;
        const { formatMessage } = intl;

        return (
            <Fragment>
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

    renderOptionsAWS() {
        const { accessRegion, accessZone, handleChange, intl } = this.props;
        const { formatMessage } = intl;

        return (
            <Fragment>
                <FieldGroup
                    className="field-group-left"
                    label={formatMessage(clusterMsgs.accessRegionLabel)}
                    name="accessRegion"
                    onChange={handleChange}
                    placeholder={formatMessage(clusterMsgs.enterRegionPlaceholder)}
                    type="input"
                    value={accessRegion}
                />
                <FieldGroup
                    className="field-group-left"
                    label={formatMessage(clusterMsgs.accessZoneLabel)}
                    name="accessZone"
                    onChange={handleChange}
                    placeholder={formatMessage(clusterMsgs.enterZonePlaceholder)}
                    type="input"
                    value={accessZone}
                />
            </Fragment>
        );
    }

    renderOptionsGCP() {
        const { accessZone, handleChange, intl } = this.props;
        const { formatMessage } = intl;

        return (
            <FieldGroup
                className="field-group-left"
                label={formatMessage(clusterMsgs.zoneLabel)}
                name="accessZone"
                onChange={handleChange}
                placeholder={formatMessage(clusterMsgs.enterZonePlaceholder)}
                type="input"
                value={accessZone}
            />
        );
    }

    renderOptionsAzure() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return <div>{formatMessage(clusterMsgs.notSupported)}</div>;
    }

    renderProviderOptions() {
        const { cspDomainType, intl } = this.props;
        const { formatMessage } = intl;

        switch (cspDomainType) {
            case constants.CSP_DOMAINS.AWS:
                return this.renderOptionsAWS();

            case constants.CSP_DOMAINS.GCP:
                return this.renderOptionsGCP();

            case constants.CSP_DOMAINS.AZURE:
                return this.renderOptionsAzure();

            default:
                return <div>{formatMessage(clusterMsgs.unkownMessage)}</div>;
        }
    }

    render() {
        const {
            createSnapshotCatalogPolicy,
            cspDomainType,
            cspTags,
            description,
            domainName,
            encryptionAlgorithmObj,
            handleChange,
            handleChangeAlgorithm,
            handleChangeCSPTags,
            handleServiceProviderChange,
            intl,
            managementHost,
            minPassphraseLength,
            passphrase,
            protectionDomainMetadataData = {},
            selectedCredentialType,
            systemData,
        } = this.props;
        const { formatMessage } = intl;
        const { loadingHostname } = systemData || {};
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const { encryptionAlgorithm: label = '' } = encryptionAlgorithmObj || {};
        const initialValues = encryptionAlgorithmObj ? [{ value: encryptionAlgorithmObj, label }] : null;
        const labelMinWidth = '150px';

        return (
            <Fragment>
                {loadingHostname ? <Loader /> : null}
                <div className="content-flex-row  pad-10-t">
                    <div className="content-flex-column-left pad-20-t">
                        <FieldGroup
                            className="field-group-left"
                            label={formatMessage(clusterMsgs.domainNameLabel)}
                            name="domainName"
                            onChange={handleChange}
                            placeholder={formatMessage(clusterMsgs.enterNamePlaceholder)}
                            type="input"
                            value={domainName}
                        />
                        <FieldGroup
                            inputComponent={
                                <SelectOptions
                                    id="selectProvider"
                                    isClearable={false}
                                    value={cspDomainType}
                                    initialValues={this.getServiceProvidersInitial()}
                                    options={this.getServiceProviders()}
                                    placeholder={formatMessage(clusterMsgs.selectProviderPlaceholder)}
                                    onChange={handleServiceProviderChange}
                                />
                            }
                            className="field-group-left"
                            label={formatMessage(clusterMsgs.serviceProviderLabel)}
                        />
                        {this.renderProviderOptions()}
                    </div>
                    <div className="content-flex-column-left pad-20-t">
                        <FieldGroup
                            className="field-group-left"
                            label={formatMessage(clusterMsgs.managementHostLabel)}
                            labelMinWidth={labelMinWidth}
                            name="managementHost"
                            onChange={handleChange}
                            placeholder={formatMessage(clusterMsgs.enterHostPlaceholder)}
                            type="input"
                            value={managementHost}
                        />
                        {createSnapshotCatalogPolicy ? (
                            <Fragment>
                                <FieldGroup
                                    className="field-group-left"
                                    inputComponent={
                                        <SelectOptions
                                            id="createProtectionDialogFormEncryption"
                                            initialValues={initialValues}
                                            isLoading={protectionDomainMetadataData.loading}
                                            isClearable={false}
                                            onChange={handleChangeAlgorithm}
                                            options={protectionDomainMetadata
                                                .filter(pdm => {
                                                    const { encryptionAlgorithm } = pdm;
                                                    return (
                                                        encryptionAlgorithm !==
                                                        constants.PASSPHRASE_ENCRYPTION_ALGORITHMS.NONE
                                                    );
                                                })
                                                .map(pdm => {
                                                    const { encryptionAlgorithm = '' } = pdm;
                                                    return { value: pdm, label: encryptionAlgorithm };
                                                })}
                                            value={{ value: encryptionAlgorithmObj }}
                                        />
                                    }
                                    label={formatMessage(clusterMsgs.createProtectionDialogFormEncryptionLabel)}
                                    labelMinWidth={labelMinWidth}
                                />
                                <FieldGroup
                                    className="field-group-left"
                                    label={formatMessage(clusterMsgs.protectionPassword)}
                                    labelMinWidth={labelMinWidth}
                                    name="passphrase"
                                    onChange={handleChange}
                                    placeholder={formatMessage(clusterMsgs.protectionPasswordPlaceholder, {
                                        minPassphraseLength,
                                    })}
                                    type="password"
                                    value={passphrase}
                                />
                            </Fragment>
                        ) : null}
                        {this.renderCredentialSelect()}
                        {selectedCredentialType === constants.OPTION_USE_EXISTING
                            ? this.renderCredentialOptions()
                            : this.renderCSPOptions()}
                    </div>
                </div>
                <div className="content-flex-row">
                    <div className="content-flex-column-left pad-20-t">
                        <FieldGroup
                            className="field-group-left"
                            name="cspTags"
                            inputComponent={<SelectTags onChange={handleChangeCSPTags} tags={cspTags} />}
                            label={formatMessage(clusterMsgs.cspTags)}
                        />
                    </div>
                    <div className="content-flex-column-left pad-20-t">
                        <FieldGroup
                            className="field-group-left"
                            label={formatMessage(clusterMsgs.cspDescription)}
                            name="cspDescription"
                            onChange={handleChange}
                            placeholder={formatMessage(clusterMsgs.descriptionPlaceholder)}
                            type="textarea"
                            value={description}
                        />
                    </div>
                </div>
            </Fragment>
        );
    }
}

CreateCSPDomainDialogForm.propTypes = {
    accessKeyId: PropTypes.string,
    accessRegion: PropTypes.string,
    accessZone: PropTypes.string,
    createSnapshotCatalogPolicy: PropTypes.bool,
    cspCredentialId: PropTypes.string,
    cspCredentialName: PropTypes.string,
    cspCredentials: PropTypes.array,
    cspDomainType: PropTypes.string,
    cspTags: PropTypes.array,
    description: PropTypes.string,
    domainName: PropTypes.string,
    encryptionAlgorithmObj: PropTypes.object,
    gc_cred: PropTypes.string,
    getSystemHostname: PropTypes.func,
    handleChange: PropTypes.func,
    handleChangeAlgorithm: PropTypes.func,
    handleChangeCredential: PropTypes.func,
    handleChangeCSPTags: PropTypes.func,
    handleServiceProviderChange: PropTypes.func,
    intl: intlShape.isRequired,
    managementHost: PropTypes.string,
    minPassphraseLength: PropTypes.number,
    passphrase: PropTypes.string,
    protectionDomainMetadataData: PropTypes.object,
    secretKey: PropTypes.string,
    selectedCredentialType: PropTypes.string,
    systemData: PropTypes.object,
};

export default injectIntl(CreateCSPDomainDialogForm);
