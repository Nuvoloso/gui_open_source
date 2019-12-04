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
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';

import VolumeSeries from '../components/VolumeSeries';

import {
    deleteVolumeSeries,
    getPVSpec,
    getVolumeSeries,
    mountVolumeSeries,
    patchVolumeSeries,
    postVolumeSeries,
    publishVolumeSeries,
    unmountVolumeSeries,
} from '../actions/volumeSeriesActions';
import { getCGs } from '../actions/consistencyGroupActions';
import { getAGs } from '../actions/applicationGroupActions';
import { getAccounts } from '../actions/accountActions';
import { getClusters } from '../actions/clusterActions';
import { getCSPs } from '../actions/cspActions';
import { getProtectionDomains } from '../actions/protectionDomainActions';
import { getServicePlans } from '../actions/servicePlanActions';
import { getVolumesCompliance } from '../actions/complianceActions';
import { getServicePlanAllocations } from '../actions/servicePlanAllocationActions';
import { openModal } from '../actions/modalActions';
import { timePeriodUnit } from '../components/utils';
import { updateNavigationList } from '../components/volume_series_utils';

import * as types from '../actions/types';
import * as constants from '../constants';

class VolumeSeriesContainer extends Component {
    constructor(props) {
        super(props);

        this.deleteVolumeSeries = this.deleteVolumeSeries.bind(this);
        this.dispatchMetrics = this.dispatchMetrics.bind(this);
        this.getPVSpec = this.getPVSpec.bind(this);
        this.handlePublish = this.handlePublish.bind(this);
        this.mountVolumeSeries = this.mountVolumeSeries.bind(this);
        this.onFilteredChange = this.onFilteredChange.bind(this);
        this.onSortedChange = this.onSortedChange.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchVolumeSeries = this.patchVolumeSeries.bind(this);
        this.postVolumeSeries = this.postVolumeSeries.bind(this);
        this.unmountVolumeSeries = this.unmountVolumeSeries.bind(this);
    }

    dispatchMetrics() {
        const { dispatch, session, uiSettings } = this.props;
        const { period } = uiSettings || {};
        const startTime = moment()
            .utc()
            .subtract(1, timePeriodUnit(period));
        const endTime = moment().utc();
        const { metricsDatabaseConnected } = session;

        if (metricsDatabaseConnected === constants.METRICS_SERVICE_CONNECTED) {
            dispatch(getVolumesCompliance(startTime.toISOString(), endTime.toISOString()));
        }
    }

    componentDidMount() {
        const { dispatch, session } = this.props;
        const { metricsDatabaseConnected } = session;

        dispatch(getServicePlans());
        dispatch(getClusters());
        dispatch(getCGs());
        dispatch(getAGs());
        dispatch(getServicePlanAllocations());
        dispatch(getVolumeSeries());
        dispatch(getAccounts());
        dispatch(getCSPs());
        dispatch(getProtectionDomains());
        if (metricsDatabaseConnected === constants.METRICS_SERVICE_CONNECTED) {
            this.dispatchMetrics();
        }
    }

