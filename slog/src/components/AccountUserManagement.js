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

import TableContainer from '../containers/TableContainer';
import { accountUsersMsgs } from '../messages/AccountUsers';
import UsersEditForm from './UsersEditForm';
import Loader from './Loader';

import './accountsusers.css';
import { sessionGetAccount } from '../sessionUtils';

import { getAccountAdminRoleId, getAccountUserRoleID } from '../containers/userAccountUtils';
import { accountMsgs } from '../messages/Account';
import ButtonAction from './ButtonAction';

import pencil from '../pencil.svg';
import pencilUp from '../pencil-up.svg';

class AccountUserManagement extends Component {
    renderUsers(values) {
        return <div>{values}</div>;
    }

    lookupUserName(id) {
        const { intl, usersData } = this.props;
        const { users } = usersData;
        const { formatMessage } = intl;

        const user = users.find(user => {
            return user.meta.id === id;
        });

        if (user) {
            return user.authIdentifier;
        } else {
            return formatMessage(accountUsersMsgs.userNotFound);
        }
    }

    /**
     * Look up user info given its uuid and return an object containing
     * the authIdentifier and userName.
     * @param {*} id
     */
    lookupUserInfo(id) {
        const { usersData } = this.props;
        const { users } = usersData;
        let userName = '';

        const user = users.find(user => {
            return user.meta.id === id;
        });

        if (!user) {
            return {};
        }

        userName = user.profile && user.profile.userName ? user.profile.userName.value : '';

        return { authIdentifier: user.authIdentifier, userName: userName };
    }

    /**
     * Look up role name given its uuid.
     * @param {*} roleId
     */
    lookupRole(roleId) {
        const { intl, rolesData } = this.props;
        const { roles } = rolesData;
        const { formatMessage } = intl;

        const role = roles.find(role => {
            return role.meta.id === roleId;
        });

        return role.name || formatMessage(accountUsersMsgs.unknown);
    }

    renderToolbar() {
        const { accountsData, intl, openModal, patchAccount, rolesData, userData } = this.props;
        const { user } = userData;
        const { accounts } = accountsData;
        const { formatMessage } = intl;
        let users = [];
        let admins = [];

        const account = accounts.find(account => {
            return sessionGetAccount() === account.meta.id;
        });

        /**
         * Protect against account information being updated.
         */
        if (!account) {
            return;
        }

        users = Object.keys(account.userRoles).filter(key => {
            return account.userRoles[key].roleId === getAccountUserRoleID(rolesData);
        });
        admins = Object.keys(account.userRoles).filter(key => {
            return account.userRoles[key].roleId === getAccountAdminRoleId(rolesData);
        });

        return (
            <div className="table-header-actions">
                <ButtonAction
                    btnHov={pencil}
                    btnUp={pencilUp}
                    id="accountToolbarEdit"
                    onClick={() => {
                        openModal(
                            UsersEditForm,
                            { dark: true, title: formatMessage(accountMsgs.editTitle), patchAccount },
                            {
                                edit: { accountId: sessionGetAccount(), users, admins },
                                user,
                                rolesData,
                            }
                        );
                    }}
                />
            </div>
        );
    }

    generateUserData() {
        const { accountsData } = this.props;
        const { accounts = [] } = accountsData || {};
        const account = accounts.find(account => {
            return sessionGetAccount() === account.meta.id;
        });

        const userIds = (account && account.userRoles && Object.keys(account.userRoles)) || [];
        let data = null;

        data = userIds.map(userId => {
            const userInfo = this.lookupUserInfo(userId);
            return {
                name: userInfo.authIdentifier,
                userName: userInfo.userName,
                role: this.lookupRole(account.userRoles[userId].roleId),
                id: userId,
                disabled: false,
            };
        });

        return data;
    }

    renderUserTable() {
        const { accountsData, intl } = this.props;
        const { accounts = [] } = accountsData || {};
        const { formatMessage } = intl;
        let title = formatMessage(accountUsersMsgs.titleAccountUsers);

        const columns = [
            {
                Header: formatMessage(accountUsersMsgs.tableAuthIdentifier),
                accessor: 'name',
                Cell: row => <span>{this.renderUsers(row.value)}</span>,
            },
            {
                Header: formatMessage(accountUsersMsgs.headerUserName),
                accessor: 'userName',
            },
            {
                Header: formatMessage(accountUsersMsgs.headerRole),
                accessor: 'role',
            },
            {
                Header: 'id',
                show: false,
                accessor: 'id',
            },
            {
                Header: 'disabled',
                show: false,
                accessor: 'disabled',
            },
        ];

        /**
         * If a single account is selected, we will populate the user table with information.
         */
        let data = [];

        const account = accounts.find(account => {
            return sessionGetAccount() === account.meta.id;
        });

        data = this.generateUserData();
        title = `${title}: ${account ? account.name : ''}`;

        /**
         * Determine text to display in user table.
         */
        let noDataText = '';
        if (data.length === 0) {
            noDataText = formatMessage(accountUsersMsgs.noDataTextNoAccount);
        }

        return (
            <div>
                <div className="account-users">
                    <TableContainer
                        columns={columns}
                        component="ACCOUNT_USERS_TABLE"
                        noDataText={noDataText}
                        data={data}
                        defaultSorted={[{ id: 'name' }]}
                        filterLeft
                        toolbar={this.renderToolbar()}
                        title={title}
                    />
                </div>
            </div>
        );
    }

    render() {
        const { accountsData, userData, usersData } = this.props;

        if (accountsData.loading || usersData.loading || userData.loading) {
            return <Loader />;
        }
        return <div>{this.renderUserTable()}</div>;
    }
}

AccountUserManagement.propTypes = {
    accountsData: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    openModal: PropTypes.func.isRequired,
    patchAccount: PropTypes.func.isRequired,
    rolesData: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
};

export default injectIntl(AccountUserManagement);
