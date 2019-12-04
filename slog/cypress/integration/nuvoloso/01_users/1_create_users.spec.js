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

import * as constants from '../../../../src/constants';
import * as testConstants from '../test_constants.js';

import { login } from '../../common/login.js';
import { logout } from '../../common/logout.js';
import { switchToAccount } from '../../common/switchToAccount.js';

function createUser(authIdentifier, role, userName) {
    cy.get('#userToolbarCreate').click({ force: true });
    cy.get('#userCreateFormAuthIdentifier')
        .clear()
        .type(authIdentifier);
    if (userName) {
        cy.get('#userCreateFormName')
            .clear()
            .type(userName);
    }
    cy.get('#userCreateFormPassword').clear().type('user');
    cy.get('#userCreateFormSubmit').click();
}

describe('creates users', () => {
    it('creates all the demo users', () => {
        login('admin', 'admin');
        switchToAccount(testConstants.SYSTEM_ACCOUNT);

        cy.visit('/dev');
        cy.get('div[class=loader]').should('not.exist');

        createUser(testConstants.userTad, constants.ROLE_NAME_ACCOUNT_ADMIN);
        createUser(testConstants.userTitus, constants.ROLE_NAME_ACCOUNT_ADMIN);
        createUser(testConstants.userStephen, constants.ROLE_NAME_ACCOUNT_ADMIN);
        createUser(testConstants.userDave, constants.ROLE_NAME_ACCOUNT_ADMIN);
        createUser(testConstants.userRick, constants.ROLE_NAME_ACCOUNT_ADMIN);

        logout();
    });
});
