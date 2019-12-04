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

export function execClusterCmd(cmd) {
    const execCmd = `${Cypress.env('NUVO_CY_SSH')} ${cmd}`;

    cy.exec(execCmd).then(result => {
        console.log(result.stdout);
        return result.stdout;
    });
}

export function copyFileLocalRemote(localFile, remoteFile) {
    const scpCmd = `${Cypress.env('NUVO_CY_SCP')} ${localFile} ${Cypress.env('NUVO_CY_SCP_REMOTE')}:${remoteFile}`;

    cy.exec(scpCmd).then(result => {
        console.log(result);
    });
}

export function copyFileRemoteLocal(localFile, remoteFile) {
    const scpCmd = `${Cypress.env('NUVO_CY_SCP')} ${Cypress.env('NUVO_CY_SCP_REMOTE')}:${remoteFile} ${localFile}`;

    cy.exec(scpCmd).then(result => {
        console.log(result);
    });
}
