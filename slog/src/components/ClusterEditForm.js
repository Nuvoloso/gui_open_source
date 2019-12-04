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
import _ from 'lodash';
import { Button, ButtonToolbar, Form, FormControl, Modal } from 'react-bootstrap';

import FieldGroupHorizontal from './FieldGroupHorizontal';
import Loader from './Loader';
import SelectTags from './SelectTags';
import { messages } from '../messages/Messages';
import { clusterMsgs } from '../messages/Cluster';
import '../styles.css';

/**
 * This form is only for editing.  Clusters are not created manually by the user.
 * clusterAttributes are not presented yet but are included in the state in case we want to
 * allow presentation/editing
 */
class ClusterEditForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cspDomainId: '',
            description: '',
            name: '',
            tags: [],
            clusterAttributes: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
    }

    componentDidMount() {
        const { values } = this.props;
        const { edit } = values || {};

        this.setState({ ...edit });

        this.name.focus();
    }

    disableSubmit() {
        const { values } = this.props;
        const { edit } = values || {};
        const { name, description, tags } = this.state;

        // compare what is editable on the form
        return (
            name === edit._original.name &&
            description === edit._original.description &&
            _.isEqual(tags, edit._original.tags)
        );
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleEditSubmit(event) {
        event.preventDefault();

        const { closeModal, config, clustersData, values } = this.props;
        const { edit } = values || {};
        const { patchCluster } = config;
        const { cspDomainId, description, name, tags } = this.state;

        const { clusters = [] } = clustersData || {};
        const { cspDomainName } = clusters.find(cluster => {
            return cluster.cspDomainId === cspDomainId;
        });

        closeModal();

        patchCluster(edit.id, cspDomainName, {
            ...(description !== edit.description && { description }),
            ...(name !== edit.name && { name }),
            ...(!_.isEqual(tags, edit.tags) && { tags }),
        });
    }

    renderFetchStatus() {
        const { clustersData = {} } = this.props;

        if (clustersData.loading) {
            return <Loader />;
        } else if (clustersData.error) {
            return <div style={{ color: 'red' }}>{clustersData.error}</div>;
        }
    }

    render() {
        const { closeModal, intl, values } = this.props;
        const { edit } = values || {};
        const { _original } = edit || {};
        const { tags } = _original || {};
        const { formatMessage } = intl;

        const { description, name } = this.state;

        return (
            <div>
                <Form className="modalContent" horizontal onSubmit={this.handleEditSubmit}>
                    <FieldGroupHorizontal label={formatMessage(clusterMsgs.nameLabel)}>
                        <FormControl
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
                    <FieldGroupHorizontal label={formatMessage(clusterMsgs.descriptionLabel)}>
                        <FormControl
                            className="form-textarea"
                            componentClass="textarea"
                            name="description"
                            onChange={this.handleChange}
                            placeholder={formatMessage(clusterMsgs.descriptionPlaceholder)}
                            value={description}
                        />
                    </FieldGroupHorizontal>
                    <FieldGroupHorizontal label={formatMessage(clusterMsgs.tagsLabel)}>
                        <SelectTags onChange={this.handleChange} tags={tags} />
                    </FieldGroupHorizontal>
                    <Modal.Footer>
                        <ButtonToolbar>
                            <Button
                                bsStyle="primary"
                                className="pull-right"
                                disabled={this.disableSubmit()}
                                type="submit"
                            >
                                {formatMessage(messages.submit)}
                            </Button>
                            <Button bsStyle="link" className="pull-right" onClick={closeModal}>
                                {formatMessage(messages.cancel)}
                            </Button>
                        </ButtonToolbar>
                    </Modal.Footer>
                </Form>
            </div>
        );
    }
}

ClusterEditForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    clustersData: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

function mapStateToProps(state) {
    const { clustersData } = state;
    return {
        clustersData,
    };
}

export default connect(mapStateToProps)(injectIntl(ClusterEditForm));
