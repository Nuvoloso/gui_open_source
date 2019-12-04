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

export function createCSPDomain(companyName, cspRegion, cspZone, credentialName, keyId, keySecret, managementHost) {
    cy.get('#cspDomainCreate').click({ force: true });

    cy.get('#domainName').type(companyName);

    cy.get('#accessRegion').type(cspRegion);
    cy.get('#accessZone').type(cspZone);

    cy.get('#cspCredentialName').type(credentialName);
    cy.get('#accessKeyId').type(keyId);
    cy.get('#secretKey').type(keySecret);

    cy.get('#managementHost').type(managementHost);

    cy.get('#dialogCreateClusterSave').click();

    cy.get('div[class=loader]').should('not.exist', { timeout: 10000 });

    cy.contains('[data-testid=csp-domains-table]', companyName, { timeout: 10000 });
}

if (test_standalone) {
    describe('CSP domain', () => {
        it('creates the CSP domain', () => {
            login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);

            cy.visit('/cspdomains');

            createCSPDomain(
                testConstants.companyName,
                testConstants.cspRegion,
                testConstants.cspZone,
                testConstants.credentialName,
                testConstants.keyId,
                testConstants.keySecret,
                '192.168.200.1'
            );

            logout();
        });
    });
} else {
    describe('running standalone', () => {
        it('should return true', () => {});
    });
}
