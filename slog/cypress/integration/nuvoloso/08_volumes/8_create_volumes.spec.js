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
import * as constants from '../../../../src/constants.js';

import { login } from '../../common/login.js';
import { logout } from '../../common/logout.js';
import { switchToAccount } from '../../common/switchToAccount.js';

/**
 * Provide a debug mechanism when creating AGs/CGs.
 */
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

export function createVolume(name, cluster, account, servicePlan, size, appName, cgName) {
    cy.get('#volumeSeriesButtonCreate').click({ force: true });

    cy.get('div[class=loader]').should('not.exist', { timeout: 60000 });

    cy.get('.vs-create-form').contains('Create New Volume');
    cy.get('div[class=loader]').should('not.exist', { timeout: 30000 });

    cy.get('#name')
        .clear({ force: true })
        .type(name, { force: true });

    cy.get(`#clustersSelect .select-options__input input`)
        .first()
        .type(cluster, { force: true })
        .type('{enter}', { force: true });

    cy.get(`#selectServicePlan .select-options__input input`)
        .first()
        .type(servicePlan, { force: true })
        .type('{enter}', { force: true });

    cy.get('#volumeSeriesCreateSize')
        .clear({ force: true })
        .type(size, { force: true });

    cy.get(`#selectAGsContainer .select-options__input input`)
        .first()
        .type(appName, { force: true })
        .type('{enter}', { force: true });

    cy.get('#volumeSeriesCreateSubmit > img')
        .should('exist')
        .click();
    cy.get('div[class=loader]').should('not.exist', { timeout: 10000 });
    cy.get('.vs-create-form').should('not.exist');

    cy.contains('[data-testid=volume-series-table]', name, { timeout: 20000 });
}

