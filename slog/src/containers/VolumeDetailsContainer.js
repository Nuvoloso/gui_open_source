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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';

import Loader from '../components/Loader';
import VolumeDetails from '../components/VolumeDetails';

import { getAGs } from '../actions/applicationGroupActions';
import { getCGs } from '../actions/consistencyGroupActions';
import { getServicePlanAllocations } from '../actions/servicePlanAllocationActions';
import { getServicePlans } from '../actions/servicePlanActions';
import { getSnapshots } from '../actions/snapshotActions';
import { getVolumesCompliance, getVolumeStatus } from '../actions/complianceActions';
import { getVolumeMetrics } from '../actions/volumeMetricsActions';
import { getVolumeSeries, patchVolumeSeries } from '../actions/volumeSeriesActions';
import { getVolumeServiceHistory } from '../actions/complianceActions';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';
import { postChangeCapacity } from '../actions/volumeSeriesActions';
import { postAuditLog } from '../actions/complianceActions';

import * as constants from '../constants';
import * as types from '../actions/types';
import { timePeriodUnit } from '../components/utils';

class VolumeDetailsContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedChartKey: constants.IO_KEYS.PROVISIONING_UNIT,
            startTime: null,
            endTime: null,
            timePeriod: constants.METRIC_PERIOD_DAY,
        };

        this.updateTimer = null;
        this.updateTimerSnapshots = null;

        this.dispatchMetrics = this.dispatchMetrics.bind(this);
        this.handleChartSelect = this.handleChartSelect.bind(this);
        this.handleDetailsTabSelect = this.handleDetailsTabSelect.bind(this);
        this.handlePatchVolume = this.handlePatchVolume.bind(this);
        this.loadVolumeData = this.loadVolumeData.bind(this);
        this.postAuditLog = this.postAuditLog.bind(this);
        this.postChangeCapacity = this.postChangeCapacity.bind(this);
        this.selectTimePeriod = this.selectTimePeriod.bind(this);
        this.selectChart = this.selectChart.bind(this);
        this.timeShift = this.timeShift.bind(this);
    }

    /**
     * Load all but specific volume data when the component mounts.
     */
    componentDidMount() {
        const { dispatch, intl, match, servicePlansData, uiSettings } = this.props;
        const { formatMessage } = intl;
        const { params } = match || {};
        const { id } = params || {};
        const { servicePlans = [] } = servicePlansData || {};
        const { volumesTimePeriod } = uiSettings || {};
        const name = this.getName();

        if (name) {
            dispatch({
                type: types.SET_HEADER_RESOURCE_NAME,
                resourceName: formatMessage(volumeSeriesMsgs.volumeDetailsTitle, { name }),
            });
        } else {
            dispatch(getVolumeSeries());
        }

        const endTime = moment();
        const startTime = endTime.clone().subtract(1, timePeriodUnit(volumesTimePeriod));
        this.setState({ endTime, startTime });

        dispatch(getVolumeMetrics('admin', startTime.toISOString(), endTime.toISOString(), id, name));

        if (servicePlans.length < 1) {
            dispatch(getServicePlans());
        }

        dispatch(getAGs());
        dispatch(getVolumeSeries());
        dispatch(getServicePlanAllocations());
        dispatch(getCGs());

        this.setState({ timePeriod: volumesTimePeriod });
    }

    selectChart(selectedChartKey) {
        const { dispatch } = this.props;
        dispatch({
            type: types.SET_VOLUME_DETAILS_TAB,
            volumeDetailsTab: constants.VOLUME_DETAILS_TABS.SERVICE_PLAN_COMPLIANCE,
        });
        this.setState({ selectedChartKey });
    }

    dispatchMetrics(startTime, endTime, id, name) {
        const { dispatch, session } = this.props;
        // status is just the past day
        const statusStartTime = moment().subtract(1, 'day');
        // service history needs to fetch the past month and filter client side
        const serviceHistoryStartTime = moment().subtract(1, 'month');
        const { metricsDatabaseConnected } = session;

        if (metricsDatabaseConnected === constants.METRICS_SERVICE_CONNECTED) {
            dispatch(getVolumeServiceHistory(serviceHistoryStartTime.toISOString(), moment(endTime).toISOString(), id));
            dispatch(getVolumesCompliance(moment(startTime).toISOString(), moment(endTime).toISOString()));
            dispatch(getVolumeStatus(id, moment(statusStartTime).toISOString(), moment(endTime).toISOString()));
            dispatch(getVolumeMetrics('admin', startTime.toISOString(), moment(endTime).toISOString(), id, name));
        }
    }

    /**
     * Load volume specific data when the name changes or is set for the first time.
     */
    loadVolumeData() {
        const { dispatch, match } = this.props;
        const { params } = match || {};
        const { id } = params || {};
        const { endTime, startTime } = this.state;
        const name = this.getName();

        if (!name) {
            return;
        }
        dispatch(getSnapshots(id, startTime.toISOString(), moment(endTime).toISOString(), true));
        this.dispatchMetrics(startTime, endTime, id, name);

        /**
         * Set up refresh of data.
         */
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }

        if (this.updateTimerSnapshots) {
            clearInterval(this.updateTimerSnapshots);
            this.updateTimerSnapshots = null;
        }

        this.updateTimer = setInterval(() => {
            const { timePeriod } = this.state;
            const startTime = moment().subtract(1, timePeriodUnit(timePeriod));
            const endTime = moment();
            this.setState({ endTime, startTime });

            this.dispatchMetrics(startTime, endTime, id, name);
        }, 60000);

        this.updateTimerSnapshots = setInterval(() => {
            const startTime = moment().subtract(1, 'month');
            const endTime = moment();
            dispatch(getSnapshots(id, startTime.toISOString(), endTime.toISOString(), true));
        }, 60000);
    }

    componentDidUpdate(prevProps, prevState) {
        const { auditLogData, dispatch, intl, match, session, uiSettings, volumeSeriesData } = this.props;
        const { formatMessage } = intl;
        const { params } = match || {};
        const { id } = params || {};
        const { volumeSeries = [] } = volumeSeriesData || {};
        const volume = volumeSeries.find(vs => vs.meta.id === id);
        const { name } = volume || {};
        const { volumesTimePeriod } = uiSettings || {};
        const { metricsDatabaseConnected } = session;

        const {
            auditLogData: prevAuditLogData,
            match: prevMatch,
            session: prevSession,
            uiSettings: prevUISettings,
            volumeSeriesData: prevVolumeSeriesData,
        } = prevProps;
        const { metricsDatabaseConnected: prevMetricsDatabaseConnected } = prevSession;

        const { params: prevParams } = prevMatch || {};
        const { id: prevId } = prevParams || {};
        const { volumeSeries: prevVolumeSeries = [] } = prevVolumeSeriesData || {};
        const prevVolume = prevVolumeSeries.find(vs => vs.meta.id === prevId);
        const { name: prevName } = prevVolume || {};
        const { volumesTimePeriod: prevVolumesTimePeriod } = prevUISettings;
        const { endTime, startTime } = this.state;
        const { endTime: prevEndTime, startTime: prevStartTime } = prevState;

        /**
         * Need to redirect to /volumes if no volumes are found
         */
        if (!volumeSeriesData.loading && (!volumeSeries.length === 0 || !volume)) {
            // nothing found or no access to this volume, return to top level resource page
            this.props.history.push(`/${constants.URI_VOLUME_SERIES}`);
            return;
        }

        /**
         * Need to shift end time to accommodate for newly created record.
         */
        if (auditLogData.loading !== prevAuditLogData.loading && !auditLogData.loading) {
            const shiftEndTime = endTime.clone().add(1, 'minute');
            this.setState({ endTime: shiftEndTime });
        }

        if (name !== prevName) {
            dispatch({
                type: types.SET_HEADER_RESOURCE_NAME,
                resourceName: formatMessage(volumeSeriesMsgs.volumeDetailsTitle, { name }),
            });

            /**
             * Need to fetch all data on name/volume change.
             */
            this.loadVolumeData();
        } else if (
            endTime !== prevEndTime ||
            metricsDatabaseConnected !== prevMetricsDatabaseConnected ||
            startTime !== prevStartTime ||
            volumesTimePeriod !== prevVolumesTimePeriod
        ) {
            /**
             * Need to fetch all data on time period change.
             */
            this.loadVolumeData();
        }
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_HEADER_RESOURCE_NAME, resourceName: null });
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        if (this.updateTimerSnapshots) {
            clearInterval(this.updateTimerSnapshots);
            this.updateTimerSnapshots = null;
        }
    }

    getName() {
        const { match, volumeSeriesData } = this.props;
        const { params } = match || {};
        const { id } = params || {};
        const { volumeSeries = [] } = volumeSeriesData || {};
        const volume = volumeSeries.find(vs => vs.meta.id === id);
        const { name } = volume || {};

        return name;
    }

    handleChartSelect(selectedChartKey) {
        this.setState({ selectedChartKey });
    }

    handleDetailsTabSelect(volumeDetailsTab) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_VOLUME_DETAILS_TAB, volumeDetailsTab });
    }

    handlePatchVolume(id, clusterId, params) {
        const { dispatch } = this.props;
        dispatch(patchVolumeSeries(id, clusterId, params));
    }

    /**
     * Create the audit log annotation.
     */
    postAuditLog(actionParams) {
        const { dispatch } = this.props;

        dispatch(postAuditLog(actionParams));
    }

    postChangeCapacity(volumeSeriesCreateSpec, volumeSeriedId, name) {
        const { dispatch } = this.props;

        dispatch(postChangeCapacity(volumeSeriesCreateSpec, volumeSeriedId, name));
    }

    /**
     * Adjust the time period.  Note that all metrics/resource data is loaded in
     * loadVolumeData() which will key off changes to the selected time period.
     */
    selectTimePeriod(timePeriod) {
        const { endTime, selectedChartKey } = this.state;
        const { dispatch } = this.props;
        const startTime = endTime.clone().subtract(1, timePeriodUnit(timePeriod));

        this.setState({ startTime, timePeriod });

        dispatch({ type: types.SET_VOLUME_DETAILS_TIME_PERIOD, timePeriod });

        if (selectedChartKey === constants.SLO_KEYS.RPO) {
            return;
        }
    }

    /**
     * Move the start/end dates forward or backward N days based on the time period in use.
     * @param {*} direction
     */
    timeShift(direction) {
        const { endTime, startTime, timePeriod } = this.state;
        const newEndTime =
            direction === constants.TIME_SHIFT_FORWARD
                ? moment(endTime)
                      .clone()
                      .add(1, timePeriodUnit(timePeriod))
                : moment(endTime)
                      .clone()
                      .subtract(1, timePeriodUnit(timePeriod));
        const resetEndTime = newEndTime.isAfter();
        const newStartTime = resetEndTime
            ? moment().subtract(1, timePeriodUnit(timePeriod))
            : direction === constants.TIME_SHIFT_FORWARD
            ? moment(startTime)
                  .clone()
                  .add(1, timePeriodUnit(timePeriod))
            : moment(startTime)
                  .clone()
                  .subtract(1, timePeriodUnit(timePeriod));

        if (resetEndTime) {
            this.setState({ endTime: moment(), startTime: newStartTime });
        } else {
            this.setState({ endTime: newEndTime, startTime: newStartTime });
        }
    }

    render() {
        const {
            accountsData,
            applicationGroupsData = {},
            clustersData,
            consistencyGroupsData = {},
            match,
            resourceNavigation,
            servicePlanAllocationsData = {},
            servicePlansData = {},
            snapshotsData,
            uiSettings,
            volumeComplianceTotalsData = {},
            volumeMetricsData = {},
            volumeSeriesData = {},
            volumeServiceHistoryData = {},
            volumeStatusData = {},
        } = this.props;
        const { endTime, selectedChartKey, startTime, timePeriod } = this.state;
        const { params } = match || {};
        const { id } = params || {};
        const { volumeDetailsTab } = uiSettings || {};
        const { loading, volumeSeries = [] } = volumeSeriesData || {};
        const volume = volumeSeries.find(vol => vol.meta.id === id);
        const { servicePlanId } = volume || {};
        const { servicePlans = [] } = servicePlansData || {};
        const servicePlan = servicePlans.find(sp => sp.meta.id === servicePlanId);
        const { data: volumeList = [] } = resourceNavigation || {};

        const isLoading =
            applicationGroupsData.loading ||
            consistencyGroupsData.loading ||
            servicePlanAllocationsData.loading ||
            servicePlansData.loading ||
            volumeComplianceTotalsData.loading ||
            volumeMetricsData.loading ||
            volumeSeriesData.loading ||
            volumeServiceHistoryData.loading ||
            volumeStatusData.loading;

        return (
            <Fragment>
                {isLoading ? <Loader /> : null}
                <VolumeDetails
                    accountsData={accountsData}
                    applicationGroupsData={applicationGroupsData}
                    clustersData={clustersData}
                    consistencyGroupsData={consistencyGroupsData}
                    endTime={endTime}
                    initialChart={selectedChartKey}
                    loading={loading}
                    onChartSelect={this.handleChartSelect}
                    onPatchVolume={this.handlePatchVolume}
                    onTabSelect={this.handleDetailsTabSelect}
                    postAuditLog={this.postAuditLog}
                    postChangeCapacity={this.postChangeCapacity}
                    selectChart={this.selectChart}
                    selectTimePeriod={this.selectTimePeriod}
                    servicePlan={servicePlan}
                    servicePlanAllocationsData={servicePlanAllocationsData}
                    servicePlansData={servicePlansData}
                    snapshotsData={snapshotsData}
                    startTime={startTime}
                    tabKey={volumeDetailsTab}
                    timePeriod={timePeriod}
                    timeShift={this.timeShift}
                    volume={volume}
                    volumeList={volumeList}
                    volumeComplianceTotalsData={volumeComplianceTotalsData}
                    volumeMetricsData={volumeMetricsData}
                    volumeSeriesData={volumeSeriesData}
                    volumeServiceHistoryData={volumeServiceHistoryData}
                    volumeStatusData={volumeStatusData}
                />
            </Fragment>
        );
    }
}

VolumeDetailsContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    applicationGroupsData: PropTypes.object.isRequired,
    auditLogData: PropTypes.object.isRequired,
    clustersData: PropTypes.object.isRequired,
    consistencyGroupsData: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    resourceNavigation: PropTypes.object,
    servicePlanAllocationsData: PropTypes.object,
    servicePlansData: PropTypes.object.isRequired,
    session: PropTypes.object,
    snapshotsData: PropTypes.object.isRequired,
    uiSettings: PropTypes.object,
    volumeComplianceTotalsData: PropTypes.object.isRequired,
    volumeMetricsData: PropTypes.object.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
    volumeServiceHistoryData: PropTypes.object.isRequired,
    volumeStatusData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const {
        accountsData,
        applicationGroupsData,
        auditLogData,
        clustersData,
        consistencyGroupsData,
        resourceNavigation,
        servicePlanAllocationsData,
        servicePlansData,
        session,
        snapshotsData,
        uiSettings,
        volumeComplianceTotalsData,
        volumeMetricsData,
        volumeSeriesData,
        volumeServiceHistoryData,
        volumeStatusData,
    } = state;
    return {
        accountsData,
        applicationGroupsData,
        auditLogData,
        clustersData,
        consistencyGroupsData,
        resourceNavigation,
        servicePlanAllocationsData,
        servicePlansData,
        session,
        snapshotsData,
        uiSettings,
        volumeComplianceTotalsData,
        volumeMetricsData,
        volumeSeriesData,
        volumeServiceHistoryData,
        volumeStatusData,
    };
}

export default connect(mapStateToProps)(injectIntl(VolumeDetailsContainer));
