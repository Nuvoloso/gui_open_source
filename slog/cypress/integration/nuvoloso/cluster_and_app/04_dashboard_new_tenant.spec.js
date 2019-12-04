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
import { createAccount, deleteAccount } from '../../common/accounts.js';

describe('it creates new tenant and validates empty dashboared', () => {
    const testAccount = 'new_tenant_empty_dashboard'

    it('logs in as the system account', () => {
        login(testConstants.SYSTEM_ACCOUNT_USER, testConstants.SYSTEM_ACCOUNT_USER_PASSWORD);
        switchToAccount(testConstants.SYSTEM_ACCOUNT);
    });

    it('creates a test tenant and switches to it', () => {
        cy.get('#accountsOverview').click();
        createAccount(testAccount, ['admin']);
        switchToAccount(testAccount);
    });

    it('validates the counts after initial creation', () => {
        cy.get('#dashboard').click();
        // volumes count
        cy.get(
            '#volumes-donut > div.nu-donut-and-legend-container > div > div.nu-donut-container > svg > g > text.nu-donut-total-value'
        ).contains('0');
        // ag count
        cy.get('#ag-donut > div.nu-donut-container > svg > g > text.nu-donut-total-value').contains('0');
        // accounts count
        cy.get('#accounts-donut > div.nu-donut-container > svg > g > text.nu-donut-total-value').contains('1');
        // clusters count
        cy.get('#clusters-donut > div.nu-donut-container > svg > g > text.nu-donut-total-value').contains('0');
        // pools count
        cy.get('.dashboard-card-severity-3 > .dashboard-card-col-right > .dashboard-card-count').contains('0');
        cy.get('.dashboard-card-severity-2 > .dashboard-card-col-right > .dashboard-card-count').contains('0');
        cy.get('.dashboard-card-severity-1 > .dashboard-card-col-right > .dashboard-card-count').contains('0');
        cy.get('.dashboard-card-severity-0 > .dashboard-card-col-right > .dashboard-card-count').contains('0');
    });

    it('deletes the test account', () => {
        switchToAccount(testConstants.SYSTEM_ACCOUNT);
        deleteAccount(testAccount)
    })

    it('logs out', () => {
        logout();
    });
});
