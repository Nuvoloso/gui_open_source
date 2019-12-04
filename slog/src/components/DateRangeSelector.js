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

import DateSelector from '../components/DateSelector';
import TimePeriodSelector from '../components/TimePeriodSelector';

import '../components/recoverselect.css';

import * as constants from '../constants';

class DateRangeSelector extends Component {
    render() {
        const {
            endDate,
            onChangeDates,
            selectedDates,
            selectTimePeriod,
            startDate,
            timePeriod,
            timeShift,
        } = this.props;
        return (
            <div className="recover-snapshot">
                <div className="context-flex-column max-width recover-snapshot-background">
                    <div className="content-flex-row font-14 mt15 flex-space-between mr20 ml10 mb10">
                        <TimePeriodSelector
                            endTime={endDate}
                            hidePeriods={constants.METRIC_PERIOD_DAY}
                            onClick={selectTimePeriod}
                            startTime={startDate}
                            timePeriod={timePeriod}
                            timeShift={timeShift}
                        />
                    </div>
                    <div className="content-flex-row max-width nested-content-2 ml10 mr10 font-12 ">
                        <DateSelector
                            onChangeDates={onChangeDates}
                            selectedDates={selectedDates}
                            startDate={startDate}
                            timePeriod={timePeriod}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

DateRangeSelector.propTypes = {
    endDate: PropTypes.object.isRequired,
    onChangeDates: PropTypes.func.isRequired,
    selectedDates: PropTypes.array.isRequired,
    selectTimePeriod: PropTypes.func,
    startDate: PropTypes.object.isRequired,
    timePeriod: PropTypes.string,
    timeShift: PropTypes.func,
};

export default DateRangeSelector;
