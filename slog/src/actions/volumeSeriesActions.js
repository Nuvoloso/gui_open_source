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
import moment from 'moment';

import { getErrorMsg, validateStatus } from '../components/utils';

import * as types from './types';
import * as constants from '../constants';

import async from 'async';

const apiUrl = `/${constants.URI_VOLUME_SERIES}`;
const reqUrl = `/${constants.URI_VOLUME_SERIES_REQUESTS}`;

export function getVolumeSeries() {
    return dispatch => {
        dispatch({ type: types.GET_VOLUME_SERIES_REQUEST });
        return axios.get(apiUrl).then(
            response => {
                dispatch({ type: types.GET_VOLUME_SERIES_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_VOLUME_SERIES_FAILURE, error });
            }
        );
    };
}

/**
 * Pass flag to optimize query on server.
 */
export function getVolumeSeriesRequests(isTerminated) {
    return dispatch => {
        dispatch({ type: types.GET_VSR_REQUEST });
        const params = {
            isTerminated,
        };

        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');
        return axios.get(reqUrl.concat(querystr)).then(
            response => {
                dispatch({ type: types.GET_VSR_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_VSR_FAILURE, error });
            }
        );
    };
}

export function postVolumeSeriesRecover(volumeSeriesCreateSpec, snapshotId, nodeId) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_LONG, 'minutes')
            .format();
        const requestedOperations = ['CREATE_FROM_SNAPSHOT'];

        return axios
            .post(reqUrl, {
                completeByTime,
                nodeId,
                requestedOperations,
                snapshotId,
                volumeSeriesCreateSpec,
            })
            .then(
                () => {
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Recover started for volume ${volumeSeriesCreateSpec.name}`,
                    });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                }
            );
    };
}

/**
 * Start the backup.  Operates on CG but displaying volume name for now.
 * @param {*} cg
 * @param {*} clusterId
 * @param {*} name
 */
export function postVolumeSeriesCGSnapshot(cg, clusterId, name) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_LONG, 'minutes')
            .format();
        const requestedOperations = ['CG_SNAPSHOT_CREATE'];
        const { meta } = cg || {};
        const { id: consistencyGroupId } = meta || {};

        return axios
            .post(reqUrl, {
                clusterId,
                consistencyGroupId,
                completeByTime,
                requestedOperations,
            })
            .then(
                () => {
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Backup started for ${name}`,
                    });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                }
            );
    };
}

