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
// if HOST is set, assume we're pointing to an AWS deployment, which will need https.
const PROTOCOL = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
const HOST = process.env.HOST || 'localhost';
// if no PORT and HOST are set, assume localhost development and default to port 3000.
const PORT = process.env.PORT ? `:${process.env.PORT}` : `${!process.env.HOST ? ':3000' : ''}`;

export const apiURL = `${PROTOCOL}${HOST}${PORT}`;
export const waitPeriodActions = 500;
export const waitPeriodPage = 3000;
export const waitPeriodLoad = 15000;
export const waitPeriodDropdown = 3000;

// eslint-disable-next-line
export const test_standalone = Cypress.env('test_standalone');
// eslint-disable-next-line
export const test_scale_volumes = Cypress.env('test_scale_volumes');

export const SYSTEM_ACCOUNT = 'System';
export const DEMO_TENANT = 'Demo\\ Tenant';
export const NORMAL_ACCOUNT = 'Normal\\ Account';

export const SYSTEM_ACCOUNT_USER = 'admin';
export const SYSTEM_ACCOUNT_USER_PASSWORD = 'admin';

export const NORMAL_ACCOUNT_USER = test_standalone ? 'dave.cohrs@nuvoloso.com' : 'admin';
export const NORMAL_ACCOUNT_USER_PASSWORD = test_standalone ? 'user' : 'admin';

export const DEMO_TENANT_USER = test_standalone ? 'tad.lebeck@nuvoloso.com' : 'admin';
export const DEMO_TENANT_USER_PASSWORD = test_standalone ? 'user' : 'admin';

export const acctEng = test_standalone ? 'Eng' : NORMAL_ACCOUNT;
export const acctMarketing = test_standalone ? 'Marketing' : NORMAL_ACCOUNT;
export const acctOther = test_standalone ? 'Other' : NORMAL_ACCOUNT;
export const acctSales = test_standalone ? 'Sales' : NORMAL_ACCOUNT;
export const acctSalesOps = test_standalone ? 'SalesOps' : NORMAL_ACCOUNT;
export const acctEngMfgOps = test_standalone ? 'EngMfgOps' : NORMAL_ACCOUNT;

export const userName = 'admin';
export const userPassword = 'admin';
export const companyName = 'Nuvoloso';
export const cspRegion = 'us-west-2';
export const cspZone = 'us-west-2a';
export const credentialName = 'AWS Key';
export const keyId = 'AKIAJFQN2RLO2OIRH3MQ';
export const keySecret = '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';
export const managementHost = '100.71.73.164';

// users
export const user1 = 'tad.lebeck@nuvoloso.com';
export const userName1 = 'Tad';
export const userTad = user1;

export const user2 = 'titus.ou@nuvoloso.com';
export const userTitus = user2;
export const userName2 = 'Titus';

export const user3 = 'stephen.manley@nuvoloso.com';
export const userStephen = user3;
export const userName3 = 'Stephen';

export const user4 = 'dave.cohrs@nuvoloso.com';
export const userDave = user4;
export const userName4 = null;

export const user5 = 'rick.rasmussen@nuvoloso.com';
export const userRick = user5;
export const userName5 = null;

export const clusterName = 'Nuvoloso';
export const westClusterName = test_standalone ? 'Nuvo-West' : clusterName;
export const eastClusterName = test_standalone ? 'Nuvo-East' : clusterName;
