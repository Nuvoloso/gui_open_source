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
import { connect } from 'react-redux';
import Header from '../components/Header.js';
import { getAccounts } from '../actions/accountActions';
import { patchUser } from '../actions/userActions';
import { sessionGetAccount, sessionSetAccount } from '../sessionUtils';
import Loader from '../components/Loader';

class HeaderContainer extends Component {
    constructor(props) {
        super(props);

        this.handleChangeAccount = this.handleChangeAccount.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { session: prevSession } = prevProps;
        const { accountId: prevAccountId } = prevSession || {};

        const { dispatch, session } = this.props;
        const { accountId } = session || {};

        if (accountId !== prevAccountId) {
            dispatch(getAccounts());
        }
    }

    handleChangeAccount(accountId) {
        const { dispatch, userData } = this.props;
        const { user } = userData || {};
        const { meta, profile } = user || {};
        const { id: userId } = meta || {};

        if (accountId !== sessionGetAccount()) {
            sessionSetAccount(accountId);
            const params = {
                profile: {
                    ...profile,
                    defaultAccountId: {
                        value: accountId,
                    },
                },
            };
            if (userId) {
                dispatch(patchUser(userId, params, true));
            }
        }
    }

    render() {
        const {
            logout,
            user,
            accountsData = {},
            headerData,
            session,
            socket,
            userData = {},
            usersData = {},
        } = this.props;
        const { resourceName } = headerData || {};
        const { accountId } = session || {};
        const { accounts = [] } = accountsData;
        const { name = '' } = accounts.find(ac => ac.meta.id === accountId) || {};

        return (
            <Fragment>
                <Header
                    logout={logout}
                    onChangeAccount={this.handleChangeAccount}
                    resourceName={resourceName}
                    sessionAccountName={name}
                    socket={socket}
                    user={user}
                    userData={userData}
                />
                {accountsData.loading || userData.loading || usersData.loading ? <Loader /> : null}
            </Fragment>
        );
    }
}

HeaderContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    headerData: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    session: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { accountsData, headerData, session, socket, userData, usersData } = state;
    return {
        accountsData,
        headerData,
        session,
        socket,
        userData,
        usersData,
    };
}

export default connect(mapStateToProps)(HeaderContainer);
