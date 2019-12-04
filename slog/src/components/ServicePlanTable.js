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

import { bytesToUnit, formatBytes } from './utils';
import { messages } from '../messages/Messages';
import { servicePlanMsgs } from '../messages/ServicePlan';
import * as constants from '../constants';

const DISABLED_KEYS = [constants.SLO_KEYS.AVAILABILITY, constants.SLO_KEYS.RETENTION, constants.SLO_KEYS.SECURITY, constants.SLO_KEYS.RESPONSE_TIME_MAXIMUM];

class ServicePlanTable extends Component {
    constructor(props) {
        super(props);

        const { initialSelectedKey } = props;

        this.state = {
            selectedKey: initialSelectedKey,
        };

        this.renderPerformance = this.renderPerformance.bind(this);
    }

    /**
     * Need to determine if the initial chart has changed on a switch triggered from
     * volume service history.
     */
    componentDidUpdate(prevProps) {
        const { initialSelectedKey: prevInitialSelectedKey } = prevProps;
        const { initialSelectedKey } = this.props;

        if (prevInitialSelectedKey !== initialSelectedKey) {
            this.setState({ selectedKey: initialSelectedKey });
        }
    }

    /**
     *
     * @param {string} title
     * @param {array} data array of objects {header: string, value: string}
     */
    renderTable(title, data = []) {
        return (
            <div className="service-plan-compliance-table">
                <div className="service-plan-compliance-table-title">{title}</div>
                <div className="service-plan-compliance-table-block">
                    {data.map((d, idx) => {
                        const { selectedKey } = this.state;
                        const { header, key, value } = d || {};
                        return (
                            <div
                                className={`service-plan-compliance-table-column ${
                                    idx !== 0 ? 'service-plan-compliance-table-column-border' : ''
                                } ${key === selectedKey ? 'service-plan-compliance-table-column-selected' : ''} ${
                                    DISABLED_KEYS.includes(key) ? 'unselectable' : 'selectable'
                                }`}
                                id={key}
                                key={key}
                                onClick={() => {
                                    if (DISABLED_KEYS.includes(key)) {
                                        return;
                                    }

                                    const { onClick } = this.props;

                                    if (onClick) {
                                        onClick(key);
                                    }

                                    this.setState({ selectedKey: key });
                                }}
                            >
                                <div className="service-plan-compliance-table-header">{header}</div>
                                <div className="service-plan-compliance-table-cell">
                                    {this.renderTableValue(key, value)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    renderTableValue(key, value) {
        switch (key) {
            case constants.IO_KEYS.READ_WRITE_MIX:
            case constants.IO_KEYS.IO_PATTERN:
                return (
                    <div>
                        <div>{value}</div>
                        <div className="mt10">{this.renderTableValueDescription(value)}</div>
                    </div>
                );
            default:
                return value;
        }
    }

    renderTableValueDescription(value) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (value) {
            // ioPattern
            case 'random':
                return formatMessage(servicePlanMsgs.ioRandomDefinition);
            case 'sequential':
                return formatMessage(servicePlanMsgs.ioSequentialDefinition);
            case 'streaming':
                return formatMessage(servicePlanMsgs.ioStreamingDefinition);
            // readWriteMix
            case 'read-mostly':
                return formatMessage(servicePlanMsgs.ioMixRDefinition);
            case 'read-write':
                return formatMessage(servicePlanMsgs.ioMixRwDefinition);
            case 'write-mostly':
                return formatMessage(servicePlanMsgs.ioMixWDefinition);
            default:
                return null;
        }
    }

    renderPerformance(sizeBytes) {
        const { intl, servicePlan } = this.props;
        const { formatMessage } = intl;
        const { provisioningUnit } = servicePlan || {};
        const { iOPS = 0, throughput = 0 } = provisioningUnit || {};

        const multiplier = bytesToUnit(sizeBytes) || 0;

        if (iOPS) {
            return `${multiplier * iOPS} ${formatMessage(servicePlanMsgs.iops)} (${iOPS} / ${formatMessage(
                messages.gib
            )})`;
        }

        return `${formatMessage(servicePlanMsgs.provisioningUnitThroughputValue, {
            formattedBytes: formatBytes(multiplier * throughput, true),
        })} (${formatBytes(throughput, true)} / ${formatMessage(messages.gib)})`;
    }

    render() {
        const { intl, servicePlan, volume = {} } = this.props;
        const { formatMessage } = intl;
        const { ioProfile, slos = {} } = servicePlan || {};
        const { ioPattern = {}, readWriteMix = {} } = ioProfile || {};
        const { value: availability } = slos[constants.SLO_KEYS.AVAILABILITY] || {};
        const { value: rpo } = slos[constants.SLO_KEYS.RPO] || {};
        const { value: responseAvg } = slos[constants.SLO_KEYS.RESPONSE_TIME_AVERAGE] || {};
        const { value: responseMax } = slos[constants.SLO_KEYS.RESPONSE_TIME_MAXIMUM] || {};
        const { value: retention } = slos[constants.SLO_KEYS.RETENTION] || {};
        const { value: security } = slos[constants.SLO_KEYS.SECURITY] || {};
        const { sizeBytes = 0, spaAdditionalBytes = 0 } = volume;

        return (
            <div className="service-plan-compliance-tables">
                {this.renderTable(formatMessage(servicePlanMsgs.tableWorkloadProfiles), [
                    {
                        header: formatMessage(servicePlanMsgs.tableIoPattern),
                        key: constants.IO_KEYS.IO_PATTERN,
                        value: ioPattern.name,
                    },
                    {
                        header: formatMessage(servicePlanMsgs.tableIoMix),
                        key: constants.IO_KEYS.READ_WRITE_MIX,
                        value: readWriteMix.name,
                    },
                    {
                        header: formatMessage(servicePlanMsgs.tableIoPerformance),
                        key: constants.IO_KEYS.PROVISIONING_UNIT,
                        value: this.renderPerformance(sizeBytes + spaAdditionalBytes),
                    },
                ])}
                {this.renderTable(formatMessage(servicePlanMsgs.tableSlos), [
                    {
                        header: formatMessage(servicePlanMsgs.tableAvailability),
                        key: constants.SLO_KEYS.AVAILABILITY,
                        value: availability,
                    },
                    { header: formatMessage(servicePlanMsgs.tableRpo), key: constants.SLO_KEYS.RPO, value: rpo },
                    {
                        header: formatMessage(servicePlanMsgs.tableResponseTimeAvg),
                        key: constants.SLO_KEYS.RESPONSE_TIME_AVERAGE,
                        value: responseAvg,
                    },
                    {
                        header: formatMessage(servicePlanMsgs.tableResponseTimeMax),
                        key: constants.SLO_KEYS.RESPONSE_TIME_MAXIMUM,
                        value: responseMax,
                    },
                    {
                        header: formatMessage(servicePlanMsgs.tableRetention),
                        key: constants.SLO_KEYS.RETENTION,
                        value: retention,
                    },
                    {
                        header: formatMessage(servicePlanMsgs.tableSecurity),
                        key: constants.SLO_KEYS.SECURITY,
                        value: security,
                    },
                ])}
            </div>
        );
    }
}

ServicePlanTable.propTypes = {
    initialSelectedKey: PropTypes.string,
    intl: intlShape.isRequired,
    onClick: PropTypes.func,
    servicePlan: PropTypes.object,
    volume: PropTypes.object,
};

ServicePlanTable.defaultProps = {
    initialSelectedKey: '',
};

export default injectIntl(ServicePlanTable);
