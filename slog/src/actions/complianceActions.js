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

import { getErrorMsg } from '../components/utils';

import * as constants from '../constants';

export function getAccountsCompliance(startTime, endTime, accountId = '') {
    return dispatch => {
        dispatch({ type: types.GET_ACCOUNT_COMPLIANCE_TOTALS_REQUEST });

        const params = {
            endTime,
            startTime,
            accountId,
        };
        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/compliance/accounts'.concat(querystr)).then(
            response => {
                const { data } = response || {};
                dispatch({
                    type: types.GET_ACCOUNT_COMPLIANCE_TOTALS_SUCCESS,
                    payload: { data, endTime, startTime },
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_ACCOUNT_COMPLIANCE_TOTALS_FAILURE, error });
            }
        );
    };
}

export function getApplicationGroupsCompliance(startTime, endTime) {
    return dispatch => {
        dispatch({ type: types.GET_APPGROUP_COMPLIANCE_TOTALS_REQUEST });

        const params = {
            endTime,
            startTime,
        };
        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/compliance/application-groups'.concat(querystr)).then(
            response => {
                const { data } = response || {};
                dispatch({
                    type: types.GET_APPGROUP_COMPLIANCE_TOTALS_SUCCESS,
                    payload: { data, endTime, startTime },
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_APPGROUP_COMPLIANCE_TOTALS_FAILURE, error });
            }
        );
    };
}

export function getClustersCompliance(startTime, endTime) {
    return dispatch => {
        dispatch({ type: types.GET_CLUSTER_COMPLIANCE_TOTALS_REQUEST });

        const params = {
            endTime,
            startTime,
        };
        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/compliance/clusters'.concat(querystr)).then(
            response => {
                const { data } = response || {};
                dispatch({
                    type: types.GET_CLUSTER_COMPLIANCE_TOTALS_SUCCESS,
                    payload: { data, endTime, startTime },
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_CLUSTER_COMPLIANCE_TOTALS_FAILURE, error });
            }
        );
    };
}

export function getServicePlansCompliance(startTime, endTime) {
    return dispatch => {
        dispatch({ type: types.GET_SERVICE_PLAN_COMPLIANCE_TOTALS_REQUEST });

        const params = {
            endTime,
            startTime,
        };
        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/compliance/pools'.concat(querystr)).then(
            response => {
                const { data } = response || {};
                dispatch({
                    type: types.GET_SERVICE_PLAN_COMPLIANCE_TOTALS_SUCCESS,
                    payload: { data, endTime, startTime },
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_SERVICE_PLAN_COMPLIANCE_TOTALS_FAILURE, error });
            }
        );
    };
}

export function getVolumesCompliance(startTime, endTime) {
    return dispatch => {
        dispatch({ type: types.GET_VOLUME_COMPLIANCE_TOTALS_REQUEST });

        const params = {
            endTime,
            startTime,
        };
        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/compliance/volumes'.concat(querystr)).then(
            response => {
                const { data } = response || {};
                dispatch({
                    type: types.GET_VOLUME_COMPLIANCE_TOTALS_SUCCESS,
                    payload: { data, endTime, startTime },
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_VOLUME_COMPLIANCE_TOTALS_FAILURE, error });
            }
        );
    };
}

export function getVolumeServiceHistory(startTime, endTime, volId) {
    return dispatch => {
        dispatch({ type: types.GET_VOLUME_SERVICE_HISTORY_REQUEST });

        const params = {
            ...(endTime && { endTime }),
            ...(startTime && { startTime }),
            objectId: volId,
            related: true,
        };
        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/compliance/volumeservicehistory'.concat(querystr)).then(
            response => {
                const { data } = response || {};
                dispatch({
                    type: types.GET_VOLUME_SERVICE_HISTORY_SUCCESS,
                    payload: { data, endTime, startTime },
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_VOLUME_SERVICE_HISTORY_FAILURE, error });
            }
        );
    };
}

export function postAuditLog(params) {
    return dispatch => {
        dispatch({ type: types.POST_AUDIT_LOG_REQUEST });

        return axios.post(`/${constants.URI_AUDIT_LOG}`, params).then(
            response => {
                dispatch({ type: types.POST_AUDIT_LOG_SUCCESS, payload: response.data });

                dispatch({
                    type: types.ADD_ALERT_MESSAGE,
                    message: 'Successfully added note',
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.POST_AUDIT_LOG_FAILURE, error });
            }
        );
    };
}

export function getVolumeStatus(volId, startTime, endTime) {
    return dispatch => {
        dispatch({ type: types.GET_VOLUME_STATUS_REQUEST });

        const params = {
            endTime,
            startTime,
            volId,
        };
        const querystr =
            '?' +
            Object.keys(params)
                .map(k => k + '=' + params[k])
                .join('&');

        return axios.get('/metrics/compliance/volumestatus'.concat(querystr)).then(
            response => {
                const { data } = response || {};
                dispatch({
                    type: types.GET_VOLUME_STATUS_SUCCESS,
                    payload: { data, endTime, startTime },
                });
            },
            error => {
                dispatch({ type: types.ADD_ERROR_MESSAGE, message: getErrorMsg(error) });
                dispatch({ type: types.GET_VOLUME_STATUS_FAILURE, error });
            }
        );
    };
}