describe('Volumes', () => {
    let name = 'Marketing-DB1';
    let size = 5;
    let servicePlan = constants.SP_NAME_OLTP;
    let prefix = 'Marketing';
    let appName = debugAG(prefix);
    let cgName = debugCG(prefix);

    it.only('creates the marketing volumes', () => {
        login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
        cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

        cy.get('#volumesOverview').click();
        cy.get('div[class=loader]').should('not.exist');
        cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
        if (!testConstants.test_standalone) {
            switchToAccount(testConstants.SYSTEM_ACCOUNT);
        }
        switchToAccount(testConstants.acctMarketing);

        createVolume(name, testConstants.clusterName, testConstants.acctMarketing, servicePlan, size, appName, cgName);

        name = 'Database-Alpha';
        size = 5;
        servicePlan = constants.SP_NAME_OLTP;
        prefix = 'Marketing';
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        createVolume(name, testConstants.clusterName, testConstants.acctMarketing, servicePlan, size, appName, cgName);

        // For demo, SP changes from OLTP to DSS Data.  Volume needs to
        // be created with final SP configured.
        name = 'Marketing-DB2';
        size = 5;
        servicePlan = constants.SP_NAME_DSS;
        createVolume(name, testConstants.clusterName, testConstants.acctMarketing, servicePlan, size, appName, cgName);

        prefix = 'App-Marketing';
        servicePlan = constants.SP_NAME_GEN_APP;
        appName = debugAG('Marketing');
        cgName = debugCG('Marketing');
        size = 5;
        for (let i = 0; i < 5; i++) {
            name = prefix + '-0' + i;
            createVolume(
                name,
                testConstants.clusterName,
                testConstants.acctMarketing,
                servicePlan,
                size,
                appName,
                cgName
            );
        }

        logout();
    });

    it('creates the engineering volumes', () => {
        login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
        cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

        cy.get('#volumesOverview').click();
        cy.get('div[class=loader]').should('not.exist');

        cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
        switchToAccount(testConstants.acctEng);

        name = 'Eng-App1';
        servicePlan = constants.SP_NAME_GEN_APP;
        size = 10;
        prefix = 'Engineering';
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        createVolume(name, testConstants.clusterName, testConstants.acctEng, servicePlan, size, appName, cgName);

        // same CG
        name = 'Eng-App2';
        servicePlan = constants.SP_NAME_TECH_APP;
        size = 20;
        createVolume(name, testConstants.eastClusterName, testConstants.acctEng, servicePlan, size, appName, cgName);

        // same CG
        name = 'Eng-App3';
        servicePlan = constants.SP_NAME_TECH_APP;
        size = 20;
        createVolume(name, testConstants.eastClusterName, testConstants.acctEng, servicePlan, size, appName, cgName);

        logout();
    });

    it('creates more marketing volumes', () => {
        login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
        cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

        cy.get('#volumesOverview').click();
        cy.get('div[class=loader]').should('not.exist');

        cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
        switchToAccount(testConstants.acctMarketing);

        name = 'Marketing-DSS1';
        servicePlan = constants.SP_NAME_DSS;
        size = 10;
        prefix = 'Marketing';
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        createVolume(name, testConstants.clusterName, testConstants.acctMarketing, servicePlan, size, appName, cgName);

        logout();
    });

    it('creates sales ops volumes', () => {
        login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
        cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

        cy.get('#volumesOverview').click();
        cy.get('div[class=loader]').should('not.exist');
        cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
        switchToAccount(testConstants.acctSalesOps);

        // mimics code in testDb.js
        // mktg db
        servicePlan = constants.SP_NAME_OLTP;
        prefix = 'Sales-Mktg-DB';
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        size = 5;
        for (let i = 0; i < 3; i++) {
            name = prefix + '-0' + i;
            createVolume(
                name,
                testConstants.eastClusterName,
                testConstants.acctSalesOps,
                servicePlan,
                size,
                appName,
                cgName
            );
        }

        logout();
    });

    if (testConstants.test_scale_volumes) {
        it('creates sales ops db volumes', () => {
            login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
            cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

            cy.get('#volumesOverview').click();
            cy.get('div[class=loader]').should('not.exist');
            cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
            switchToAccount(testConstants.acctSalesOps);

            prefix = 'Sales-DB';
            servicePlan = constants.SP_NAME_OLTP;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            size = 5;
            for (let i = 0; i < 3; i++) {
                name = prefix + '-0' + i;
                createVolume(
                    name,
                    testConstants.eastClusterName,
                    testConstants.acctSalesOps,
                    servicePlan,
                    size,
                    appName,
                    cgName
                );
            }

            logout();
        });

        it('creates more sales ops website volumes', () => {
            login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
            cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

            cy.get('#volumesOverview').click();
            cy.get('div[class=loader]').should('not.exist');
            cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
            switchToAccount(testConstants.acctSalesOps);

            // company website
            prefix = 'Website';
            servicePlan = constants.SP_NAME_GEN_APP;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            name = prefix;
            createVolume(
                name,
                testConstants.eastClusterName,
                testConstants.acctSalesOps,
                servicePlan,
                size,
                appName,
                cgName
            );

            servicePlan = constants.SP_NAME_OLTP;
            cgName = debugCG(prefix + '-DB');
            name = prefix + '-DB' + '-01';
            createVolume(
                name,
                testConstants.eastClusterName,
                testConstants.acctSalesOps,
                servicePlan,
                size,
                appName,
                cgName
            );

            logout();
        });

        it('creates mfg ops volumes', () => {
            login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
            cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

            cy.get('#volumesOverview').click();
            cy.get('div[class=loader]').should('not.exist');
            cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
            switchToAccount(testConstants.acctEngMfgOps);

            prefix = 'BD-Mfg-Data';
            servicePlan = constants.SP_NAME_DSS;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            size = 5;

            for (let i = 0; i < 4; i++) {
                name = prefix + '-0' + i;
                createVolume(
                    name,
                    testConstants.westClusterName,
                    testConstants.acctEngMfgOps,
                    servicePlan,
                    size,
                    appName,
                    cgName
                );
            }
            logout();
        });
        it('creates mfg ops oem volumes', () => {
            login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
            cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

            cy.get('#volumesOverview').click();
            cy.get('div[class=loader]').should('not.exist');
            cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
            switchToAccount(testConstants.acctEngMfgOps);

            prefix = 'BD-Mfg-OEM';
            servicePlan = constants.SP_NAME_DSS;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            size = 5;
            for (let i = 0; i < 2; i++) {
                name = prefix + '-0' + i;
                createVolume(
                    name,
                    testConstants.westClusterName,
                    testConstants.acctEngMfgOps,
                    servicePlan,
                    size,
                    appName,
                    cgName
                );
            }

            prefix = 'BD-Mfg-RMA';
            servicePlan = constants.SP_NAME_DSS;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            size = 5;
            for (let i = 0; i < 1; i++) {
                name = prefix + '-0' + i;
                createVolume(
                    name,
                    testConstants.westClusterName,
                    testConstants.acctEngMfgOps,
                    servicePlan,
                    size,
                    appName,
                    cgName
                );
            }
            logout();
        });
        it('creates mfg ops dss /parts  volumes', () => {
            login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
            cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

            cy.get('#volumesOverview').click();
            cy.get('div[class=loader]').should('not.exist');
            cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
            switchToAccount(testConstants.acctEngMfgOps);

            prefix = 'BD-Eng';
            servicePlan = constants.SP_NAME_DSS;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            size = 5;
            for (let i = 0; i < 5; i++) {
                name = prefix + '-0' + i;
                createVolume(
                    name,
                    testConstants.westClusterName,
                    testConstants.acctEngMfgOps,
                    servicePlan,
                    size,
                    appName,
                    cgName
                );
            }

            prefix = 'DB-Mfg-Parts';
            servicePlan = constants.SP_NAME_OLTP;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            size = 5;
            name = prefix + '-0';
            createVolume(
                name,
                testConstants.westClusterName,
                testConstants.acctEngMfgOps,
                servicePlan,
                size,
                appName,
                cgName
            );

            logout();
        });
        it('creates mfg ops inventory volumes', () => {
            login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
            cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

            cy.get('#volumesOverview').click();
            cy.get('div[class=loader]').should('not.exist');
            cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
            switchToAccount(testConstants.acctEngMfgOps);
            prefix = 'DB-Mfg-Inventory';
            servicePlan = constants.SP_NAME_OLTP;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            size = 5;
            name = prefix + '-0';
            createVolume(
                name,
                testConstants.westClusterName,
                testConstants.acctEngMfgOps,
                servicePlan,
                size,
                appName,
                cgName
            );

            prefix = 'DB-Eng-QA';
            servicePlan = constants.SP_NAME_OLTP;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            size = 5;
            name = prefix + '-0';
            createVolume(
                name,
                testConstants.westClusterName,
                testConstants.acctEngMfgOps,
                servicePlan,
                size,
                appName,
                cgName
            );

            logout();
        });
        it('creates mfg ops CAD volumes', () => {
            login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
            cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

            cy.get('#volumesOverview').click();
            cy.get('div[class=loader]').should('not.exist');
            cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
            switchToAccount(testConstants.acctEngMfgOps);

            prefix = 'Eng-CAD-Research';
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            servicePlan = constants.SP_NAME_TECH_APP;
            name = prefix + '-0';
            createVolume(
                name,
                testConstants.westClusterName,
                testConstants.acctEngMfgOps,
                servicePlan,
                size,
                appName,
                cgName
            );

            prefix = 'Eng-CAD-Development';
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            servicePlan = constants.SP_NAME_TECH_APP;
            name = prefix + '-0';
            createVolume(
                name,
                testConstants.westClusterName,
                testConstants.acctEngMfgOps,
                servicePlan,
                size,
                appName,
                cgName
            );

            logout();
        });
        it('creates more ops volumes', () => {
            login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
            cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

            cy.get('#volumesOverview').click();
            cy.get('div[class=loader]').should('not.exist');
            cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });

            switchToAccount(testConstants.acctEngMfgOps);

            prefix = 'App-Eng';
            servicePlan = constants.SP_NAME_GEN_APP;
            appName = debugAG(prefix);
            cgName = debugCG(prefix);
            size = 5;
            for (let i = 0; i < 25; i++) {
                name = prefix + '-0' + i;
                createVolume(
                    name,
                    testConstants.westClusterName,
                    testConstants.acctEngMfgOps,
                    servicePlan,
                    size,
                    appName,
                    cgName
                );
            }

            logout();
        });
    }
});

