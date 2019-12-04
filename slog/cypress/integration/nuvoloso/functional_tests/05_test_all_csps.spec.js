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
import { createAccount } from '../../common/accounts.js';

/**
 * Create credential for AWS
 * Create credential for GCP
 * Create CSP for AWS
 * Create CSP for GCP
 * Create Cluster with new CSP for AWS
 * Create Cluster with new CSP for GCP
 * Create Cluster with existing CSP for AWS
 * Create Cluster with existing CSP for GCP
 */

describe('it tests all CSP/cluster combinations', () => {
    const accessKey = Cypress.env('AWS_ACCESS_KEY_ID');
    const accessSecret = Cypress.env('AWS_SECRET_ACCESS_KEY');

    const AWScredentialName = 'AWS_test_credential';
    const GCPcredentialName = 'GCP_test_credential';

    const AWSdefaultRegion = 'us-west-2';
    const AWSdefaultZone = 'us-west-2c';
    const AWSdomainName = 'AWS_test_domain';
    const AWSdomainNameNew = 'AWS_test_domain_new';
    const AWScredentialNameNew = 'AWS_test_credential_new';

    const AWSdefaultPassphrase = 'asdfasdfasdfasdf';

    const GCPdomainName = 'GCP_test_domain';
    const GCPdomainNameNew = 'GCP_test_domain_new';
    const GCPcredentialNameNew = 'GCP_test_credential_new';
    const GCPzone = 'us-west1-c';
    const gcpCredentialFilename = Cypress.env('GCP_CREDENTIAL_FILE');

    const testAccount = 'test_credentials_and_csps';

    it('logs in as the system account', () => {
        login(testConstants.SYSTEM_ACCOUNT_USER, testConstants.SYSTEM_ACCOUNT_USER_PASSWORD);
        switchToAccount(testConstants.SYSTEM_ACCOUNT);
    });

    it('creates a test tenant', () => {
        cy.get('#accountsOverview').click();
        createAccount(testAccount, ['admin']);
        switchToAccount(testAccount);
    });

    it('logs in as the demo account and changes to test account', () => {
        login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);
        switchToAccount(testAccount);
    });

    it('Create credential for AWS', () => {
        cy.get('#cspOverview').click();

        cy.get('#cspCredentialCreate > .nuvo-action-text').click();

        cy.get('#cspCredentialName').type(AWScredentialName);

        cy.get('#accessKeyId').type(accessKey);

        cy.get('#secretKey').type(accessSecret);

        cy.get('#dialogCreateCredentialSave > img').click();

        cy.get('#resource-details-tabs-tab-AWS').click();

        cy.get('[data-testid=csp-credentials-table-AWS]').contains(AWScredentialName);
    });

    it('Create credential for GCP', () => {
        // read credentials from file

        cy.readFile(`${gcpCredentialFilename}`).then(credfile => {
            console.log('file is ', credfile);

            cy.get('#cspOverview').click();

            cy.get('#cspCredentialCreate > .nuvo-action-text').click();

            cy.get('#cspCredentialName').type(GCPcredentialName);

            cy.get('#selectProvider .select-options__input input')
                .first()
                .clear({ force: true })
                .type('GCP')
                .type('{enter}', { force: true });

            console.log(JSON.stringify(credfile, null, 2));
            cy.get('#gc_cred').type(JSON.stringify(credfile, null, 2), { delay: 0 });

            cy.get('#dialogCreateCredentialSave > img').click();

            cy.get('#cspOverview').click();

            cy.get('#resource-details-tabs-tab-GCP').click();

            cy.get('[data-testid=csp-credentials-table-GCP]').contains(GCPcredentialName);
        });
    });

    it('Create CSP for AWS existing', () => {
        cy.get('#cspOverview').click();

        cy.get('#cspDomainCreate > .nuvo-action-text').click();

        cy.get('#domainName').type(AWSdomainName);

        cy.get('#accessRegion').type(AWSdefaultRegion);

        cy.get('#accessZone').type(AWSdefaultZone);

        // cy.get('#passphrase').type(AWSdefaultPassphrase);

        cy.get('#selectCredential .select-options__input input')
            .first()
            .clear({ force: true })
            .type(AWScredentialName)
            .type('{enter}', { force: true });

        cy.get('#resource-details-tabs-tab-DOMAINS').click();

        cy.get('#dialogCreateDomainSave > img').click();

        cy.get('[data-testid=csp-domains-table]').contains(AWSdomainName);
    });

    it('Create CSP for GCP existing', () => {
        cy.get('#cspOverview').click();

        cy.get('#cspDomainCreate > .nuvo-action-text').click();

        cy.get('#domainName').type(GCPdomainName);

        cy.get('#selectProvider .select-options__input input')
            .first()
            .clear({ force: true })
            .type('GCP')
            .type('{enter}', { force: true });

        cy.get('#accessZone').type(GCPzone);

        cy.get('#selectCredential .select-options__input input')
            .first()
            .clear({ force: true })
            .type(GCPcredentialName)
            .type('{enter}', { force: true });

        cy.get('#dialogCreateDomainSave > img').click();

        cy.get('#resource-details-tabs-tab-DOMAINS').click();

        cy.get('[data-testid=csp-domains-table]').contains(GCPdomainName);
    });

    it('Create CSP for AWS new', () => {
        cy.get('#cspOverview').click();

        cy.get('#cspDomainCreate > .nuvo-action-text').click();

        cy.get('#domainName').type(AWSdomainNameNew);

        cy.get('#accessRegion').type(AWSdefaultRegion);

        cy.get('#accessZone').type(AWSdefaultZone);

        cy.get('#OPTION_CREATE_NEW').click();

        // cy.get('#passphrase').type(AWSdefaultPassphrase);

        cy.get('#cspCredentialName').type(AWScredentialNameNew);

        cy.get('#accessKeyId').type(accessKey);

        cy.get('#secretKey').type(accessSecret);

        cy.get('#dialogCreateDomainSave > img').click();

        cy.get('#resource-details-tabs-tab-DOMAINS').click();

        cy.get('[data-testid=csp-domains-table]').contains(AWSdomainNameNew);
    });

    it('Create CSP for GCP new', () => {
        cy.readFile(`${gcpCredentialFilename}`).then(credfile => {
            console.log('file is ', credfile);

            cy.get('#cspOverview').click();

            cy.get('#cspDomainCreate > .nuvo-action-text').click();

            cy.get('#domainName').type(GCPdomainNameNew);

            cy.get('#selectProvider .select-options__input input')
                .first()
                .clear({ force: true })
                .type('GCP')
                .type('{enter}', { force: true });

            cy.get('#accessZone').type(GCPzone);

            cy.get('#OPTION_CREATE_NEW').click();

            cy.get('#cspCredentialName').type(GCPcredentialNameNew);

            cy.get('#gc_cred').type(JSON.stringify(credfile, null, 2), { delay: 0 });

            cy.get('#dialogCreateDomainSave > img').click();

            cy.get('#resource-details-tabs-tab-DOMAINS').click();

            cy.get('[data-testid=csp-domains-table]').contains(GCPdomainNameNew);
        });
    });

    it('logs out', () => {
        logout();
    });
});
