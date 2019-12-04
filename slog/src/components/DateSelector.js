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

import moment from 'moment';

import './process.css';
import './recoverselect.css';

import * as constants from '../constants';

class DateSelector extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    onClick(date) {
        const { onChangeDates } = this.props;

        onChangeDates(date);
    }

    render() {
        const { selectedDates, startDate, timePeriod } = this.props;
        const dates = [];
        const dateLabels = [];
        const numDays = timePeriod === constants.METRIC_PERIOD_WEEK ? 6 : 31;

        /**
         * When comparing dates, normalize to start of day (local time)
         */
        for (let i = 0; i <= numDays; i++) {
            const startOfIncrementalDay = moment(startDate).add(i, 'days');
            let labelClassName = '';
            let dateClassName = '';

            const dateFound = selectedDates.find(date => {
                return date.isSame(startOfIncrementalDay);
            });

            if (dateFound) {
                labelClassName = 'date-label-selected';
                dateClassName = 'date-selected';
            } else {
                labelClassName = 'date-label-not-selected';
                dateClassName = 'date-not-selected';
            }

            dateLabels.push(
                <div key={i} className={labelClassName}>
                    {startOfIncrementalDay.format(timePeriod === constants.METRIC_PERIOD_WEEK ? 'MM/DD' : 'DD')}
                </div>
            );

            dates.push(
                <div key={i} className="content-flex-column max-width">
                    <div className={dateClassName} onClick={() => this.onClick(startOfIncrementalDay)} />
                </div>
            );
        }

        return (
            <div className="content-flex-column max-width">
                <div className="content-flex-row center-content h30">{dateLabels}</div>
                <div className="content-flex-row h30 blue-border">{dates}</div>
            </div>
        );
    }
}

DateSelector.propTypes = {
    onChangeDates: PropTypes.func.isRequired,
    selectedDates: PropTypes.array.isRequired,
    startDate: PropTypes.object.isRequired,
    timePeriod: PropTypes.string,
};

export default DateSelector;
