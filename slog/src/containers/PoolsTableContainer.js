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
import _ from 'lodash';

import PoolsTable from '../components/PoolsTable';
import { deleteServicePlanAllocations, getServicePlanAllocations } from '../actions/servicePlanAllocationActions';
import { getClusters } from '../actions/clusterActions';
import { getServicePlans } from '../actions/servicePlanActions';
import { getVolumeSeries } from '../actions/volumeSeriesActions';
import { openModal } from '../actions/modalActions';
import * as constants from '../constants';
import * as types from '../actions/types';

class PoolsTableContainer extends Component {
    constructor(props) {
        super(props);

        this.deletePools = this.deletePools.bind(this);
        this.handleClickServicePlanLink = this.handleClickServicePlanLink.bind(this);
        this.openModal = this.openModal.bind(this);
    }

    componentDidMount() {
        const { clustersData, dispatch, servicePlanAllocationsData, servicePlansData, volumeSeriesData } = this.props;
        const { clusters = [] } = clustersData || {};
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const { servicePlans = [] } = servicePlansData || {};
        const { volumeSeries = [] } = volumeSeriesData || {};

        if (clusters.length < 1) {
            dispatch(getClusters());
        }

        if (servicePlanAllocations.length < 1) {
            dispatch(getServicePlanAllocations());
        }

        if (servicePlans.length < 1) {
            dispatch(getServicePlans());
        }

        if (volumeSeries.length < 1) {
            dispatch(getVolumeSeries());
        }
    }

    componentDidUpdate(prevProps) {
        const { cspsData, disableHandleCostChange, dispatch, servicePlanAllocationsData = {} } = this.props;
        const { csps = [] } = cspsData || {};
        const { cspsData: prevCspsData, servicePlanAllocationsData: prevServicePlanAllocationsData = {} } = prevProps;
        const { csps: prevCsps = [] } = prevCspsData || {};

        if (servicePlanAllocationsData.error && !prevServicePlanAllocationsData.error) {
            const messages = [];

            if (servicePlanAllocationsData.error) {
                messages.push(servicePlanAllocationsData.error);
            }

            if (messages.length > 0) {
                dispatch({ type: types.SET_ERROR_MESSAGES, messages });
            } else {
                dispatch({ type: types.CLEAR_ERROR_MESSAGES });
            }
        }

        if (!disableHandleCostChange) {
            const isCostChanged =
                csps.length !== prevCsps.length ||
                csps.some((csp, idx) => {
                    const { storageCosts = {} } = csp || {};
                    const { storageCosts: prevStorageCosts = {} } = prevCsps[idx] || {};

                    return !_.isEqual(storageCosts, prevStorageCosts);
                });

            if (isCostChanged) {
                dispatch(getServicePlanAllocations());
            }
        }
    }

    deletePools(ids = []) {
        const { dispatch } = this.props;
        dispatch(deleteServicePlanAllocations(ids));
    }

    handleClickServicePlanLink() {
        const { dispatch } = this.props;
        dispatch({
            type: types.SET_SERVICE_PLANS_OVERVIEW_TAB,
            tab: constants.SERVICE_PLANS_OVERVIEW_TABS.SERVICE_PLANS,
        });
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    render() {
        const {
            account,
            accountsData,
            cluster,
            clustersData,
            hideColumnFilter,
            rolesData,
            servicePlanAllocationsData,
            servicePlansData,
            table,
            tableComponentName,
            uiSettings,
            userData,
            volumeSeriesData,
        } = this.props;

        return (
            <PoolsTable
                account={account}
                accountsData={accountsData}
                cluster={cluster}
                clustersData={clustersData}
                deletePools={this.deletePools}
                hideColumnFilter={hideColumnFilter}
                onClickServicePlanLink={this.handleClickServicePlanLink}
                openModal={this.openModal}
                rolesData={rolesData}
                servicePlanAllocationsData={servicePlanAllocationsData}
                servicePlansData={servicePlansData}
                table={table}
                tableComponentName={tableComponentName}
                uiSettings={uiSettings}
                userData={userData}
                volumeSeriesData={volumeSeriesData}
            />
        );
    }
}

PoolsTableContainer.propTypes = {
    account: PropTypes.object,
    accountsData: PropTypes.object.isRequired,
    cluster: PropTypes.object,
    clustersData: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    disableHandleCostChange: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    hideColumnFilter: PropTypes.bool,
    rolesData: PropTypes.object.isRequired,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    servicePlansData: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    tableComponentName: PropTypes.string,
    uiSettings: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const {
        accountsData,
        clustersData,
        cspsData,
        rolesData,
        servicePlanAllocationsData,
        servicePlansData,
        table,
        uiSettings,
        userData,
        volumeSeriesData,
    } = state;
    return {
        accountsData,
        clustersData,
        cspsData,
        rolesData,
        servicePlanAllocationsData,
        servicePlansData,
        table,
        uiSettings,
        userData,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(PoolsTableContainer);