    componentDidUpdate(prevProps) {
        const { dispatch, session, volumeSeriesData = {} } = this.props;
        const { session: prevSession, volumeSeriesData: prevVolumeSeriesData = {} } = prevProps;
        const { metricsDatabaseConnected } = session;
        const { metricsDatabaseConnected: prevMetricsDatabaseConnected } = prevSession || {};

        if (volumeSeriesData.error !== prevVolumeSeriesData.error) {
            const messages = [];

            if (volumeSeriesData.error) {
                messages.push(volumeSeriesData.error);
            }

            if (messages.length > 0) {
                dispatch({ type: types.SET_ERROR_MESSAGES, messages });
            } else {
                dispatch({ type: types.CLEAR_ERROR_MESSAGES });
            }
        }

        if (
            prevMetricsDatabaseConnected === constants.METRICS_SERVICE_UNKNOWN &&
            metricsDatabaseConnected === constants.METRICS_SERVICE_CONNECTED
        ) {
            this.dispatchMetrics();
        }

        if (!volumeSeriesData.loading && prevVolumeSeriesData.loading) {
            const { volumeSeries = [] } = volumeSeriesData || {};
            dispatch(updateNavigationList(volumeSeries));
        }
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    deleteVolumeSeries(volume) {
        const { dispatch, tableVolumeSeries } = this.props;
        dispatch(deleteVolumeSeries(volume ? [volume] : tableVolumeSeries.selectedRows));
    }

    handlePublish(volume, clusterId) {
        const { dispatch } = this.props;
        const { id, name } = volume || {};

        dispatch(publishVolumeSeries(name, id, clusterId));
    }

    getPVSpec(volume) {
        const { dispatch, tableVolumeSeries } = this.props;
        const { selectedRows = [] } = tableVolumeSeries || {};

        dispatch(getPVSpec(volume ? [volume] : selectedRows));
    }

    mountVolumeSeries(id, nodeId, name) {
        const { dispatch } = this.props;
        dispatch(mountVolumeSeries(id, nodeId, name));
    }

    patchVolumeSeries(id, params, clusterId) {
        const { dispatch } = this.props;
        dispatch(patchVolumeSeries(id, clusterId, params));
    }

    postVolumeSeries(volumeSeriesCreateSpec, clusterId, applicationGroupIds) {
        const { dispatch } = this.props;
        dispatch(postVolumeSeries(volumeSeriesCreateSpec, clusterId, applicationGroupIds));
    }

    unmountVolumeSeries(id, nodeIds = [], name) {
        const { clustersData, dispatch } = this.props;
        const { clusters = [] } = clustersData || {};

        const allNodes = [];
        clusters.forEach(cluster => {
            const { nodes } = cluster || {};
            allNodes.push(...nodes);
        });

        nodeIds.forEach(nodeId => {
            const node = allNodes.find(node => node.meta.id === nodeId) || {};
            dispatch(unmountVolumeSeries(id, nodeId, name, node.name));
        });
    }

    onFilteredChange(data) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_RESOURCE_NAVIGATION_DATA, data });
    }

    onSortedChange(data) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_RESOURCE_NAVIGATION_DATA, data });
    }

    render() {
        const {
            accountsData,
            applicationGroupsData,
            clustersData,
            consistencyGroupsData,
            enableDelete,
            enableMount,
            hideColumns,
            hideHeader,
            multiSelect,
            protectionDomainsData,
            selectable,
            servicePlanAllocationsData,
            servicePlansData,
            session,
            tableOnly,
            tableVolumeSeries,
            volumeComplianceTotalsData,
            volumeSeriesData,
            volumeSeriesFilter,
        } = this.props;
        return (
            <VolumeSeries
                accountsData={accountsData}
                applicationGroupsData={applicationGroupsData}
                clustersData={clustersData}
                consistencyGroupsData={consistencyGroupsData}
                deleteVolumeSeries={this.deleteVolumeSeries}
                enableDelete={enableDelete}
                enableMount={enableMount}
                getPVSpec={this.getPVSpec}
                handlePublish={this.handlePublish}
                hideColumns={hideColumns}
                hideHeader={hideHeader}
                mountVolumeSeries={this.mountVolumeSeries}
                multiSelect={multiSelect}
                onFilteredChange={this.onFilteredChange}
                onSortedChange={this.onSortedChange}
                openModal={this.openModal}
                patchVolumeSeries={this.patchVolumeSeries}
                postVolumeSeries={this.postVolumeSeries}
                protectionDomainsData={protectionDomainsData}
                selectable={selectable}
                selectedRows={tableVolumeSeries.selectedRows}
                servicePlanAllocationsData={servicePlanAllocationsData}
                servicePlansData={servicePlansData}
                session={session}
                tableOnly={tableOnly}
                unmountVolumeSeries={this.unmountVolumeSeries}
                volumeComplianceTotalsData={volumeComplianceTotalsData}
                volumeSeriesData={volumeSeriesData}
                volumeSeriesFilter={volumeSeriesFilter}
            />
        );
    }
}

VolumeSeriesContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    applicationGroupsData: PropTypes.object.isRequired,
    clustersData: PropTypes.object.isRequired,
    consistencyGroupsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    enableDelete: PropTypes.bool,
    enableMount: PropTypes.bool,
    hideColumns: PropTypes.array,
    hideHeader: PropTypes.bool,
    intl: intlShape.isRequired,
    multiSelect: PropTypes.bool,
    protectionDomainsData: PropTypes.object.isRequired,
    pvSpecData: PropTypes.object.isRequired,
    selectable: PropTypes.bool,
    servicePlanAllocationsData: PropTypes.object,
    servicePlansData: PropTypes.object.isRequired,
    session: PropTypes.object.isRequired,
    tableOnly: PropTypes.bool,
    tableVolumeSeries: PropTypes.object.isRequired,
    uiSettings: PropTypes.object.isRequired,
    volumeComplianceTotalsData: PropTypes.object.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
    volumeSeriesFilter: PropTypes.func,
};

VolumeSeriesContainer.defaultProps = {
    hideColumns: [],
    selectable: false,
    tableOnly: false,
    volumeSeriesFilter: () => true,
};

function mapStateToProps(state) {
    const {
        accountsData,
        applicationGroupsData,
        clustersData,
        consistencyGroupsData,
        protectionDomainsData,
        pvSpecData,
        servicePlanAllocationsData,
        servicePlansData,
        session,
        tableVolumeSeries,
        uiSettings,
        volumeComplianceTotalsData,
        volumeSeriesData,
    } = state;
    return {
        accountsData,
        applicationGroupsData,
        clustersData,
        consistencyGroupsData,
        protectionDomainsData,
        pvSpecData,
        servicePlanAllocationsData,
        servicePlansData,
        session,
        tableVolumeSeries,
        uiSettings,
        volumeComplianceTotalsData,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(VolumeSeriesContainer));
