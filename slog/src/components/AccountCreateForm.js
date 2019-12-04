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
import SelectTags from './SelectTags';
import { accountMsgs } from '../messages/Account';
import { messages } from '../messages/Messages';

import {
    getAccountAdminRoleId,
    getAccountUserRoleID,
    getSystemAdminRoleID,
    getTenantRoleId,
    isSystemAdmin,
    isTenantAdmin,
} from '../containers/userAccountUtils';

import './accounts.css';

class AccountCreateForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            admins: [],
            description: '',
            disabled: false,
            name: '',
            tags: [],
            tenants: [],
            users: [],
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAdmin = this.handleChangeAdmin.bind(this);
        this.handleChangeTags = this.handleChangeTags.bind(this);
        this.handleChangeUser = this.handleChangeUser.bind(this);
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
        const { admins = [], description, disabled, name, tags, tenants = [], users = [] } = this.state;

        const missingRequired =
            name.length < 1 ||
            (this.isSystemAdmin() || this.isEditSystemOrTenantAdmin() ? tenants.length < 1 : admins.length < 1);

        if (edit) {
            return (
                (_.isEqual(tags, edit._original.tags) &&
                    description === edit._original.description &&
                    disabled === edit._original.disabled &&
                    name === edit._original.name &&
                    _.isEqual(users, edit._original.users) &&
                    _.isEqual(admins, edit._original.admins) &&
                    _.isEqual(tenants, edit._original.tenants)) ||
                missingRequired
            );
        }

        return missingRequired;
    }

    getRoleIds() {
        const { values } = this.props;
        const { edit, user } = values || {};
        const { _original } = edit || {};
        const { userRoles = {} } = _original || {};
        const { meta } = user || {};
        const { id } = meta || {};

        const roleIds =
            Object.keys(userRoles)
                .filter(userId => userId === id)
                .map(userId => {
                    const { roleId } = userRoles[userId] || {};

                    return roleId;
                }) || [];

        return roleIds;
    }

    getUserRoles() {
        const { values } = this.props;
        const { rolesData } = values || {};
        const { admins = [], tenants = [], users = [] } = this.state;

        const userRoles = {};

        if (Array.isArray(tenants)) {
            tenants.forEach(tenant => {
                userRoles[tenant] = {
                    roleId: this.isEditSystemAdmin() ? getSystemAdminRoleID(rolesData) : getTenantRoleId(rolesData),
                };
            });
        }
        if (Array.isArray(admins)) {
            admins.forEach(admin => {
                userRoles[admin] = {
                    roleId: getAccountAdminRoleId(rolesData),
                };
            });
        }
        if (Array.isArray(users)) {
            users.forEach(user => {
                userRoles[user] = {
                    roleId: getAccountUserRoleID(rolesData),
                };
            });
        }

        return userRoles;
    }

    handleChange(name, value) {
        if (name) {
            this.setState({ [name]: value });
        }
    }

    handleChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ tags: value });
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

        if (this.isSystemAdmin() || this.isEditSystemOrTenantAdmin()) {
            this.setState({ tenants: admins });
        } else {
            this.setState({ admins });
        }
    }

    handleCreateSubmit(event) {
        event.preventDefault();

        const { closeModal, config, values } = this.props;
        const { patchAccount, postAccount } = config;
        const { edit, rolesData, user } = values || {};
        const { admins, description, disabled, name, tags, tenants, users } = this.state;

        closeModal();

        if (edit) {
            const params = {
                ...(name !== edit.name && { name }),
                ...((users !== edit.users || admins !== edit.admins || tenants !== edit.tenants) && {
                    userRoles: this.getUserRoles(),
                }),
                ...(description !== (edit.description || '') && { description }),
                ...(!_.isEqual(tags, edit.tags) && { tags }),
                ...(disabled !== (edit._original.disabled || false) && { disabled }),
            };
            patchAccount(edit.id, params);
        } else {
            const tenantId = isTenantAdmin(user, rolesData) ? user.meta.id : null;
            postAccount(name, this.getUserRoles(), description, tags, disabled, tenantId);
        }
    }

    isEditSystemAdmin() {
        const { values } = this.props;
        const { rolesData } = values || {};
        const roleIds = this.getRoleIds();

        return roleIds.find(roleId => roleId === getSystemAdminRoleID(rolesData));
    }

    isEditSystemOrTenantAdmin() {
        const { values } = this.props;
        const { rolesData } = values || {};
        const roleIds = this.getRoleIds();

        return roleIds.find(
            roleId => roleId === getSystemAdminRoleID(rolesData) || roleId === getTenantRoleId(rolesData)
        );
    }

    isSystemAdmin() {
        const { values } = this.props;
        const { rolesData, user } = values || {};

        return isSystemAdmin(user, rolesData);
    }

    render() {
        const { closeModal, intl, values } = this.props;
        const { edit } = values || {};
        const { _original } = edit || {};
        const { tags } = _original || {};
        const { admins, description, name, tenants, users } = this.state;
        const { formatMessage } = intl;

        const isEditSystemAdmin = this.isEditSystemAdmin();
        const isEditSystemOrTenantAdmin = this.isEditSystemOrTenantAdmin();
        const isSystemAdmin = this.isSystemAdmin();

        return (
            <div className="account-create-form">
                <div className="modalContent">
                    <FieldGroup
                        id="accountCreateFormName"
                        label={formatMessage(accountMsgs.nameLabel)}
                        name="name"
                        onChange={this.handleChange}
                        placeholder={formatMessage(accountMsgs.namePlaceholder)}
                        type="string"
                        value={name}
                    />
                    {isSystemAdmin || isEditSystemOrTenantAdmin ? (
                        <FieldGroup
                            inputComponent={
                                <SelectUsersContainer
                                    idExtension="accountsAdmins"
                                    existing={tenants}
                                    onChangeUser={this.handleChangeAdmin}
                                    isMulti={true}
                                    isRequired
                                />
                            }
                            label={
                                isEditSystemAdmin
                                    ? formatMessage(accountMsgs.systemAdminLabel)
                                    : formatMessage(accountMsgs.tenantAdminLabel)
                            }
                        />
                    ) : (
                        <FieldGroup
                            inputComponent={
                                <SelectUsersContainer
                                    idExtension="accountsAdmins"
                                    existing={admins}
                                    onChangeUser={this.handleChangeAdmin}
                                    isMulti={true}
                                    isRequired
                                />
                            }
                            label={formatMessage(accountMsgs.accountAdminLabel)}
                        />
                    )}
                    {isSystemAdmin || isEditSystemOrTenantAdmin ? null : (
                        <FieldGroup
                            inputComponent={
                                <SelectUsersContainer
                                    idExtension="accountsUsers"
                                    existing={users}
                                    onChangeUser={this.handleChangeUser}
                                    isMulti={true}
                                />
                            }
                            label={formatMessage(accountMsgs.usersLabel)}
                        />
                    )}
                    <FieldGroup
                        inputComponent={<SelectTags onChange={this.handleChangeTags} tags={tags} />}
                        label={formatMessage(accountMsgs.tagsLabel)}
                    />
                    <FieldGroup
                        label={formatMessage(accountMsgs.descriptionLabel)}
                        name="description"
                        onChange={this.handleChange}
                        placeholder={formatMessage(accountMsgs.descriptionPlaceholder)}
                        type="textarea"
                        value={description}
                    />
                </div>
                <div className="modal-footer">
                    <Button
                        id="accountCreateFormSubmit"
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

AccountCreateForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(AccountCreateForm);
