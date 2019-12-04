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
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Accounts from '../components/Accounts';
import Loader from '../components/Loader';

import { openModal } from '../actions/modalActions';
import { deleteAccounts, getAccounts, patchAccount, postAccount } from '../actions/accountActions';
import * as types from '../actions/types';
import { getServicePlanAllocations } from '../actions/servicePlanAllocationActions';
import { getUsers } from '../actions/userActions';
import { getVolumeSeries } from '../actions/volumeSeriesActions';
import { sessionGetAccount } from '../sessionUtils';

import { isTenantAdmin, isAccountAdmin } from '../containers/userAccountUtils';

import * as constants from '../constants';

class AccountsContainer extends Component {
    constructor(props) {
        super(props);

        this.deleteAccounts = this.deleteAccounts.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchAccount = this.patchAccount.bind(this);
        this.postAccount = this.postAccount.bind(this);
    }

    componentDidMount() {
        const { dispatch, servicePlanAllocationsData, volumeSeriesData } = this.props;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const { volumeSeries = [] } = volumeSeriesData || {};

        dispatch(getAccounts());

        if (servicePlanAllocations.length < 1) {
            dispatch(getServicePlanAllocations());
        }

        if (volumeSeries.length < 1) {
            dispatch(getVolumeSeries());
        }
    }

    componentDidUpdate(prevProps) {
        const { dispatch, accountsData, rolesData, userData } = this.props;
        const { error, loading } = accountsData || {};
        const { user } = userData || {};
        const { accountsData: prevAccountsData } = prevProps;
        const { error: prevError, loading: prevLoading } = prevAccountsData || {};

        if (isAccountAdmin(user, rolesData)) {
            this.props.history.push(`/${constants.URI_ACCOUNTS}/${sessionGetAccount()}`);
        }

        if (!loading && prevLoading) {
            dispatch(getUsers());
        }

        if (error !== prevError) {
            if (error) {
                const messages = [error];
                dispatch({ type: types.SET_ERROR_MESSAGES, messages });
            } else {
                dispatch({ type: types.CLEAR_ERROR_MESSAGES });
            }
        }
    }

    deleteAccounts(account) {
        const { dispatch, tableAccounts, userData } = this.props;
        const { user } = userData || {};
        const { authIdentifier } = user || {};
        dispatch(deleteAccounts(account ? [account] : tableAccounts.selectedRows, authIdentifier));
    }

    isLoading() {
        const {
            accountsData = {},
            rolesData = {},
            servicePlanAllocationsData = {},
            userData = {},
            usersData = {},
            volumeSeriesData = {},
        } = this.props;

        return (
            accountsData.loading ||
            rolesData.loading ||
            servicePlanAllocationsData.loading ||
            userData.loading ||
            usersData.loading ||
            volumeSeriesData.loading
        );
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    patchAccount(id, params) {
        const { dispatch, userData } = this.props;
        const { user } = userData || {};
        const { authIdentifier } = user || {};
        dispatch(patchAccount(id, params, authIdentifier));
    }

    postAccount(name, userRoles, description, tags, disabled) {
        const { dispatch, rolesData, userData } = this.props;
        const { user } = userData || {};
        const { authIdentifier } = user || {};
        let accountId = null;

        if (isTenantAdmin(user, rolesData)) {
            accountId = sessionGetAccount();
        }

        dispatch(postAccount(name, userRoles, description, tags, disabled, authIdentifier, accountId));
    }

    render() {
        const {
            accountsData,
            rolesData,
            servicePlanAllocationsData,
            session,
            tableAccounts,
            userData,
            usersData,
            volumeSeriesData,
        } = this.props;
        const { selectedRows } = tableAccounts || {};

        return (
            <div className="component-page">
                {this.isLoading() ? <Loader /> : null}
                <Accounts
                    accountsData={accountsData}
                    deleteAccounts={this.deleteAccounts}
                    openModal={this.openModal}
                    patchAccount={this.patchAccount}
                    postAccount={this.postAccount}
                    rolesData={rolesData}
                    selectedRows={selectedRows}
                    servicePlanAllocationsData={servicePlanAllocationsData}
                    session={session}
                    userData={userData}
                    usersData={usersData}
                    volumeSeriesData={volumeSeriesData}
                />
            </div>
        );
    }
}

AccountsContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    rolesData: PropTypes.object.isRequired,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    session: PropTypes.object.isRequired,
    tableAccounts: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const {
        accountsData,
        rolesData,
        servicePlanAllocationsData,
        session,
        tableAccounts,
        userData,
        usersData,
        volumeSeriesData,
    } = state;
    return {
        accountsData,
        rolesData,
        servicePlanAllocationsData,
        session,
        tableAccounts,
        userData,
        usersData,
        volumeSeriesData,
    };
}

export default withRouter(connect(mapStateToProps)(AccountsContainer));
