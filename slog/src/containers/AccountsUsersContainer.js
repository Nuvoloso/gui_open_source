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

import AccountsContainer from './AccountsContainer';
import UsersContainer from './UsersContainer';
import { getRoles } from '../actions/roleActions';
import { isTenantAdmin, isSystemAdmin, isAccountAdmin } from './userAccountUtils';

class AccountsUsersContainer extends Component {
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getRoles());
    }

    render() {
        const { rolesData, userData } = this.props;
        const { user } = userData;

        if (isSystemAdmin(user, rolesData) || isTenantAdmin(user, rolesData) || isAccountAdmin(user, rolesData)) {
            return <AccountsContainer />;
        } else {
            return <UsersContainer />;
        }
    }
}

AccountsUsersContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    rolesData: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { rolesData, userData } = state;
    return {
        rolesData,
        userData,
    };
}

export default connect(mapStateToProps)(AccountsUsersContainer);
