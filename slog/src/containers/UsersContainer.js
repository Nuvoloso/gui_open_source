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
import _ from 'lodash';

import Users from '../components/Users';
import { openModal } from '../actions/modalActions';
import { deleteUsers, getUsers, patchUser, postUser } from '../actions/userActions';
import { patchAccount } from '../actions/accountActions';
import * as types from '../actions/types';

class UsersContainer extends Component {
    constructor(props) {
        super(props);

        this.deleteUsers = this.deleteUsers.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchAccount = this.patchAccount.bind(this);
        this.patchUser = this.patchUser.bind(this);
        this.postUser = this.postUser.bind(this);
        this.removeUsers = this.removeUsers.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getUsers());
    }

    componentDidUpdate(prevProps) {
        const { account, dispatch, usersData } = this.props;
        const { account: prevAccount, usersData: prevUsersData } = prevProps;
        const { userRoles = {} } = account || {};
        const { userRoles: prevUserRoles = {} } = prevAccount || {};
        const { error } = usersData || {};
        const { error: prevError } = prevUsersData || {};

        if (!_.isEqual(userRoles, prevUserRoles)) {
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

    deleteUsers(user) {
        const { dispatch, tableUsers = {} } = this.props;
        dispatch(deleteUsers(user ? [user] : tableUsers.selectedRows));
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    patchAccount(id, params, authIdentifier, deleteUsersList) {
        const { dispatch } = this.props;
        dispatch(patchAccount(id, params, authIdentifier, deleteUsersList));
    }

    patchUser(id, params) {
        const { dispatch } = this.props;
        dispatch(patchUser(id, params));
    }

    postUser(userName, authIdentifier, password, disabled) {
        const { dispatch } = this.props;
        dispatch(postUser(userName, authIdentifier, password, disabled));
    }

    removeUsers(usersToRemove = [], deleteAfter) {
        const { account, dispatch, userData } = this.props;
        const { meta, userRoles = {} } = account || {};
        const { id: accountId } = meta || {};
        const { user } = userData || {};
        const { authIdentifier } = user || {};

        const filteredUserRoles = {};
        Object.keys(userRoles)
            .filter(roleUserId => usersToRemove.every(user => user.id !== roleUserId))
            .forEach(id => {
                filteredUserRoles[id] = userRoles[id];
            });

        const params = {
            userRoles: filteredUserRoles,
        };

        dispatch(patchAccount(accountId, params, authIdentifier, deleteAfter ? usersToRemove : null));
    }

    render() {
        const { account, tableUsers = {}, tableOnly, rolesData, userData, usersData } = this.props;

        return (
            <Users
                account={account}
                deleteUsers={this.deleteUsers}
                openModal={this.openModal}
                patchAccount={this.patchAccount}
                patchUser={this.patchUser}
                postUser={this.postUser}
                removeUsers={this.removeUsers}
                rolesData={rolesData}
                selectedRows={tableUsers.selectedRows}
                tableOnly={tableOnly}
                userData={userData}
                usersData={usersData}
            />
        );
    }
}

UsersContainer.propTypes = {
    account: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    tableUsers: PropTypes.object.isRequired,
    tableOnly: PropTypes.bool,
    rolesData: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { rolesData, tableUsers, userData, usersData } = state;
    return {
        rolesData,
        tableUsers,
        userData,
        usersData,
    };
}

export default connect(mapStateToProps)(UsersContainer);
