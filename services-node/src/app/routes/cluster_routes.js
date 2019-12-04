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
import { handleError, request, send } from '../../instance';

import { getErrorMessage, logMessage } from '../../utils';

const axios = require('axios');
const config = require('../../config');

import * as constants from '../../constants';

const url = `/${constants.URI_CLUSTERS}`;
const urlNodes = `/${constants.URI_NODES}`;

const apiCSPs = `${config.API_URL}/${constants.URI_CSP_DOMAINS}`;
const apiClusters = `${config.API_URL}/${constants.URI_CLUSTERS}`;
const apiNodes = `${config.API_URL}/${constants.URI_NODES}`;
const typeCSP = 'csp';
const typeNode = 'node';

// Issue all cspdomain requests and return an object that has the
// response or error in it.  Either can be set to null depending
// on success or failure.
// TODO: Could optimize by building list of unique CSP domain IDs
// and fetching only once
function buildClusterRequests(req, clusters, cspRequests, nodeRequests) {
    clusters.forEach(cluster => {
        // default the CSP domainname to an unknown value in case it was deleted
        // this should be an exceptional case
        cluster['cspDomainName'] = '<unknown CSP domain>';

        cspRequests.push(request(req, 'get', `${apiCSPs}/${cluster.cspDomainId}`, {
                cluster,
                type: typeCSP,
            })
                .then(res => {
                        // store the data
                        return { response: res, error: null };
                    },
                    err => {
                        // store the error
                        return { response: null, error: err };
                    })
                .catch(() => {
                    // both failed, but keep trying and send the failure later
                    logMessage('Could not fetch CSP Domain information from: ', cluster.name);
                    return { response: null, error: null };
                }));

        cluster['nodes'] = [];

        nodeRequests.push(request(req, 'get', `${apiNodes}?clusterId=${cluster.meta.id}`, {
                cluster,
                type: typeNode,
            })
                .then(res => {
                        return { response: res, error: null };
                    },
                    err => {
                        return { response: null, error: err };
                    })
                .catch(() => {
                    logMessage('Could not fetch nodes information from: ', cluster.name);
                    return { response: null, error: null };
                }));
    });
}

module.exports = function(app) {
    //
    // GET
    //
    app.get([url, `${url}/:id`], (req, res) => {
        const { id } = req.params || {};
        const reqUrl = id ? `${apiClusters}/${id}` : apiClusters;
        request(req, 'get', reqUrl)
            .then(response => {
                const clusters = id ? [response.data] : response.data;
                const cspRequests = [];
                const nodeRequests = [];

                if (clusters.length < 1) {
                    send(res, response);
                    return;
                }

                // look up CSP domain and nodes for each cluster
                buildClusterRequests(req, clusters, cspRequests, nodeRequests);

                // process all CSP and node requests
                axios
                    .all([...cspRequests, ...nodeRequests])
                    .then(axios.spread((...args) => {
                            // an array of error messages returned from the request
                            const errMessages = [];

                            args.forEach((arg, idx) => {
                                // we either have a result or an error
                                if (arg) {
                                    const { error, response } = arg;

                                    if (response) {
                                        let config = {};

                                        if (response.config && response.config.data) {
                                            config = JSON.parse(response.config.data);
                                        }

                                        const { cluster: requestedCluster, type } = config || {};

                                        if (type === typeCSP) {
                                            const csp = response.data || {};
                                            // Need to find all instances where the CSP is used
                                            // and set the name
                                            if (csp) {
                                                clusters.forEach(cluster => {
                                                    if (cluster.cspDomainId === csp.meta.id) {
                                                        cluster['cspDomainName'] = csp.name;
                                                    }
                                                });
                                            }
                                        } else if (type === typeNode) {
                                            const nodes = response.data || [];
                                            clusters.forEach(cluster => {
                                                if (cluster.meta.id === requestedCluster.meta.id) {
                                                    cluster['nodes'] = nodes;
                                                }
                                            });
                                        }
                                    } else if (error) {
                                        // store all the error messages
                                        const { config } = error.response || {};
                                        const { cluster, type } = config || {};

                                        if (type === typeCSP) {
                                            errMessages.push(`Failure fetching CSP Domain ID ${cluster.cspDomainId} for ${cluster.name}: ${error.message}`);
                                        } else if (type === typeNode) {
                                            errMessages.push(`Failure fetching nodes for ${cluster.name}: ${error.message}`);
                                        } else {
                                            errMessages.push(`Unhandled type (${type}) returned from fetching cluster ${cluster.name}: ${error.message}`);
                                        }
                                    } else {
                                        // something completely failed
                                        errMessages.push('Invalid response from fetching cluster at index: ', idx);
                                    }
                                } else {
                                    // complete failure
                                    logMessage('Could not look up any CSP or node information for cluster at index: ',
                                        idx);
                                }
                            });

                            // Create one string for all failures to return
                            if (errMessages.length > 0) {
                                logMessage(errMessages);
                            }
                            const { headers } = args[args.length - 1].response || {};
                            send(res, {
                                data: id ? clusters[0] : clusters,
                                headers,
                            });
                        }))
                    .catch(err => {
                        logMessage('error fetching clusters: ', getErrorMessage(err));
                    });
            })
            .catch(err => {
                handleError(res, err);
            });
    });

    //
    // DELETE
    //
    app.delete(`${url}/:id`, (req, res) => {
        const url = apiClusters.concat('/', req.params.id);
        request(req, 'delete', url)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });

    //
    // PATCH
    //
    app.patch(`${url}/:id`, (req, res) => {
        const { set = [] } = req.query || {};
        const url = apiClusters.concat('/', req.params.id, '?set=', Array.isArray(set) ? set.join('&set=') : set);
        request(req, 'patch', url, req.body)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });

    //
    // POST
    //
    app.post(url, (req, res) => {
        request(req, 'post', apiClusters, req.body)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });

    //
    // NODES
    //
    app.get([urlNodes, `${urlNodes}/:id`], (req, res) => {
        const { id } = req.params || {};
        const url = id ? `${apiNodes}/${id}` : apiNodes;
        request(req, 'get', url)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.post(urlNodes, (req, res) => {
        request(req, 'post', apiNodes, req.body)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.patch(`${urlNodes}/:id`, (req, res) => {
        const { set = [] } = req.query || {};
        const url = apiNodes.concat('/', req.params.id, '?set=', Array.isArray(set) ? set.join('&set=') : set);
        request(req, 'patch', url, req.body)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });
    app.delete(`${urlNodes}/:id`, (req, res) => {
        const url = apiNodes.concat('/', req.params.id);
        request(req, 'delete', url)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });

    // ACCOUNT SECRET
    app.get(`${url}/:id/account-secret`, (req, res) => {
        const { params, query } = req || {};
        const { id } = params || {};
        const { authorizedAccountId } = query || {};
        const url = `${apiClusters}/${id}/account-secret?authorizedAccountId=${authorizedAccountId}`;
        request(req, 'get', url)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });

    // DEPLOYMENT FILES
    app.get(`${url}/:id/orchestrator`, (req, res) => {
        const url = `${apiClusters}/${req.params.id}/orchestrator`;
        request(req, 'get', url)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });
};