export function postVolumeSeries(volumeSeriesCreateSpec, clusterId, applicationGroupIds) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
            .format();
        const requestedOperations = ['CREATE'];
        if (clusterId) {
            requestedOperations.push('BIND', 'PUBLISH');
        }
        return axios
            .post(reqUrl, {
                ...(clusterId && { clusterId }),
                ...(applicationGroupIds && { applicationGroupIds }),
                completeByTime,
                requestedOperations,
                volumeSeriesCreateSpec,
            })
            .then(
                () => {
                    const { name = '' } = volumeSeriesCreateSpec;
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Volume create started for ${name}`,
                    });
                    dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                }
            );
    };
}

export function deleteVolumeSeries(volumeSeries) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
            .format();
        const requestedOperations = ['DELETE'];

        const reqs = [];
        const completedIds = [];
        const failed = [];

        for (let i = 0; i < volumeSeries.length; i++) {
            reqs.push(
                axios
                    .post(
                        reqUrl,
                        {
                            completeByTime,
                            requestedOperations,
                            volumeSeriesId: volumeSeries[i].id,
                        },
                        {
                            volumeSeries: volumeSeries[i],
                        }
                    )
                    .catch(error => {
                        const { response } = error;
                        const { data } = response || {};
                        const { message } = data || {};
                        failed.push({
                            volumeSeries: volumeSeries[i],
                            error: message || error,
                        });
                    })
            );
        }

        return axios.all(reqs).then(
            axios.spread((...args) => {
                for (let j = 0; j < args.length; j++) {
                    if (args[j]) {
                        if (validateStatus(args[j].status)) {
                            completedIds.push(args[j].config.volumeSeries.id);
                            dispatch({
                                type: types.REMOVE_SELECTED_ROW_VOLUME_SERIES_TABLE,
                                row: { id: args[j].config.volumeSeries.id },
                            });
                            dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS_APPLICATION_GROUPS_TABLE });
                            dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS_CONSISTENCY_GROUPS_TABLE });
                        } else {
                            failed.push({
                                volumeSeries: args[j].config.volumeSeries,
                                error: args[j].statusText,
                            });
                        }
                    }
                }
                if (failed.length > 0) {
                    dispatch({
                        type: types.DELETE_VOLUME_SERIES_FAILURE,
                        error: {
                            message: failed.map(e => {
                                const { error, volumeSeries } = e;
                                const { message } = error || {};
                                const { name } = volumeSeries || {};
                                return `Error requesting ${requestedOperations.join(' and ')} for ${name ||
                                    'volume series'}: ${message || error}`;
                            }),
                        },
                    });
                }
            })
        );
    };
}

/**
 * Handle a volume update.  Need to handle up to three operations: patch the volume series, rename the
 * volume series, or bind the volume series.
 * Attempt the patch first, then issue the optional operation afterwards.  The rename/bind operations
 * must be submitted by the user independently due to limitations in the API.
 * @param {*} id
 * @param {*} params
 */
export function patchVolumeSeries(id, clusterId, params) {
    const { name, ...paramsNoName } = params;
    const { ...paramsPatchVS } = paramsNoName;
    const keys = Object.keys(paramsNoName) || [];

    /**
     * Issue all the actions and gather the results
     */
    return dispatch => {
        if (keys.length < 1 && !name && !clusterId) {
            return;
        }
        dispatch({ type: types.UPDATE_VOLUME_SERIES_REQUEST });
        async.series(
            [
                callback => {
                    if (keys.length > 0) {
                        axios.patch(apiUrl.concat('/', id, '?set='.concat(keys.join('&set='))), paramsPatchVS).then(
                            response => {
                                dispatch({ type: types.UPDATE_VOLUME_SERIES_SUCCESS, payload: response.data });
                                let operationsMessage = '';
                                if (name || clusterId) {
                                    operationsMessage = ', starting operations';
                                }

                                /**
                                 * Provide feedback that the patch was successful.  If there is a subsequent
                                 * operation to issue, then we provide that feedback in the alert message.
                                 */
                                dispatch({
                                    type: types.ADD_ALERT_MESSAGE,
                                    message: `Successfully updated volume series${operationsMessage}`,
                                });
                                callback(null);
                            },
                            error => {
                                callback(error);
                            }
                        );
                    } else {
                        // nothing to do
                        callback(null);
                    }
                },
                callback => {
                    if (name) {
                        const completeByTime = moment()
                            .utc()
                            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
                            .format();
                        const requestedOperations = ['RENAME'];
                        const volumeSeriesCreateSpec = params;
                        return axios
                            .post(reqUrl, {
                                completeByTime,
                                requestedOperations,
                                volumeSeriesId: id,
                                volumeSeriesCreateSpec,
                            })
                            .then(
                                () => {
                                    dispatch({
                                        type: types.ADD_ALERT_MESSAGE,
                                        message: `Starting ${requestedOperations.join(' and ')} for ${name ||
                                            'volume series'}`,
                                    });
                                    callback(null);
                                },
                                error => {
                                    callback(error);
                                }
                            );
                    } else {
                        // nothing to do
                        callback(null);
                    }
                },
                callback => {
                    if (clusterId) {
                        const completeByTime = moment()
                            .utc()
                            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
                            .format();
                        const requestedOperations = ['BIND'];
                        const volumeSeriesCreateSpec = params;
                        return axios
                            .post(reqUrl, {
                                ...(clusterId && { clusterId }),
                                completeByTime,
                                requestedOperations,
                                volumeSeriesId: id,
                                volumeSeriesCreateSpec,
                            })
                            .then(
                                () => {
                                    dispatch({
                                        type: types.ADD_ALERT_MESSAGE,
                                        message: `Starting ${requestedOperations.join(' and ')} for ${name ||
                                            'volume series'}`,
                                    });
                                    callback(null);
                                },
                                error => {
                                    callback(error);
                                }
                            );
                    } else {
                        //nothing to do
                        callback(null);
                    }
                },
            ],
            error => {
                if (error) {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                    dispatch({ type: types.UPDATE_VOLUME_SERIES_FAILURE, error });
                } else {
                    /**
                     * If there were no errors, clear the table.
                     */
                    dispatch({ type: types.REMOVE_SELECTED_ROW_VOLUME_SERIES_TABLE, row: { id } });
                    dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS_APPLICATION_GROUPS_TABLE });
                    dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS_CONSISTENCY_GROUPS_TABLE });
                }
            }
        );
    };
}

export function bindVolumeSeries(volumeSeriesId, clusterId, name) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
            .format();
        const requestedOperations = [];
        if (clusterId) {
            requestedOperations.push('BIND');
        }
        return axios
            .post(reqUrl, {
                clusterId,
                completeByTime,
                requestedOperations,
                volumeSeriesId,
            })
            .then(
                () => {
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Starting ${requestedOperations.join(' and ')} for ${name || 'volume series'}`,
                    });
                    dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                }
            );
    };
}

