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
import TableContainer from '../containers/TableContainer';

import { formatBytes } from './utils';
import './table.css';

class Snapshots extends Component {
    render() {
        const { snapshots, selectedRows, tableOnly } = this.props;

        const columns = [
            {
                /** used for pivot only */
                accessor: 'date',
            },
            {
                Header: 'Time',
                accessor: 'time',
                width: 100,
            },
            {
                Header: 'Volumes',
                accessor: 'count',
                width: 100,
            },
            {
                Header: 'Size',
                accessor: 'sizeBytes',
            },
            {
                accessor: 'id',
                show: false,
            },
            {
                accessor: 'seconds',
                show: false,
            },
        ];

        const data =
            snapshots.length > 0
                ? snapshots.map(snap => {
                      return {
                          date: snap.date,
                          time: moment(snap.timeCreated).format('hh:mm:ss A'),
                          count: snap.count,
                          sizeBytes: formatBytes(snap.size, 'GiB', 2),
                          id: snap.id,
                          seconds: moment(snap.timeCreated).unix(),
                          snapIdentifier: snap.snapIdentifier,
                      };
                  })
                : [];

        return (
            <div className={tableOnly ? '' : 'component-page'}>
                <TableContainer
                    cardsMode={true}
                    columns={columns}
                    component="SNAPSHOTS_TABLE"
                    componentSelectedRows={selectedRows}
                    data={data}
                    noDataText={'no snapshots available'}
                    defaultSorted={[{ id: 'date', desc: true }, { id: 'seconds', desc: true }]}
                    multiSelect={false}
                    pivotBy={['date']}
                    selectable
                    startExpanded={{ 0: {} }}
                />
            </div>
        );
    }
}

// Property type validation
Snapshots.propTypes = {
    selectedRows: PropTypes.array.isRequired,
    snapshots: PropTypes.array,
    tableOnly: PropTypes.bool,
};

export default Snapshots;
