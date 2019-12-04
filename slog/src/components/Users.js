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
import { Checkbox, Collapse } from 'react-bootstrap';

import ButtonAction from './ButtonAction';
import DeleteForm from './DeleteForm';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import SelectOptions from './SelectOptions';
import TableActionIcon from './TableActionIcon';
import TableContainer from '../containers/TableContainer';
import UserCreateForm from './UserCreateForm';
import UserPasswordForm from './UserPasswordForm';
import { getSystemAdminRoleID, getTenantRoleId, isAccountUser } from '../containers/userAccountUtils';
import { userMsgs } from '../messages/User';
import { messages } from '../messages/Messages';
import * as constants from '../constants';

import { DeleteForever, Edit, VpnKey } from '@material-ui/icons';
import { ReactComponent as AccountIcon } from '../assets/account.svg';
import btnAddUserHov from '../assets/btn-add-user-hov.svg';
import btnAddUserUp from '../assets/btn-add-user-up.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnDeleteAllDisable from '../assets/btn-delete-all-disable.svg';
import btnDeleteAllHov from '../assets/btn-delete-all-hov.svg';
import btnDeleteAllUp from '../assets/btn-delete-all-up.svg';

import './users.css';

class Users extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteUserAfterRemove: false,
            dialogOpenCreate: false,
            editDisabled: false,
            editId: '',
            editName: '',
            editRoleId: '',
            editUser: null,
            editUserName: '',
        };

        this.dialogToggleCreate = this.dialogToggleCreate.bind(this);
        this.handleEditChange = this.handleEditChange.bind(this);
        this.handleEditChangePassword = this.handleEditChangePassword.bind(this);
        this.handleEditChangeRole = this.handleEditChangeRole.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
    }

    dialogToggleCreate() {
        const { dialogOpenCreate } = this.state;

        this.setState({ dialogOpenCreate: !dialogOpenCreate });
    }

    disableEditSubmit() {
        const { account } = this.props;
        const { editDisabled, editName, editRoleId = '', editUser, editUserName } = this.state;
        const { _original } = editUser || {};
        const { disabled, name, roleId = '', userName } = _original || {};

        return (
            !editName ||
            (name === editName && userName === editUserName && roleId === editRoleId && disabled === editDisabled) ||
            (account && !editRoleId)
        );
    }

    handleDelete(user) {
        const { account, deleteUsers, intl, openModal, removeUsers, selectedRows } = this.props;
        const { formatMessage } = intl;
        const { name } = user || selectedRows[0] || {};

        openModal(
            DeleteForm,
            {
                title: formatMessage(userMsgs.deleteTitle, { count: user ? 1 : selectedRows.length }),
                deleteFunc: () => {
                    if (account && removeUsers) {
                        const { deleteUserAfterRemove } = this.state;

                        return removeUsers(user ? [user] : selectedRows, deleteUserAfterRemove);
                    } else {
                        return deleteUsers(user);
                    }
                },
            },
            {
                message: (
                    <div>
                        <div>
                            {formatMessage(userMsgs.deleteMsg, {
                                count: user ? 1 : selectedRows.length,
                                name,
                            })}
                        </div>
                        <div className="mt20">
                            <Checkbox
                                className="delete-user-checkbox"
                                data-testid="deleteUserAfterRemove"
                                name="deleteUserAfterRemove"
                                onChange={e => {
                                    const { target } = e || {};
                                    const { checked, name } = target || {};

                                    this.handleEditChange(name, checked);
                                }}
                            >
                                {formatMessage(userMsgs.removeUserDeleteMsg)}
                            </Checkbox>
                        </div>
                    </div>
                ),
            }
        );
    }

    handleEdit(selectedRow) {
        const { _original, id } = selectedRow || {};
        const { disabled = false, name = '', roleId = '', userName = '' } = _original || {};

        this.setState({
            editDisabled: disabled,
            editId: id,
            editName: name,
            editRoleId: roleId,
            editUser: selectedRow,
            editUserName: userName,
        });
    }

    handleEditChange(name, value) {
        if (name) {
            this.setState({ [name]: value });
        }
    }

    handleEditChangePassword(selectedRow) {
        const { id, name } = selectedRow || {};

        const { intl, openModal, patchUser } = this.props;
        const { formatMessage } = intl;

        openModal(
            UserPasswordForm,
            {
                dark: true,
                title: formatMessage(userMsgs.changePasswordTitle, { name }),
                patchUser,
            },
            {
                id,
            }
        );
    }

    handleEditChangeRole(selectedItem) {
        const { value } = selectedItem || {};
        this.setState({ editRoleId: value });
    }

    handleEditSubmit() {
        const { account, patchAccount, patchUser, userData } = this.props;
        const { user } = userData || {};
        const { authIdentifier } = user || {};
        const { editDisabled, editId, editName, editRoleId, editUser, editUserName } = this.state;
        const { disabled, name, roleId, userName, _original } = editUser || {};
        const { profile = {} } = _original || {};

        if (patchUser) {
            const params = {
                ...(name !== editName && { authIdentifier: editName }),
                profile: {
                    ...profile,
                    ...(userName !== editUserName && {
                        userName: {
                            value: editUserName,
                        },
                    }),
                },
                ...((disabled || false) !== editDisabled && { disabled: editDisabled }),
            };
            patchUser(editId, params);
        }

        if (roleId !== editRoleId && account && patchAccount) {
            const { meta, userRoles = {} } = account || {};
            const { id } = meta || {};

            const params = {
                userRoles: {
                    ...userRoles,
                    [editId]: { roleId: editRoleId },
                },
            };
            patchAccount(id, params, authIdentifier);
        }

        this.handleEdit(null);
    }

    renderFetchStatus() {
        const { usersData } = this.props;
        const { loading } = usersData || {};

        if (loading) {
            return <Loader />;
        }
    }

    renderHeader() {
        const { intl, postUser, userData, rolesData } = this.props;
        const { formatMessage } = intl;
        const { user } = userData || {};
        const { dialogOpenCreate } = this.state;

        return (
            <div className="content-flex-column">
                <div className="content-flex-row">
                    <div className="layout-icon-background">
                        <AccountIcon className="layout-icon" />
                    </div>
                    <div className="content-flex-row layout-summary" />
                    <div className="layout-actions">
                        <div>
                            {isAccountUser(user, rolesData) ? null : (
                                <ButtonAction
                                    btnUp={btnAddUserUp}
                                    btnHov={btnAddUserHov}
                                    id="userToolbarCreate"
                                    onClick={this.dialogToggleCreate}
                                    label={formatMessage(userMsgs.toolbarCreate)}
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className="divider-horizontal" />
                <Collapse in={dialogOpenCreate} unmountOnExit>
                    <div>
                        <UserCreateForm cancel={this.dialogToggleCreate} onSubmit={postUser} />
                    </div>
                </Collapse>
            </div>
        );
    }

    renderToolbar() {
        const { selectedRows } = this.props;

        return (
            <div className="table-header-actions">
                <ButtonAction
                    btnDisable={btnDeleteAllDisable}
                    btnHov={btnDeleteAllHov}
                    btnUp={btnDeleteAllUp}
                    disabled={selectedRows.length < 1}
                    id="userToolbarDelete"
                    onClick={() => this.handleDelete()}
                />
            </div>
        );
    }

    render() {
        const { account, intl, selectedRows, tableOnly, usersData } = this.props;
        const { userRoles = {} } = account || {};
        const accountUserIds = Object.keys(userRoles) || [];
        const { users = [] } = usersData || {};
        const { formatMessage } = intl;
        const { editUser } = this.state;

        const columns = [
            {
                Header: formatMessage(userMsgs.tableAuthenticationId),
                accessor: 'name',
                editable: true,
                Cell: row => {
                    const { editName } = this.state;
                    const { original } = row || {};
                    const { id = '' } = original || {};
                    const { id: editUserId } = editUser || {};

                    if (id === editUserId) {
                        return <FieldGroup name="editName" onChange={this.handleEditChange} value={editName} />;
                    } else {
                        return (
                            <div>{`${row.value}${
                                row.original.disabled ? ` ${formatMessage(messages.disabledTag)}` : ''
                            }`}</div>
                        );
                    }
                },
            },
            {
                Header: formatMessage(userMsgs.tableUserName),
                accessor: 'userName',
                editable: true,
                Cell: row => {
                    const { editUserName } = this.state;
                    const { original, value } = row || {};
                    const { id = '' } = original || {};
                    const { id: editUserId } = editUser || {};

                    if (id === editUserId) {
                        return <FieldGroup name="editUserName" onChange={this.handleEditChange} value={editUserName} />;
                    } else {
                        return value;
                    }
                },
            },
            {
                Header: formatMessage(userMsgs.tableRole),
                accessor: 'roleName',
                editable: true,
                Cell: row => {
                    const { account, rolesData, usersData } = this.props;
                    const { meta } = account || {};
                    const { id: accountId } = meta || {};
                    const { users = [] } = usersData || {};

                    const { original, value = [] } = row || {};
                    const { id = '' } = original || {};
                    const { id: editUserId } = editUser || {};

                    const { accountRoles = [] } =
                        users.find(user => {
                            const { meta } = user || {};
                            const { id } = meta || {};

                            return id === editUserId;
                        }) || {};
                    const { roleId } = accountRoles.find(accountRole => accountRole.accountId === accountId) || {};

                    const allowEditingRole =
                        id === editUserId &&
                        account &&
                        roleId !== getTenantRoleId(rolesData) &&
                        roleId !== getSystemAdminRoleID(rolesData);

                    if (allowEditingRole) {
                        const { editRoleId } = this.state;
                        const { rolesData } = this.props;
                        const { loading, roles = [] } = rolesData || {};
                        const role = roles.find(role => {
                            const { meta } = role || {};
                            const { id } = meta || {};

                            return id === editRoleId;
                        });
                        const { name } = role || {};

                        return (
                            <SelectOptions
                                id="editRoleId"
                                initialValues={
                                    editRoleId
                                        ? {
                                              label: name,
                                              value: editRoleId,
                                          }
                                        : null
                                }
                                loading={loading}
                                onChange={this.handleEditChangeRole}
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
                        );
                    } else {
                        return value;
                    }
                },
            },
            {
                Header: formatMessage(userMsgs.tableActions),
                accessor: 'actions',
                sortable: false,
                width: 120,
                Cell: (selected = {}) => {
                    const { original, row } = selected || {};
                    const { id, name } = original || {};
                    return (
                        <div className="table-actions-cell">
                            {editUser && editUser.id === id ? (
                                <Fragment>
                                    <ButtonAction
                                        btnUp={btnAltSaveUp}
                                        btnHov={btnAltSaveHov}
                                        btnDisable={btnAltSaveDisable}
                                        disabled={this.disableEditSubmit()}
                                        id="action-save"
                                        onClick={this.handleEditSubmit}
                                    />
                                    <ButtonAction
                                        btnUp={btnCancelUp}
                                        btnHov={btnCancelHov}
                                        id="action-cancel"
                                        onClick={() => this.handleEdit(null)}
                                    />
                                </Fragment>
                            ) : (
                                <Fragment>
                                    <TableActionIcon
                                        id={`userActionEdit-${id}`}
                                        materialIcon={Edit}
                                        onClick={() => this.handleEdit(row)}
                                        testid={`userActionEdit-${name}`}
                                        tooltip={formatMessage(userMsgs.toolbarEdit)}
                                    />
                                    <TableActionIcon
                                        id={`userActionChangePassword-${id}`}
                                        materialIcon={VpnKey}
                                        onClick={() => this.handleEditChangePassword(row)}
                                        testid={`userActionChangePassword-${name}`}
                                        tooltip={formatMessage(userMsgs.toolbarChangePassword)}
                                    />
                                    <TableActionIcon
                                        id={`userActionDelete-${id}`}
                                        materialIcon={DeleteForever}
                                        onClick={() => this.handleDelete(row._original)}
                                        testid={`userActionDelete-${name}`}
                                        tooltip={formatMessage(userMsgs.toolbarDelete)}
                                    />
                                </Fragment>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'disabled',
                show: false,
                accessor: 'disabled',
            },
            {
                Header: 'id',
                show: false,
                accessor: 'id',
            },
        ];

        const data = users
            .filter(user => {
                if (!account) {
                    return true;
                }

                const { meta } = user || {};
                const { id } = meta || {};

                return accountUserIds.find(accountUserId => accountUserId === id);
            })
            .map(user => {
                const { editId } = this.state;
                const { accountRoles = [], authIdentifier, disabled, meta, profile } = user || {};
                const { id } = meta || {};
                const { userName } = profile || {};
                const { value = '' } = userName || {};

                const accountRole = Array.isArray(accountRoles)
                    ? accountRoles.find(accountRole => {
                          const { accountId } = accountRole || {};
                          const { meta } = account || {};
                          const { id } = meta || {};

                          return accountId === id;
                      })
                    : {};
                const { roleId, roleName } = accountRole || {};

                return {
                    disabled,
                    edit: id === editId,
                    id,
                    name: authIdentifier,
                    profile,
                    roleId,
                    roleName,
                    userName: value,
                };
            });

        return (
            <div className="dark">
                {this.renderFetchStatus()}
                {tableOnly ? null : this.renderHeader()}
                <TableContainer
                    columns={columns}
                    component="USERS_TABLE"
                    componentSelectedRows={selectedRows}
                    data={data}
                    defaultSorted={[{ id: 'name' }]}
                    filterLeft
                    id="users-table"
                    selectable
                    title={formatMessage(userMsgs.tableTitle)}
                    toolbar={this.renderToolbar()}
                />
            </div>
        );
    }
}

Users.propTypes = {
    account: PropTypes.object,
    deleteUsers: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    openModal: PropTypes.func.isRequired,
    patchAccount: PropTypes.func,
    patchUser: PropTypes.func.isRequired,
    postUser: PropTypes.func.isRequired,
    removeUsers: PropTypes.func,
    rolesData: PropTypes.object.isRequired,
    selectedRows: PropTypes.array.isRequired,
    tableOnly: PropTypes.bool,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
};

export default injectIntl(Users);
