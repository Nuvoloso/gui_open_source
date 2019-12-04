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

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import SelectOptions from './SelectOptions';
import SelectRadios from './SelectRadios';
import { getSystemAdminRoleID, getTenantRoleId } from '../containers/userAccountUtils';
import { userMsgs } from '../messages/User';
import * as constants from '../constants';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';

class UserCreateForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            disabled: false,
            name: '', // based on Table support, converts to authIdentifier
            password: '',
            roleId: '',
            selectedCreateOption: constants.OPTION_CREATE_NEW,
            selectedUserId: '',
            selectedUserName: '',
            userName: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeRole = this.handleChangeRole.bind(this);
        this.handleChangeUser = this.handleChangeUser.bind(this);
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
    }

    componentDidMount() {
        const { account, rolesData } = this.props;
        const { name, tenantAccountId } = account || {};

        if (!tenantAccountId) {
            if (name === constants.SYSTEM_ACCOUNT_NAME) {
                this.setState({ roleId: getSystemAdminRoleID(rolesData) });
            } else {
                this.setState({ roleId: getTenantRoleId(rolesData) });
            }
        }
    }

    disableSubmit() {
        const { account } = this.props;
        const { name, password, roleId, selectedCreateOption, selectedUserId } = this.state;

        if (account && !roleId) {
            return true;
        }

        if (selectedCreateOption === constants.OPTION_USE_EXISTING) {
            if (!selectedUserId) {
                return true;
            }
        }

        if (selectedCreateOption === constants.OPTION_CREATE_NEW) {
            if (name.length < 1 || password.length < 1) {
                return true;
            }
        }

        return false;
    }

    handleChange(name, value) {
        if (name) {
            this.setState({ [name]: value });
        }
    }

    handleChangeRole(selectedItem) {
        const { value } = selectedItem || {};
        this.setState({ roleId: value });
    }

    handleChangeUser(selectedUserOption = {}) {
        const { usersData } = this.props;
        const { users = [] } = usersData || {};

        const { value: selectedUserId } = selectedUserOption || {};
        this.setState({ selectedUserId });

        const user = users.find(user => {
            const { meta } = user || {};
            const { id } = meta || {};

            return id === selectedUserId;
        });
        const { profile } = user || {};
        const { userName } = profile || {};
        const { value: selectedUserName } = userName || {};

        this.setState({ selectedUserName });
    }

    handleCreateSubmit() {
        const { account, cancel, onSubmit } = this.props;
        const { meta } = account || {};
        const { id } = meta || {};
        const { disabled, name, password, roleId, selectedCreateOption, selectedUserId, userName } = this.state;

        if (onSubmit) {
            onSubmit(
                userName,
                name,
                password,
                disabled,
                id,
                roleId,
                selectedCreateOption === constants.OPTION_USE_EXISTING && selectedUserId
            );
            cancel();
        }
    }

    renderCreateOptions(usersFiltered = []) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <SelectRadios
                initialSelectedId={
                    usersFiltered.length > 0 ? constants.OPTION_USE_EXISTING : constants.OPTION_CREATE_NEW
                }
                name="selectedCreateOption"
                onChange={this.handleChange}
                options={[
                    {
                        disabled: usersFiltered.length < 1,
                        id: constants.OPTION_USE_EXISTING,
                        label: formatMessage(userMsgs.useExistingOption),
                    },
                    {
                        id: constants.OPTION_CREATE_NEW,
                        label: formatMessage(userMsgs.createNewOption),
                    },
                ]}
            />
        );
    }

    renderRoleSelect() {
        const { account, intl, rolesData } = this.props;
        const { name, tenantAccountId } = account || {};
        const { formatMessage } = intl;
        const { roles = [], loading } = rolesData || {};

        return (
            <FieldGroup
                id="userCreateFormRole"
                inputComponent={
                    <SelectOptions
                        id="userCreateFormRoleSelect"
                        loading={loading}
                        onChange={this.handleChangeRole}
                        options={roles
                            .filter(role => {
                                const { name } = role || {};

                                return (
                                    name === constants.ROLE_NAME_ACCOUNT_ADMIN ||
                                    name === constants.ROLE_NAME_ACCOUNT_USER
                                );
                            })
                            .map(role => {
                                const { meta, name } = role || {};
                                const { id } = meta || {};

                                return {
                                    label: name,
                                    value: id,
                                };
                            })}
                        placeholder={formatMessage(userMsgs.roleSelectPlaceholder)}
                    />
                }
                label={formatMessage(userMsgs.roleLabel)}
                name="role"
                type={tenantAccountId ? null : 'static'}
                value={
                    tenantAccountId
                        ? null
                        : name === constants.SYSTEM_ACCOUNT_NAME
                        ? constants.ROLE_NAME_SYSTEM_ADMIN
                        : constants.ROLE_NAME_TENANT_ADMIN
                }
            />
        );
    }

    render() {
        const { account, cancel, intl, title, usersData } = this.props;
        const { formatMessage } = intl;
        const { loading, users = [] } = usersData || {};
        const usersFiltered = users.filter(user => {
            const { meta } = user || {};
            const { id } = meta || {};

            const { userRoles = {} } = account || {};
            const foundUserRole = Object.keys(userRoles).find(userId => userId === id);

            return !foundUserRole;
        });
        const { name, password, selectedCreateOption, userName, selectedUserId, selectedUserName } = this.state;
        const selectedUser =
            usersFiltered.find(user => {
                const { meta } = user || {};
                const { id } = meta || {};

                return id === selectedUserId;
            }) || {};
        const disableSubmit = this.disableSubmit();

        return (
            <div className="user-create-form dark">
                <div className="collapsible-create-form-header">
                    <div>{title || formatMessage(userMsgs.createTitle)}</div>
                    <div className="dialog-save-exit-buttons">
                        <ButtonAction
                            btnUp={btnAltSaveUp}
                            btnHov={btnAltSaveHov}
                            btnDisable={btnAltSaveDisable}
                            disabled={disableSubmit}
                            id="userCreateFormSubmit"
                            onClick={this.handleCreateSubmit}
                        />
                        <ButtonAction
                            btnUp={btnCancelUp}
                            btnHov={btnCancelHov}
                            id="userCreateFormCancel"
                            onClick={cancel}
                        />
                    </div>
                </div>
                <div className="user-create-form-fields">
                    {usersData ? this.renderCreateOptions(usersFiltered) : null}
                    {selectedCreateOption === constants.OPTION_USE_EXISTING ? (
                        <FieldGroup
                            inputComponent={
                                <SelectOptions
                                    id="userSelect"
                                    initialValues={
                                        selectedUser
                                            ? {
                                                  label: selectedUser.authIdentifier,
                                                  value: selectedUserId,
                                              }
                                            : null
                                    }
                                    isLoading={loading}
                                    onChange={this.handleChangeUser}
                                    options={usersFiltered.map(user => {
                                        const { authIdentifier, meta } = user || {};
                                        const { id } = meta || {};

                                        return {
                                            label: authIdentifier,
                                            value: id,
                                        };
                                    })}
                                    placeholder={formatMessage(userMsgs.selectPlaceholderRequired)}
                                />
                            }
                            label={formatMessage(userMsgs.authIdLabel)}
                        />
                    ) : (
                        <FieldGroup
                            id="userCreateFormAuthIdentifier"
                            label={formatMessage(userMsgs.authIdLabel)}
                            name="name"
                            onChange={this.handleChange}
                            placeholder={formatMessage(userMsgs.authIdPlaceholder)}
                            value={name}
                        />
                    )}
                    <FieldGroup
                        id="userCreateFormName"
                        label={formatMessage(userMsgs.nameLabel)}
                        name="userName"
                        onChange={this.handleChange}
                        placeholder={formatMessage(userMsgs.namePlaceholder)}
                        type={selectedCreateOption === constants.OPTION_USE_EXISTING ? 'static' : null}
                        value={selectedCreateOption === constants.OPTION_USE_EXISTING ? selectedUserName : userName}
                    />
                    {account ? this.renderRoleSelect() : null}
                    {selectedCreateOption === constants.OPTION_CREATE_NEW ? (
                        <FieldGroup
                            id="userCreateFormPassword"
                            label={formatMessage(userMsgs.passwordLabel)}
                            name="password"
                            onChange={this.handleChange}
                            placeholder={formatMessage(userMsgs.passwordPlaceholder)}
                            type="password"
                            value={password}
                        />
                    ) : null}
                </div>
            </div>
        );
    }
}

UserCreateForm.propTypes = {
    account: PropTypes.object,
    cancel: PropTypes.func,
    intl: intlShape.isRequired,
    onSubmit: PropTypes.func,
    rolesData: PropTypes.object,
    title: PropTypes.node,
    usersData: PropTypes.object,
};

export default injectIntl(UserCreateForm);
