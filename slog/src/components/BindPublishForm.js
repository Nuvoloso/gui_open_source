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

import FieldGroup from './FieldGroup';
import SelectOptions from './SelectOptions';

import { messages } from '../messages/Messages';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';

class BindPublishForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            clusterId: '',
        };

        this.handleChangeCluster = this.handleChangeCluster.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    }

    disableSubmit() {
        const { clusterId } = this.state;

        return clusterId === '';
    }

    handleCreateSubmit(event) {
        event.preventDefault();

        const { closeModal, config, values } = this.props;
        const { volume } = values || {};
        const { handlePublish } = config || {};
        const { clusterId } = this.state;

        closeModal();

        if (handlePublish) {
            handlePublish(volume, clusterId);
        }
    }

    handleChangeCluster(item) {
        if (item) {
            this.setState({ clusterId: item.value });
        } else {
            this.setState({ clusterId: '' });
        }
    }

    render() {
        const { closeModal, intl, values } = this.props;
        const { clustersData } = values || {};
        const { clusters = [], loading } = clustersData || {};
        const { clusterId } = this.state;
        const { formatMessage } = intl;
        const cluster = clusters.find(cluster => cluster.meta.id === clusterId);
        const { meta, name } = cluster || {};
        const { id } = meta || {};
        const initialValues = cluster ? { value: id, label: name } : [];

        return (
            <div className="bind-publish-form">
                <div className="modalContent">
                    <FieldGroup
                        inputComponent={
                            <SelectOptions
                                existing={clusterId}
                                id="bindPublishDialog"
                                initialValues={initialValues}
                                isLoading={loading}
                                isClearable={false}
                                onChange={this.handleChangeCluster}
                                options={clusters.map(cluster => {
                                    const { meta, name } = cluster || {};
                                    const { id } = meta || {};
                                    return { value: id, label: name };
                                })}
                                placeholder={formatMessage(volumeSeriesMsgs.bindClusterPlaceholder)}
                                value={clusterId}
                            />
                        }
                        label={formatMessage(volumeSeriesMsgs.labelCluster)}
                    />
                </div>
                <div className="modal-footer">
                    <Button
                        bsStyle="primary"
                        disabled={this.disableSubmit()}
                        id="ConsistencyGroupsFormSubmit"
                        onClick={this.handleCreateSubmit}
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

BindPublishForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    handlePublish: PropTypes.func,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(BindPublishForm);