export function cancelVolumeSeriesRequest(id) {
    return dispatch => {
        return axios.post(`${reqUrl}/${id}/cancel`).then(
            res => {
                const { data } = res;
                const { volumeSeriesCreateSpec } = data || {};
                const { name } = volumeSeriesCreateSpec || {};

                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: `Canceling volume series request${name ? ` for ${name}` : ''}.`,
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
            }
        );
    };
}

export function getPVSpec(volumes = []) {
    return dispatch => {
        dispatch({ type: types.GET_VOLUME_SERIES_PV_SPEC_REQUEST });

        const reqs = [];
        const yamls = [];
        const completed = [];
        const failed = [];

        volumes.forEach(volume => {
            const { id, name } = volume || {};
            reqs.push(
                axios.get(`${apiUrl}/${id}/persistent-volume-spec`, { id, name }).catch(error => {
                    const { response } = error;
                    const { data } = response || {};
                    const { message } = data || {};
                    failed.push({
                        id,
                        error: message || error,
                        name,
                    });
                })
            );
        });

        return axios.all(reqs).then(
            axios.spread((...args) => {
                args.forEach(arg => {
                    if (arg) {
                        const { config, data } = arg || {};
                        const { id, name } = config || {};
                        if (validateStatus(arg.status)) {
                            const { pvSpec } = data || {};
                            if (pvSpec) {
                                yamls.push(pvSpec);
                            }
                            completed.push({
                                id,
                                name,
                            });
                            dispatch({ type: types.REMOVE_SELECTED_ROW_VOLUME_SERIES_TABLE, row: { id } });
                        } else {
                            failed.push({
                                id,
                                error: arg.statusText,
                                name,
                            });
                        }
                    }
                });

                dispatch({ type: types.GET_VOLUME_SERIES_PV_SPEC_COMPLETE, payload: { completed, failed, yamls } });
            })
        );
    };
}

export function postChangeCapacity(volumeSeriesCreateSpec, volumeSeriesId, name) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
            .format();
        const requestedOperations = [constants.VSR_OPERATIONS.CHANGE_CAPACITY];

        return axios
            .post(reqUrl, {
                completeByTime,
                requestedOperations,
                volumeSeriesId,
                volumeSeriesCreateSpec,
            })
            .then(
                () => {
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Change capacity started for volume ${name}`,
                    });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                }
            );
    };
}

export function mountVolumeSeries(volumeSeriesId, nodeId, volumeName) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
            .format();
        const requestedOperations = ['MOUNT'];
        return axios
            .post(reqUrl, {
                completeByTime,
                nodeId,
                requestedOperations,
                volumeSeriesId,
            })
            .then(
                () => {
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Requested mount operation for ${volumeName || volumeSeriesId} `,
                    });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                }
            );
    };
}

export function unmountVolumeSeries(volumeSeriesId, nodeId, volumeName, nodeName) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_LONG, 'minutes')
            .format();
        const requestedOperations = ['UNMOUNT'];
        return axios
            .post(reqUrl, {
                completeByTime,
                nodeId,
                requestedOperations,
                volumeSeriesId,
            })
            .then(
                () => {
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Requested unmount operation for ${volumeName || volumeSeriesId} on node: ${nodeName ||
                            nodeId}`,
                    });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                }
            );
    };
}

/**
 * Pass flag to optimize query on server.
 */
export function getVolumeSeriesRequestsCompleted() {
    return dispatch => {
        dispatch({ type: types.GET_VSR_COMPLETED_REQUEST });
        const params = {
            isTerminated: true,
        };

        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');
        return axios.get(reqUrl.concat(querystr)).then(
            response => {
                dispatch({ type: types.GET_VSR_COMPLETED_SUCCESS, payload: response.data });
            },
            error => {
                dispatch({ type: types.GET_VSR_COMPLETED_FAILURE, error });
            }
        );
    };
}

export function publishVolumeSeries(name, volumeSeriesId, clusterId) {
    return dispatch => {
        const completeByTime = moment()
            .utc()
            .add(constants.VSR_COMPLETION_LENGTH_SHORT, 'minutes')
            .format();
        const requestedOperations = [constants.VSR_OPERATIONS.BIND, constants.VSR_OPERATIONS.PUBLISH];
        return axios
            .post(reqUrl, {
                clusterId,
                completeByTime,
                requestedOperations,
                volumeSeriesId,
            })
            .then(
                () => {
                    dispatch({
                        type: types.ADD_ALERT_MESSAGE,
                        message: `Requested publish operation for ${name}`,
                    });
                },
                error => {
                    dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                }
            );
    };
}
