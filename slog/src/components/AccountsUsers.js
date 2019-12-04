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

import Accounts from './Accounts';
import AccountUsers from './AccountUsers';
import { isTenantAdmin, isSystemAdmin, isAccountUser, isAccountAdmin } from '../containers/userAccountUtils';
import AccountUserManagement from './AccountUserManagement';
import { accountMsgs } from '../messages/Account';
import Loader from './Loader';

class AccountsUsers extends Component {
    renderAccounts() {
        const {
            accountsData,
            deleteAccounts,
            openModal,
            patchAccount,
            postAccount,
            rolesData,
            selectedRowsAccounts,
            session,
            userData,
            usersData,
        } = this.props;
        const { user } = userData;

        if (isSystemAdmin(user, rolesData) || isTenantAdmin(user, rolesData)) {
            return (
                <Accounts
                    accountsData={accountsData}
                    deleteAccounts={deleteAccounts}
                    openModal={openModal}
                    patchAccount={patchAccount}
                    postAccount={postAccount}
                    rolesData={rolesData}
                    selectedRows={selectedRowsAccounts}
                    session={session}
                    userData={userData}
                    usersData={usersData}
                />
            );
        }
    }

    renderAccountUsers() {
        const { accountsData, rolesData, selectedRowsAccounts, selectedRowsUsers, userData, usersData } = this.props;
        const { user } = userData;

        if (isSystemAdmin(user, rolesData) || isTenantAdmin(user, rolesData)) {
            return (
                <div className="accounts-users">
                    <AccountUsers
                        accountsData={accountsData}
                        rolesData={rolesData}
                        selectedAccountRows={selectedRowsAccounts}
                        selectedRows={selectedRowsUsers}
                        selectable
                        usersData={usersData}
                    />
                </div>
            );
        }
    }

    renderAccountUserManagement() {
        const {
            accountsData,
            intl,
            openModal,
            patchAccount,
            rolesData,
            selectedRowsAccounts,
            selectedRowsUsers,
            userData,
            usersData,
        } = this.props;
        const { user } = userData;
        const { formatMessage } = intl;

        if (isAccountAdmin(user, rolesData)) {
            return (
                <div>
                    <AccountUserManagement
                        accountsData={accountsData}
                        openModal={openModal}
                        patchAccount={patchAccount}
                        rolesData={rolesData}
                        selectedAccountRows={selectedRowsAccounts}
                        selectedRows={selectedRowsUsers}
                        selectable
                        userData={userData}
                        usersData={usersData}
                    />
                </div>
            );
        } else if (isAccountUser(user, rolesData)) {
            return <div className="mt20 ml20 dialog-title">{formatMessage(accountMsgs.noAdminRights)}</div>;
        }
    }

    render() {
        const { rolesData, userData, usersData } = this.props;

        if (usersData.loading || userData.loading || rolesData.loading) {
            return <Loader />;
        }

        return (
            <div>
                {this.renderAccounts()}
                {this.renderAccountUsers()}
                {this.renderAccountUserManagement()}
            </div>
        );
    }
}

AccountsUsers.propTypes = {
    accountsData: PropTypes.object.isRequired,
    deleteAccounts: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    openModal: PropTypes.func.isRequired,
    patchAccount: PropTypes.func.isRequired,
    postAccount: PropTypes.func.isRequired,
    rolesData: PropTypes.object.isRequired,
    selectedRowsAccounts: PropTypes.array.isRequired,
    selectedRowsUsers: PropTypes.array.isRequired,
    session: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
};

export default injectIntl(AccountsUsers);
