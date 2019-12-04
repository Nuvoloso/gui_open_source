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
import * as types from './types';
import axios from 'axios';

export function getVolumeComplianceTotals(username, startTime, endTime) {
    return dispatch => {
        dispatch({ type: types.GET_VOLUME_COMPLIANCE_TOTALS_REQUEST });
        const params = {
            username,
            startTime: startTime,
            endTime: endTime,
        };

        let querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/volumes/totalinrange'.concat(querystr)).then(
            response => {
                dispatch({
                    type: types.GET_VOLUME_COMPLIANCE_TOTALS_SUCCESS,
                    payload: { data: response.data, startTime, endTime },
                });
            },
            error => {
                dispatch({ type: types.GET_VOLUME_COMPLIANCE_TOTALS_FAILURE, error });
            }
        );
    };
}

export function getAppGroupComplianceTotals(username, startTime, endTime) {
    return dispatch => {
        dispatch({ type: types.GET_APPGROUP_COMPLIANCE_TOTALS_REQUEST });

        const params = {
            username,
            startTime: startTime,
            endTime: endTime,
        };

        let querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/volumes/totalinrangebyag'.concat(querystr)).then(
            response => {
                dispatch({
                    type: types.GET_APPGROUP_COMPLIANCE_TOTALS_SUCCESS,
                    payload: { data: response.data, startTime, endTime },
                });
            },
            error => {
                dispatch({ type: types.GET_APPGROUP_COMPLIANCE_TOTALS_FAILURE, error });
            }
        );
    };
}

export function getConsistencyGroupComplianceTotals(username, startTime, endTime, consistencyGroup) {
    return dispatch => {
        dispatch({ type: types.GET_CONSISTENCYGROUP_COMPLIANCE_TOTALS_REQUEST });

        const params = {
            username,
            startTime: startTime,
            endTime: endTime,
            consistencyGroup,
        };

        let querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/volumes/totalinrangebycg'.concat(querystr)).then(
            response => {
                dispatch({
                    type: types.GET_CONSISTENCYGROUP_COMPLIANCE_TOTALS_SUCCESS,
                    payload: { data: response.data, startTime, endTime },
                });
            },
            error => {
                dispatch({ type: types.GET_CONSISTENCYGROUP_COMPLIANCE_TOTALS_FAILURE, error });
            }
        );
    };
}

export function getServicePlanComplianceTotals(username, startTime, endTime) {
    return dispatch => {
        dispatch({ type: types.GET_SERVICE_PLAN_COMPLIANCE_TOTALS_REQUEST });

        const params = {
            username,
            startTime: startTime,
            endTime: endTime,
        };

        let querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/serviceplans/severitybyperiod'.concat(querystr)).then(
            response => {
                dispatch({
                    type: types.GET_SERVICE_PLAN_COMPLIANCE_TOTALS_SUCCESS,
                    payload: { data: response.data, startTime, endTime },
                });
            },
            error => {
                dispatch({ type: types.GET_SERVICE_PLAN_COMPLIANCE_TOTALS_FAILURE, error });
            }
        );
    };
}

export function getStorageLatency(username, startTime, endTime, volId) {
    return dispatch => {
        dispatch({ type: types.GET_STORAGE_METRICS_REQUEST });

        const params = {
            username,
            startTime,
            endTime,
            volId,
        };

        let querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/storage/latency'.concat(querystr)).then(
            response => {
                dispatch({
                    type: types.GET_STORAGE_METRICS_SUCCESS,
                    payload: { data: response.data, startTime, endTime, volId },
                });
            },
            error => {
                dispatch({ type: types.GET_STORAGE_METRICS_FAILURE, error });
            }
        );
    };
}

export function getVolumeMetrics(username, startTime, endTime, volId, volname) {
    return dispatch => {
        dispatch({ type: types.GET_VOLUME_METRICS_REQUEST });

        const params = {
            username,
            startTime,
            endTime,
            volId,
        };

        let querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/volumes/performance'.concat(querystr)).then(
            response => {
                dispatch({
                    type: types.GET_VOLUME_METRICS_SUCCESS,
                    payload: { data: response.data, startTime, endTime, volId, volname },
                });
            },
            error => {
                dispatch({ type: types.GET_VOLUME_METRICS_FAILURE, error });
            }
        );
    };
}

export function getVolumeCapacity(username, startTime, endTime, volId, volname) {
    return dispatch => {
        dispatch({ type: types.GET_VOLUME_CAPACITY_REQUEST });

        const params = {
            username,
            startTime,
            endTime,
            volId,
        };

        let querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/volumes/capacity'.concat(querystr)).then(
            response => {
                dispatch({
                    type: types.GET_VOLUME_CAPACITY_SUCCESS,
                    payload: { data: response.data, startTime, endTime, volId, volname },
                });
            },
            error => {
                dispatch({ type: types.GET_VOLUME_CAPACITY_FAILURE, error });
            }
        );
    };
}

export function clearStorageMetrics() {
    return { type: types.CLEAR_STORAGE_METRICS };
}

export function clearVolumeMetrics() {
    return { type: types.CLEAR_VOLUME_METRICS };
}

export function clearCapacityMetrics() {
    return { type: types.CLEAR_VOLUME_CAPACITY };
}
