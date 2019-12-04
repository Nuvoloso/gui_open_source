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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import Dashboard from '../components/Dashboard.js';
import {
    getAccountsCompliance,
    getApplicationGroupsCompliance,
    getClustersCompliance,
    getServicePlansCompliance,
    getVolumesCompliance,
} from '../actions/complianceActions';
import { getServicePlanAllocations } from '../actions/servicePlanAllocationActions';
import { timePeriodUnit } from '../components/utils';
import { isTenantAdmin } from '../containers/userAccountUtils';

import * as constants from '../constants';
import * as types from '../actions/types';

class DashboardContainer extends Component {
    constructor(props) {
        super(props);

        const { endTime, startTime } = this.getTimes();

        this.state = {
            endTime,
            startTime,
        };

        this.dispatchMetrics = this.dispatchMetrics.bind(this);
        this.handleClickAccounts = this.handleClickAccounts.bind(this);
        this.handleClickApplicationGroups = this.handleClickApplicationGroups.bind(this);
        this.handleClickPoolCard = this.handleClickPoolCard.bind(this);
        this.handleClickPools = this.handleClickPools.bind(this);
        this.handleClickVolumes = this.handleClickVolumes.bind(this);
        this.updateTimer = null;
    }

    componentDidMount() {
        this.fetchData();
    }

    componentWillUnmount() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { session, uiSettings, userData } = this.props;
        const { user } = userData || {};
        const { period } = uiSettings || {};

        const { session: prevSession, uiSettings: prevUiSettings, userData: prevUserData } = prevProps;
        const { period: prevPeriod } = prevUiSettings || {};
        const { user: prevUser } = prevUserData || {};
        const { metricsDatabaseConnected: prevMetricsDatabaseConnected } = prevSession;
        const { metricsDatabaseConnected } = session;

        if (period !== prevPeriod) {
            const { endTime, startTime } = this.getTimes();
            this.setState({ endTime, startTime });
        }

        const { endTime, startTime } = this.state;
        const { endTime: prevEndTime, startTime: prevStartTime } = prevState;

        if (
            endTime.format() !== prevEndTime.format() ||
            startTime.format() !== prevStartTime.format() ||
            user !== prevUser ||
            metricsDatabaseConnected !== prevMetricsDatabaseConnected
        ) {
            this.fetchData();
        }
    }

    dispatchMetrics(startTime, endTime, queryAccountId) {
        const { dispatch, session } = this.props;
        const { metricsDatabaseConnected } = session;

        if (metricsDatabaseConnected === constants.METRICS_SERVICE_CONNECTED) {
            dispatch(getVolumesCompliance(startTime.format(), endTime.format()));
            dispatch(getApplicationGroupsCompliance(startTime.format(), endTime.format()));
            dispatch(getAccountsCompliance(startTime.format(), endTime.format(), queryAccountId));
            dispatch(getClustersCompliance(startTime.format(), endTime.format()));
            dispatch(getServicePlansCompliance(startTime.format(), endTime.format()));
        }
    }

    fetchData() {
        const { dispatch, rolesData, session, userData } = this.props;
        const { accountId = '', metricsDatabaseConnected } = session || {};
        const { user } = userData || {};
        const { endTime, startTime } = this.state;
        const queryAccountId = isTenantAdmin(user, rolesData) ? '' : accountId;

        dispatch(getServicePlanAllocations());

        if (!user || metricsDatabaseConnected !== constants.METRICS_SERVICE_CONNECTED) {
            return;
        }

        this.dispatchMetrics(startTime, endTime, queryAccountId);

        /**
         * Set up refresh of data.
         */
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }

        this.updateTimer = setInterval(() => {
            const { endTime, startTime } = this.getTimes();
            this.setState({ endTime, startTime });

            this.dispatchMetrics(startTime, endTime, queryAccountId);
        }, 60000);
    }

    getTimes() {
        const { uiSettings } = this.props;
        const { period } = uiSettings || {};

        const startTime = moment()
            .utc()
            .subtract(1, timePeriodUnit(period));
        const endTime = moment().utc();

        return { endTime, startTime };
    }

    handleClickAccounts() {
        const { dispatch } = this.props;
        dispatch({
            type: types.SET_ACCOUNTS_USERS_TAB,
            tab: constants.ACCOUNTS_TABS.ACCOUNTS,
        });
    }

    handleClickApplicationGroups() {
        const { dispatch } = this.props;
        dispatch({
            type: types.SET_VOLUMES_TAB,
            tab: constants.VOLUMES_TABS.APPLICATION_GROUPS,
        });
    }

    handleClickPoolCard() {
        const { dispatch } = this.props;
        dispatch({
            type: types.SET_SERVICE_PLANS_OVERVIEW_TAB,
            tab: constants.SERVICE_PLANS_OVERVIEW_TABS.POOLS,
        });
    }

    handleClickPools() {
        const { dispatch } = this.props;
        dispatch({
            type: types.SET_SERVICE_PLANS_OVERVIEW_TAB,
            tab: constants.SERVICE_PLANS_OVERVIEW_TABS.POOLS,
        });
    }

    handleClickVolumes() {
        const { dispatch } = this.props;
        dispatch({
            type: types.SET_VOLUMES_TAB,
            tab: constants.VOLUMES_TABS.VOLUMES,
        });
    }

    render() {
        const {
            accountComplianceTotalsData,
            appGroupComplianceTotalsData,
            clusterComplianceTotalsData,
            servicePlanAllocationsData,
            servicePlanComplianceTotalsData,
            session,
            volumeComplianceTotalsData,
        } = this.props;
        const { endTime, startTime } = this.state;

        return (
            <Dashboard
                accountComplianceTotalsData={accountComplianceTotalsData}
                appGroupComplianceTotalsData={appGroupComplianceTotalsData}
                clusterComplianceTotalsData={clusterComplianceTotalsData}
                endTime={endTime}
                onClickAccounts={this.handleClickAccounts}
                onClickApplicationGroups={this.handleClickApplicationGroups}
                onClickPoolCard={this.handleClickPoolCard}
                onClickPools={this.handleClickPools}
                onClickVolumes={this.handleClickVolumes}
                servicePlanAllocationsData={servicePlanAllocationsData}
                servicePlanComplianceTotalsData={servicePlanComplianceTotalsData}
                session={session}
                startTime={startTime}
                volumeComplianceTotalsData={volumeComplianceTotalsData}
            />
        );
    }
}

DashboardContainer.propTypes = {
    accountComplianceTotalsData: PropTypes.object.isRequired,
    appGroupComplianceTotalsData: PropTypes.object.isRequired,
    clusterComplianceTotalsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    rolesData: PropTypes.object.isRequired,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    servicePlanComplianceTotalsData: PropTypes.object.isRequired,
    session: PropTypes.object.isRequired,
    uiSettings: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    volumeComplianceTotalsData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const {
        accountComplianceTotalsData,
        appGroupComplianceTotalsData,
        clusterComplianceTotalsData,
        rolesData,
        servicePlanAllocationsData,
        servicePlanComplianceTotalsData,
        session,
        uiSettings,
        userData,
        volumeComplianceTotalsData,
    } = state;
    return {
        accountComplianceTotalsData,
        appGroupComplianceTotalsData,
        clusterComplianceTotalsData,
        rolesData,
        servicePlanAllocationsData,
        servicePlanComplianceTotalsData,
        session,
        uiSettings,
        userData,
        volumeComplianceTotalsData,
    };
}

export default connect(mapStateToProps)(DashboardContainer);
