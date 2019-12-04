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
import { execClusterCmd, copyFileLocalRemote, copyFileRemoteLocal } from '../../common/remote.js';
import { testAccount } from './deployconstants';

/**
 * Deploy a test application that does dynamic provisioning.
 * Confirm the volume gets mounted.
 */

describe('it deploys the application and waits for a volume to mount', () => {
    const testDirectory = 'cypress/integration/nuvoloso/cluster_and_app';
    const appconfigYAML = 'general-premier.yaml';

    it('deploys the application', () => {
        copyFileLocalRemote(`${testDirectory}/${appconfigYAML}`, `/tmp/${appconfigYAML}`);
        execClusterCmd(`kubectl apply -f /tmp/${appconfigYAML}`);
        cy.wait(120000);
    });

    it('logs in as the demo account and changes to test account', () => {
        login(testConstants.DEMO_TENANT_USER, testConstants.DEMO_TENANT_USER_PASSWORD);
        switchToAccount(testAccount);
    });

    it('waits for the volume to mount', () => {
        cy.get('#volumesOverview').click();
        const tmpName = 'pvcout.json';
        execClusterCmd(`-- 'kubectl get pvc -o json > /tmp/${tmpName}'`);
        copyFileRemoteLocal(`/tmp/${tmpName}`, `/tmp/${tmpName}`);

        let pvname = '';
        cy.readFile(`/tmp/${tmpName}`).then(pvcfile => {
            console.log('file is ', pvcfile);
            console.log('pvname is ', pvcfile.items[0].spec.volumeName);

            pvname = pvcfile.items[0].spec.volumeName;

            cy.get('div[class=loader]').should('not.exist');

            cy.get('#volume-series-table').contains(pvname, { timeout: 60 * 10 * 1000 });
            cy.get('#volume-series-table').contains('MOUNTED', { timeout: 60 * 10 * 1000 });
        });
    });

    it('logs out', () => {
        logout();
    });
});
