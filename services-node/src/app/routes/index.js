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
const accountRoutes = require('./account_routes');
const applicationGroupRoutes = require('./application_group_routes');
const auditLogRoutes = require('./audit_log_routes');
const authRoutes = require('./auth_routes');
const clusterRoutes = require('./cluster_routes');
const consistencyGroupRoutes = require('./consistency_group_routes');
const cspCredentialRoutes = require('./csp_credential_routes');
const cspRoutes = require('./csp_routes');
const cspStorageTypeRoutes = require('./csp_storage_type_routes');
const metricsRoutes = require('./metrics_routes');
const poolRoutes = require('./pool_routes');
const protectionDomainRoutes = require('./protection_domain_routes');
const roleRoutes = require('./role_routes');
const servicePlanAllocationRoutes = require('./service_plan_allocation_routes');
const servicePlanRoutes = require('./service_plan_routes');
const settingsRoutes = require('./settings_routes');
const sloRoutes = require('./slo_routes');
const snapshotRoutes = require('./snapshot_routes');
const storageRoutes = require('./storage_routes');
const systemRoutes = require('./system_routes');
const userRoutes = require('./user_routes');
const volumeSeriesRoutes = require('./volume_series_routes');

module.exports = function(app) {
    accountRoutes(app);
    applicationGroupRoutes(app);
    auditLogRoutes(app);
    authRoutes(app);
    clusterRoutes(app);
    consistencyGroupRoutes(app);
    cspCredentialRoutes(app);
    cspRoutes(app);
    cspStorageTypeRoutes(app);
    metricsRoutes(app);
    poolRoutes(app);
    protectionDomainRoutes(app);
    roleRoutes(app);
    servicePlanAllocationRoutes(app);
    servicePlanRoutes(app);
    settingsRoutes(app);
    sloRoutes(app);
    snapshotRoutes(app);
    storageRoutes(app);
    systemRoutes(app);
    userRoutes(app);
    volumeSeriesRoutes(app);
};
