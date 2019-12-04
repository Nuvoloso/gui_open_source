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
import { intlShape, injectIntl } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { CheckCircle, Error, Group, Warning, RemoveCircle } from '@material-ui/icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';

import NuDonut from './NuDonut';
import { dashboardMsgs } from '../messages/Dashboard';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';
import { getViolationLevels } from './utils_metrics';
import { POOL_CAPACITY_LEVELS } from '../constants';
import { ReactComponent as Clusters } from '../assets/ico-cluster-sm.svg';
import { ReactComponent as Pool } from '../assets/pool.svg';
import { ReactComponent as Volumes } from '../assets/menu/ico-volume.svg';
import { messages } from '../messages/Messages';
import * as constants from '../constants';

import './dashboard.css';
import '../leaplabs.css';

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            initialLoad: true,
        };

        this.handleClickAccounts = this.handleClickAccounts.bind(this);
        this.handleClickApplicationGroups = this.handleClickApplicationGroups.bind(this);
        this.handleClickClusters = this.handleClickClusters.bind(this);
        this.handleClickPools = this.handleClickPools.bind(this);
        this.handleClickVolumes = this.handleClickVolumes.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { initialLoad } = this.state;

        const {
            accountComplianceTotalsData = {},
            appGroupComplianceTotalsData = {},
            clusterComplianceTotalsData = {},
            servicePlanComplianceTotalsData = {},
            session,
            volumeComplianceTotalsData = {},
        } = this.props;
        const { metricsDatabaseConnected } = session || {};

        const {
            accountComplianceTotalsData: prevAccountComplianceTotalsData = {},
            appGroupComplianceTotalsData: prevAppGroupComplianceTotalsData = {},
            clusterComplianceTotalsData: prevClusterComplianceTotalsData = {},
            servicePlanComplianceTotalsData: prevServicePlanComplianceTotalsData = {},
            session: prevSession,
            volumeComplianceTotalsData: prevVolumeComplianceTotalsData = {},
        } = prevProps;
        const { metricsDatabaseConnected: prevMetricsDatabaseConnected } = prevSession || {};

        if (
            initialLoad &&
            (prevAccountComplianceTotalsData.loading ||
                prevAppGroupComplianceTotalsData.loading ||
                prevClusterComplianceTotalsData.loading ||
                prevServicePlanComplianceTotalsData.loading ||
                prevVolumeComplianceTotalsData.loading) &&
            (!accountComplianceTotalsData.loading &&
                !appGroupComplianceTotalsData.loading &&
                !clusterComplianceTotalsData.loading &&
                !servicePlanComplianceTotalsData.loading &&
                !volumeComplianceTotalsData.loading)
        ) {
            this.setState({ initialLoad: false });
        }

        if (metricsDatabaseConnected !== prevMetricsDatabaseConnected) {
            this.setState({ initialLoad: true });
        }
    }

    getPoolCardTooltipMsg(severityLevel) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (severityLevel) {
            case constants.POOL_CAPACITY_LEVELS.OVER_90:
                return formatMessage(dashboardMsgs.poolsCapacityOver90Tooltip);
            case constants.POOL_CAPACITY_LEVELS.OVER_80_BELOW_90:
                return formatMessage(dashboardMsgs.poolsCapacityOver80Below90Tooltip);
            case constants.POOL_CAPACITY_LEVELS.OVER_70_BELOW_80:
                return formatMessage(dashboardMsgs.poolsCapacityOver70Below80Tooltip);
            case constants.POOL_CAPACITY_LEVELS.BELOW_70:
            default:
                return '';
        }
    }

    getPoolFilterValues(severityLevel) {
        switch (severityLevel) {
            case constants.POOL_CAPACITY_LEVELS.OVER_90:
                return { filterPercentEnd: 100, filterPercentStart: 90 };
            case constants.POOL_CAPACITY_LEVELS.OVER_80_BELOW_90:
                return { filterPercentEnd: 89.9, filterPercentStart: 80 };
            case constants.POOL_CAPACITY_LEVELS.OVER_70_BELOW_80:
                return { filterPercentEnd: 79.9, filterPercentStart: 70 };
            case constants.POOL_CAPACITY_LEVELS.BELOW_70:
                return { filterPercentEnd: 69.9, filterPercentStart: 0 };
            default:
                return { filterPercentEnd: 100, filterPercentStart: 0 };
        }
    }

    getSeverityIcon(severityLevel) {
        switch (severityLevel) {
            case POOL_CAPACITY_LEVELS.OVER_90:
                return <Error fontSize="large" />;
            case POOL_CAPACITY_LEVELS.OVER_80_BELOW_90:
                return <Warning fontSize="large" />;
            case POOL_CAPACITY_LEVELS.OVER_70_BELOW_80:
                return <RemoveCircle fontSize="large" />;
            case POOL_CAPACITY_LEVELS.BELOW_70:
            default:
                return <CheckCircle fontSize="large" />;
        }
    }

    getSeverityDescription(severityLevel) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (severityLevel) {
            case POOL_CAPACITY_LEVELS.OVER_90:
                return formatMessage(dashboardMsgs.poolsCapacityOver90);
            case POOL_CAPACITY_LEVELS.OVER_80_BELOW_90:
                return formatMessage(dashboardMsgs.poolsCapacityOver80Below90);
            case POOL_CAPACITY_LEVELS.OVER_70_BELOW_80:
                return formatMessage(dashboardMsgs.poolsCapacityOver70Below80);
            case POOL_CAPACITY_LEVELS.BELOW_70:
            default:
                return formatMessage(dashboardMsgs.poolsCapacityBelow70);
        }
    }

    handleClickAccounts() {
        const { onClickAccounts } = this.props;

        if (onClickAccounts) {
            onClickAccounts();
        }

        this.props.history.push(`/${constants.URI_ACCOUNTS}`);
    }

    handleClickApplicationGroups() {
        const { onClickApplicationGroups } = this.props;

        if (onClickApplicationGroups) {
            onClickApplicationGroups();
        }

        this.props.history.push(`/${constants.URI_VOLUME_SERIES}`);
    }

    handleClickClusters(e, level) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (level) {
            case constants.ALERT_LEVEL_ERROR:
                this.props.history.push(`/${constants.URI_CLUSTERS}?filter=${formatMessage(messages.error)}`);
                break;
            case constants.ALERT_LEVEL_OK:
                this.props.history.push(`/${constants.URI_CLUSTERS}?filter=${formatMessage(messages.ok)}`);
                break;
            case constants.ALERT_LEVEL_WARNING:
                this.props.history.push(`/${constants.URI_CLUSTERS}?filter=${formatMessage(messages.warning)}`);
                break;
            default:
                this.props.history.push(`/${constants.URI_CLUSTERS}`);
        }
    }

    handleClickPools() {
        const { onClickPools } = this.props;

        if (onClickPools) {
            onClickPools();
        }

        this.props.history.push(`/${constants.URI_SERVICE_PLANS}`);
    }

    handleClickVolumes(e, level) {
        const { intl, onClickVolumes } = this.props;
        const { formatMessage } = intl;

        if (onClickVolumes) {
            onClickVolumes();
        }

        switch (level) {
            case constants.ALERT_LEVEL_ERROR:
                this.props.history.push(
                    `/${constants.URI_VOLUME_SERIES}?filter=${formatMessage(volumeSeriesMsgs.statusError)}`
                );
                break;
            case constants.ALERT_LEVEL_OK:
                this.props.history.push(
                    `/${constants.URI_VOLUME_SERIES}?filter=${formatMessage(volumeSeriesMsgs.statusOk)}`
                );
                break;
            case constants.ALERT_LEVEL_WARNING:
                this.props.history.push(
                    `/${constants.URI_VOLUME_SERIES}?filter=${formatMessage(volumeSeriesMsgs.statusWarning)}`
                );
                break;
            default:
                this.props.history.push(`/${constants.URI_VOLUME_SERIES}`);
        }
    }

    renderPoolCard(count, severityLevel = POOL_CAPACITY_LEVELS.BELOW_70) {
        const cardComponent = (
            <div
                className={`dashboard-card dashboard-card-severity-${severityLevel}`}
                onClick={() => {
                    const { onClickPoolCard } = this.props;

                    if (onClickPoolCard) {
                        onClickPoolCard();
                    }

                    const filterValues = this.getPoolFilterValues(severityLevel) || {};
                    const keys = Object.keys(filterValues) || [];

                    this.props.history.push(
                        `/${constants.URI_SERVICE_PLANS}${
                            keys.length > 0 ? `?${keys.map(key => key + '=' + filterValues[key]).join('&')}` : ''
                        }`
                    );
                }}
            >
                <div className="dashboard-card-col-left">
                    <div>{this.getSeverityIcon(severityLevel)}</div>
                    <div className="dashboard-card-description">{this.getSeverityDescription(severityLevel)}</div>
                </div>
                <div className="dashboard-card-col-right">
                    <div className={`dashboard-card-count ${!count ? 'dashboard-card-count-0' : ''}`}>{count}</div>
                </div>
            </div>
        );

        const toolTipMsg = this.getPoolCardTooltipMsg(severityLevel);

        if (toolTipMsg) {
            return (
                <OverlayTrigger overlay={<Tooltip id="delete-pool-tooltip">{toolTipMsg}</Tooltip>} placement="top">
                    {cardComponent}
                </OverlayTrigger>
            );
        } else {
            return cardComponent;
        }
    }

    renderPools() {
        const { intl, servicePlanAllocationsData } = this.props;
        const { formatMessage } = intl;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};

        const poolCapacityLevelCounts = {
            over90: 0,
            over80Below90: 0,
            over70Below80: 0,
            below70: 0,
        };

        servicePlanAllocations.forEach(spa => {
            const { reservableCapacityBytes, totalCapacityBytes } = spa || {};
            const percentUsed = ((totalCapacityBytes - reservableCapacityBytes) / totalCapacityBytes) * 100;

            if (percentUsed >= 90) {
                poolCapacityLevelCounts.over90++;
            } else if (percentUsed >= 80 && percentUsed < 90) {
                poolCapacityLevelCounts.over80Below90++;
            } else if (percentUsed >= 70 && percentUsed < 80) {
                poolCapacityLevelCounts.over70Below80++;
            } else {
                poolCapacityLevelCounts.below70++;
            }
        });

        return (
            <div className="dashboard-pools-capacity">
                <div className="dashboard-block-title ml10">{formatMessage(dashboardMsgs.poolsCapacity)}</div>
                <div className="dashboard-cards">
                    {this.renderPoolCard(poolCapacityLevelCounts.over90, POOL_CAPACITY_LEVELS.OVER_90)}
                    {this.renderPoolCard(poolCapacityLevelCounts.over80Below90, POOL_CAPACITY_LEVELS.OVER_80_BELOW_90)}
                    {this.renderPoolCard(poolCapacityLevelCounts.over70Below80, POOL_CAPACITY_LEVELS.OVER_70_BELOW_80)}
                    {this.renderPoolCard(poolCapacityLevelCounts.below70, POOL_CAPACITY_LEVELS.BELOW_70)}
                </div>
            </div>
        );
    }

    render() {
        const { initialLoad } = this.state;
        const {
            accountComplianceTotalsData = {},
            appGroupComplianceTotalsData = {},
            clusterComplianceTotalsData = {},
            endTime,
            intl,
            servicePlanComplianceTotalsData = {},
            startTime,
            volumeComplianceTotalsData = {},
        } = this.props;
        const { formatMessage } = intl;
        const startString = moment
            .utc(startTime)
            .local()
            .format('lll');
        const endString = moment
            .utc(endTime)
            .local()
            .format('lll');

        const accountViolationLevels = getViolationLevels(accountComplianceTotalsData.metrics);
        const agViolationLevels = getViolationLevels(appGroupComplianceTotalsData.metrics);
        const clusterViolationLevels = getViolationLevels(clusterComplianceTotalsData.metrics);
        const servicePlanViolationLevels = getViolationLevels(servicePlanComplianceTotalsData.metrics);
        const volumeViolationLevels = getViolationLevels(volumeComplianceTotalsData.metrics);

        return (
            <div className="dashboard">
                <div className="dashboard-range">
                    {startString} - {endString}
                </div>
                <div className="dashboard-donuts">
                    <div className="dashboard-block-volumes">
                        <NuDonut
                            countError={volumeViolationLevels.error}
                            countOk={volumeViolationLevels.ok}
                            countWarning={volumeViolationLevels.warning}
                            id="volumes-donut"
                            legend
                            loading={initialLoad && volumeComplianceTotalsData.loading}
                            name={
                                <div className="content-flex-row-centered">
                                    <span className="dashboard-donut-icon ">
                                        <Volumes />
                                    </span>
                                    {formatMessage(dashboardMsgs.volumes)}
                                </div>
                            }
                            onClickError={this.handleClickVolumes}
                            onClickOk={this.handleClickVolumes}
                            onClickWarning={this.handleClickVolumes}
                        />
                    </div>
                    <div className="dashboard-block-other">
                        <div className="dashboard-block-other-donuts">
                            <div className="dashboard-block-ag">
                                <NuDonut
                                    countError={agViolationLevels.error}
                                    countOk={agViolationLevels.ok}
                                    countWarning={agViolationLevels.warning}
                                    id="ag-donut"
                                    loading={initialLoad && appGroupComplianceTotalsData.loading}
                                    name={
                                        <div className="content-flex-row-centered">
                                            <span className="dashboard-donut-icon icon-module" />
                                            {formatMessage(dashboardMsgs.applicationGroups)}
                                        </div>
                                    }
                                    onClickError={this.handleClickApplicationGroups}
                                    onClickOk={this.handleClickApplicationGroups}
                                    onClickWarning={this.handleClickApplicationGroups}
                                />
                            </div>
                            <div className="dashboard-block-misc">
                                <NuDonut
                                    countError={accountViolationLevels.error}
                                    countOk={accountViolationLevels.ok}
                                    countWarning={accountViolationLevels.warning}
                                    id="accounts-donut"
                                    loading={initialLoad && accountComplianceTotalsData.loading}
                                    name={
                                        <div className="content-flex-row-centered">
                                            <Group className="dashboard-donut-icon" style={{ width: '24px' }} />
                                            {formatMessage(dashboardMsgs.accounts)}
                                        </div>
                                    }
                                    onClickError={this.handleClickAccounts}
                                    onClickOk={this.handleClickAccounts}
                                    onClickWarning={this.handleClickAccounts}
                                    strokeWidth={2}
                                />
                                <NuDonut
                                    countError={clusterViolationLevels.error}
                                    countOk={clusterViolationLevels.ok}
                                    countWarning={clusterViolationLevels.warning}
                                    id="clusters-donut"
                                    loading={initialLoad && clusterComplianceTotalsData.loading}
                                    name={
                                        <div className="content-flex-row-centered">
                                            <Clusters className="dashboard-donut-icon" />
                                            {formatMessage(dashboardMsgs.clusters)}
                                        </div>
                                    }
                                    onClickError={this.handleClickClusters}
                                    onClickOk={this.handleClickClusters}
                                    onClickWarning={this.handleClickClusters}
                                    strokeWidth={2}
                                />
                                <NuDonut
                                    countError={servicePlanViolationLevels.error}
                                    countOk={servicePlanViolationLevels.ok}
                                    countWarning={servicePlanViolationLevels.warning}
                                    id="pools-donut"
                                    loading={initialLoad && servicePlanComplianceTotalsData.loading}
                                    name={
                                        <div className="content-flex-row-centered">
                                            <span className="dashboard-donut-icon">
                                                <Pool />
                                            </span>
                                            {formatMessage(dashboardMsgs.servicePlans)}
                                        </div>
                                    }
                                    onClickError={this.handleClickPools}
                                    onClickOk={this.handleClickPools}
                                    onClickWarning={this.handleClickPools}
                                    strokeWidth={2}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {this.renderPools()}
            </div>
        );
    }
}

Dashboard.propTypes = {
    accountComplianceTotalsData: PropTypes.object.isRequired,
    appGroupComplianceTotalsData: PropTypes.object.isRequired,
    clusterComplianceTotalsData: PropTypes.object.isRequired,
    endTime: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    onClickAccounts: PropTypes.func,
    onClickApplicationGroups: PropTypes.func,
    onClickPoolCard: PropTypes.func,
    onClickPools: PropTypes.func,
    onClickVolumes: PropTypes.func,
    servicePlanAllocationsData: PropTypes.object,
    servicePlanComplianceTotalsData: PropTypes.object.isRequired,
    session: PropTypes.object,
    startTime: PropTypes.object.isRequired,
    volumeComplianceTotalsData: PropTypes.object.isRequired,
};

export default withRouter(injectIntl(Dashboard));
