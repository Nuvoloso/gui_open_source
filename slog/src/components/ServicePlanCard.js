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

import { servicePlanMsgs } from '../messages/ServicePlan';
import { bytesToUnit } from './utils';

import { ReactComponent as ServicePlans } from '../assets/menu/collection-policy.svg';
import { SwapVert, NetworkCheck } from '@material-ui/icons';

import '../leaplabs.css';

class ServicePlanCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedPlans: [],
        };
    }

    renderPerformance() {
        const { data, intl } = this.props;
        const { provisioningUnit } = data || {};
        const { iOPS, throughput } = provisioningUnit || {};
        const { formatMessage } = intl;

        return (
            <div className="content-flex-row-centered">
                <div className="card-info content-flex-column-centered">
                    {iOPS ? (
                        <SwapVert
                            className="card-info-icon nuvo-color-blue"
                            style={{ fontSize: '36px', cursor: 'default' }}
                        />
                    ) : (
                        <NetworkCheck
                            className="card-info-icon nuvo-color-blue"
                            style={{ fontSize: '36px', cursor: 'default' }}
                        />
                    )}
                    {iOPS ? (
                        <div className="card-info-icon-label">{formatMessage(servicePlanMsgs.iops)}</div>
                    ) : (
                        <div className="card-info-icon-label">{formatMessage(servicePlanMsgs.throughput)}</div>
                    )}
                </div>
                <div className="ml15 card-info card-value">{iOPS || bytesToUnit(throughput, 2, true)}</div>
                <div className="card-info-label ml10">
                    {iOPS
                        ? formatMessage(servicePlanMsgs.provisioningUnitIops)
                        : formatMessage(servicePlanMsgs.mbsPerSec)}
                </div>
            </div>
        );
    }

    renderPools(data) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { servicePlanAllocations = {} } = data;
        const count = servicePlanAllocations.length || 0;
        const className = `ml15 card-info card-value ${count === 0 ? 'number-dimmed' : ''} `;

        return (
            <div className="content-flex-row-centered">
                <div className="card-info content-flex-column-centered">
                    <span className="mt5 icon-app-instance nuvo-color-mystrious-honeydew" />
                </div>
                <div className={className}>{count}</div>
                <div className="ml10 card-info-label nuvo-color-mystrious-honeydew">
                    {formatMessage(servicePlanMsgs.pools)}
                </div>
            </div>
        );
    }

    renderName(data) {
        return (
            <div className="card-name-background content-flex-row-centered">
                <div className="ml5 card-name-icon-background">
                    <ServicePlans className="card-name-icon" />
                </div>
                <div className="ml15 card-name-text">{data['name']}</div>
            </div>
        );
    }

    render() {
        const { data, renderPools } = this.props;

        const className = `card card-service-plan-fixed ${data.filteredCard ? 'card-highlighted' : ''}`;
        return (
            <div className={className}>
                {this.renderName(data)}
                <div className="card-content-background">
                    <div className="card-service-plan-main">{this.renderPerformance()}</div>
                </div>
                {renderPools ? (
                    <div className="card-content-background">
                        <div className="card-service-plan-main">{this.renderPools(data)}</div>
                    </div>
                ) : null}
            </div>
        );
    }
}

ServicePlanCard.defaultProps = {
    renderPools: true,
};

ServicePlanCard.propTypes = {
    columns: PropTypes.array,
    compares: PropTypes.object,
    data: PropTypes.object,
    intl: intlShape.isRequired,
    isSelected: PropTypes.func,
    renderPools: PropTypes.bool,
    rolesData: PropTypes.object.isRequired,
    selectable: PropTypes.bool,
    selectedRows: PropTypes.array,
    selectToggle: PropTypes.func,
    titleAccessor: PropTypes.string,
    viewCollapsed: PropTypes.bool,
};

export default injectIntl(ServicePlanCard);
