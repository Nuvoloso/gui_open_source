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
import axios from 'axios';

import { getErrorMsg, validateStatus } from '../components/utils';
import { postCluster } from './clusterActions';
import { ATTRIBUTE_AWS_NO_CRED, ATTRIBUTE_GCP_NO_CRED } from '../reducers/csps';

import * as types from './types';

import * as constants from '../constants';

const urlCspCredentials = `/${constants.URI_CSP_CREDENTIALS}`;
const urlCspDomains = `/${constants.URI_CSP_DOMAINS}`;
const apiUrlAccounts = `/${constants.URI_ACCOUNTS}`;

const urlCspMetadata = `/${constants.URI_CSP_METADATA}`;

export function getCSPs() {
    return dispatch => {
        dispatch({ type: types.GET_CSPS_REQUEST });
        return axios.get(urlCspDomains).then(
            response => {
                dispatch({ type: types.GET_CSPS_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_CSPS_FAILURE, error });
            }
        );
    };
}

export function postCSP(params) {
    return dispatch => {
        dispatch({ type: types.POST_CSPS_REQUEST });

        return axios.post(urlCspDomains, params).then(
            response => {
                dispatch({ type: types.POST_CSPS_SUCCESS, payload: response.data });

                const { meta, name } = response.data || {};
                const { id } = meta || {};
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'cloud service provider'}`,
                });

                const { createSnapshotCatalogPolicy } = params;
                if (createSnapshotCatalogPolicy) {
                    /**
                     * Create the snapshot catalog PD and then update the account
                     * policy
                     */
                    const createSnapshotCatalogParams = {
                        ...params,
                        cspDomainId: id,
                    };
                    dispatch(createSnapshotCatalog(createSnapshotCatalogParams));
                }
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_CSPS_FAILURE, error });
            }
        );
    };
}

export function deleteCSPs(csps) {
    return dispatch => {
        dispatch({ type: types.DELETE_CSPS_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failedNames = [];

        for (let i = 0; i < csps.length; i++) {
            reqs.push(
                axios.delete(`${urlCspDomains}/${csps[i].id}`, { csp: csps[i] }).catch(error => {
                    failedNames.push({ name: csps[i].name, message: getErrorMsg(error) });
                    return null;
                })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        const { config, status } = args[j];
                        const { csp } = config || {};
                        const { id, name } = csp || {};

                        if (validateStatus(status)) {
                            completedIds.push(id);
                            dispatch({
                                type: types.REMOVE_SELECTED_ROW_CSPS,
                                row: { id },
                            });
                        } else {
                            failedNames.push({
                                name,
                                message: `Error deleting CSP ${status}`,
                            });
                        }
                    }
                }

                if (completedIds.length > 0) {
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully deleted cloud service provider`,
                    });
                    dispatch({ type: types.DELETE_CSPS_SUCCESS, payload: { ids: completedIds } });
                }
                if (failedNames.length > 0) {
                    const errorMessage = failedNames.map(name => {
                        return `Error deleting CSP ${name.name}: ${name.message}`;
                    });
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: errorMessage });
                    dispatch({ type: types.DELETE_CSPS_FAILURE, payload: { names: failedNames } });
                }
            })
        );
    };
}

export function patchCSP(id, params) {
    return dispatch => {
        const keys = Object.keys(params) || [];
        if (keys.length > 0) {
            dispatch({ type: types.UPDATE_CSPS_REQUEST });
            return axios.patch(urlCspDomains.concat('/', id, '?set='.concat(keys.join('&set='))), params).then(
                response => {
                    dispatch({ type: types.REMOVE_SELECTED_ROW_CSPS, row: { id } });
                    dispatch({ type: types.UPDATE_CSPS_SUCCESS, payload: response.data });

                    const { name } = response.data || {};
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully updated ${name || 'cloud service provider'}`,
                    });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                    dispatch({ type: types.UPDATE_CSPS_FAILURE, error });
                }
            );
        }
    };
}

/**
 * Create a CSP and a cluster if CSP creation successful.
 * @param {*} params
 * @param {*} name
 */
export function postCSPandCluster(params, clusterName) {
    return dispatch => {
        dispatch({ type: types.POST_CSPS_REQUEST });

        return axios.post(urlCspDomains, params).then(
            response => {
                dispatch({ type: types.POST_CSPS_SUCCESS, payload: response.data });

                const { name } = response.data || {};
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'cloud service provider'}`,
                });

                /**
                 * Now we can dispatch cluster create.
                 */
                const { meta } = response.data || {};
                const { id } = meta;
                const clusterCreateParams = {
                    clusterType: constants.ORCHESTRATOR_TYPE_KUBERNETES,
                    name: clusterName,
                    cspDomainId: id,
                };
                dispatch(postCluster(clusterCreateParams));

                /**
                 * Create the snapshot catalog PD and then update the account
                 * policy
                 */
                const { createSnapshotCatalogPolicy } = params;
                if (createSnapshotCatalogPolicy) {
                    const createSnapshotCatalogParams = {
                        ...params,
                        cspDomainId: id,
                    };
                    dispatch(createSnapshotCatalog(createSnapshotCatalogParams));
                }
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_CSPS_FAILURE, error });
            }
        );
    };
}

