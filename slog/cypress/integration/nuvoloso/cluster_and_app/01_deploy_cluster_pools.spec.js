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
import { execClusterCmd, copyFileLocalRemote } from '../../common/remote.js';
import { createPool } from '../../common/pools.js';
import { testAccount } from './deployconstants';

const clusterManagement = Cypress.env('NUVO_CY_CLUSTER_MGMT');
const clusterApplication = Cypress.env('NUVO_CY_CLUSTER_APP');

const KOPS_STATE_STORE = Cypress.env('KOPS_STATE_STORE');

/**
 * Depends on deployed management cluster and deployed 3 node app cluster (no configuration)
 * Log in as system account
 * Create NewTenant account (not Demo Tenant)
 * Create Cluster with CSP (called Nuvoloso)
 * Verify cluster is in correct state
 * Verify SNAPSHOT_CATALOG was created
 * Verify protection domain exists
 * Download cluster YAML
 * Run command to apply YAML in specified cluster (own namespace?)
 * Verify cluster gets created and 'managed'
 * Verify number of nodes is displayed matches number in app cluster
 * Create pool for storage
 * Create account secret and apply in cluster
 */

describe('it verifies the clusters exist', () => {
    const accessKey = Cypress.env('AWS_ACCESS_KEY_ID');
    const accessSecret = Cypress.env('AWS_SECRET_ACCESS_KEY');
    const clusterName = 'test_cluster';
    const credentialName = 'test_credential';
    const defaultPassphrase = 'asdfasdfasdfasdf';
    const defaultRegion = 'us-west-2';
    const defaultZone = 'us-west-2c';
    const domainName = 'test_domain';

    /**
     * run kubectl config against each cluster name
     */
    it('verifies management cluster exists', () => {
        execClusterCmd(`kops --state ${KOPS_STATE_STORE} get cluster ${clusterManagement}`);
    });

    it('verifies application cluster exists', () => {
        execClusterCmd(`kops --state ${KOPS_STATE_STORE} get cluster ${clusterApplication}`);
    });

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

    it('creates a cluster with new domain', () => {
        cy.get('#clustersOverview').click();

        cy.get('#clusterButtonCreate').click();

        cy.get('#clusterName').type(clusterName);

        cy.get('#domainName').type(domainName);

        cy.get('#accessRegion').type(defaultRegion);

        cy.get('#accessZone').type(defaultZone);

        cy.get('#passphrase').type(defaultPassphrase);

        cy.get('#cspCredentialName').type(credentialName);

        cy.get('#accessKeyId').type(accessKey);

        cy.get('#secretKey').type(accessSecret);

        cy.get('#dialogCreateClusterSave').click();

        cy.get('.btn-default', { timeout: 10000 }).click();
    });

    it('verifies the cluster is in the correct state', () => {
        cy.get('#clustersOverview').click();
        cy.get('[data-testid=clusters-table]').contains('Deployable');
    });

    it('verifies the snapshot catalog was created', () => {
        cy.get('#cspOverview').click();
        cy.get('div[class=loader]').should('not.exist');

        cy.get(`#csp-domains-table-link-${domainName}`).click();

        cy.get('#resource-details-tabs-tab-PROTECTION_DOMAINS').click();

        cy.get('#protection-domains-table').contains('SNAPSHOT_CATALOG');
    });

    it('creates the protection domain for data', () => {
        cy.get('#cspOverview').click();

        cy.get('div[class=loader]').should('not.exist');

        cy.get(`#csp-domains-table-link-${domainName}`).click();

        cy.get('#resource-details-tabs-tab-PROTECTION_DOMAINS').click();

        cy.get('#accountCreateProtectionDomain').click();

        cy.get('#createProtectionDialogFormPassphrase').type(defaultPassphrase);

        cy.get('#dialogCreateDomainSave > img').click();

        cy.get('#protection-domains-table').contains(testAccount);

        cy.wait(500);
    });

    let clusterConfigYAML = '';

    it('gets the YAML for the cluster', () => {
        cy.get('div[class=loader]').should('not.exist');

        cy.get('#clustersOverview').click();

        cy.get('div[class=loader]').should('not.exist');

        cy.get(`#cluster-link-${clusterName}`).click();

        cy.get('#cluster-get-yaml').click();

        cy.get('div.vs-yaml-textarea-container > textarea')
            .invoke('text')
            .then(yamlfile => {
                clusterConfigYAML = yamlfile;

                cy.get('.btn-default').click();
            });
    });

    it('installs and confirms the cluster yaml', () => {
        console.log(clusterConfigYAML);
        const configFile = '/tmp/clusterconfig.yaml';

        cy.wait(500);
        cy.get('#clustersOverview').click();

        cy.writeFile(configFile, clusterConfigYAML);
        copyFileLocalRemote(configFile, configFile);

        execClusterCmd(`kubectl --context ${clusterApplication} apply -f ${configFile}`);

        cy.get('[data-testid=clusters-table]').contains('Managed', { timeout: 120000 });
    });

    it('verifies the number of nodes in the cluster', () => {
        cy.wait(500);
        cy.get('#clustersOverview').click();

        cy.get(`#cluster-link-${clusterName}`).click();

        const cmd = `kubectl --context ${clusterApplication} get nodes | egrep node | wc -l`;
        const execCmd = `${Cypress.env('NUVO_CY_SSH')} ${cmd}`;
        cy.exec(execCmd).then(result => {
            const count = result.stdout;
            cy.get('#resource-details-tabs-tab-NODES').contains(count, { timeout: 5 * 60 * 1000 });

            cy.get('#resource-details-tabs-tab-NODES').click();

            cy.get('#cluster-nodes-table')
                .find('.cluster-table-state-text')
                .each($el => {
                    cy.get($el)
                        .invoke('text')
                        .should('equal', 'Managed');
                });
        });
    });

    it('creates a pool for storage', () => {
        createPool(clusterName, testAccount, 'General Premier');
    });

    let clusterSecretConfigYAML = '';

    it('gets the YAML for the secret', () => {
        cy.wait(500);
        cy.get('#clustersOverview').click();

        cy.get(`#cluster-link-${clusterName}`).click();

        cy.get('#cluster-get-secret-yaml').click();

        cy.get('div.vs-yaml-textarea-container > textarea')
            .invoke('text')
            .then(yamlfile => {
                clusterSecretConfigYAML = yamlfile;
                cy.get('.btn-default').click();
            });
    });

    it('installs the cluster account secret yaml', () => {
        const configFile = '/tmp/clustersecretconfig.yaml';

        cy.wait(500);
        cy.get('#clustersOverview').click();

        cy.writeFile(configFile, clusterSecretConfigYAML);
        copyFileLocalRemote(configFile, configFile);

        execClusterCmd(`kubectl apply --context ${clusterApplication} -f ${configFile}`);

        // verification?  none in GUI
    });

    it('logs out', () => {
        logout();
    });
});
