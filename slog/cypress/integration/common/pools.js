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

export function createPool(cluster, account, spName) {
    cy.get('div[class=loader]').should('not.exist', { timeout: 20000 });
    cy.wait(300);
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
}
