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

import FieldGroup from '../components/FieldGroup';
import Loader from '../components/Loader';
import SelectOptions from '../components/SelectOptions';
import { clusterMsgs } from '../messages/Cluster';
import { messages } from '../messages/Messages';
import '../styles.css';

class MountVolumeForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nodeId: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    disableSubmit() {
        const { nodeId } = this.state;
        return !nodeId;
    }

    handleChange(selectedItem) {
        const { value = '' } = selectedItem || {};
        this.setState({ nodeId: value });
    }

    handleSubmit() {
        const { closeModal, config, values } = this.props;
        const { mountVolumeSeries } = config || {};
        const { volume } = values || {};
        const { id, name } = volume || {};
        const { nodeId } = this.state;

        closeModal();

        mountVolumeSeries(id, nodeId, name);
    }

    renderFetchStatus() {
        const { values } = this.props;
        const { clustersData = {} } = values || {};

        if (clustersData.loading) {
            return <Loader />;
        }
    }

    render() {
        const { closeModal, intl } = this.props;
        const { formatMessage } = intl;
        const { values } = this.props;
        const { clustersData } = values || {};
        const { clusters = [] } = clustersData || {};

        const nodeOptions = [];
        clusters.forEach(cluster => {
            const { name: clusterName, nodes = [] } = cluster || {};
            nodes.forEach(node => {
                const { meta, name } = node || {};
                const { id } = meta || {};

                if (!id) {
                    return null;
                }

                nodeOptions.push({ label: `[${clusterName}] ${name}`, value: id });
            });
        });

        return (
            <div className="volume-mount-form">
                {this.renderFetchStatus()}
                <div className="modalContent" onSubmit={this.handleCreateSubmit}>
                    <FieldGroup
                        inputComponent={
                            <SelectOptions id="select-nodes" onChange={this.handleChange} options={nodeOptions} />
                        }
                        label={formatMessage(clusterMsgs.tableNode)}
                    />
                </div>
                <div className="modal-footer">
                    <Button
                        id="clusterCreateSubmit"
                        bsStyle="primary"
                        disabled={this.disableSubmit()}
                        onClick={this.handleSubmit}
                        type="submit"
                    >
                        {formatMessage(messages.submit)}
                    </Button>
                    <Button onClick={closeModal}>{formatMessage(messages.cancel)}</Button>
                </div>
            </div>
        );
    }
}

MountVolumeForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(MountVolumeForm);
