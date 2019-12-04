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

import Loader from './Loader';
import Snapshots from './Snapshots';

class SnapshotSelector extends Component {
    render() {
        const { endDate, selectedDates, selectedRows, snapshotcgData, startDate } = this.props;
        const numDays = moment(endDate).diff(startDate, 'days');
        const snapshotsInDays = [];

        if (snapshotcgData.loading) {
            return <Loader />;
        }

        const snapshotIds = Object.keys(snapshotcgData.cgSnapshots);

        for (let i = 0; i <= numDays; i++) {
            snapshotsInDays.push([]);
            const dayStart = moment(startDate).add(i, 'days');
            const dayEnd = dayStart.clone().add(1, 'day');
            snapshotIds.forEach(id => {
                const snapshot = snapshotcgData.cgSnapshots[id];
                if (moment(snapshot.timeCreated).isBetween(dayStart, dayEnd)) {
                    snapshotsInDays[i].push({ ...snapshot, id });
                }
            });
        }

        const displayDays = [];

        snapshotsInDays.forEach((snapshotInDay, index) => {
            const dayStart = moment(startDate).add(index, 'days');
            const dayIsIncluded = selectedDates.find(date => {
                return date.isSame(dayStart);
            });
            if (dayIsIncluded) {
                snapshotInDay.forEach(snapshot => {
                    displayDays.push({
                        ...snapshot,
                        date: dayStart.format('MM/DD/YYYY'),
                    });
                });
            }
        });

        return (
            <div className="snapshot-select">
                <Snapshots selectedRows={selectedRows} snapshots={displayDays} startDate={startDate} />
            </div>
        );
    }
}

SnapshotSelector.propTypes = {
    endDate: PropTypes.object,
    selectedDates: PropTypes.array,
    selectedRows: PropTypes.array,
    snapshotcgData: PropTypes.object,
    startDate: PropTypes.object,
};

export default SnapshotSelector;
