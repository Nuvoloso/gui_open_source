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

import * as constants from '../../../../src/constants';

import { switchToAccount } from '../../common/switchToAccount.js';

const DebugGroups = false;
function debugAG(ag) {
    if (DebugGroups) {
        return 'ag-' + ag;
    } else {
        return ag;
    }
}

function debugCG(cg) {
    if (DebugGroups) {
        return 'cg-' + cg;
    } else {
        return cg;
    }
}

function createAG(name, account) {
    cy.get('#agToolbarCreate').click();

    cy.get('#applicationGroupCreateFormName')
        .clear()
        .type(name);

    cy.get('#groupsFormSubmit').click();

    cy.get('div[class=loader]').should('not.exist');

    cy.get('[data-testid=application-groups-table]').contains(name);
}

describe('Application Groups', () => {
    it('creates the application groups', () => {
        login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);

        cy.visit(`/${constants.URI_VOLUME_SERIES}`);
        cy.contains('.header-breadcrumbs-base', 'Volumes Overview');
        cy.contains('#volumes-tabs-tab-APPLICATION_GROUPS', 'Application Groups');

        cy.get('div[class=loader]').should('not.exist');

        cy.get('#volumes-tabs-tab-APPLICATION_GROUPS').click();

        switchToAccount(testConstants.acctMarketing);

        createAG(debugAG('Marketing'), testConstants.acctMarketing);

        switchToAccount(testConstants.acctEng);
        createAG(debugAG('Engineering'), testConstants.acctEng);
        createAG(debugAG('ViolationWorkloadAvgSizeMin'), testConstants.acctEng);
        createAG(debugAG('ViolationWorkloadAvgSizeMax'), testConstants.acctEng);

        switchToAccount(testConstants.acctSalesOps);
        createAG(debugAG('Sales-Mktg-DB'), testConstants.acctSalesOps);
        createAG(debugAG('Sales-DB'), testConstants.acctSalesOps);
        createAG(debugAG('Website'), testConstants.acctSalesOps);
        createAG(debugAG('WorkloadOLTPBasicToPremier'), testConstants.acctSalesOps);
        createAG(debugAG('WorkloadNoChange'), testConstants.acctSalesOps);
        createAG(debugAG('ViolationWorkLoadMixRead'), testConstants.acctSalesOps);
        createAG(debugAG('ViolationWorkLoadMixWrite'), testConstants.acctSalesOps);

        switchToAccount(testConstants.acctEngMfgOps);
        createAG(debugAG('BD-Mfg-Data'), testConstants.acctEngMfgOps);
        createAG(debugAG('BD-Mfg-OEM'), testConstants.acctEngMfgOps);
        createAG(debugAG('BD-Mfg-RMA'), testConstants.acctEngMfgOps);
        createAG(debugAG('BD-Eng'), testConstants.acctEngMfgOps);
        createAG(debugAG('DB-Mfg-Parts'), testConstants.acctEngMfgOps);
        createAG(debugAG('DB-Mfg-Inventory'), testConstants.acctEngMfgOps);
        createAG(debugAG('DB-Eng-QA'), testConstants.acctEngMfgOps);
        createAG(debugAG('Eng-CAD-Research'), testConstants.acctEngMfgOps);
        createAG(debugAG('Eng-CAD-Development'), testConstants.acctEngMfgOps);
        createAG(debugAG('App-Eng'), testConstants.acctEngMfgOps);
        createAG(debugAG('ViolationWorkloadRate'), testConstants.acctEngMfgOps);

        logout();
    });
});
