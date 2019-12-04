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
import { createAccount } from '../../common/accounts';
import { goAccountsOverview } from '../../common/navigation';

function createUserInAccount(username, password) {
    cy.get('#accountToolbarAddUser > img').click();

    cy.get('#OPTION_CREATE_NEW').click();

    cy.get('#userCreateFormAuthIdentifier').type(username);

    cy.get('#userCreateFormRoleSelect  .select-options__input input')
        .first()
        .clear({ force: true })
        .type('Account User', { force: true })
        .type('{enter}', { force: true });

    cy.get('#userCreateFormPassword').type(password);

    cy.get('#userCreateFormSubmit > img')
        .should('exist')
        .click();

    cy.contains('#users-table-table', username);
}

describe('it tests users', () => {
    const testUser = 'test_user';
    const testPassword = 'test_password';
    const testAccount = 'test_account';

    it('logs in as the demo tenant', () => {
        login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);
        switchToAccount(testConstants.DEMO_TENANT);
    });

    it('creates a new subtenant', () => {
        createAccount(testAccount, testUser, testPassword);
    });

    it('creates users in new account', () => {
        switchToAccount(testAccount);

        goAccountsOverview();
        cy.get('#resource-details-tabs-tab-USERS').click();

        createUserInAccount('user1', 'user');
        createUserInAccount('user2', 'user');
        createUserInAccount('user3', 'user');
    });

    it('validates the count is 4', () => {
        cy.get('#table-header-total-count').contains('4');
    });

    it('selects the users', () => {
        cy.get('#tableItemIduser1 > input').click();
        cy.get('#tableItemIduser2 > input').click();
        cy.get('#tableItemIduser3 > input').click();
    });

    it('validates the selected count is 3', () => {
        cy.get('#table-header-selected-count').contains('3');
    });

    it('sets the filter', () => {
        cy.get('.filtered-input').type('user');
    });

    it('validates the displayed count is 3', () => {
        cy.get('#table-header-displayed-count').contains('3');
    });

    it('selects the users again', () => {
        cy.get('#tableItemIduser1 > input').click();
        cy.get('#tableItemIduser2 > input').click();
        cy.get('#tableItemIduser3 > input').click();
    });

    it('deletes the users', () => {
        cy.get('#userToolbarDelete').click();
        cy.get('[data-testid=deleteUserAfterRemove').click();
        cy.get('#deleteFormButtonDelete').click();
    });

    it('deletes the account', () => {
        switchToAccount(testConstants.DEMO_TENANT);

        cy.get(`[cy-testid=accountToolbarDelete-${testAccount}]`).click();

        cy.get('#deleteFormButtonDelete').click();
    });

    it('logs out', () => {
        logout();
    });
});
