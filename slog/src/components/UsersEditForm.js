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
import SelectUsersContainer from '../containers/SelectUsersContainer';
import { accountMsgs } from '../messages/Account';
import { messages } from '../messages/Messages';

import { genUserRoles } from '../containers/userAccountUtils';

import './accounts.css';

class UsersEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            admins: [],
            users: [],
        };

        this.handleChangeUser = this.handleChangeUser.bind(this);
        this.handleChangeAdmin = this.handleChangeAdmin.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    }

    componentDidMount() {
        const { values } = this.props;
        const { edit } = values || {};

        if (edit) {
            this.setState({ ...edit });
        }
    }

    disableSubmit() {
        const { values } = this.props;
        const { edit } = values || {};
        const { admins, name, users } = this.state;

        if (edit) {
            let usersModified = false;
            let adminsModified = false;
            const { ..._original } = edit;
            usersModified = _.isEqual(users, _original.users);
            adminsModified = _.isEqual(admins, _original.admins);
            return usersModified && adminsModified && admins.length !== 0;
        }

        return name.length < 1 || admins.length === 0;
    }

    handleChangeUser(selectedItems) {
        const users = [];

        selectedItems.forEach(item => {
            users.push(item.value);
        });
        this.setState({ users });
    }

    handleChangeAdmin(selectedItems) {
        const admins = [];

        selectedItems.forEach(item => {
            admins.push(item.value);
        });
        this.setState({ admins });
    }

    handleCreateSubmit(event) {
        event.preventDefault();

        const { closeModal, config, values } = this.props;
        const { patchAccount } = config;
        const { edit, rolesData, user } = values || {};
        const { admins, users } = this.state;

        closeModal();

        const params = {
            ...((users !== edit.users || admins !== edit.admins) && {
                userRoles: genUserRoles(this.state.users, this.state.admins, user, rolesData),
            }),
        };
        patchAccount(edit.accountId, params);
    }

    render() {
        const { closeModal, intl } = this.props;
        const { admins, users } = this.state;
        const { formatMessage } = intl;

        return (
            <div className="account-create-form">
                <div className="modalContent">
                    <FieldGroup
                        inputComponent={
                            <SelectUsersContainer
                                existing={admins}
                                onChangeUser={this.handleChangeAdmin}
                                isMulti={true}
                                isRequired
                            />
                        }
                        label={formatMessage(accountMsgs.accountAdminLabel)}
                    />
                    <FieldGroup
                        inputComponent={
                            <SelectUsersContainer
                                existing={users}
                                onChangeUser={this.handleChangeUser}
                                isMulti={true}
                            />
                        }
                        label={formatMessage(accountMsgs.usersLabel)}
                    />
                </div>
                <div className="modal-footer">
                    <Button
                        id="usersEditForm"
                        bsStyle="primary"
                        disabled={this.disableSubmit()}
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

UsersEditForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(UsersEditForm);
