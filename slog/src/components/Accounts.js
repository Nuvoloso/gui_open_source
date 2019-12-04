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
import { Link } from 'react-router-dom';

import ButtonAction from './ButtonAction';
import Loader from './Loader';
import AccountCreateForm from './AccountCreateForm';
import DeleteForm from './DeleteForm';
import TableContainer from '../containers/TableContainer';
import { accountMsgs } from '../messages/Account';
import { messages } from '../messages/Messages';
import { renderTags } from './utils';

import {
    getAccountAdminRoleId,
    getAccountUserRoleID,
    getSystemAdminRoleID,
    getTenantRoleId,
    isSystemAdmin,
    isTenantAdmin,
} from '../containers/userAccountUtils';
import { sessionGetAccount } from '../sessionUtils';

import { DeleteForever, Edit } from '@material-ui/icons';
import { ReactComponent as AccountIcon } from '../assets/account.svg';
import btnAddAccountHov from '../assets/btn-add-account-hov.svg';
import btnAddAccountUp from '../assets/btn-add-account-up.svg';
import btnDeleteAllDisable from '../assets/btn-delete-all-disable.svg';
import btnDeleteAllHov from '../assets/btn-delete-all-hov.svg';
import btnDeleteAllUp from '../assets/btn-delete-all-up.svg';

import * as constants from '../constants';

class Accounts extends Component {
    handleDelete(account) {
        const { deleteAccounts, intl, openModal, selectedRows } = this.props;
        const { formatMessage } = intl;
        const { name } = account || selectedRows[0] || {};

        openModal(
            DeleteForm,
            {
                title: formatMessage(accountMsgs.deleteTitle, { count: account ? 1 : selectedRows.length }),
                deleteFunc: () => deleteAccounts(account),
            },
            {
                message: formatMessage(accountMsgs.deleteMsg, {
                    count: account ? 1 : selectedRows.length,
                    name,
                }),
            }
        );
    }

