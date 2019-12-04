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

function createServicePlanAllocation(spName, cluster, account) {
    it('creates the service plan allocations', () => {
        login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);

        cy.get('div[class=loader]').should('not.exist', { timeout: 20000 });

        switchToAccount(testConstants.DEMO_TENANT);

        cy.get('div[class=loader]').should('not.exist', { timeout: 20000 });

        cy.wait(250);
        cy.get('#clustersOverview').click();
        cy.get('div[class=loader]').should('not.exist');

        cy.get('div[class=loader]').should('not.exist', { timeout: 20000 });

        cy.contains('.header-breadcrumbs-base', 'Clusters', { timeout: 10000 });
        cy.get('div[class=loader]').should('not.exist', { timeout: 20000 });
        // navigate to the cluster
        let id = '';

        id = `#cluster-link-${cluster}`;
        cy.get(id).click({ force: true });
        cy.contains('.header-breadcrumbs > div', cluster);

        // click manage pools

        cy.get('#clusters-details-manage-pools').click();

        // click Account
        id = `#spa-form-account-${account}`;
        cy.get(id).click();

        cy.wait(500);

        cy.get('div[class=loader]').should('not.exist', { timeout: 20000 });

        const normalizedName = spName.split(' ').join('\\ ');
        id = `#spa-form-service-plan-${normalizedName}`;

        // click service plan
        cy.get(id).check();

        // fill in value for capacity
        cy.get(`#spa-form-capacity-${normalizedName}`)
            .clear()
            .type(300);

        // fill in value for cost
        cy.get(`#spa-form-cost-${normalizedName}`)
            .clear()
            .type(10);

        // click save
        cy.get(`#button-save`).click();

        cy.get('div[class=loader]').should('not.exist');

        logout();
    });
}

describe.only('Service Plan Allocations', () => {
    let cardName = '';

    /**
     * Note that if you modify the order of service plans, you must adjust
     * the reference in the call to addToServicePlan.
     *
     * Nuvoloso: Marketing, Eng (General)
     * Nuvo-West: EngMFgOps, Eng (Premier)
     * Nuvo-East: SalesOps, Eng (Tech Apps)
     */

    cardName = constants.SP_NAME_DSS;
    createServicePlanAllocation(cardName, testConstants.clusterName, testConstants.acctMarketing);
    createServicePlanAllocation(cardName, testConstants.eastClusterName, testConstants.acctSalesOps);
    createServicePlanAllocation(cardName, testConstants.westClusterName, testConstants.acctEngMfgOps);

    cardName = constants.SP_NAME_OLTP;
    createServicePlanAllocation(cardName, testConstants.clusterName, testConstants.acctMarketing);
    createServicePlanAllocation(cardName, testConstants.eastClusterName, testConstants.acctSalesOps);
    createServicePlanAllocation(cardName, testConstants.westClusterName, testConstants.acctEngMfgOps);

    cardName = constants.SP_NAME_GEN_APP;
    createServicePlanAllocation(cardName, testConstants.clusterName, testConstants.acctEng);
    createServicePlanAllocation(cardName, testConstants.eastClusterName, testConstants.acctSalesOps);
    createServicePlanAllocation(cardName, testConstants.westClusterName, testConstants.acctEngMfgOps);
    createServicePlanAllocation(cardName, testConstants.clusterName, testConstants.acctMarketing);

    cardName = constants.SP_NAME_TECH_APP;
    createServicePlanAllocation(cardName, testConstants.eastClusterName, testConstants.acctEng);
    createServicePlanAllocation(cardName, testConstants.westClusterName, testConstants.acctEngMfgOps);

    cardName = constants.SP_NAME_OLTP_PREMIER;
    createServicePlanAllocation(cardName, testConstants.westClusterName, testConstants.acctEng);
    createServicePlanAllocation(cardName, testConstants.eastClusterName, testConstants.acctSalesOps);

    cardName = constants.SP_NAME_STREAMING_ANALYTICS;
    createServicePlanAllocation(cardName, testConstants.eastClusterName, testConstants.acctEng);
    createServicePlanAllocation(cardName, testConstants.eastClusterName, testConstants.acctSalesOps);
    createServicePlanAllocation(cardName, testConstants.westClusterName, testConstants.acctEngMfgOps);

    cardName = constants.SP_NAME_ONLINE_ARCHIVE;
    createServicePlanAllocation(cardName, testConstants.westClusterName, testConstants.acctEngMfgOps);
});
