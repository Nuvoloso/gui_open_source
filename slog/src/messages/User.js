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
import { defineMessages } from 'react-intl';

export const userMsgs = defineMessages({
    tableTitle: {
        id: 'user.tableTitle',
        defaultMessage: 'Users',
    },
    tableAuthenticationId: {
        id: 'user.tableAuthenticationId',
        defaultMessage: 'Authentication ID',
    },
    tableUserName: {
        id: 'user.tableUserName',
        defaultMessage: 'User Name',
    },
    tableRole: {
        id: 'user.tableRole',
        defaultMessage: 'Role',
    },
    tableActions: {
        id: 'user.tableActions',
        defaultMessage: 'Actions',
    },
    toolbarCreate: {
        id: 'user.toolbarCreate',
        defaultMessage: 'Create User',
    },
    toolbarEdit: {
        id: 'user.toolbarEdit',
        defaultMessage: 'Edit',
    },
    toolbarChangePassword: {
        id: 'user.toolbarChangePassword',
        defaultMessage: 'Change Password',
    },
    toolbarDelete: {
        id: 'user.toolbarDelete',
        defaultMessage: 'Delete',
    },
    toolbarAdd: {
        id: 'user.toolbarAdd',
        defaultMessage: 'Add',
    },
    toolbarRemove: {
        id: 'user.toolbarRemove',
        defaultMessage: 'Remove',
    },
    createTitle: {
        id: 'user.createTitle',
        defaultMessage: 'Create User',
    },
    editTitle: {
        id: 'user.editTitle',
        defaultMessage: 'Edit User',
    },
    createNewOption: {
        id: 'user.createNewOption',
        defaultMessage: 'Create New User',
    },
    useExistingOption: {
        id: 'user.useExistingOption',
        defaultMessage: 'Use Existing User',
    },
    nameLabel: {
        id: 'user.nameLabel',
        defaultMessage: 'Name',
    },
    authIdLabel: {
        id: 'user.authIdLabel',
        defaultMessage: 'Authentication Id',
    },
    namePlaceholder: {
        id: 'user.namePlaceholder',
        defaultMessage: 'Enter a name for the user',
    },
    authIdPlaceholder: {
        id: 'user.authIdPlaceholder',
        defaultMessage: 'Enter an authentication id for the user (required)',
    },
    passwordLabel: {
        id: 'user.passwordLabel',
        defaultMessage: 'Password',
    },
    passwordPlaceholder: {
        id: 'user.passwordPlaceholder',
        defaultMessage: 'Enter a password for the user (minimum 1 character required)',
    },
    changePasswordTitle: {
        id: 'user.changePasswordTitle',
        defaultMessage: 'Change Password for {name}',
    },
    newPasswordLabel: {
        id: 'user.newPasswordLabel',
        defaultMessage: 'New Password',
    },
    newPasswordPlaceholder: {
        id: 'user.newPasswordPlaceholder',
        defaultMessage: 'Enter a new password for the user (minimum 1 character required)',
    },
    confirmNewPasswordLabel: {
        id: 'user.confirmNewPasswordLabel',
        defaultMessage: 'Confirm New Password',
    },
    confirmNewPasswordPlaceholder: {
        id: 'user.confirmNewPasswordPlaceholder',
        defaultMessage: 'Confirm new password for the user',
    },
    disabledLabel: {
        id: 'user.disabledLabel',
        defaultMessage: 'Disabled',
    },
    usersLabel: {
        id: 'user.usersLabel',
        defaultMessage: 'Users',
    },
    deleteTitle: {
        id: 'user.deleteTitle',
        defaultMessage: 'Delete {count, plural, one {User} other {Users}}',
    },
    deleteMsg: {
        id: 'user.deleteMsg',
        defaultMessage: 'Are you sure you want to delete {count, plural, one {{name}} other {{count} users}}?',
    },
    removeUserDeleteMsg: {
        id: 'user.removeUserDeleteMsg',
        defaultMessage: 'Delete user after removing from account',
    },
    selectPlaceholder: {
        id: 'user.selectPlaceholder',
        defaultMessage: 'Select a user',
    },
    selectPlaceholderRequired: {
        id: 'user.selectPlaceholderRequired',
        defaultMessage: 'Select a user (required)',
    },
    roleLabel: {
        id: 'user.roleLabel',
        defaultMessage: 'Role',
    },
    roleSelectPlaceholder: {
        id: 'user.roleSelectPlaceholder',
        defaultMessage: 'Select a role (required)',
    },
});
