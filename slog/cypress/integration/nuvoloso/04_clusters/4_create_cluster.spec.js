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

const test_standalone = Cypress.env('test_standalone');

export function createCluster(name) {
    cy.get('#clusterToolbarCreate').click({ force: true });

    cy.get('#clusterCreateCspDomainId').select('Nuvoloso (AWS)', { force: true });

    cy.get('#clusterCreateName').type(name);

    cy.get('#clusterCreateSubmit').click();

    cy.get('div[class=loader]').should('not.exist');

    cy.get('[data-testid=clusters-table]').contains(name);
}

if (test_standalone) {
    describe('Cluster', () => {
        it('creates the cluster', () => {
            login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);

            cy.visit('/dev');

            createCluster(testConstants.companyName);
            createCluster(testConstants.westClusterName);
            createCluster(testConstants.eastClusterName);

            logout();
        });
    });
} else {
    describe('running standalone', () => {
        it('should return true', () => {});
    });
}
