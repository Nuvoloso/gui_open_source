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
import moment from 'moment';

import * as constants from '../constants';

import { ChevronRight, ChevronLeft } from '@material-ui/icons';

import { messages } from '../messages/Messages';

class TimePeriodSelector extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(e) {
        const { onClick } = this.props;
        const { id } = e.currentTarget;

        if (onClick) {
            onClick(id);
        }
    }

    render() {
        const { endTime, hidePeriods, intl, startTime, timePeriod, timeShift } = this.props;
        const { formatMessage } = intl;
        // do not allow moving forward in time past today
        const shiftRightDisabled = moment().isSame(endTime, 'day');

        return (
            <div className="content-flex-row-centered mr20">
                <div className="time-range mr20">
                    {`${
                        startTime
                            ? moment(startTime)
                                  .local()
                                  .format('L')
                            : ''
                    } - ${
                        endTime
                            ? moment(endTime)
                                  .local()
                                  .format('L')
                            : ''
                    }`}
                </div>
                <div
                    className={`content-flex-row-centered period ${
                        timePeriod === constants.METRIC_PERIOD_MONTH ? 'selected' : ''
                    }`}
                    id={constants.METRIC_PERIOD_MONTH}
                    onClick={this.onClick}
                >
                    <div className="period-oval" />
                    <div>{formatMessage(messages.month)}</div>
                </div>
                <div
                    className={`content-flex-row-centered period ${
                        timePeriod === constants.METRIC_PERIOD_WEEK ? 'selected' : ''
                    }`}
                    id={constants.METRIC_PERIOD_WEEK}
                    onClick={this.onClick}
                >
                    <div className="period-oval" />
                    <div>{formatMessage(messages.week)}</div>
                </div>
                {hidePeriods !== constants.METRIC_PERIOD_DAY ? (
                    <div
                        className={`content-flex-row-centered period ${
                            timePeriod === constants.METRIC_PERIOD_DAY ? 'selected' : ''
                        }`}
                        id={constants.METRIC_PERIOD_DAY}
                        onClick={this.onClick}
                    >
                        <div className="period-oval" />
                        <div>{formatMessage(messages.day)}</div>
                    </div>
                ) : null}
                <div className={`content-flex-row-centered`}>
                    <ChevronLeft className="time-shift" onClick={() => timeShift(constants.TIME_SHIFT_BACKWARD)} />
                    <ChevronRight
                        className={`time-shift${shiftRightDisabled ? '-disabled' : ''}`}
                        onClick={() => {
                            if (!shiftRightDisabled) {
                                timeShift(constants.TIME_SHIFT_FORWARD);
                            }
                        }}
                    />
                </div>
            </div>
        );
    }
}

TimePeriodSelector.propTypes = {
    endTime: PropTypes.object,
    hidePeriods: PropTypes.string,
    intl: intlShape.isRequired,
    onClick: PropTypes.func,
    startTime: PropTypes.object,
    timePeriod: PropTypes.string,
    timeShift: PropTypes.func,
};

export default injectIntl(TimePeriodSelector);
