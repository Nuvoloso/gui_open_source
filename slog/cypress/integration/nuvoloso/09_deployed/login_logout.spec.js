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

// login tests
describe('Login and logout', function() {
    it('Successfully logins in as system admin', function() {
        cy.visit('/'); // change URL to match your dev URL

        cy.get('#loginUsername').type('admin');
        cy.get('#loginPassword').type('admin');

        cy.get('#loginSubmit').click();

        cy.get('.header-menu-title').should('contain', 'admin');
    });

    it('Successfully logs out', function() {
        cy.get('#nav-user-dropdown').click();
        cy.get('#logout-icon').click();
    });
});
