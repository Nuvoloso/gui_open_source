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
import { sessionGetAccount } from '../sessionUtils';
import * as constants from '../constants';

export function getTenantRoleId(rolesData) {
    return getRoleId(rolesData, constants.ROLE_NAME_TENANT_ADMIN);
}

export function getAccountUserRoleID(rolesData) {
    return getRoleId(rolesData, constants.ROLE_NAME_ACCOUNT_USER);
}

export function getSystemAdminRoleID(rolesData) {
    return getRoleId(rolesData, constants.ROLE_NAME_SYSTEM_ADMIN);
}

export function getAccountAdminRoleId(rolesData) {
    return getRoleId(rolesData, constants.ROLE_NAME_ACCOUNT_ADMIN);
}

function getRoleId(rolesData, roleName) {
    const { roles = [] } = rolesData || {};

    const role = roles.find(role => {
        return role.name === roleName;
    });

    const { meta } = role || {};
    const { id = '' } = meta || {};

    return id;
}

function getSessionAccountRoleId(user) {
    const { accountRoles = [] } = user || {};
    const currentAccount = sessionGetAccount();

    if (!user || accountRoles.length === 0) {
        return '';
    }

    const role = accountRoles.find(role => {
        return role.accountId === currentAccount;
    });

    return (role && role.roleId) || '';
}

export function isTenantAdmin(user, rolesData) {
    const { accountRoles = [] } = user || {};
    if (!user || accountRoles.length === 0) {
        return false;
    }
    return getTenantRoleId(rolesData) === getSessionAccountRoleId(user);
}

export function isSystemAdmin(user, rolesData) {
    const { accountRoles = [] } = user || {};
    if (!user || accountRoles.length === 0) {
        return false;
    }
    return getSystemAdminRoleID(rolesData) === getSessionAccountRoleId(user);
}

export function isAccountAdmin(user, rolesData) {
    const { accountRoles = [] } = user || {};
    if (!user || accountRoles.length === 0) {
        return false;
    }
    return getAccountAdminRoleId(rolesData) === getSessionAccountRoleId(user);
}

export function isAccountUser(user, rolesData) {
    const { accountRoles = [] } = user || {};
    if (user === null || accountRoles.length === 0) {
        return false;
    }
    return getAccountUserRoleID(rolesData) === getSessionAccountRoleId(user);
}

/**
 * Generate the role object needed to create the account object.
 */
export function genUserRoles(users, admins, user, rolesData) {
    const userRoles = {};

    /**
     * If Sysadmin
     *   creating accounts with tenant admin
     * If Tenant admin
     *   creating accounts with account admin and account user
     * If account admin
     *   editing accounts for account users only
     * If account user
     *   won't see the page
     */

    if (isSystemAdmin(user, rolesData)) {
        if (admins) {
            admins.forEach(admin => {
                userRoles[admin] = {
                    roleId: getTenantRoleId(rolesData),
                };
            });
        }
    } else if (isTenantAdmin(user, rolesData)) {
        if (admins) {
            admins.forEach(admin => {
                userRoles[admin] = {
                    roleId: getAccountAdminRoleId(rolesData),
                };
            });
        }
        if (users) {
            users.forEach(user => {
                userRoles[user] = {
                    roleId: getAccountUserRoleID(rolesData),
                };
            });
        }
    } else if (isAccountAdmin(user, rolesData)) {
        if (admins) {
            admins.forEach(admin => {
                userRoles[admin] = {
                    roleId: getAccountAdminRoleId(rolesData),
                };
            });
        }
        if (users) {
            users.forEach(user => {
                userRoles[user] = {
                    roleId: getAccountUserRoleID(rolesData),
                };
            });
        }
    }

    return userRoles;
}
