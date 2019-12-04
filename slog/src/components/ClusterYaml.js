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
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

import ModalInfo from './ModalInfo';
import { messages } from '../messages/Messages';
import { clusterMsgs } from '../messages/Cluster';
import Loader from './Loader';

import './volumes.css';

class ClusterYaml extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showCopied: false,
        };

        this.clusterTextArea = React.createRef();
        this.handleClick = this.handleClick.bind(this);

        this.copyTimeout = null;
    }

    componentWillUnmount() {
        clearTimeout(this.copyTimeout);
    }

    handleClick() {
        this.clusterTextArea.current.select();
        document.execCommand('copy');

        this.setState({ showCopied: true });
        this.copyTimeout = setTimeout(() => {
            this.setState({ showCopied: false });
        }, 3000);
    }

    isError() {
        const { clusterAccountSecretData = {}, config, orchestratorDeploymentData = {} } = this.props;
        const { accountSecretMode } = config || {};

        return accountSecretMode ? clusterAccountSecretData.error : orchestratorDeploymentData.error;
    }

    isLoading() {
        const { clusterAccountSecretData = {}, config, orchestratorDeploymentData = {} } = this.props;
        const { accountSecretMode } = config || {};

        return (accountSecretMode && clusterAccountSecretData.loading) || orchestratorDeploymentData.loading;
    }

    renderConfigFile() {
        const { clusterAccountSecretData, config, orchestratorDeploymentData } = this.props;
        const { clusterAccountSecret } = clusterAccountSecretData || {};
        const { accountSecretMode } = config || {};
        const { deploymentConfigFile } = orchestratorDeploymentData || {};
        const { deployment } = deploymentConfigFile || {};

        if (this.isLoading()) {
            return null;
        }

        return (
            <Fragment>
                {this.renderInfo()}
                <div className="vs-yaml-textarea-container">
                    <textarea
                        className="vs-yaml-textarea"
                        ref={this.clusterTextArea}
                        defaultValue={accountSecretMode ? clusterAccountSecret : deployment}
                    />
                </div>
            </Fragment>
        );
    }

    renderError() {
        const { clusterAccountSecretData = {}, config, orchestratorDeploymentData = {}, intl } = this.props;
        const { accountSecretMode } = config || {};
        const { formatMessage } = intl;

        return (
            <div className="modal-error-box">
                <div className="modal-error-title">{formatMessage(clusterMsgs.yamlErrorMsg)}</div>
                <div className="modal-error-content">
                    {accountSecretMode ? clusterAccountSecretData.error : orchestratorDeploymentData.error}
                </div>
            </div>
        );
    }

    renderInfo() {
        const { config, intl } = this.props;
        const { info } = config || {};
        const { formatMessage } = intl;

        return (
            <ModalInfo>
                {info || (
                    <Fragment>
                        <div>{formatMessage(clusterMsgs.yamlTextReady)}</div>
                        <div>
                            {`${formatMessage(clusterMsgs.yamlTextReadyDirectionPrepend)} `}
                            <i>{formatMessage(clusterMsgs.yamlTextReadyCommand)}</i>
                            {` ${formatMessage(clusterMsgs.yamlTextReadyDirectionAppend)}`}
                        </div>
                    </Fragment>
                )}
            </ModalInfo>
        );
    }

    render() {
        const { closeModal, clusterAccountSecretData, config, orchestratorDeploymentData, intl } = this.props;
        const { clusterAccountSecret } = clusterAccountSecretData || {};
        const { accountSecretMode } = config || {};
        const { deploymentConfigFile } = orchestratorDeploymentData || {};
        const { deployment } = deploymentConfigFile || {};
        const { formatMessage } = intl;
        const { showCopied } = this.state;

        return (
            <div>
                {this.isLoading() ? <Loader /> : null}
                {this.isError() ? this.renderError() : this.renderConfigFile()}
                <div className="vs-yaml-footer">
                    {showCopied ? (
                        <Button bsStyle="success" className="btn-copy">
                            <i className="fa fa-check mr20" aria-hidden="true" />
                            {formatMessage(messages.copied)}
                        </Button>
                    ) : (
                        <Button
                            bsStyle="primary"
                            className="btn-copy"
                            disabled={accountSecretMode ? !clusterAccountSecret : !deployment}
                            onClick={this.handleClick}
                        >
                            {formatMessage(messages.copyToClipboard)}
                        </Button>
                    )}
                    <Button onClick={closeModal}>{formatMessage(messages.close)}</Button>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { clusterAccountSecretData, orchestratorDeploymentData } = state;
    return {
        clusterAccountSecretData,
        orchestratorDeploymentData,
    };
}

ClusterYaml.propTypes = {
    closeModal: PropTypes.func.isRequired,
    clusterAccountSecretData: PropTypes.object.isRequired,
    config: PropTypes.object,
    orchestratorDeploymentData: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
};

export default connect(mapStateToProps)(injectIntl(ClusterYaml));
