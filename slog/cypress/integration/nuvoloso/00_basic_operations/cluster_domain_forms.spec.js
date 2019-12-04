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

describe('it tests users', () => {
    it('logs in as the demo tenant', () => {
        login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);
        switchToAccount(testConstants.DEMO_TENANT);
    });

    it('tests create new cluster form', () => {
        cy.get('#clustersOverview').click();

        cy.get('#clusterButtonCreate').click();

        // validate correct radios are shown
        cy.get('[cy-testid=dialog-create-cluster-new]').should('be.enabled');
        cy.get('[cy-testid=select-credent-type-create-new]').should('be.enabled');

        // validate form not enabled until all elements present
        cy.get('#clusterName').type('gt_cluster');

        cy.get('#domainName').type('ct_domain');
        cy.get('#accessRegion').type('us-west-2');

        cy.get('#accessZone').type('us-west-2c');

        cy.get('#cspCredentialName').type('gt_cred');

        cy.get('#accessKeyId').type('AKIAJFQN2RLO2OIRH3MQ');
        cy.get('#secretKey').type('kAKIAJFQN2RLO2OIRH3MQ');

        cy.get('#passphrase').type('123456789012345');

        cy.get('#dialogCreateClusterSave > img').should('have.class', 'action-icon-disabled');

        cy.get('#passphrase').type('6');

        cy.get('#dialogCreateClusterSave > img').should('not.have.class', 'action-icon-disabled');
    });

    it('tests create new domain form', () => {
        cy.get('#cspOverview').click();

        cy.get('#cspDomainCreate > .nuvo-action-text').click();

        // validate correct radios are shown
        cy.get('[cy-testid=select-credent-type-create-new]').should('be.enabled');

        // validate form not enabled until all elements present
        cy.get('#domainName').type('ct_domain');
        cy.get('#accessRegion').type('us-west-2');

        cy.get('#accessZone').type('us-west-2c');

        cy.get('#cspCredentialName').type('gt_cred');

        cy.get('#accessKeyId').type('AKIAJFQN2RLO2OIRH3MQ');
        cy.get('#secretKey').type('kAKIAJFQN2RLO2OIRH3MQ');

        cy.get('#passphrase').type('123456789012345');

        cy.get('#dialogCreateDomainSave > img').should('have.class', 'action-icon-disabled');

        cy.get('#passphrase').type('6');

        cy.get('#dialogCreateDomainSave > img').should('not.have.class', 'action-icon-disabled');
    });

    it('logs out', () => {
        logout();
    });
});