function domainAttributesPruned(params) {
    switch (params.cspDomainType) {
        case constants.CSP_DOMAINS.AWS: {
            const cspDomainAttributes = ATTRIBUTE_AWS_NO_CRED;

            cspDomainAttributes[constants.AWS_REGION].value = params.cspDomainAttributes[constants.AWS_REGION].value;
            cspDomainAttributes[constants.AWS_AVAILABILITY_ZONE].value =
                params.cspDomainAttributes[constants.AWS_AVAILABILITY_ZONE].value;

            return cspDomainAttributes;
        }
        case constants.CSP_DOMAINS.GCP: {
            const cspDomainAttributes = ATTRIBUTE_GCP_NO_CRED;

            cspDomainAttributes[constants.GC_ZONE].value = params.cspDomainAttributes[constants.GC_ZONE].value;

            return cspDomainAttributes;
        }
        default:
            return {};
    }
}

export function postCredentialCSPCluster(params, clusterName) {
    return dispatch => {
        dispatch({ type: types.POST_CSP_CREDENTIALS_REQUEST });

        const credentialParams = getCredentialParams(params);

        return axios.post(urlCspCredentials, credentialParams).then(
            response => {
                const { data } = response || {};
                const { meta, name } = data || {};
                const { id } = meta || {};

                // update domain with newly created csp credential
                params['cspCredentialId'] = id;

                dispatch({ type: types.POST_CSP_CREDENTIALS_SUCCESS, payload: data });
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'cloud service provider credential'}`,
                });

                const cspDomainAttributes = domainAttributesPruned(params);

                const dispatchParams = {
                    ...params,
                    cspDomainAttributes,
                };

                dispatch(postCSPandCluster(dispatchParams, clusterName));
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_CSP_CREDENTIALS_FAILURE, error });
            }
        );
    };
}

export function postCredentialCSP(params) {
    return dispatch => {
        dispatch({ type: types.POST_CSP_CREDENTIALS_REQUEST });

        const credentialParams = getCredentialParams(params);

        return axios.post(urlCspCredentials, credentialParams).then(
            response => {
                const { data } = response || {};
                const { meta, name } = data || {};
                const { id } = meta || {};

                // update domain with newly created csp credential
                params['cspCredentialId'] = id;

                dispatch({ type: types.POST_CSP_CREDENTIALS_SUCCESS, payload: data });
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'cloud service provider credential'}`,
                });

                const cspDomainAttributes = domainAttributesPruned(params);

                const dispatchParams = {
                    ...params,
                    cspDomainAttributes,
                };

                dispatch(postCSP(dispatchParams));
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_CSP_CREDENTIALS_FAILURE, error });
            }
        );
    };
}

export function getCSPCredentials() {
    return dispatch => {
        dispatch({ type: types.GET_CSP_CREDENTIALS_REQUEST });
        return axios.get(urlCspCredentials).then(
            response => {
                dispatch({ type: types.GET_CSP_CREDENTIALS_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_CSP_CREDENTIALS_FAILURE, error });
            }
        );
    };
}

