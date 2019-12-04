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
import { Button, ButtonGroup, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { messages } from '../messages/Messages';
import { volumeMetricsMsgs } from '../messages/VolumeMetrics';
import './timeperiodselection.css';

const constants = require('../constants');

class TimePeriodSelection extends Component {
    renderTooltip(id) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        switch (id) {
            // periods
            case constants.TOOLTIP_DAY: {
                return <Tooltip id="servicePlansTooltip">{formatMessage(volumeMetricsMsgs.day)}</Tooltip>;
            }
            case constants.TOOLTIP_WEEK: {
                return <Tooltip id="servicePlansTooltip">{formatMessage(volumeMetricsMsgs.week)}</Tooltip>;
            }
            case constants.TOOLTIP_MONTH: {
                return <Tooltip id="servicePlansTooltip">{formatMessage(volumeMetricsMsgs.month)}</Tooltip>;
            }

            // default to something
            default:
                return <Tooltip id="unknownTooltip">${formatMessage(messages.unknown)}</Tooltip>;
        }
    }

    render() {
        const { intl, period, selectTimePeriod } = this.props;
        const { formatMessage } = intl;

        return (
            <MenuItem header className="header-filter-dropdown">
                <div className="header-filter-dropdown-period-label">{formatMessage(volumeMetricsMsgs.timePeriod)}</div>
                <ButtonGroup className="nv-toolbar header-filter-dropdown-period-buttons">
                    <OverlayTrigger placement="top" overlay={this.renderTooltip(constants.TOOLTIP_DAY)}>
                        <Button
                            className="timeperiodbuttons"
                            active={period === constants.METRIC_PERIOD_DAY}
                            onClick={() => {
                                selectTimePeriod(constants.METRIC_PERIOD_DAY);
                            }}
                        >
                            {formatMessage(messages.day)}
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={this.renderTooltip(constants.TOOLTIP_WEEK)}>
                        <Button
                            className="timeperiodbuttons"
                            active={period === constants.METRIC_PERIOD_WEEK}
                            onClick={() => {
                                selectTimePeriod(constants.METRIC_PERIOD_WEEK);
                            }}
                        >
                            {formatMessage(messages.week)}
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={this.renderTooltip(constants.TOOLTIP_MONTH)}>
                        <Button
                            className="timeperiodbuttons"
                            active={period === constants.METRIC_PERIOD_MONTH}
                            onClick={() => {
                                selectTimePeriod(constants.METRIC_PERIOD_MONTH);
                            }}
                        >
                            {formatMessage(messages.month)}
                        </Button>
                    </OverlayTrigger>
                </ButtonGroup>
            </MenuItem>
        );
    }
}

TimePeriodSelection.propTypes = {
    intl: intlShape.isRequired,
    period: PropTypes.string.isRequired,
    selectTimePeriod: PropTypes.func.isRequired,
};

export default injectIntl(TimePeriodSelection);
