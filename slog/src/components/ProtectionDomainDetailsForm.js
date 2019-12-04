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
import { Button } from 'react-bootstrap';

import ModalInfo from './ModalInfo';
import { messages } from '../messages/Messages';
import { accountMsgs } from '../messages/Account';

class ProtectionDomainDetailsForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showCopied: false,
        };

        this.textCopyDialogRef = React.createRef();
        this.handleClick = this.handleClick.bind(this);

        this.copyTimeout = null;
    }

    componentWillUnmount() {
        clearTimeout(this.copyTimeout);
    }

    handleClick() {
        this.textCopyDialogRef.current.select();
        document.execCommand('copy');

        this.setState({ showCopied: true });
        this.copyTimeout = setTimeout(() => {
            this.setState({ showCopied: false });
        }, 3000);
    }

    render() {
        const { closeModal, config, intl, values } = this.props;
        const { snapshotCatalogCreated, protectionDomain } = values || {};
        const { bucketName, encryptionAlgorithm, encryptionPassphrase, id, name, region } = protectionDomain || {};

        const { info } = config || {};
        const { formatMessage } = intl;
        const { showCopied } = this.state;

        const { value } = encryptionPassphrase || {};

        // generate the information they need to stash away
        const summaryText = `${formatMessage(
            accountMsgs.protectionInformationDialogSummaryName
        )}: ${name}\n${formatMessage(accountMsgs.protectionInformationDialogSummaryId)}: ${id}\n${formatMessage(
            accountMsgs.protectionInformationDialogSummaryRegion
        )}: ${region}\n${formatMessage(
            accountMsgs.protectionInformationDialogSummaryBucketName
        )}: ${bucketName}\n${formatMessage(
            accountMsgs.protectionInformationDialogSummaryAlgorithm
        )}: ${encryptionAlgorithm}\n${formatMessage(
            accountMsgs.protectionInformationDialogSummaryPassphrase
        )}: ${value}`;

        return (
            <div>
                <ModalInfo>
                    {info || (
                        <div>
                            {snapshotCatalogCreated ? (
                                <div className="mb10">
                                    {formatMessage(accountMsgs.protectionInformationDialogSnapshotCatalog)}
                                </div>
                            ) : (
                                ''
                            )}
                            {formatMessage(accountMsgs.protectionInformationDialogInfo)}
                        </div>
                    )}
                </ModalInfo>
                <div className="vs-yaml-textarea-container">
                    <textarea className="vs-yaml-textarea" readOnly ref={this.textCopyDialogRef} value={summaryText} />
                </div>
                <div className="vs-yaml-footer">
                    {showCopied ? (
                        <Button bsStyle="success" className="btn-copy">
                            <i className="fa fa-check mr20" aria-hidden="true" />
                            {formatMessage(messages.copied)}
                        </Button>
                    ) : (
                        <Button bsStyle="primary" className="btn-copy" onClick={this.handleClick}>
                            {formatMessage(messages.copyToClipboard)}
                        </Button>
                    )}
                    <Button onClick={closeModal}>{formatMessage(messages.close)}</Button>
                </div>
            </div>
        );
    }
}

ProtectionDomainDetailsForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object,
    intl: intlShape.isRequired,
    values: PropTypes.shape({
        k8sPvcYaml: PropTypes.object,
    }),
};

export default injectIntl(ProtectionDomainDetailsForm);
