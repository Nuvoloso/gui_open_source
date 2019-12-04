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
module.exports = {
    OBJ_ACCOUNT: 'Account',
    OBJ_APPLICATION_GROUP: 'ApplicationGroup',
    OBJ_CONSISTENCY_GROUP: 'ConsistencyGroup',
    OBJ_SERVICE_PLAN: 'ServicePlan',
    SERVICES_NODE_API: 'web-services',
    URI_AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
    },
    // service URL
    URI_AUDIT_LOG: 'audit-log-records',
    URI_ACCOUNTS: 'accounts',
    URI_APPLICATION_GROUPS: 'application-groups',
    URI_BACKUP: 'backup',
    URI_CLUSTERS: 'clusters',
    URI_CONSISTENCY_GROUPS: 'consistency-groups',
    URI_CSP_CREDENTIALS: 'csp-credentials',
    URI_CSP_CREDENTITAL_METADATA: 'csp-credential-metadata',
    URI_CSP_DOMAINS: 'csp-domains',
    URI_CSP_METADATA: 'csp-domain-metadata',
    URI_CSP_STORAGE_TYPES: 'csp-storage-types',
    URI_METRICS: 'metrics',
    URI_NODES: 'nodes',
    URI_POOLS: 'pools',
    URI_PROTECTION_DOMAIN_METADATA: 'protection-domain-metadata',
    URI_PROTECTION_DOMAINS: 'protection-domains',
    URI_RECOVER: 'recover',
    URI_ROLES: 'roles',
    URI_SERVICE_PLAN_ALLOCATIONS: 'service-plan-allocations',
    URI_SERVICE_PLANS: 'service-plans',
    URI_SETTINGS: 'settings',
    URI_SNAPSHOTS: 'snapshots',
    URI_STORAGE: 'storage',
    URI_SYSTEM_HOSTNAME: '/system/hostname',
    URI_USERS: 'users',
    URI_VERSION: 'version',
    URI_VOLUME_SERIES_REQUESTS: 'volume-series-requests',
    URI_VOLUME_SERIES: 'volume-series',
    METRIC_PERIOD_MINUTE: 'PERIOD_MINUTE',
    METRIC_PERIOD_HOUR: 'PERIOD_HOUR',
    METRIC_PERIOD_DAY: 'PERIOD_DAY',
    METRIC_PERIOD_WEEK: 'PERIOD_WEEK',
    METRIC_PERIOD_MONTH: 'PERIOD_MONTH',
    STATE_DISABLED: 'DISABLED',
    STATE_OK: 'OK',
    METRICS_DIR: 'metricsdb',
    METRICS_DB: 'nuvo.db',
    PERIOD_BACKWARD: 'PERIOD_BACKWARD',
    PERIOD_FORWARD: 'PERIOD_FORWARD',
    VIEW_APPLICATION_GROUP: 'VIEW_APPLICATION_GROUP',
    VIEW_SERVICE_PLAN: 'VIEW_SERVICE_PLAN',
    VIEW_VOLUME: 'VIEW_VOLUME',
    VIEW_CONSISTENCY_GROUP: 'VIEW_CONSISTENCY_GROUP',
    ALERT_LEVEL_OK: 0,
    ALERT_LEVEL_WARNING: 1,
    ALERT_LEVEL_ERROR: 2,
    COLOR_OK: '#699362', // --safe-green
    COLOR_WARNING: '#f5a623', // --neutral-yellow
    COLOR_ERROR: '#d45155', // --critical-red
    POLLING_INTERVAL: 5000,
    SOCKET: 'websocket',
    SOCKET_CONNECTED: 'connected',
    WATCHER: 'WATCHER',
    WS_EXPIRED_AUTH: 'WS_EXPIRED_AUTH',
    WS_MESSAGES: {
        CONNECTED: 'Connected to system',
        LOGOUT: 'logout',
        METRICS_DB_DISCONNECTED: 'metricsDatabaseDisconnected',
        METRICS_DB_READY: 'metricsDatabaseReady',
        WATCHER_CONNECTED: 'Connected to central service',
        WATCHER_CONNECTING: 'Reconnecting to central service',
        WATCHER_DISCONNECTED: 'Disconnected from central service',
    },
    WS_RECONNECT_INTERVAL: 30000,
    SERVICE_STATES: {
        ERROR: 'ERROR',
        NOT_READY: 'NOT_READY',
        READY: 'READY',
        STARTING: 'STARTING',
        STOPPED: 'STOPPED',
        STOPPING: 'STOPPING',
        UNKNOWN: 'UNKNOWN',
    },
    CLUSTER_STATES: {
        DEPLOYABLE: 'DEPLOYABLE',
        MANAGED: 'MANAGED',
        RESETTING: 'RESETTING',
        TEAR_DOWN: 'TEAR_DOWN',
        TIMED_OUT: 'TIMED_OUT',
    },
    VSR_COMPLETED_STATES: {
        SUCCEEDED: 'SUCCEEDED',
        FAILED: 'FAILED',
        CANCELED: 'CANCELED',
    },
    VSR_OPERATIONS: {
        ALLOCATE_CAPACITY: 'ALLOCATE_CAPACITY',
        BIND: 'BIND',
        CG_SNAPSHOT_CREATE: 'CG_SNAPSHOT_CREATE',
        CHANGE_CAPACITY: 'CHANGE_CAPACITY',
        CHANGE_SERVICE_PLAN: 'CHANGE_SERVICE_PLAN',
        CREATE_FROM_SNAPSHOT: 'CREATE_FROM_SNAPSHOT',
        CREATE: 'CREATE',
        DELETE: 'DELETE',
        GROW: 'GROW',
        MOUNT: 'MOUNT',
        PROVISION: 'PROVISION',
        PUBLISH: 'PUBLISH',
        RENAME: 'RENAME',
        UNMOUNT: 'UNMOUNT',
        VOL_SNAPSHOT_CREATE: 'VOL_SNAPSHOT_CREATE',
        VOL_SNAPSHOT_DELETE: 'VOL_SNAPSHOT_DELETE',
        VOL_SNAPSHOT_RESTORE: 'VOL_SNAPSHOT_RESTORE',
    },
    VSR_STATES: {
        ALLOCATING_CAPACITY: 'ALLOCATING_CAPACITY',
        ATTACHING_FS: 'ATTACHING_FS',
        BINDING: 'BINDING',
        CANCELED: 'CANCELED',
        CAPACITY_WAIT: 'CAPACITY_WAIT',
        CG_SNAPSHOT_FINALIZE: 'CG_SNAPSHOT_FINALIZE',
        CG_SNAPSHOT_VOLUMES: 'CG_SNAPSHOT_VOLUMES',
        CG_SNAPSHOT_WAIT: 'CG_SNAPSHOT_WAIT',
        CHANGING_CAPACITY: 'CHANGING_CAPACITY',
        CREATED_PIT: 'CREATED_PIT',
        CREATING: 'CREATING',
        CREATING_FROM_SNAPSHOT: 'CREATING_FROM_SNAPSHOT',
        CREATING_PIT: 'CREATING_PIT',
        DELETING_SPA: 'DELETING_SPA',
        FAILED: 'FAILED',
        FINALIZING_SNAPSHOT: 'FINALIZING_SNAPSHOT',
        NEW: 'NEW',
        PAUSED_IO: 'PAUSED_IO',
        PAUSING_IO: 'PAUSING_IO',
        PLACEMENT: 'PLACEMENT',
        PUBLISHING: 'PUBLISHING',
        PUBLISHING_SERVICE_PLAN: 'PUBLISHING_SERVICE_PLAN',
        RENAMING: 'RENAMING',
        SIZING: 'SIZING',
        SNAPSHOT_RESTORE: 'SNAPSHOT_RESTORE',
        SNAPSHOT_RESTORE_DONE: 'SNAPSHOT_RESTORE_DONE',
        SNAPSHOT_RESTORE_FINALIZE: 'SNAPSHOT_RESTORE_FINALIZE',
        SNAPSHOT_UPLOADING: 'SNAPSHOT_UPLOADING',
        SNAPSHOT_UPLOAD_DONE: 'SNAPSHOT_UPLOAD_DONE',
        STORAGE_WAIT: 'STORAGE_WAIT',
        UNDO_ALLOCATING_CAPACITY: 'UNDO_ALLOCATING_CAPACITY',
        UNDO_ATTACHING_FS: 'UNDO_ATTACHING_FS',
        UNDO_BINDING: 'UNDO_BINDING',
        UNDO_CG_SNAPSHOT_VOLUMES: 'UNDO_CG_SNAPSHOT_VOLUMES',
        UNDO_CHANGING_CAPACITY: 'UNDO_CHANGING_CAPACITY',
        UNDO_CREATED_PIT: 'UNDO_CREATED_PIT',
        UNDO_CREATING: 'UNDO_CREATING',
        UNDO_CREATING_FROM_SNAPSHOT: 'UNDO_CREATING_FROM_SNAPSHOT',
        UNDO_CREATING_PIT: 'UNDO_CREATING_PIT',
        UNDO_PAUSED_IO: 'UNDO_PAUSED_IO',
        UNDO_PAUSING_IO: 'UNDO_PAUSING_IO',
        UNDO_PLACEMENT: 'UNDO_PLACEMENT',
        UNDO_PUBLISHING: 'UNDO_PUBLISHING',
        UNDO_RENAMING: 'UNDO_RENAMING',
        UNDO_SIZING: 'UNDO_SIZING',
        UNDO_SNAPSHOT_RESTORE: 'UNDO_SNAPSHOT_RESTORE',
        UNDO_SNAPSHOT_UPLOADING: 'UNDO_SNAPSHOT_UPLOADING',
        UNDO_SNAPSHOT_UPLOAD_DONE: 'UNDO_SNAPSHOT_UPLOAD_DONE',
        UNDO_VOLUME_CONFIG: 'UNDO_VOLUME_CONFIG',
        UNDO_VOLUME_EXPORT: 'UNDO_VOLUME_EXPORT',
        VOLUME_CONFIG: 'VOLUME_CONFIG',
        VOLUME_EXPORT: 'VOLUME_EXPORT',
    },

    /**
     * Max completion time for VSR requests.  Some should finish
     * quickly (within several minutes), but a backup/recover could
     * take a long time.  Limit to 24 hours.
     *
     * Expressed in minutes.
     */
    VSR_COMPLETION_LENGTH_SHORT: 5,
    VSR_COMPLETION_LENGTH_LONG: 60 * 24,

    // filters
    FILTER_AG: 'FILTER_AG',
    FILTER_CG: 'FILTER_CG',
    FILTER_VOL: 'FILTER_VOL',
    FILTER_SP: 'FILTER_SP',
    // icons
    ICON_APPLICATION_GROUP: 'fa-sitemap',
    ICON_CONSISTENCY_GROUP: 'fa-dot-circle-o',
    ICON_ERROR: 'fa-times-circle',
    ICON_OK: 'fa-check',
    ICON_SERVICE_PLAN: 'fa-exchange',
    ICON_VOLUME: 'fa-hdd-o',
    ICON_WARNING: 'fa-exclamation-circle',
    // tooltips objects
    TOOLTIP_APPLICATION_GROUPS: 'TOOLTIP_APPLICATION_GROUPS',
    TOOLTIP_CONSISTENCY_GROUPS: 'TOOLTIP_CONSISTENCY_GROUPS',
    TOOLTIP_SERVICE_PLANS: 'TOOLTIP_SERVICE_PLANS',
    TOOLTIP_VOLUMES: 'TOOLTIP_VOLUMES',
    // tooltip time period
    TOOLTIP_DAY: 'TOOLTIP_DAY',
    TOOLTIP_MONTH: 'TOOLTIP_MONTH',
    TOOLTIP_WEEK: 'TOOLTIP_WEEK',
    // tooltips levels
    TOOLTIP_ERROR: 'TOOLTIP_ERROR',
    TOOLTIP_OK: 'TOOLTIP_OK',
    TOOLTIP_WARNING: 'TOOLTIP_WARNING',
    // dashboard
    DASHBOARD_DEFAULT_NUMBER_DAYS: 30,
    // chart names
    CHART_COMPLIANCE_DETAILS_LATENCY: 'complianceVolumeDetailsLatency',
    CHART_COMPLIANCE_DETAILS_LATENCY_STORAGE: 'complianceVolumeDetailsLatencyStorage',
    CHART_COMPLIANCE_DETAILS_CAPACITY: 'complianceVolumeDetailsCapacity',
    CHART_COMPLIANCE_DETAILS_IO: 'complianceVolumeDetailsIO',
    CHART_COMPLIANCE_DETAILS_BLOCKSIZE: 'complianceVolumeDetailsBlocksize',
    // special tags
    TAG_SERVICE_PLAN_COST: '_SERVICE_PLAN_COST',
    TAG_SERVICE_PLAN_ALLOCATION_COST: '_SERVICE_PLAN_ALLOCATION_COST',
    // service plan names
    // service plans
    SP_NAME_DSS: 'DSS',
    SP_NAME_GEN_APP: 'General',
    SP_NAME_OLTP: 'OLTP',
    SP_NAME_OLTP_PREMIER: 'OLTP Premier',
    SP_NAME_ONLINE_ARCHIVE: 'Online Archive',
    SP_NAME_TECH_APP: 'Technical Applications',
    SP_NAME_STREAMING_ANALYTICS: 'Streaming Analytics',
    SLO_KEYS: {
        AVAILABILITY: 'Availability',
        RPO: 'RPO',
        RESPONSE_TIME_AVERAGE: 'Response Time Average',
        RESPONSE_TIME_MAXIMUM: 'Response Time Maximum',
        RETENTION: 'Retention',
        SECURITY: 'Security',
    },
    IO_KEYS: {
        IO_PATTERN: 'ioPattern',
        PROVISIONING_UNIT: 'provisioningUnit',
        READ_WRITE_MIX: 'readWriteMix',
    },
    // ids for components
    ID_SERVICE_PLAN_EDIT: 'servicePlanEdit',
    ID_SERVICE_PLAN_EDIT_FORM_COST: 'servicePlanEditFormCost',
    ID_SERVICE_PLAN_EDIT_SUBMIT: 'servicePlanEditSubmit',
    ID_SERVICE_PLAN_ALLOCATION: 'servicePlanAllocation',
    ID_SERVICE_PLAN_ALLOCATION_ACCOUNT: 'select-spa-account-',
    ID_SERVICE_PLAN_ALLOCATION_CLUSTER: 'select-spa-cluster-',
    ID_SERVICE_PLAN_ALLOCATION_SIZE: 'select-spa-size-',
    ID_SERVICE_PLAN_ALLOCATION_COST: 'select-spa-cost-',
    ID_SERVICE_PLAN_ALLOCATION_SUBMIT: 'servicePlanAllocateSubmit',

    // metric thresholds
    METRIC_VIOLATION_LEVELS: {
        ERROR: 2,
        WARNING: 1,
        OK: 0,
    },
    METRICS_SP_ERROR_BASE: 1000,
    // session storage items
    SESSION_STORAGE_ACCOUNT: 'account',
    SESSION_STORAGE_TOKEN: 'token',
    // Role types
    ROLE_NAME_ACCOUNT_ADMIN: 'Account Admin',
    ROLE_NAME_ACCOUNT_USER: 'Account User',
    ROLE_NAME_TENANT_ADMIN: 'Tenant Admin',
    ROLE_NAME_SYSTEM_ADMIN: 'System Admin',
    SYSTEM_ACCOUNT_NAME: 'System',
    // WS client/server messages
    WS_MESSAGE_ACCOUNT_UPDATE: 'WS_MESSAGE_ACCOUNT_UPDATE',
    // search selections
    SEARCH_OPTION_GROUP_NAME: 'SEARCH_OPTION_GROUP_NAME',
    SEARCH_OPTION_VOLUME_NAME: 'SEARCH_OPTION_VOLUME_NAME',

    // setup
    SETUP_MENU_IDX: {
        SERVICE_PLANS: 0,
        SPAS: 1,
        ACCOUNTS_COST: 2,
        GROUPS: 3,
        VOLUMES: 4,
    },

    // volume details
    VOLUME_DETAILS_TABS: {
        SETTINGS: 'SETTINGS',
        MEMBERSHIPS: 'MEMBERSHIPS',
        SERVICE_PLAN_COMPLIANCE: 'SERVICE_PLAN_COMPLIANCE',
        SERVICE_HISTORY: 'SERVICE_HISTORY',
    },

    // cluster details
    CLUSTER_DETAILS_TABS: {
        SETTINGS: 'SETTINGS',
        POOLS: 'POOLS',
        VOLUMES: 'VOLUMES',
        NODES: 'NODES',
    },

    // CSP details
    CSP_DETAILS_TABS: {
        CLUSTERS: 'CLUSTERS',
        SETTINGS: 'SETTINGS',
        STORAGE: 'STORAGE',
        PROTECTION_DOMAINS: 'PROTECTION_DOMAINS',
    },

    CSP_TABS: {
        CREDENTIALS: 'CREDENTIALS',
        DOMAINS: 'DOMAINS',
    },

    // Volumes page tabs
    VOLUMES_TABS: {
        VOLUMES: 'VOLUMES',
        APPLICATION_GROUPS: 'APPLICATION_GROUPS',
        CONSISTENCY_GROUPS: 'CONSISTENCY_GROUPS',
    },

    SERVICE_PLANS_OVERVIEW_TABS: {
        SERVICE_PLANS: 'SERVICE_PLANS',
        POOLS: 'POOLS',
    },

    ACCOUNTS_TABS: {
        ACCOUNTS: 'ACCOUNTS',
        USERS: 'USERS',
    },

    ACCOUNT_DETAILS_TABS: {
        DETAILS: 'DETAILS',
        POOLS: 'POOLS',
        PROTECTION_DOMAINS: 'PROTECTION_DOMAINS',
        USERS: 'USERS',
    },

    NUVOLOSO: 'Nuvoloso',

    STYLE_COLOR_NUVO_BLUE_LIGHT: '#56c6f2',
    STYLE_BACKGROUND_HIGHLIGHT: 'rgba(6, 27, 47, 0.1)',
    STYLE_BACKGROUND_DIMMED: 'rgba(6, 27, 47, 0.4)',
    STYLE_HIGHCHART_COLORS: [
        'rgba(var(--nuvo-blue-rgb), 0.8)',
        'rgba(var(--iris-rgb), 0.8)',
        'rgba(var(--neutral-yellow-rgb), 0.8)',
        'rgba(var(--mystrious-honeydew-rgb), 0.8)',
    ],

    // component names
    COMPONENT_SERVICE_PLAN: 'SERVICE_PLANS',

    // dialog options
    OPTION_USE_EXISTING: 'OPTION_USE_EXISTING',
    OPTION_CREATE_NEW: 'OPTION_CREATE_NEW',

    // AWS domain attribute names
    AWS_REGION: 'aws_region',
    AWS_AVAILABILITY_ZONE: 'aws_availability_zone',
    AWS_ACCESS_KEY_ID: 'aws_access_key_id',
    AWS_SECRET_ACCESS_KEY: 'aws_secret_access_key',

    GC_CRED: 'gc_cred',
    GC_ZONE: 'gc_zone',

    // CSP Domains
    CSP_DOMAINS: {
        AWS: 'AWS',
        AZURE: 'Azure',
        GCP: 'GCP',
    },

    // Orchestrator types
    ORCHESTRATOR_TYPE_KUBERNETES: 'kubernetes',

    // Maximum volume size (GiB)
    MAX_VOL_SIZE: 1000,
    // Maximum IOPS based on https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EBSVolumeTypes.html
    // XXX needs to be coded based on storage types/measurements
    MAX_IOPS: 16000,
    MAX_THROUGHPUT: 500,

    // Data returned from metrics database is returned in a specific order
    METRICS_DATA_INDEX_LATENCY_AVG: 0,
    METRICS_DATA_INDEX_LATENCY_TARGET: 1,
    METRICS_DATA_INDEX_LATENCY_MAX: 2,
    METRICS_DATA_INDEX_LATENCY_TARGET_AVG: 3,
    METRICS_DATA_INDEX_LATENCY_TARGET_MAX: 4,
    METRICS_DATA_INDEX_PERFORMANCE: 5,
    METRICS_DATA_INDEX_MAX_PERFORMANCE: 6,
    METRICS_DATA_INDEX_COST_PERFORMANCE: 7,
    METRICS_DATA_INDEX_PERCENT_READS: 8,
    METRICS_DATA_INDEX_PERCENT_WRITES: 9,
    METRICS_DATA_INDEX_BLOCKSIZE: 10,
    METRICS_DATA_INDEX_MIN_BLOCKSIZE: 11,
    METRICS_DATA_INDEX_MAX_BLOCKSIZE: 12,
    METRICS_DATA_SIZE_ARRAY: 12,

    METRICS_DATA_NAME_IOPS: 'iOPS',

    DATA_ARRAY_INDEX_TIME: 0,
    DATA_ARRAY_INDEX_VALUE: 1,

    // field group constants
    MAX_NUMBER_COST_DECIMAL_POINTS: 4,

    // metrics database
    METRICS_DB_INTERVAL_PING: 10000,
    METRICS_DB_RETRY_INTERVAL: 10000,

    /**
     * Metrics service status on client.
     * METRICS_SERVICE_UNKNOWN indicates we are waiting for initial message from webservice.
     */
    METRICS_SERVICE_UNKNOWN: 'METRICS_SERVICE_UNKNOWN',
    METRICS_SERVICE_DISCONNECTED: 'METRICS_SERVICE_DISCONNECTED',
    METRICS_SERVICE_CONNECTED: 'METRICS_SERVICE_CONNECTED',

    /**
     * Violation tracking
     */
    VIOLATION_CLEARED: 'VIOLATION_CLEARED',
    VIOLATION_SET: 'VIOLATION_SET',

    /**
     * Violations
     */
    VIOLATION_LATENCY_MEAN: 'violationlatencymean',
    VIOLATION_LATENCY_MAX: 'violationlatencymax',
    VIOLATION_WORKLOAD_RATE: 'violationworkloadrate',
    VIOLATION_WORKLOAD_MIXREAD: 'violationworkloadmixread',
    VIOLATION_WORKLOAD_MIXWRITE: 'violationworkloadmixwrite',
    VIOLATION_WORKLOAD_AVG_SIZE_MIN: 'violationworkloadavgsizemin',
    VIOLATION_WORKLOAD_AVG_SIZE_MAX: 'violationworkloadavgsizemax',
    VIOLATION_RPO: 'violationRPO',

    /**
     * RPO policy: 4 hours
     */
    RPO_MAXIMUM_SNAPSHOT_INTERVAL: 4 * 60 * 60,
    /**
     * service history object types
     */
    SERVICE_HISTORY_RPO_VIOLATION: 'rpoViolation',
    SERVICE_HISTORY_METRICS_VIOLATION: 'metricsViolation',
    SERVICE_HISTORY_ANNOTATION: 'annotation',

    VOLUME_SNAPSHOT_HEAD: 'HEAD',
    VOLUME_MOUNT_STATES: {
        ERROR: 'ERROR',
        IN_USE: 'IN_USE',
        MOUNTED: 'MOUNTED',
        MOUNTING: 'MOUNTING',
        UNBOUND: 'UNBOUND',
        UNMOUNTING: 'UNMOUNTING',
    },

    // Roles
    ROLE_TYPES: {
        ROLE_SYSTEM: 'ROLE_SYSTEM',
        ROLE_TENANT: 'ROLE_TENANT',
        ROLE_ACCOUNT_ADMIN: 'ROLE_ACCOUNT_ADMIN',
        ROLE_ACCOUNT_USER: 'ROLE_ACCOUNT_USER',
    },

    POOL_CAPACITY_LEVELS: {
        BELOW_70: 0,
        OVER_70_BELOW_80: 1,
        OVER_80_BELOW_90: 2,
        OVER_90: 3,
    },

    // time selection
    TIME_SHIFT_FORWARD: 'TIME_SHIFT_FORWARD',
    TIME_SHIFT_BACKWARD: 'TIME_SHIFT_BACKWARD',

    // watcher strings
    // ignore node update if id is this text
    NODE_ID_SUMMARY_HEARTBEAT: 'summary-heartbeat',

    // passphrase encryption algorithms
    PASSPHRASE_ENCRYPTION_ALGORITHMS: {
        AES256: 'AES-256',
        NONE: 'NONE',
    },

    // protection domains
    PROTECTION_DOMAIN_DEFAULT: 'DEFAULT',
};
