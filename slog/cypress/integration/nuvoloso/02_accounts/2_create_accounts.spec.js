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

import * as testConstants from '../test_constants.js';

import { login } from '../../common/login.js';
import { logout } from '../../common/logout.js';
import { switchToAccount } from '../../common/switchToAccount.js';

function createAccount(name, admins) {
    cy.get('#accountToolbarCreate').click();
    cy.get('#accountCreateFormName').type(name);

    if (Array.isArray(admins)) {
        admins.forEach(admin => {
            cy.get('#selectUsersContainer-accountsAdmins .select-options__input input')
                .first()
                .type(admin, { force: true })
                .type('{enter}');
        });
    }

    cy.get('#accountCreateFormSubmit').click();

    cy.get('div[class=loader]').should('not.exist');

    // confirmation
    cy.get('.content').contains(name);
}

function loadAccountsPage() {
    cy.visit('/accounts');
    cy.get('.header-breadcrumbs-base').contains('Accounts');
}

if (testConstants.test_standalone) {
    describe('creates tenant accounts', () => {
        it('creates all the tenants accounts', () => {
            login(testConstants.userName, testConstants.userPassword);

            loadAccountsPage();

            switchToAccount(testConstants.SYSTEM_ACCOUNT);

            createAccount(testConstants.companyName, [testConstants.DEMO_TENANT_USER], null);

            logout();
        });
    });

    describe('creates accounts', () => {
        it('creates all the demo accounts', () => {
            login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);

            loadAccountsPage();

            createAccount(testConstants.acctEng, [testConstants.userDave], null);
            createAccount(testConstants.acctMarketing, [testConstants.userDave], null);
            createAccount(testConstants.acctSales, [testConstants.userDave], null);
            createAccount(testConstants.acctOther, [testConstants.userDave], null);
            createAccount(testConstants.acctSalesOps, [testConstants.userDave], null);
            createAccount(testConstants.acctEngMfgOps, [testConstants.userDave], null);

            logout();
        });
    });
} else {
    describe('running standalone', () => {
        it('should return true', () => {});
    });
}