describe('Volumes - workload', () => {
    let name = '';
    let size = 5;
    let servicePlan = constants.SP_NAME_OLTP;
    let prefix = '';
    let appName = debugAG(prefix);
    let cgName = debugCG(prefix);

    it('creates the workload volumes', () => {
        login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
        cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

        cy.get('#volumesOverview').click();
        cy.get('div[class=loader]').should('not.exist');
        cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
        switchToAccount(testConstants.acctSalesOps);

        name = prefix = 'WorkloadOLTPBasicToPremier';
        servicePlan = constants.SP_NAME_OLTP_PREMIER;
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        size = 100;
        createVolume(
            name,
            testConstants.eastClusterName,
            testConstants.acctSalesOps,
            servicePlan,
            size,
            appName,
            cgName
        );

        name = prefix = 'WorkloadNoChange';
        servicePlan = constants.SP_NAME_OLTP;
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        size = 100;
        createVolume(
            name,
            testConstants.eastClusterName,
            testConstants.acctSalesOps,
            servicePlan,
            size,
            appName,
            cgName
        );

        logout();
    });

    it('creates the workload violation mix read/write volumes', () => {
        login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
        cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

        cy.get('#volumesOverview').click();
        cy.get('div[class=loader]').should('not.exist');
        cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
        switchToAccount(testConstants.acctSalesOps);

        name = prefix = 'ViolationWorkLoadMixRead';
        servicePlan = constants.SP_NAME_STREAMING_ANALYTICS;
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        size = 100;
        createVolume(
            name,
            testConstants.eastClusterName,
            testConstants.acctSalesOps,
            servicePlan,
            size,
            appName,
            cgName
        );

        name = prefix = 'ViolationWorkLoadMixWrite';
        servicePlan = constants.SP_NAME_OLTP;
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        size = 100;
        createVolume(
            name,
            testConstants.eastClusterName,
            testConstants.acctSalesOps,
            servicePlan,
            size,
            appName,
            cgName
        );
        logout();
    });

    it('create eng mfg ops size violation volumes', () => {
        login(testConstants.NORMAL_ACCOUNT_USER, testConstants.NORMAL_ACCOUNT_USER_PASSWORD);
        cy.get('#volumes-donut > div.nu-donut-name').contains('Volumes', { timeout: 10000 });

        cy.get('#volumesOverview').click();
        cy.get('div[class=loader]').should('not.exist');
        cy.contains('.header-breadcrumbs-base', 'Volumes', { timeout: 10000 });
        switchToAccount(testConstants.acctEng);

        name = prefix = 'ViolationWorkloadAvgSizeMin';
        servicePlan = constants.SP_NAME_GEN_APP;
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        size = 100;
        createVolume(name, testConstants.clusterName, testConstants.acctEng, servicePlan, size, appName, cgName);

        name = prefix = 'ViolationWorkloadAvgSizeMax';
        servicePlan = constants.SP_NAME_TECH_APP;
        appName = debugAG(prefix);
        cgName = debugCG(prefix);
        size = 100;
        createVolume(name, testConstants.eastClusterName, testConstants.acctEng, servicePlan, size, appName, cgName);
        logout();
    });
});
