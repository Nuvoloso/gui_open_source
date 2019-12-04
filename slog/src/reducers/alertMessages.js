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
import * as types from '../actions/types';

const initialState = {
    alerts: [],
    errors: [],
};

export default function modal(state = initialState, action) {
    switch (action.type) {
        case types.ADD_ALERT_MESSAGE:
            return {
                ...state,
                alerts: [...state.alerts, action.message],
            };
        case types.REMOVE_ALERT_MESSAGE:
            return {
                ...state,
                alerts: state.alerts.filter(alert => alert !== action.message),
            };
        case types.SET_ERROR_MESSAGES:
            return {
                ...state,
                errors: action.messages,
            };
        case types.ADD_ERROR_MESSAGE:
            return {
                ...state,
                errors: [...state.errors, action.message],
            };
        case types.REMOVE_ERROR_MESSAGE:
            return {
                ...state,
                errors: state.errors.filter(error => error !== action.message),
            };
        case types.CLEAR_ERROR_MESSAGES:
            return {
                ...state,
                errors: [],
            };
        case types.CLEAR_ALL_MESSAGES:
            return initialState;
        default:
            return state;
    }
}