export function patchCredential(id, params) {
    const keys = Object.keys(params) || [];
    return dispatch => {
        dispatch({ type: types.UPDATE_CSP_CREDENTIALS_REQUEST });
        return axios.patch(urlCspCredentials.concat('/', id, '?set='.concat(keys.join('&set='))), params).then(
            response => {
                dispatch({ type: types.UPDATE_CSP_CREDENTIALS_SUCCESS, payload: response.data });
                const { name } = response.data || {};
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully updated ${name || 'credentials'}`,
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.UPDATE_CSP_CREDENTIALS_FAILURE, error });
            }
        );
    };
}

export function deleteCredentials(credentials) {
    return dispatch => {
        dispatch({ type: types.DELETE_CSP_CREDENTIALS_REQUEST });

        const reqs = [];
        const completedIds = [];
        const failedNames = [];

        for (let i = 0; i < credentials.length; i++) {
            reqs.push(
                axios
                    .delete(`${urlCspCredentials}/${credentials[i].id}`, { credential: credentials[i] })
                    .catch(error => {
                        failedNames.push({
                            cspCredential: credentials[i],
                            message: getErrorMsg(error),
                        });
                    })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        const { config, status, statusText } = args[j] || {};
                        const { cspCredential } = config || {};
                        const { id } = cspCredential || {};

                        if (validateStatus(status)) {
                            completedIds.push(id);
                        } else {
                            failedNames.push({
                                cspCredential,
                                error: statusText,
                            });
                        }
                    }
                }

                if (completedIds.length > 0) {
                    dispatch({ type: types.DELETE_CSP_CREDENTIALS_SUCCESS, payload: { ids: completedIds } });
                    const message = `Successfully deleted ${completedIds.length > 1 ? 'credentials' : 'credential'}`;

                    dispatch({ type: types.ADD_ALERT_MESSAGE, message });
                }
                if (failedNames.length > 0) {
                    const errorMessage = failedNames.map(name => {
                        return `Error deleting CSP credentials ${name.name}: ${name.message}`;
                    });
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: errorMessage });
                    dispatch({ type: types.DELETE_CSP_CREDENTIALS_FAILURE, payload: { names: failedNames } });
                }
            })
        );
    };
}

function genCredentialAttributes(params) {
    const { cspDomainAttributes, cspDomainType } = params || {};

    switch (cspDomainType) {
        case constants.CSP_DOMAINS.AWS: {
            const { aws_access_key_id = {}, aws_secret_access_key = {} } = cspDomainAttributes || {};

            return {
                aws_access_key_id: {
                    kind: 'STRING',
                    value: aws_access_key_id.value,
                },
                aws_secret_access_key: {
                    kind: 'SECRET',
                    value: aws_secret_access_key.value,
                },
            };
        }
        case constants.CSP_DOMAINS.GCP: {
            const { gc_cred = {} } = cspDomainAttributes || {};

            return {
                gc_cred: {
                    kind: 'SECRET',
                    value: gc_cred.value,
                },
            };
        }
        default:
            return {};
    }
}

function getCredentialParams(params) {
    const { tags = [], description, cspDomainType, cspCredentialName } = params || {};

    const credentialAttributes = genCredentialAttributes(params);

    return {
        credentialAttributes,
        cspDomainType,
        name: cspCredentialName,
        ...(tags.length > 0 && { tags }),
        ...(description && { description }),
    };
}

export function postCspCredentials(params) {
    return dispatch => {
        dispatch({ type: types.POST_CSP_CREDENTIALS_REQUEST });

        const credentialParams = getCredentialParams(params);

        return axios.post(urlCspCredentials, credentialParams).then(
            response => {
                const { data } = response || {};
                const { name } = data || {};

                dispatch({ type: types.POST_CSP_CREDENTIALS_SUCCESS, payload: data });
                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'cloud service provider credential'}`,
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_CSP_CREDENTIALS_FAILURE, error });
            }
        );
    };
}

const apiProtectionDomainsUrl = `/${constants.URI_PROTECTION_DOMAINS}`;

function createSnapshotCatalog(params) {
    return dispatch => {
        dispatch({ type: types.POST_PROTECTION_DOMAINS_REQUEST });

        const { protectionDomainName: name, accountId, encryptionAlgorithm, encryptionPassphrase } = params;

        const catalogParams = {
            name,
            accountId,
            encryptionAlgorithm,
            encryptionPassphrase,
        };

        return axios.post(apiProtectionDomainsUrl, catalogParams).then(
            response => {
                dispatch({ type: types.POST_PROTECTION_DOMAINS_SUCCESS, payload: response.data });

                const { meta, name } = response.data || {};
                const { id } = meta || {};

                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Successfully created ${name || 'protection domain'}`,
                });

                // now set the snapshot policy
                const policyParams = {
                    ...params,
                    protectionDomainId: id,
                };
                dispatch(setSnapshotPolicy(policyParams));
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_PROTECTION_DOMAINS_FAILURE, error });
            }
        );
    };
}

function setSnapshotPolicy(params) {
    return dispatch => {
        const { accountId, cspDomainId, protectionDomainId } = params;

        const policyParams = {
            snapshotCatalogPolicy: {
                cspDomainId,
                protectionDomainId,
            },
        };
        const keys = Object.keys(policyParams) || [];

        dispatch({ type: types.POST_ACCOUNT_SNAPSHOT_POLICY_SET_REQUEST });
        return axios
            .patch(apiUrlAccounts.concat('/', accountId, '?set='.concat(keys.join('&set='))), policyParams)
            .then(
                response => {
                    dispatch({
                        type: types.POST_ACCOUNT_SNAPSHOT_POLICY_SUCCESS,
                        payload: response.data,
                    });

                    const { name } = response.data || {};
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Successfully set policy for ${name || 'account'}`,
                    });
                },
                error => {
                    dispatch({ type: types.POST_ACCOUNT_SNAPSHOT_POLICY_FAILURE, error });
                }
            );
    };
}

export function getCSPMetaData(cspProvider) {
    return dispatch => {
        dispatch({ type: types.GET_CSP_METADATA_REQUEST });
        const reqUrl = `${urlCspMetadata}/${cspProvider}`;
        return axios.get(reqUrl).then(
            response => {
                dispatch({ type: types.GET_CSP_METADATA_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_CSP_METADATA_FAILURE, error });
            }
        );
    };
}