    renderHeader() {
        const { intl, openModal, postAccount, rolesData, userData } = this.props;
        const { user } = userData || {};
        const { formatMessage } = intl;

        return (
            <div className="content-flex-column">
                <div className="content-flex-row">
                    <div className="layout-icon-background">
                        <AccountIcon className="layout-icon" />
                    </div>
                    <div className="content-flex-row layout-summary" />
                    <div className="layout-actions">
                        {isSystemAdmin(user, rolesData) || isTenantAdmin(user, rolesData) ? (
                            <div>
                                <ButtonAction
                                    btnUp={btnAddAccountUp}
                                    btnHov={btnAddAccountHov}
                                    id="accountToolbarCreate"
                                    onClick={() =>
                                        openModal(
                                            AccountCreateForm,
                                            { dark: true, title: formatMessage(accountMsgs.createTitle), postAccount },
                                            {
                                                rolesData,
                                                user,
                                            }
                                        )
                                    }
                                    label={formatMessage(accountMsgs.toolbarCreate)}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className="divider-horizontal" />
            </div>
        );
    }

    renderToolbar() {
        const { selectedRows } = this.props;

        return (
            <div className="table-header-actions">
                <ButtonAction
                    btnDisable={btnDeleteAllDisable}
                    btnHov={btnDeleteAllHov}
                    btnUp={btnDeleteAllUp}
                    disabled={selectedRows.length < 1}
                    id="accountToolbarDelete"
                    onClick={() => this.handleDelete()}
                />
            </div>
        );
    }

    render() {
        const {
            accountsData,
            intl,
            openModal,
            patchAccount,
            rolesData,
            selectedRows,
            servicePlanAllocationsData,
            userData,
            usersData,
            volumeSeriesData,
        } = this.props;
        const { accounts = [] } = accountsData || {};
        const { user } = userData || {};
        const { formatMessage } = intl;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const { volumeSeries = [] } = volumeSeriesData || {};

        if (usersData.loading || userData.loading || rolesData.loading) {
            return <Loader />;
        }

        const columns = [
            {
                Header: formatMessage(accountMsgs.tableName),
                accessor: 'name',
                Cell: row => {
                    const { original, value } = row || {};
                    const { id = '' } = original || {};

                    return (
                        <Link
                            className="table-name-link"
                            id={`accounts-table-link-${value}`}
                            to={{ pathname: `/${constants.URI_ACCOUNTS}/${id}`, state: { name: value } }}
                        >
                            {`${row.value}${row.original.disabled ? ` ${formatMessage(messages.disabledTag)}` : ''}`}
                        </Link>
                    );
                },
            },
            {
                Header: formatMessage(accountMsgs.adminUsersLabel),
                accessor: isSystemAdmin(user, rolesData) ? 'tenants' : 'admins',
                minWidth: 100,
                Cell: row => {
                    const { value = [] } = row || {};

                    return value.length;
                },
            },
            ...(isSystemAdmin(user, rolesData)
                ? []
                : [
                      {
                          Header: formatMessage(accountMsgs.usersLabel),
                          accessor: 'users',
                          minWidth: 115,
                          Cell: row => {
                              const { original } = row || {};
                              const { users = [] } = original || {};

                              return users.length;
                          },
                      },
                  ]),
            {
                Header: formatMessage(accountMsgs.poolsLabel),
                accessor: 'pools',
                minWidth: 60,
            },
            {
                Header: formatMessage(accountMsgs.volumesLabel),
                accessor: 'volumes',
                minWidth: 70,
            },
            {
                Header: formatMessage(accountMsgs.tableDescription),
                accessor: 'description',
                minWidth: 350,
            },
            {
                Header: formatMessage(accountMsgs.tableTags),
                accessor: 'tags',
                minWidth: 400,
                Cell: row => <span>{renderTags(row.value)}</span>,
            },
            {
                Header: formatMessage(accountMsgs.tableActions),
                accessor: 'actions',
                sortable: false,
                width: 120,
                Cell: (selected = {}) => {
                    const { original, row } = selected || {};
                    const { id, name } = original || {};
                    return (
                        <div className="table-actions-cell">
                            <Edit
                                id={`accountToolbarEdit-${id}`}
                                onClick={() => {
                                    openModal(
                                        AccountCreateForm,
                                        { dark: true, title: formatMessage(accountMsgs.editTitle), patchAccount },
                                        {
                                            edit: row,
                                            rolesData,
                                            user,
                                        }
                                    );
                                }}
                            />
                            <DeleteForever
                                id={`accountToolbarDelete-${id}`}
                                cy-testid={`accountToolbarDelete-${name}`}
                                onClick={() => this.handleDelete(row._original)}
                            />
                        </div>
                    );
                },
            },
            {
                Header: 'id',
                show: false,
                accessor: 'id',
            },
        ];

        const userRoleId = getAccountUserRoleID(rolesData);
        const adminRoleId = getAccountAdminRoleId(rolesData);
        const tenantRoleId = getTenantRoleId(rolesData);
        const systemRoleId = getSystemAdminRoleID(rolesData);

        /**
         * If System Admin, will show all accounts in store.
         * If Tenant Admin, should only show accounts in store that match current session account id.
         * If Account Admin, will only show users.
         * If user, won't see the page.
         */
        const filteredAccounts =
            (isSystemAdmin(user, rolesData) || isTenantAdmin(user, rolesData)
                ? accounts
                : accounts.filter(account => {
                      const { tenantAccountId } = account || {};
                      return tenantAccountId === sessionGetAccount();
                  })) || [];

        const data = filteredAccounts.map(account => {
            const { description, disabled, meta, name, tags, userRoles = {} } = account || {};
            const { id } = meta || {};

            const users = [];
            const admins = [];
            const tenants = [];

            Object.keys(userRoles).forEach(userId => {
                const userRole = userRoles[userId];

                if (userRole) {
                    const { roleId } = userRole || {};

                    switch (roleId) {
                        case userRoleId:
                            users.push(userId);
                            break;
                        case adminRoleId:
                            admins.push(userId);
                            break;
                        case tenantRoleId:
                            isTenantAdmin(user, rolesData) ? admins.push(userId) : tenants.push(userId);
                            break;
                        case systemRoleId:
                            tenants.push(userId);
                            break;
                        default:
                            break;
                    }
                }
            });

            return {
                admins,
                description,
                disabled,
                id,
                name,
                pools: servicePlanAllocations.filter(spa => spa.authorizedAccountId === id).length,
                tags,
                tenants,
                userRoles,
                users,
                volumes: volumeSeries.filter(vol => vol.accountId === id).length,
            };
        });

        return (
            <div id="accounts-overview" className="accounts">
                {this.renderHeader()}
                <TableContainer
                    columns={columns}
                    component="ACCOUNTS_TABLE"
                    componentSelectedRows={selectedRows}
                    data={data}
                    defaultSorted={[{ id: 'name' }]}
                    filterLeft
                    id="accounts-table"
                    selectable
                    title={formatMessage(accountMsgs.accountTableTitle)}
                    toolbar={this.renderToolbar()}
                />
            </div>
        );
    }
}

Accounts.propTypes = {
    accountsData: PropTypes.object.isRequired,
    deleteAccounts: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    openModal: PropTypes.func.isRequired,
    patchAccount: PropTypes.func.isRequired,
    postAccount: PropTypes.func.isRequired,
    rolesData: PropTypes.object.isRequired,
    selectedRows: PropTypes.array.isRequired,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    session: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
};

export default injectIntl(Accounts);
