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

import * as constants from '../constants';

export const initialState = {
    accountsUsersTab: constants.ACCOUNTS_TABS.ACCOUNTS,
    backupTab: 0,
    collapsedCardsComponents: [],
    compares: {
        servicePlansAttrs: [],
    },
    period: constants.METRIC_PERIOD_DAY,
    recoverTab: 0,
    servicePlansOverviewTab: constants.SERVICE_PLANS_OVERVIEW_TABS.SERVICE_PLANS,
    settingsTab: 0,
    setupStep: constants.SETUP_MENU_IDX.SPAS,
    setupStepsCompleted: [],
    showCardsComponents: [],
    volumeDetailsTab: constants.VOLUME_DETAILS_TABS.SERVICE_PLAN_COMPLIANCE,
    volumesTab: constants.VOLUMES_TABS.VOLUMES,
    volumesTimePeriod: constants.METRIC_PERIOD_DAY,
};

export default function(state = initialState, action) {
    switch (action.type) {
        // cards
        case types.CARDS_MODE:
            return {
                ...state,
                showCardsComponents: [...state.showCardsComponents, action.component],
            };
        case types.CARDS_COLLAPSED:
            return {
                ...state,
                collapsedCardsComponents: [...state.collapsedCardsComponents, action.component],
            };
        case types.CARDS_EXPANDED:
            return {
                ...state,
                collapsedCardsComponents: state.collapsedCardsComponents.filter(
                    component => component !== action.component
                ),
            };
        // table
        case types.TABLE_MODE:
            return {
                ...state,
                showCardsComponents: state.showCardsComponents.filter(component => component !== action.component),
            };
        // settings
        case types.SET_SETTINGS_TAB:
            return {
                ...state,
                settingsTab: action.tab,
            };
        // settings
        case types.SET_ACCOUNTS_USERS_TAB:
            return {
                ...state,
                accountsUsersTab: action.tab,
            };
        // service plans
        case types.ADD_SERVICE_PLAN_COMPARE:
            return {
                ...state,
                compares: {
                    ...state.compares,
                    servicePlansAttrs: [...state.compares.servicePlansAttrs, action.compare],
                },
            };
        case types.REMOVE_SERVICE_PLAN_COMPARE:
            return {
                ...state,
                compares: {
                    ...state.compares,
                    servicePlansAttrs: state.compares.servicePlansAttrs.filter(compare => compare !== action.compare),
                },
            };
        case types.CLEAR_SERVICE_PLAN_COMPARES:
            return {
                ...state,
                compares: {
                    ...state.compares,
                    servicePlansAttrs: [],
                },
            };
        case types.SET_SERVICE_PLANS_OVERVIEW_TAB:
            return {
                ...state,
                servicePlansOverviewTab: action.tab,
            };
        // volumes
        case types.SET_VOLUME_DETAILS_TAB:
            return {
                ...state,
                volumeDetailsTab: action.volumeDetailsTab,
            };
        case types.SET_VOLUMES_TAB:
            return {
                ...state,
                volumesTab: action.tab,
            };
        // clusters
        case types.SET_CLUSTER_DETAILS_TAB:
            return {
                ...state,
                clusterDetailsTab: action.clusterDetailsTab,
            };
        // backup
        case types.SET_BACKUP_TAB:
            return {
                ...state,
                backupTab: action.tab,
            };
        // recover
        case types.SET_RECOVER_TAB:
            return {
                ...state,
                recoverTab: action.tab,
            };
        // dashboard timeframe - day/week/month
        case types.SET_DASHBOARD_TIME_PERIOD:
            return {
                ...state,
                period: action.period,
            };
        // volumes time period
        case types.SET_VOLUME_DETAILS_TIME_PERIOD:
            return {
                ...state,
                volumesTimePeriod: action.timePeriod,
            };
        // setup
        case types.SET_SETUP_STEP:
            return {
                ...state,
                setupStep: action.setupStep,
            };
        case types.ADD_SETUP_STEP_COMPLETED:
            return {
                ...state,
                setupStepsCompleted: [...state.setupStepsCompleted, action.setupStep],
            };
        // default
        default:
            return state;
    }
}
