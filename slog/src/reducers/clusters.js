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
import { getErrorMsg } from '../components/utils';
import * as types from '../actions/types';

/**
 * clusters shape is
 * clusters: array of cluster objects as defined by the API
 * error: current error message
 * loading: boolean to indicate if operation is in progress
 */
const initialState = {
    clusters: [],
    error: null,
    loading: false,
};

/**
 *
 * @param { object } cluster - cluster configured in system
 * @returns { object } - normalized cluster object
 */
export function normalize(cluster) {
    const {
        accountId,
        authorizedAccounts = {},
        clusterAttributes = {},
        clusterIdentifer,
        clusterType,
        cspDomainId,
        cspDomainName,
        description = '',
        meta,
        name,
        nodes = [],
        service,
        state,
        tags,
    } = cluster;

    return {
        accountId,
        authorizedAccounts,
        clusterAttributes: Object.keys(clusterAttributes).length > 0 ? JSON.stringify(cluster.clusterAttributes) : '',
        clusterIdentifer,
        clusterType,
        cspDomainId,
        cspDomainName,
        description,
        meta,
        name,
        nodes,
        service,
        state,
        tags,
    };
}

/**
 * Reducer function for clusters
 * @param {*} state
 * @param {*} action
 */
export default function(state = initialState, action) {
    switch (action.type) {
        case types.GET_CLUSTERS_REQUEST:
            return {
                ...state,
                error: null,
                loading: true,
            };
        case types.GET_CLUSTERS_FAILURE:
            return {
                clusters: [],
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.GET_CLUSTERS_SUCCESS:
            return {
                clusters: action.payload.map(cluster => normalize(cluster)),
                error: null,
                loading: false,
            };
        case types.DELETE_CLUSTERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.DELETE_CLUSTERS_FAILURE:
            return {
                ...state,
                error: `Error deleting ${
                    action.payload.names.length === 1 ? 'cluster' : 'clusters'
                }: ${action.payload.names.join(', ')}`,
                loading: false,
            };
        case types.DELETE_CLUSTERS_SUCCESS:
            return {
                /**
                 * When deleting a cluster, the higher level page may get reloaded,
                 * causing the state to be in flux.
                 */
                clusters: state.loading
                    ? state.clusters
                    : state.clusters.filter(cluster => !action.payload.ids.includes(cluster.meta.id)),
                error: null,
                loading: false,
            };
        case types.UPDATE_CLUSTERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.UPDATE_CLUSTERS_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.UPDATE_CLUSTERS_SUCCESS:
            return {
                clusters: state.clusters.map(cluster => {
                    const { meta } = cluster || {};
                    const { id = '' } = meta || {};
                    if (id === action.payload.meta.id) {
                        return normalize(action.payload);
                    } else {
                        return cluster;
                    }
                }),
                error: null,
                loading: false,
            };
        case types.GET_NODES_SUCCESS:
            return {
                ...state,
                clusters: state.clusters.map(cluster => {
                    const { meta } = cluster || {};
                    const { id } = meta || {};
                    const { payload = [] } = action || {};

                    const nodes = [];

                    payload.forEach(node => {
                        const { clusterId } = node || {};
                        if (clusterId === id) {
                            nodes.push(node);
                        }
                    });

                    return {
                        ...cluster,
                        nodes,
                    };
                }),
            };
        case types.DELETE_NODES_SUCCESS:
            return {
                ...state,
                clusters: state.clusters.map(cluster => {
                    const { nodes = [] } = cluster || {};
                    const { payload } = action || {};
                    const { ids = [] } = payload || {};

                    return {
                        ...cluster,
                        nodes: nodes.filter(node => !ids.some(id => id === node.meta.id)),
                    };
                }),
            };
        case types.UPDATE_NODES_SUCCESS:
            return {
                ...state,
                clusters: state.clusters.map(cluster => {
                    const { meta } = cluster || {};
                    const { id } = meta || {};
                    const { payload } = action || {};
                    const { clusterId } = payload || {};

                    if (id === clusterId) {
                        const { nodes = [] } = cluster || {};
                        return {
                            ...cluster,
                            nodes: nodes.map(node => {
                                if (node.meta.id === payload.meta.id) {
                                    return payload;
                                } else {
                                    return node;
                                }
                            }),
                        };
                    } else {
                        return cluster;
                    }
                }),
            };
        case types.POST_CLUSTER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case types.POST_CLUSTER_FAILURE:
            return {
                ...state,
                error: getErrorMsg(action.error),
                loading: false,
            };
        case types.POST_CLUSTER_SUCCESS:
            return {
                accounts: [...state.clusters, normalize(action.payload)],
                error: null,
                loading: false,
            };
        default:
            return state;
    }
}
