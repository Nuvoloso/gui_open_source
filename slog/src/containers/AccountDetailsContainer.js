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
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import AccountDetails from '../components/AccountDetails';
import ProtectionDomainDetailsForm from '../components/ProtectionDomainDetailsForm';

import { deleteAccounts, patchAccount } from '../actions/accountActions';
import { getRoles } from '../actions/roleActions';
import { getServicePlanAllocations } from '../actions/servicePlanAllocationActions';
import { getUsers, postUser } from '../actions/userActions';
import { isAccountUser } from './userAccountUtils';
import { openModal } from '../actions/modalActions';
import { sessionSetAccount } from '../sessionUtils';
import { getCSPs } from '../actions/cspActions';

import { accountMsgs } from '../messages/Account';

import * as constants from '../constants';
import * as types from '../actions/types';

class AccountDetailsContainer extends Component {
    constructor(props) {
        super(props);

        this.handleAddUser = this.handleAddUser.bind(this);
        this.handleDeleteAccount = this.handleDeleteAccount.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handlePatchAccount = this.handlePatchAccount.bind(this);
        this.handleSetResourceHeaderName = this.handleSetResourceHeaderName.bind(this);
    }

    componentDidMount() {
        const { dispatch, rolesData, servicePlanAllocationsData, usersData } = this.props;
        const { roles = [] } = rolesData || {};
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const { users = [] } = usersData || {};

        if (roles.length < 1) {
            dispatch(getRoles());
        }

        if (servicePlanAllocations.length < 1) {
            dispatch(getServicePlanAllocations());
        }

        if (users.length < 1) {
            dispatch(getUsers());
        }

        dispatch(getCSPs());
    }

    protectionDetailsModal() {
        const { accountsData, dispatch, intl, session } = this.props;
        const { accountId } = session || {};
        const { formatMessage } = intl;

        const { domainSetId = '' } = accountsData || {};

        const { cspsData } = this.props || {};
        const { csps = [] } = cspsData || {};
        const csp = csps.find(csp => {
            return csp.accountId === accountId;
        });

        const { cspDomainAttributes } = csp || {};
        const { aws_protection_store_bucket_name, aws_region } = cspDomainAttributes || {};
        const { value: bucketName } = aws_protection_store_bucket_name || {};
        const { value: region } = aws_region || {};

        // add the id, bucketname, region separately as the dialog is also called from the table
        // with a slightly different object
        const constructedRow = {
            bucketName,
            id: domainSetId,
            region,
        };
        dispatch(
            openModal(
                ProtectionDomainDetailsForm,
                {
                    dark: true,
                    id: 'protectionDomainsSetActiveDomain',
                    title: formatMessage(accountMsgs.protectionInformationDialogTitle),
                },
                {
                    protectionDomain: constructedRow,
                }
            )
        );
    }

    componentDidUpdate(prevProps) {
        const { accountsData, dispatch, rolesData, session, userData, usersData } = this.props;
        const { error: errorAccounts, loading } = accountsData || {};
        const { accountId, authIdentifier } = session || {};
        const { user } = userData || {};
        const { error: errorUsers } = usersData || {};
        const {
            accountsData: prevAccountsData,
            session: prevSession,
            userData: prevUserData,
            usersData: prevUsersData,
        } = prevProps;
        const { error: prevErrorAccounts } = prevAccountsData || {};
        const { accountId: prevAccountId } = prevSession || {};
        const { user: prevUser } = prevUserData || {};
        const { error: prevErrorUsers } = prevUsersData || {};

        const messages = [];

        if (errorAccounts && errorAccounts !== prevErrorAccounts) {
            messages.push(errorAccounts);
        }

        if (errorUsers && errorUsers !== prevErrorUsers) {
            messages.push(errorUsers);
        }

        if (messages.length > 0) {
            dispatch({ type: types.SET_ERROR_MESSAGES, messages });
        }

        const account = this.getAccount();
        const { userRoles = {} } = account || {};
        const userRole = Object.keys(userRoles).find(userId => {
            const { meta } = user || {};
            const { id } = meta || {};

            return userId === id;
        });
        const prevAccount = this.getAccount(prevProps);
        const { userRoles: prevUserRoles = {} } = prevAccount || {};
        const prevUserRole = Object.keys(prevUserRoles).find(userId => {
            const { meta } = prevUser || {};
            const { id } = meta || {};

            return userId === id;
        });

        if (!userRole && prevUserRole) {
            sessionSetAccount('');
            dispatch({ type: types.UPDATE_SESSION_ACCOUNT_SUCCESS, accountId: '', authIdentifier });
        }

        if (
            (!account ||
                accountId !== prevAccountId ||
                (!userRole && prevUserRole) ||
                isAccountUser(user, rolesData)) &&
            !loading
        ) {
            this.props.history.push(`/${constants.URI_ACCOUNTS}`);
            return;
        }

        const { settingDomain } = accountsData || {};
        const { settingDomain: prevSettingDomain } = prevAccountsData || {};

        if (!settingDomain && prevSettingDomain) {
            this.protectionDetailsModal();
        }
    }

