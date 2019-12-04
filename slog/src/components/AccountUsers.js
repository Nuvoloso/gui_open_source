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

import './accountsusers.css';

class AccountUsers extends Component {
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

        const user = users.find(user => {
            return user.meta.id === id;
        });

        const { authIdentifier, profile } = user || {};
        const { userName } = profile || {};
        const { value = '' } = userName || {};

        return { authIdentifier, userName: value };
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

    render() {
        const { accountsData, intl, selectedAccountRows, selectedRows } = this.props;
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
        if (selectedAccountRows.length === 1) {
            const account = accounts.find(account => {
                return selectedAccountRows[0].id === account.meta.id;
            });

            const userIds = (account && account.userRoles && Object.keys(account.userRoles)) || [];

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
            /**
             * May have just deleted the account
             */
            if (account) {
                title = `${title}: ${account.name}`;
            }
        }

        /**
         * Determine text to display in user table.
         */
        let noDataText = '';
        if (selectedAccountRows.length === 0) {
            noDataText = formatMessage(accountUsersMsgs.noDataTextNoAccount);
        } else if (selectedAccountRows.length > 1) {
            noDataText = formatMessage(accountUsersMsgs.noDataTextSelectSingle);
        } else {
            noDataText = formatMessage(accountUsersMsgs.noDataTextSelectNoUsers);
        }

        return (
            <div className="account-users">
                <TableContainer
                    cardsMode={true}
                    columns={columns}
                    component="ACCOUNT_USERS_TABLE"
                    componentSelectedRows={selectedRows}
                    noDataText={noDataText}
                    data={data}
                    defaultSorted={[{ id: 'name' }]}
                    title={title}
                />
            </div>
        );
    }
}

AccountUsers.propTypes = {
    accountsData: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    rolesData: PropTypes.object.isRequired,
    selectedAccountRows: PropTypes.array.isRequired,
    selectedRows: PropTypes.array.isRequired,
    usersData: PropTypes.object.isRequired,
};

export default injectIntl(AccountUsers);
