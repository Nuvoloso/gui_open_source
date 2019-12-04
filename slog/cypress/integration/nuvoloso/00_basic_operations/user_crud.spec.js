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

// basic crud tests for user

import * as constants from '../../../../src/constants';
import * as testConstants from '../test_constants.js';

import { login } from '../../common/login.js';
import { logout } from '../../common/logout.js';
import { switchToAccount } from '../../common/switchToAccount.js';

function goAccountsOverview() {
    cy.get('#accountsOverview').should('be.visible');
    cy.wait(300);
    cy.get('#accountsOverview').click();
    cy.get('div[class=loader]').should('not.exist');
}

describe('it tests users', () => {
    const crudUser = 'crud';
    const crudUserModified = `${crudUser}_modified`;
    const crudPassword = 'crud';

    it('logs in', () => {
        login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);
        switchToAccount(testConstants.DEMO_TENANT);
    });

    it('creates a user', () => {
        goAccountsOverview();

        cy.get(`#accounts-table-link-${testConstants.DEMO_TENANT}`).click();
        cy.get('div[class=loader]').should('not.exist');

        cy.get('#resource-details-tabs-tab-USERS').click();
        cy.get('div[class=loader]').should('not.exist');

        cy.get('#accountToolbarAddUser').click();

        cy.get('#OPTION_CREATE_NEW').click();

        cy.get('#userCreateFormAuthIdentifier').type(crudUser);
        cy.get('#userCreateFormPassword').type(crudPassword);

        cy.get('#userCreateFormSubmit').click();

        cy.contains('#users-table-table', crudUser);
    });

    it('modifies a user', () => {
        goAccountsOverview();

        cy.get(`#accounts-table-link-${testConstants.DEMO_TENANT}`).click();
        cy.get('div[class=loader]').should('not.exist');

        cy.get('#resource-details-tabs-tab-USERS').click();
        cy.get('div[class=loader]').should('not.exist');

        cy.get(`[data-testid=userActionEdit-${crudUser}]`).click();

        cy.get('#editName')
            .clear()
            .type(crudUserModified)
            .blur();

        cy.get('#action-save').click();

        cy.wait(500);
        // validation - make sure updated name is in table
        cy.contains('#users-table-table', crudUserModified);
    });

    it('deletes a user', () => {
        goAccountsOverview();

        cy.get(`#accounts-table-link-${testConstants.DEMO_TENANT}`).click();
        cy.get('div[class=loader]').should('not.exist');

        cy.get('#resource-details-tabs-tab-USERS').click();
        cy.get('div[class=loader]').should('not.exist');

        cy.get(`[data-testid=userActionDelete-${crudUserModified}]`).click();
        cy.get('[data-testid=deleteUserAfterRemove').click();
        cy.get('#deleteFormButtonDelete').click();

        // validation make sure table no longer has updated name
        cy.get('#users-table-table').should('not.contain', crudUserModified);
    });

    it('logs out', () => {
        logout();
    });
});