    getAccount(props) {
        const { match, accountsData } = props || this.props;
        const { params } = match || {};
        const { id } = params || {};
        const { accounts = [] } = accountsData || {};
        const account = accounts.find(account => account.meta.id === id);

        return account;
    }

    handleAddUser(userName, authIdentifier, password, disabled, accountId, roleId, selectedUserId) {
        const { dispatch, userData } = this.props;
        const { user } = userData || {};
        const { authIdentifier: sessionAuthIdentifier } = user || {};

        if (selectedUserId) {
            const account = this.getAccount();
            const { userRoles = {} } = account || {};

            const params = {
                userRoles: {
                    ...userRoles,
                    [selectedUserId]: {
                        roleId,
                    },
                },
            };
            dispatch(patchAccount(accountId, params, authIdentifier));
        } else {
            dispatch(postUser(userName, authIdentifier, password, disabled, accountId, roleId, sessionAuthIdentifier));
        }
    }

    handleDeleteAccount() {
        const { dispatch, userData } = this.props;
        const { user } = userData || {};
        const { authIdentifier } = user || {};
        const account = this.getAccount();
        const { meta, name } = account || {};
        const { id } = meta || {};

        dispatch(deleteAccounts([{ id, name }], authIdentifier));
    }

    handleOpenModal(content, config = {}, values = {}) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    handlePatchAccount(id, params) {
        const { dispatch, userData } = this.props;
        const { user } = userData || {};
        const { authIdentifier } = user || {};
        dispatch(patchAccount(id, params, authIdentifier));
    }

    handleSetResourceHeaderName(resourceName) {
        const { dispatch } = this.props;
        dispatch({
            type: types.SET_HEADER_RESOURCE_NAME,
            resourceName,
        });
    }

    render() {
        const { accountsData, rolesData, servicePlanAllocationsData, userData, usersData } = this.props;
        const account = this.getAccount();

        return (
            <AccountDetails
                account={account}
                accountsData={accountsData}
                onAddUser={this.handleAddUser}
                onDeleteAccount={this.handleDeleteAccount}
                onOpenModal={this.handleOpenModal}
                onPatchAccount={this.handlePatchAccount}
                onSetResourceHeaderName={this.handleSetResourceHeaderName}
                rolesData={rolesData}
                servicePlanAllocationsData={servicePlanAllocationsData}
                userData={userData}
                usersData={usersData}
            />
        );
    }
}

AccountDetailsContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    match: PropTypes.object.isRequired,
    rolesData: PropTypes.object.isRequired,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    session: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { accountsData, cspsData, rolesData, servicePlanAllocationsData, session, userData, usersData } = state;
    return {
        accountsData,
        cspsData,
        rolesData,
        servicePlanAllocationsData,
        session,
        userData,
        usersData,
    };
}

export default withRouter(connect(mapStateToProps)(injectIntl(AccountDetailsContainer)));
