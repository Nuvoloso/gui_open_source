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

import { accountMsgs } from '../messages/Account';

import * as constants from '../constants';

import './cspdomains.css';

class CreateProtectionDomainDialogForm extends Component {
    render() {
        const {
            encryptionAlgorithmObj,
            handleChange,
            handleChangeAlgorithm,
            intl,
            minPassphraseLength,
            name,
            passphrase,
            passphraseDisabled,
            protectionDomainMetadataData,
        } = this.props;
        const { protectionDomainMetadata = [] } = protectionDomainMetadataData || {};
        const { formatMessage } = intl;

        const { encryptionAlgorithm: label = '' } = encryptionAlgorithmObj || {};
        const initialValues = [{ value: encryptionAlgorithmObj, label }];
        const labelMinWidth = '150px';

        return (
            <Fragment>
                <div className="content-flex-column pad-10-t">
                    <div className="dark content-flex-column-left pad-20-t">
                        <FieldGroup
                            className="field-group-left"
                            id="createProtectionDialogFormName"
                            label={formatMessage(accountMsgs.createProtectionDialogFormNameLabel)}
                            labelMinWidth={labelMinWidth}
                            name="name"
                            onChange={handleChange}
                            type="static"
                            value={name}
                        />

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
                                                encryptionAlgorithm !== constants.PASSPHRASE_ENCRYPTION_ALGORITHMS.NONE
                                            );
                                        })
                                        .map(pdm => {
                                            const { encryptionAlgorithm = '' } = pdm;
                                            return { value: pdm, label: encryptionAlgorithm };
                                        })}
                                    value={{ value: encryptionAlgorithmObj }}
                                />
                            }
                            label={formatMessage(accountMsgs.createProtectionDialogFormEncryptionLabel)}
                            labelMinWidth={labelMinWidth}
                        />
                        {!passphraseDisabled ? (
                            <FieldGroup
                                className="field-group-left"
                                id="createProtectionDialogFormPassphrase"
                                label={formatMessage(accountMsgs.createProtectionDialogFormPassphraseLabel)}
                                labelMinWidth={labelMinWidth}
                                name="passphrase"
                                onChange={handleChange}
                                placeholder={formatMessage(
                                    accountMsgs.createProtectionDialogFormPassphrasePlaceholder,
                                    { minPassphraseLength }
                                )}
                                type="password"
                                value={passphrase}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                </div>
            </Fragment>
        );
    }
}

CreateProtectionDomainDialogForm.propTypes = {
    encryptionAlgorithm: PropTypes.string,
    encryptionAlgorithmObj: PropTypes.object,
    handleChange: PropTypes.func,
    handleChangeAlgorithm: PropTypes.func,
    intl: intlShape.isRequired,
    minPassphraseLength: PropTypes.number,
    name: PropTypes.string,
    passphrase: PropTypes.string,
    passphraseDisabled: PropTypes.bool,
    protectionDomainMetadataData: PropTypes.object,
    save: PropTypes.func,
};

export default injectIntl(CreateProtectionDomainDialogForm);
