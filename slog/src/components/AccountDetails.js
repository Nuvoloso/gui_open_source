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
import { Collapse, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';

import AccountSettings from './AccountSettings';
import ButtonAction from './ButtonAction';
import DeleteForm from './DeleteForm';
import FieldGroup from './FieldGroup';
import PoolsTableContainer from '../containers/PoolsTableContainer';
import UserCreateForm from './UserCreateForm';
import UsersContainer from '../containers/UsersContainer';

import { accountMsgs } from '../messages/Account';
import { isTenantAdmin, isSystemAdmin } from '../containers/userAccountUtils';

import * as constants from '../constants';

import { ReactComponent as AccountIcon } from '../assets/account.svg';
import btnAddUserHov from '../assets/btn-add-user-hov.svg';
import btnAddUserUp from '../assets/btn-add-user-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';

class AccountDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            openDialogAddUser: false,
            tabKey: constants.ACCOUNT_DETAILS_TABS.DETAILS,
        };

        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.renderAddUserDialog = this.renderAddUserDialog.bind(this);
        this.toggleDialogAddUser = this.toggleDialogAddUser.bind(this);
    }

    componentDidMount() {
        const { account, intl, onSetResourceHeaderName } = this.props;
        const { name } = account || {};
        const { formatMessage } = intl;

        if (name && onSetResourceHeaderName) {
            onSetResourceHeaderName(formatMessage(accountMsgs.accountDetailsTitle, { name }));
        }
    }

    componentDidUpdate(prevProps) {
        const { account, onSetResourceHeaderName, intl } = this.props;
        const { name } = account || {};
        const { formatMessage } = intl;

        const { account: prevAccount } = prevProps;
        const { name: prevName } = prevAccount || {};

        if (name !== prevName && onSetResourceHeaderName) {
            onSetResourceHeaderName(formatMessage(accountMsgs.accountDetailsTitle, { name }));
        }
    }

    componentWillUnmount() {
        const { onSetResourceHeaderName } = this.props;

        if (onSetResourceHeaderName) {
            onSetResourceHeaderName(null);
        }
    }

    getUserRoleCounts() {
        const { account, rolesData } = this.props;
        const { userRoles = {} } = account || {};
        const { roles = [] } = rolesData || {};

        const counts = { admins: 0, tenants: 0, users: 0 };

        const keys = Object.keys(userRoles) || [];
        keys.forEach(key => {
            const { roleId } = userRoles[key] || {};
            const role = roles.find(role => {
                const { meta } = role || {};
                const { id } = meta || {};

                return id === roleId;
            });
            const { name } = role || {};

            const { admins = 0, tenants = 0, users = 0 } = counts || {};

            switch (name) {
                case constants.ROLE_NAME_ACCOUNT_ADMIN:
                    counts.admins = admins + 1;
                    break;
                case constants.ROLE_NAME_ACCOUNT_USER:
                    counts.users = users + 1;
                    break;
                case constants.ROLE_NAME_SYSTEM_ADMIN:
                case constants.ROLE_NAME_TENANT_ADMIN:
                    counts.tenants = tenants + 1;
                    break;
                default:
                    break;
            }
        });

        return counts;
    }

    handleTabSelect(tabKey) {
        this.setState({ tabKey });
    }

    toggleDialogAddUser() {
        const { openDialogAddUser } = this.state;
        this.setState({
            openDialogAddUser: !openDialogAddUser,
        });
    }

    renderAddUserDialog() {
        const { account, intl, onAddUser, rolesData, usersData } = this.props;
        const { name } = account || {};
        const { formatMessage } = intl;
        const { openDialogAddUser } = this.state;

        return (
            <Collapse in={openDialogAddUser} unmountOnExit>
                <div className="account-details-user-dialog">
                    <UserCreateForm
                        account={account}
                        cancel={this.toggleDialogAddUser}
                        onSubmit={onAddUser}
                        rolesData={rolesData}
                        title={`${formatMessage(accountMsgs.addUserTitle)}${name ? `: ${name}` : ''}`}
                        usersData={usersData}
                    />
                </div>
            </Collapse>
        );
    }

    renderHeader() {
        const { account, accountsData, intl, rolesData, servicePlanAllocationsData, userData } = this.props;
        const { accounts = [] } = accountsData || {};
        const { formatMessage } = intl;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const { user } = userData || {};
        const { meta, name, tenantAccountId } = account || {};
        const { id, timeCreated } = meta || {};
        const { name: tenantName } =
            accounts.find(account => {
                const { meta } = account || {};
                const { id } = meta || {};

                return id === tenantAccountId;
            }) || {};
        const isSystemAccount = isSystemAdmin(user, rolesData);
        const isTenantAccount = isTenantAdmin(user, rolesData);
        const createdByName =
            tenantName || (isTenantAccount || isSystemAccount ? formatMessage(accountMsgs.systemUser) : '');

        const userRoleCounts = this.getUserRoleCounts();
        const { admins = 0, tenants = 0, users = 0 } = userRoleCounts || {};

        const poolCounts = servicePlanAllocations.filter(spa => spa.authorizedAccountId === id).length;

        return (
            <div className="resource-details-header">
                <div className="layout-icon-background">
                    <AccountIcon className="layout-icon" />
                </div>
                <div className="resource-details-header-attributes-container">
                    <div className="resource-details-title mt20">
                        {formatMessage(accountMsgs.accountDetailsTitle, { name })}
                    </div>
                    <div className="resource-details-header-attributes">
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(accountMsgs.createdOnLabel)}
                                inputComponent={
                                    <div className="resource-details-value">{moment(timeCreated).format('l')}</div>
                                }
                            />
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(accountMsgs.createdByLabel)}
                                inputComponent={<div className="resource-details-value">{createdByName}</div>}
                            />
                        </div>
                        <div className="resource-details-header-attributes-group account-details-header-col-2">
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(accountMsgs.adminUsersLabel)}
                                inputComponent={
                                    <div className="resource-details-value">
                                        {isSystemAccount || isTenantAccount ? tenants : admins}
                                    </div>
                                }
                            />
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(accountMsgs.tableUsers)}
                                inputComponent={<div className="resource-details-value">{users}</div>}
                            />
                        </div>
                        <div className="resource-details-header-attributes-group">
                            <FieldGroup
                                className="mb5"
                                label={formatMessage(accountMsgs.poolsLabel)}
                                inputComponent={
                                    <Link
                                        className="value-link"
                                        to={{
                                            pathname: `/${constants.URI_SERVICE_PLANS}`,
                                            state: {
                                                filter: name,
                                                tabKey: constants.SERVICE_PLANS_OVERVIEW_TABS.POOLS,
                                            },
                                        }}
                                    >
                                        {poolCounts}
                                    </Link>
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="layout-actions">
                    <div>
                        <ButtonAction
                            btnHov={btnAddUserHov}
                            btnUp={btnAddUserUp}
                            id="accountToolbarAddUser"
                            label={formatMessage(accountMsgs.toolbarAddUser)}
                            onClick={this.toggleDialogAddUser}
                        />
                    </div>
                    <div>
                        <ButtonAction
                            btnUp={btnCancelUp}
                            btnHov={btnCancelHov}
                            id="accountToolbarDelete"
                            onClick={() => {
                                const { account, intl, onDeleteAccount, onOpenModal } = this.props;
                                const { formatMessage } = intl;
                                const { name } = account || {};

                                if (onOpenModal) {
                                    onOpenModal(
                                        DeleteForm,
                                        {
                                            title: formatMessage(accountMsgs.deleteTitle, {
                                                count: 1,
                                            }),
                                            deleteFunc: onDeleteAccount,
                                        },
                                        {
                                            message: formatMessage(accountMsgs.deleteMsg, {
                                                count: 1,
                                                name,
                                            }),
                                        }
                                    );
                                }
                            }}
                            label={formatMessage(accountMsgs.toolbarDelete)}
                        />
                    </div>
                </div>
                <div className="divider-horizontal" />
            </div>
        );
    }

    render() {
        const { account, intl, onPatchAccount } = this.props;
        const { formatMessage } = intl;
        const { openDialogAddUser, tabKey } = this.state;

        return (
            <div className="resource-details account-details">
                <div className="component-page">
                    {this.renderHeader()}
                    {this.renderAddUserDialog()}
                    <Tabs
                        activeKey={tabKey}
                        className="tabs-container"
                        id="resource-details-tabs"
                        mountOnEnter
                        onSelect={this.handleTabSelect}
                    >
                        <Tab
                            eventKey={constants.ACCOUNT_DETAILS_TABS.DETAILS}
                            title={formatMessage(accountMsgs.tabDetails)}
                        >
                            <AccountSettings account={account} saveSettings={onPatchAccount} />
                        </Tab>
                        <Tab
                            eventKey={constants.ACCOUNT_DETAILS_TABS.POOLS}
                            title={formatMessage(accountMsgs.tabPools)}
                        >
                            <PoolsTableContainer
                                account={account}
                                hideColumnFilter
                                tableComponentName="ACCOUNT_POOLS"
                            />
                        </Tab>
                        <Tab
                            eventKey={constants.ACCOUNT_DETAILS_TABS.USERS}
                            title={formatMessage(accountMsgs.tabUsers)}
                        >
                            <UsersContainer account={account} dialogOpenCreate={openDialogAddUser} tableOnly />
                        </Tab>
                    </Tabs>
                </div>
            </div>
        );
    }
}

AccountDetails.propTypes = {
    account: PropTypes.object,
    accountsData: PropTypes.object,
    intl: intlShape.isRequired,
    onAddUser: PropTypes.func,
    onDeleteAccount: PropTypes.func,
    onOpenModal: PropTypes.func,
    onPatchAccount: PropTypes.func,
    onSetResourceHeaderName: PropTypes.func,
    rolesData: PropTypes.object,
    servicePlanAllocationsData: PropTypes.object,
    userData: PropTypes.object,
    usersData: PropTypes.object,
};

export default injectIntl(AccountDetails);
