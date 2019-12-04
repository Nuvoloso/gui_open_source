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
import _ from 'lodash';

import FieldGroup from './FieldGroup';
import SelectTags from './SelectTags';
import { messages } from '../messages/Messages';

class GroupsForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accountId: '',
            name: '',
            description: '',
            tags: [],
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAccount = this.handleChangeAccount.bind(this);
        this.handleChangeTags = this.handleChangeTags.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    }

    componentDidMount() {
        const { values } = this.props;
        const { edit } = values || {};

        if (edit) {
            const { _original } = edit;
            this.setState({
                accountId: _original.accountId,
                name: _original.name,
                description: _original.description,
                tags: _original.tags,
            });
        }
    }

    disableSubmit() {
        const { values } = this.props;
        const { edit } = values || {};
        const { accountId, name, description, tags } = this.state;

        const isMissingRequired = !name || name.length < 1;

        if (edit) {
            // compare what is editable on the form
            const { _original } = edit;

            return (
                isMissingRequired ||
                (accountId === _original.accountId &&
                    name === _original.name &&
                    description === _original.description &&
                    _.isEqual(tags, _original.tags))
            );
        }

        return isMissingRequired;
    }

    handleChange(name, value) {
        if (name) {
            this.setState({ [name]: value });
        }
    }

    handleChangeAccount(selectedItem) {
        if (selectedItem) {
            this.setState({ accountId: selectedItem.value });
        } else {
            this.setState({ accountId: '' });
        }
    }

    handleChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ tags: value });
    }

    handleCreateSubmit(event) {
        event.preventDefault();

        const { closeModal, config, values } = this.props;
        const { patchGroup, postGroup } = config;
        const { edit } = values || {};
        const { accountId, description, name, tags } = this.state;

        closeModal();

        if (edit) {
            const { _original } = edit;

            const params = {
                ...(name !== _original.name && { name }),
                ...(accountId !== _original.accountId && { accountId }),
                ...(description !== (_original.description || '') && { description }),
                ...(!_.isEqual(tags, _original.tags) && { tags }),
            };
            patchGroup(edit.id, params);
        } else {
            postGroup(name, description, tags);
        }
    }

    render() {
        const { closeModal, config, intl, values } = this.props;
        const { description, name } = this.state;
        const { formatMessage } = intl;
        const { id, namePlaceholder, descriptionPlaceholder } = config;
        const { edit } = values || {};
        const { _original } = edit || {};
        const { tags } = _original || {};

        return (
            <div className="group-create-form">
                <div className="modalContent">
                    <FieldGroup
                        id={id}
                        label={formatMessage(messages.nameLabel)}
                        name="name"
                        onChange={this.handleChange}
                        placeholder={namePlaceholder}
                        value={name}
                    />
                    <FieldGroup
                        inputComponent={<SelectTags onChange={this.handleChangeTags} tags={tags} />}
                        label={formatMessage(messages.tagsLabel)}
                    />
                    <FieldGroup
                        label={formatMessage(messages.descriptionLabel)}
                        name="description"
                        onChange={this.handleChange}
                        placeholder={descriptionPlaceholder}
                        type="textarea"
                        value={description}
                    />
                </div>
                <div className="modal-footer">
                    <Button
                        bsStyle="primary"
                        disabled={this.disableSubmit()}
                        id="groupsFormSubmit"
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

GroupsForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(GroupsForm);
