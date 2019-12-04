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
import { intlShape, injectIntl } from 'react-intl';

import SelectOptions from '../components/SelectOptions';
import { getUsers } from '../actions/userActions';
import { selectContextContainerMsgs } from '../messages/SelectContextContainer';
import { sessionGetAccount, sessionSetAccount } from '../sessionUtils';
import { sessionReloadStart } from '../actions/sessionActions';
import * as types from '../actions/types';

class SelectContextContainer extends Component {
    constructor(props) {
        super(props);

        this.onChangeUser = this.onChangeUser.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getUsers());
    }

    onChangeUser(selectedOption) {
        const { dispatch, session } = this.props;
        const { value } = selectedOption || {};

        if (value && value.accountId !== sessionGetAccount()) {
            const { accountId } = value;
            sessionSetAccount(value.accountId);
            dispatch({ type: types.UPDATE_SESSION_ACCOUNT_SUCCESS, accountId, authIdentifier: session.authIdentifier });
            dispatch(sessionReloadStart());
        }
    }

    render() {
        const { userData, intl } = this.props;
        const { user = {}, loading } = userData;
        const { formatMessage } = intl;
        let options = [];

        const currentAccount = sessionGetAccount();
        let initialValues = null;

        if (user && user.accountRoles) {
            options = user.accountRoles.map(role => {
                const label = `${role.accountName}/${role.roleName}`;
                const { accountId, roleId } = role;
                const value = { accountId, roleId };
                return { value, label };
            });

            const role = user.accountRoles.find(role => {
                return role.accountId === currentAccount;
            });
            if (role) {
                const { accountId, roleId } = role;
                const value = { accountId, roleId };
                const label = `${role.accountName} / ${role.roleName}`;
                initialValues = { value, label };
            }
        }

        return (
            <SelectOptions
                id="selectContextContainer"
                initialValues={initialValues}
                isClearable={false}
                isLoading={loading}
                onChange={this.onChangeUser}
                options={options}
                placeholder={formatMessage(selectContextContainerMsgs.selectPlaceholder)}
            />
        );
    }
}

SelectContextContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    session: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { accountsData, session, userData, usersData } = state;
    return {
        accountsData,
        session,
        userData,
        usersData,
    };
}

export default connect(mapStateToProps)(injectIntl(SelectContextContainer));
