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
import { Button, ButtonToolbar, Form, FormControl, Modal } from 'react-bootstrap';

import FieldGroupHorizontal from '../components/FieldGroupHorizontal';
import { clusterMsgs } from '../messages/Cluster';
import { messages } from '../messages/Messages';
import '../styles.css';

class NodeForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            clusterId: '',
            name: '',
            nodeId: '',
            patchNodeBody: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const { clusterId } = this.state;
        const { clusterId: prevClusterId } = prevState;

        if (clusterId !== prevClusterId) {
            this.setState({ nodeId: '' });
        }
    }

    disableSubmit() {
        const { config } = this.props;
        const { deleteMode, updateMode } = config || {};
        const { clusterId, name, nodeId, patchNodeBody } = this.state;

        if (deleteMode) {
            return !clusterId || !nodeId;
        } else if (updateMode) {
            return !clusterId || !nodeId || !patchNodeBody;
        } else {
            return !clusterId || !name;
        }
    }

    handleChange(e) {
        e.preventDefault();
        this.setState({ [e.target.name]: e.target.value });
    }

    handleCreateSubmit(event) {
        event.preventDefault();

        const { closeModal, config } = this.props;
        const { deleteMode, deleteNode, patchNode, postNode, updateMode } = config;
        const { clusterId, name, nodeId, patchNodeBody } = this.state;

        closeModal();

        if (deleteMode && deleteNode) {
            deleteNode(nodeId, name);
        } else if (updateMode && patchNode) {
            patchNode(nodeId, patchNodeBody);
        } else if (postNode) {
            postNode(name, clusterId);
        }
    }

    renderClusterOptions() {
        const { values } = this.props;
        const { clusters = [] } = values || {};

        return [
            <option key={-1} value="">
                Select a cluster (required)
            </option>,
            ...clusters.map((cluster, i) => {
                return (
                    <option key={i} value={cluster.meta.id}>
                        {cluster.name}
                    </option>
                );
            }),
        ];
    }

    renderNodeOptions() {
        const { clusterId } = this.state;
        const { values } = this.props;
        const { clusters = [] } = values || {};

        const cluster = clusters.find(cluster => cluster.meta.id === clusterId);
        const { nodes = [] } = cluster || {};

        return [
            <option key={-1} value="">
                {!clusterId ? 'Select a cluster with nodes' : 'Select a node (required)'}
            </option>,
            ...nodes.map((node, i) => {
                return (
                    <option key={i} value={node.meta.id}>
                        {node.name}
                    </option>
                );
            }),
        ];
    }

    renderNodeBodyTextarea() {
        const { patchNodeBody } = this.state;

        return (
            <FormControl
                id="patchNodeBody"
                componentClass="textarea"
                inputRef={ref => {
                    this.patchNodeBodyTextarea = ref;
                }}
                name="patchNodeBody"
                onChange={this.handleChange}
                placeholder={`Enter JSON to be sent in PATCH request body, such as { "name": "new-name" }`}
                value={patchNodeBody}
            />
        );
    }

    render() {
        const { closeModal, config, intl } = this.props;
        const { deleteMode, updateMode } = config || {};
        const { formatMessage } = intl;
        const { name } = this.state;

        return (
            <div>
                <Form className="modalContent" horizontal onSubmit={this.handleCreateSubmit}>
                    <FieldGroupHorizontal label={formatMessage(clusterMsgs.clusterNameLabel)}>
                        <FormControl
                            id="nodeCreateClusterId"
                            componentClass="select"
                            inputRef={ref => {
                                this.clusterOptions = ref;
                            }}
                            name="clusterId"
                            onChange={this.handleChange}
                            placeholder=""
                        >
                            {this.renderClusterOptions()}
                        </FormControl>
                    </FieldGroupHorizontal>
                    <FieldGroupHorizontal label="Node Name">
                        {deleteMode || updateMode ? (
                            <FormControl
                                id="nodeDeleteId"
                                componentClass="select"
                                inputRef={ref => {
                                    this.nodeOptions = ref;
                                }}
                                name="nodeId"
                                onChange={this.handleChange}
                                placeholder=""
                            >
                                {this.renderNodeOptions()}
                            </FormControl>
                        ) : (
                            <FormControl
                                id="nodeCreateName"
                                componentClass="input"
                                inputRef={ref => {
                                    this.name = ref;
                                }}
                                name="name"
                                onChange={this.handleChange}
                                placeholder={formatMessage(clusterMsgs.namePlaceholder)}
                                value={name}
                            />
                        )}
                    </FieldGroupHorizontal>
                    {updateMode ? (
                        <FieldGroupHorizontal label="PATCH Node Request Body">
                            {this.renderNodeBodyTextarea()}
                        </FieldGroupHorizontal>
                    ) : null}
                    <Modal.Footer>
                        <ButtonToolbar>
                            <Button
                                id="nodeCreateSubmit"
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

NodeForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(NodeForm);
