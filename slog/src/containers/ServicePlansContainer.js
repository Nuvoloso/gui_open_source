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
import { withRouter } from 'react-router-dom';

import ServicePlans from '../components/ServicePlans';
import { deleteServicePlans, getServicePlans, patchServicePlan } from '../actions/servicePlanActions';
import { getAccounts } from '../actions/accountActions';
import { getServicePlanAllocations, postServicePlanAllocations } from '../actions/servicePlanAllocationActions';
import { getClusters } from '../actions/clusterActions';
import { getCSPs } from '../actions/cspActions';
import { sessionGetAccount } from '../sessionUtils';
import { openModal } from '../actions/modalActions';
import * as types from '../actions/types';
import * as constants from '../constants';

class ServicePlansContainer extends Component {
    constructor(props) {
        super(props);

        this.compareAdd = this.compareAdd.bind(this);
        this.compareClear = this.compareClear.bind(this);
        this.compareRemove = this.compareRemove.bind(this);
        this.deleteServicePlans = this.deleteServicePlans.bind(this);
        this.handleTabSelect = this.handleTabSelect.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchServicePlan = this.patchServicePlan.bind(this);
        this.submitAllocations = this.submitAllocations.bind(this);
    }

    componentDidMount() {
        const { dispatch, location } = this.props;
        dispatch(getAccounts());
        dispatch(getServicePlans());
        dispatch(getClusters());
        dispatch(getServicePlanAllocations());
        dispatch(getCSPs());
        dispatch({ type: types.CARDS_MODE, component: constants.COMPONENT_SERVICE_PLAN });

        const { state } = location || {};
        const { tabKey } = state || {};

        if (tabKey) {
            dispatch({ type: types.SET_SERVICE_PLANS_OVERVIEW_TAB, tab: tabKey });
        }
    }

    componentDidUpdate(prevProps) {
        const { dispatch, servicePlansData } = this.props;
        const { error } = servicePlansData || {};

        const { servicePlansData: prevServicePlansData } = prevProps;
        const { error: prevError } = prevServicePlansData || {};

        if (prevError !== error) {
            if (error) {
                const messages = [error];
                dispatch({ type: types.SET_ERROR_MESSAGES, messages });
            } else {
                dispatch({ type: types.CLEAR_ERROR_MESSAGES });
            }
        }
    }

    compareAdd(compare) {
        const { dispatch } = this.props;
        dispatch({ type: types.ADD_SERVICE_PLAN_COMPARE, compare });
    }

    compareClear() {
        const { dispatch } = this.props;
        dispatch({ type: types.CLEAR_SERVICE_PLAN_COMPARES });
    }

    compareRemove(compare) {
        const { dispatch } = this.props;
        dispatch({ type: types.REMOVE_SERVICE_PLAN_COMPARE, compare });
    }

    deleteServicePlans() {
        const { dispatch, table } = this.props;
        dispatch(deleteServicePlans(table.selectedRows));
    }

    handleTabSelect(tab) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_SERVICE_PLANS_OVERVIEW_TAB, tab });
    }

    openModal(contents, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(contents, config, values));
    }

    patchServicePlan(id, params) {
        const { dispatch } = this.props;
        dispatch(patchServicePlan(id, params));
    }

    submitAllocations(servicePlanId, spas) {
        const { dispatch, servicePlanAllocationsData } = this.props;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const currentServicePlanAllocations = servicePlanAllocations.filter(
            servicePlanAllocation => servicePlanAllocation.servicePlanId === servicePlanId
        );
        const deletes = currentServicePlanAllocations.filter(servicePlanAllocation =>
            spas.every(spa => spa.authorizedAccountId !== servicePlanAllocation.authorizedAccountId)
        );
        const accountId = sessionGetAccount();
        dispatch(postServicePlanAllocations(accountId, servicePlanId, spas));

        // TODO: placeholder until there is a way to remove SPAs.
        if (deletes.length > 0) {
            dispatch({
                type: types.ADD_ERROR_MESSAGE,
                message: 'Removing service plan allocations is currently not supported.',
            });
        }
    }

    render() {
        const {
            accountsData,
            clustersData,
            readOnly,
            rolesData,
            servicePlanAllocationsData,
            servicePlansData,
            table,
            uiSettings,
        } = this.props;
        const { compares, servicePlansOverviewTab } = uiSettings || {};
        const { servicePlansAttrs = [] } = compares || {};

        return (
            <ServicePlans
                accountsData={accountsData}
                clustersData={clustersData}
                compareAdd={this.compareAdd}
                compareClear={this.compareClear}
                compareRemove={this.compareRemove}
                deleteServicePlans={this.deleteServicePlans}
                onTabSelect={this.handleTabSelect}
                openModal={this.openModal}
                patchServicePlan={this.patchServicePlan}
                readOnly={readOnly}
                rolesData={rolesData}
                selectedRows={table.selectedRows}
                servicePlanAllocationsData={servicePlanAllocationsData}
                servicePlansAttrs={servicePlansAttrs}
                servicePlansData={servicePlansData}
                submitAllocations={this.submitAllocations}
                tabKey={servicePlansOverviewTab}
            />
        );
    }
}

ServicePlansContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    clustersData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    rolesData: PropTypes.object.isRequired,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    servicePlansData: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    uiSettings: PropTypes.object.isRequired,
};
function mapStateToProps(state) {
    const {
        accountsData,
        clustersData,
        rolesData,
        servicePlanAllocationsData,
        servicePlansData,
        table,
        uiSettings,
    } = state;
    return {
        accountsData,
        clustersData,
        rolesData,
        servicePlanAllocationsData,
        servicePlansData,
        table,
        uiSettings,
    };
}

export default withRouter(connect(mapStateToProps)(ServicePlansContainer));
