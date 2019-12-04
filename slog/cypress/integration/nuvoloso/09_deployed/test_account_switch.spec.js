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
import { switchToAccount } from '../../common/switchToAccount';

import * as constants from '../../../../src/constants';

describe('tests switch', () => {
    it('creates all the demo users', () => {
        login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);

        switchToAccount(testConstants.DEMO_TENANT);

        cy.visit(`/${constants.URI_VOLUME_SERIES}`);
        cy.contains('.header-breadcrumbs-base', 'Volumes');

        switchToAccount(testConstants.NORMAL_ACCOUNT);

        logout();
    });
});
