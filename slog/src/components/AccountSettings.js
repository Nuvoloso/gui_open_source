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
import _ from 'lodash';

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import SelectTags from './SelectTags';

import { accountMsgs } from '../messages/Account';
import { renderTags } from './utils';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import pencil from '../pencil.svg';
import pencilUp from '../pencil-up.svg';

class AccountSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            editDescription: '',
            editName: '',
            editTags: [],
        };

        this.handleClickEdit = this.handleClickEdit.bind(this);
        this.handleClickSave = this.handleClickSave.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeTags = this.handleChangeTags.bind(this);
    }

    componentDidMount() {
        const { account } = this.props;
        const { description: editDescription = '', name: editName = '', tags: editTags = [] } = account || {};

        this.setState({ editDescription, editName, editTags });
    }

    handleChange(name, value) {
        this.setState({ [name]: value });
    }

    handleChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};

        this.setState({ editTags: value });
    }

    handleClickEdit() {
        const { edit } = this.state;

        this.setState({ edit: !edit });
    }

    handleClickSave() {
        const { account = {}, saveSettings } = this.props;
        const { meta } = account;
        const { id } = meta;
        const { edit, editDescription, editName, editTags } = this.state;

        if (saveSettings) {
            saveSettings(id, { description: editDescription, name: editName, tags: editTags });
        }

        this.setState({ edit: !edit, editDescription: '', editName: '', editTags: [] });
    }

    isDisabled() {
        const { account = {} } = this.props;
        const { edit, description: editDescription, name: editName, tags: editTags } = this.state;
        return !(
            edit &&
            (editDescription !== account.description || editName !== account.name || !_.isEqual(editTags, account.tags))
        );
    }

    renderFetchStatus() {
        const { loading } = this.props;

        if (loading) {
            return <Loader />;
        }
    }

    render() {
        const { account, intl } = this.props;
        const { formatMessage } = intl;
        const { description, name, tags } = account || {};
        const { edit, editDescription, editName } = this.state;
        const disabled = this.isDisabled();

        return (
            <div className="dark resource-settings account-settings">
                <div className="resource-settings-header">
                    <div className="resource-settings-header-name">
                        {formatMessage(accountMsgs.settingsMetadataTitle)}
                    </div>
                    <div id="dialog-save-exit">
                        {edit ? (
                            <Fragment>
                                <ButtonAction
                                    btnUp={btnAltSaveUp}
                                    btnHov={btnAltSaveHov}
                                    btnDisable={btnAltSaveDisable}
                                    disabled={disabled}
                                    onClick={this.handleClickSave}
                                />
                                <ButtonAction
                                    btnUp={btnCancelUp}
                                    btnHov={btnCancelHov}
                                    onClick={this.handleClickEdit}
                                />
                            </Fragment>
                        ) : (
                            <ButtonAction btnUp={pencilUp} btnHov={pencil} onClick={this.handleClickEdit} />
                        )}
                    </div>
                </div>
                <div className="resource-settings-row">
                    <div className="resource-settings-col-1">
                        <FieldGroup
                            label={formatMessage(accountMsgs.nameLabel)}
                            name="editName"
                            onChange={this.handleChange}
                            placeholder={formatMessage(accountMsgs.namePlaceholder)}
                            styleInputWidth="300px"
                            type={edit ? 'text' : 'static'}
                            value={edit ? editName : name}
                        />
                    </div>
                    <div className="resource-settings-col-2">
                        <FieldGroup
                            label={formatMessage(accountMsgs.descriptionLabel)}
                            name="editDescription"
                            onChange={this.handleChange}
                            placeholder={formatMessage(accountMsgs.descriptionPlaceholder)}
                            styleInputWidth="300px"
                            type={edit ? 'textarea' : 'static'}
                            value={edit ? editDescription : description}
                        />
                    </div>
                    <div className="resource-settings-col-3">
                        <FieldGroup
                            inputComponent={<SelectTags onChange={this.handleChangeTags} tags={tags} />}
                            label={formatMessage(accountMsgs.tagsLabel)}
                            name="editTags"
                            type={edit ? null : 'static'}
                            value={renderTags(tags)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

AccountSettings.propTypes = {
    account: PropTypes.object,
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
    saveSettings: PropTypes.func,
};

export default injectIntl(AccountSettings);
