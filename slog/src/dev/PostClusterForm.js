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
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, ButtonToolbar, Form, FormControl, Modal } from 'react-bootstrap';

import FieldGroupHorizontal from '../components/FieldGroupHorizontal';
import Loader from '../components/Loader';
import { clusterMsgs } from '../messages/Cluster';
import { messages } from '../messages/Messages';
import '../styles.css';

class PostClusterForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cspDomainId: '',
            name: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    }

    disableSubmit() {
        const { cspDomainId, name } = this.state;

        return !cspDomainId || !name;
    }

    handleChange(e) {
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value });
    }

    handleCreateSubmit(event) {
        event.preventDefault();

        const { closeModal, config } = this.props;
        const { postCluster } = config;
        const { cspDomainId, name } = this.state;

        closeModal();

        if (postCluster) {
            postCluster(name, cspDomainId);
        }
    }

    renderCSPsOptions() {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { cspsData } = this.props;
        const { csps = [] } = cspsData || {};

        return [
            <option key="-1" value="">
                {formatMessage(clusterMsgs.cspDomainPlaceholder)}
            </option>,
            ...csps.map((csp, i) => {
                return (
                    <option key={i} value={csp.meta.id}>
                        {`${csp.name} (${csp.cspDomainType})`}
                    </option>
                );
            }),
        ];
    }

    renderFetchStatus() {
        const { cspsData = {} } = this.props;

        if (cspsData.loading) {
            return <Loader />;
        } else if (cspsData.error) {
            return <div style={{ color: 'red' }}>{cspsData.error}</div>;
        }
    }

    render() {
        const { closeModal, intl } = this.props;
        const { formatMessage } = intl;
        const { values } = this.props;
        const { edit } = values || {};
        const { name } = this.state;

        return (
            <div>
                <Form className="modalContent" horizontal onSubmit={this.handleCreateSubmit}>
                    <FieldGroupHorizontal label={formatMessage(clusterMsgs.cspDomainLabel)}>
                        {this.renderFetchStatus()}
                        <FormControl
                            id="clusterCreateCspDomainId"
                            componentClass="select"
                            disabled={edit}
                            inputRef={ref => {
                                this.cspsOptions = ref;
                            }}
                            name="cspDomainId"
                            onChange={this.handleChange}
                            placeholder=""
                        >
                            {this.renderCSPsOptions()}
                        </FormControl>
                    </FieldGroupHorizontal>
                    <FieldGroupHorizontal label={formatMessage(clusterMsgs.nameLabel)}>
                        <FormControl
                            id="clusterCreateName"
                            componentClass="input"
                            inputRef={ref => {
                                this.name = ref;
                            }}
                            name="name"
                            onChange={this.handleChange}
                            placeholder={formatMessage(clusterMsgs.namePlaceholder)}
                            value={name}
                        />
                    </FieldGroupHorizontal>
                    <Modal.Footer>
                        <ButtonToolbar>
                            <Button
                                id="clusterCreateSubmit"
                                bsStyle="primary"
                                className="pull-right"
                                disabled={this.disableSubmit()}
                                type="submit"
                            >
                                {formatMessage(messages.submit)}
                            </Button>
                            <Button bsStyle="link" className="pull-right" onClick={() => closeModal()}>
                                {formatMessage(messages.close)}
                            </Button>
                        </ButtonToolbar>
                    </Modal.Footer>
                </Form>
            </div>
        );
    }
}

PostClusterForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    orchestratorDeploymentData: PropTypes.object.isRequired,
    values: PropTypes.object,
};

function mapStateToProps(state) {
    const { cspsData, orchestratorDeploymentData, table } = state;
    return {
        cspsData,
        orchestratorDeploymentData,
        table,
    };
}

export default connect(mapStateToProps)(injectIntl(PostClusterForm));
