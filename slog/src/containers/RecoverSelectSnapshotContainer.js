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
import moment from 'moment';

import DateRangeSelector from '../components/DateRangeSelector';
import SnapshotSelector from '../components/SnapshotSelector';

import { timePeriodUnit } from '../components/utils';

import '../components/recoverselect.css';

import * as constants from '../constants';
import * as types from '../actions/types';

class RecoverSelectSnapshotContainer extends Component {
    constructor(props) {
        super(props);

        /**
         * Normalize time to local start of day.
         */
        const endDate = this.initialEndDate();
        this.state = {
            startDate: this.iniitialStartDate(),
            endDate,
            selectedDates: [endDate],
            timePeriod: constants.METRIC_PERIOD_WEEK,
        };

        this.onChangeDates = this.onChangeDates.bind(this);
        this.selectTimePeriod = this.selectTimePeriod.bind(this);
        this.timeShift = this.timeShift.bind(this);
    }

    iniitialStartDate() {
        return moment()
            .startOf('day')
            .subtract(6, 'days');
    }

    initialEndDate() {
        return moment().startOf('day');
    }

    /**
     * Adjust the time period.  Note that all metrics/resource data is loaded in
     * loadVolumeData() which will key off changes to the selected time period.
     */
    selectTimePeriod(timePeriod) {
        const { dispatch, tableSnapshots } = this.props;
        const startDate =
            timePeriod === constants.METRIC_PERIOD_WEEK
                ? this.iniitialStartDate()
                : moment()
                      .startOf('day')
                      .subtract(1, 'month');
        const endDate = this.initialEndDate();
        const { selectedRows } = tableSnapshots || {};
        const { _original } = (Array.isArray(selectedRows) && selectedRows.length > 0 && selectedRows[0]) || {};
        const { date } = _original || {};
        const resetSelection =
            moment(date)
                .startOf('day')
                .isBefore(startDate) || moment(date).isAfter(endDate);

        this.setState({
            endDate,
            startDate,
            timePeriod,
        });

        // clear any selections when switching timeframes && selection is out of new range
        if (timePeriod === constants.METRIC_PERIOD_WEEK && resetSelection) {
            dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS_SNAPSHOTS_TABLE });
        }
    }

    /**
     * Move the start/end dates forward or backward N days based on the time period in use.
     * @param {*} direction
     */
    timeShift(direction) {
        const { endDate, startDate, timePeriod } = this.state;
        const { dispatch } = this.props;
        const newEndDate =
            direction === constants.TIME_SHIFT_FORWARD
                ? moment(endDate).add(1, timePeriodUnit(timePeriod))
                : moment(endDate).subtract(1, timePeriodUnit(timePeriod));
        const resetEndTime = newEndDate.isAfter();
        const newStartDate = resetEndTime
            ? moment()
                  .subtract(1, timePeriodUnit(timePeriod))
                  .startOf('day')
            : direction === constants.TIME_SHIFT_FORWARD
            ? moment(startDate).add(1, timePeriodUnit(timePeriod))
            : moment(startDate).subtract(1, timePeriodUnit(timePeriod));

        if (resetEndTime) {
            this.setState({ endDate: moment(), startDate: newStartDate });
        } else {
            this.setState({ endDate: newEndDate, startDate: newStartDate });
        }

        // clear any selections when shifting timeframes
        dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS_SNAPSHOTS_TABLE });
    }

    onChangeDates(selectedDate) {
        const { selectedDates } = this.state;

        const dateIsSelected = selectedDates.find(date => {
            return date.isSame(selectedDate);
        });
        if (dateIsSelected) {
            // remove from array
            const index = selectedDates.findIndex(date => {
                return date.isSame(selectedDate);
            });
            selectedDates.splice(index, 1);
            this.setState({ selectedDates });
        } else {
            // add to array
            selectedDates.push(selectedDate);
            this.setState({ selectedDates });
        }
    }

    render() {
        const { endDate, startDate, selectedDates, timePeriod } = this.state;
        const { selectedCG, selectSnapshot, snapshotsData, tableSnapshots, volumeSeriesData } = this.props;
        const { snapshots = [] } = snapshotsData || {};

        const cgSnapshots = {};
        snapshots
            .filter(snapshot => snapshot.consistencyGroupId === selectedCG)
            .forEach(snapshot => {
                const { locations = {}, meta, sizeBytes, snapIdentifier, snapTime } = snapshot || {};
                const { id } = meta || {};
                if (Object.keys(locations).length > 0) {
                    const existing = cgSnapshots[id];
                    if (existing) {
                        existing.count++;
                        existing.size += sizeBytes;

                        const currentTime = moment(existing.timeCreated);
                        const newTime = moment(snapTime);
                        if (currentTime.diff(newTime) > 0) {
                            existing.timeCreated = snapTime;
                        }
                    } else {
                        cgSnapshots[id] = {
                            count: 1,
                            size: sizeBytes,
                            snapIdentifier,
                            timeCreated: snapTime,
                        };
                    }
                }
            });

        return (
            <div className="snapshot-select">
                <DateRangeSelector
                    endDate={endDate}
                    onChangeDates={this.onChangeDates}
                    selectedDates={selectedDates}
                    selectTimePeriod={this.selectTimePeriod}
                    startDate={startDate}
                    timePeriod={timePeriod}
                    timeShift={this.timeShift}
                />
                <SnapshotSelector
                    endDate={endDate}
                    selectedCG={selectedCG}
                    selectedDates={selectedDates}
                    selectedRows={tableSnapshots.selectedRows}
                    selectSnapshot={selectSnapshot}
                    snapshotcgData={{ cgSnapshots }}
                    startDate={startDate}
                    volumeSeriesData={volumeSeriesData}
                />
            </div>
        );
    }
}

RecoverSelectSnapshotContainer.propTypes = {
    consistencyGroupsData: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    selectedCG: PropTypes.string,
    selectedSnapshot: PropTypes.object,
    selectSnapshot: PropTypes.func,
    snapshotsData: PropTypes.object.isRequired,
    tableSnapshots: PropTypes.object,
    volumeSeriesData: PropTypes.object,
};

function mapStateToProps(state) {
    const { consistencyGroupsData, snapshotsData, tableSnapshots, volumeSeriesData } = state;
    return {
        consistencyGroupsData,
        snapshotsData,
        tableSnapshots,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(RecoverSelectSnapshotContainer);
