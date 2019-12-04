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

import { PlaylistAddCheck } from '@material-ui/icons';
// React Table - https://github.com/react-tools/react-table
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import treeTableHOC from 'react-table/lib/hoc/treeTable';

import moment from 'moment';

import '../styles.css';
import './tableoverride.css';

import * as constants from '../constants';

const TreeTable = treeTableHOC(ReactTable);

export function sortStringAsInt(a, b) {
    const ai = parseInt(a, 10);
    const bi = parseInt(b, 10);

    if (ai === bi) {
        return 0;
    } else if (ai < bi) {
        return -1;
    } else {
        return 1;
    }
}

// parse string to get seconds
// assume for now that the input string has been validated earlier
function getSeconds(str) {
    let seconds = 0;
    const months = str.match(/(\d+)\s*m/);
    const weeks = str.match(/(\d+)\s*w/);
    const days = str.match(/(\d+)\s*d/);
    const hours = str.match(/(\d+)\s*h/);
    const minutes = str.match(/(\d+)\s*m/);

    if (months) {
        seconds += parseInt(months[1], 10) * moment.duration(1, 'month');
    }
    if (weeks) {
        seconds += parseInt(weeks[1], 10) * moment.duration(1, 'week');
    }
    if (days) {
        seconds += parseInt(days[1], 10) * moment.duration(1, 'day');
    }
    if (hours) {
        seconds += parseInt(hours[1], 10) * moment.duration(1, 'hour');
    }
    if (minutes) {
        seconds += parseInt(minutes[1], 10) * moment.duration(1, 'minute');
    }
    return seconds;
}

export function sortStringAsDuration(a, b) {
    const ai = getSeconds(a);
    const bi = getSeconds(b);

    if (ai === bi) {
        return 0;
    } else if (ai < bi) {
        return -1;
    } else {
        return 1;
    }
}

class TableWrapper extends Component {
    constructor(props) {
        super(props);

        this.addSelectionColumn = this.addSelectionColumn.bind(this);
        this.isChecked = this.isChecked.bind(this);
    }

    /**
     * Only display header if we have multiSelect enabled.
     */
    selectHeader() {
        const { data, multiSelect, selectedRows } = this.props;

        const allSelected = selectedRows.length === data.length && selectedRows.length > 0;

        if (multiSelect) {
            return <PlaylistAddCheck className={allSelected ? 'select-all-selected' : ''} />;
        }
    }

    // add selection column for operations
    addSelectionColumn(columns) {
        if (columns.some(col => col.accessor === 'selected')) {
            return columns;
        }

        const { selectToggleAll } = this.props;
        let allColumns = columns;

        allColumns.unshift({
            Header: () => (
                <div className="table-select-header" onClick={selectToggleAll}>
                    {this.selectHeader()}
                </div>
            ),
            accessor: 'selected',
            Cell: props => {
                const labelId = `tableItemId${props.row.name}`;
                return (
                    <label id={labelId} className="table-select-cell">
                        <input
                            type="checkbox"
                            checked={this.isChecked(props.row)}
                            onChange={this.handleSelect.bind(this, props.row)}
                        />
                    </label>
                );
            },
            maxWidth: 60,
            resizable: false,
            sortable: false,
        });

        return allColumns;
    }

    getWrappedInstance() {
        return this.wrappedInstance;
    }

    handleSelect(row) {
        const { selectToggle } = this.props;

        if (selectToggle) {
            selectToggle(row, !this.isChecked(row));
        }
    }

    isChecked(row) {
        const { id } = row || {};
        const { selectedRows = [] } = this.props;
        return (
            selectedRows.length > 0 &&
            selectedRows.some(row => {
                return row.id === id;
            })
        );
    }

    renderTitle() {
        const { title, toolbar } = this.props;

        if (!title) {
            return null;
        }

        const classes = 'table-title'.concat(!toolbar ? ' mb10' : '');

        return <div className={classes}>{title}</div>;
    }

    renderToolbar() {
        const { toolbar } = this.props;

        if (!toolbar) {
            return null;
        }

        return <div className="mb10">{toolbar}</div>;
    }

    // render SubRow component if a function is passed in for the data
    subrowRender() {
        const { subrow } = this.props;

        if (subrow) {
            return row => {
                return <div>{subrow(row)}</div>;
            };
        } else {
            return;
        }
    }

    /**
     * Determine type of table to display based on the properties in ClassName
     */
    render() {
        const {
            columns,
            data,
            defaultSorted,
            expanded,
            id,
            minRows,
            noDataText,
            onExpandedChange,
            onSortedChange,
            pivotBy,
            selectable,
        } = this.props;
        const TableComponent = pivotBy ? TreeTable : ReactTable;

        // mutate the columns by adding a selectable column if needed
        if (selectable) {
            this.addSelectionColumn(columns);
        }

        return (
            <div>
                {this.renderTitle()}
                {this.renderToolbar()}
                <div id={`${id}-table`} className="table-wrapper">
                    <TableComponent
                        style={{
                            border: 0,
                        }}
                        className="-striped -highlight"
                        columns={columns}
                        data={data}
                        defaultPageSize={100}
                        defaultSorted={defaultSorted}
                        getTheadGroupProps={() => {
                            return {
                                style: {
                                    textTransform: 'uppercase',
                                },
                            };
                        }}
                        getTheadProps={() => {
                            return {
                                style: {
                                    backgroundColor: 'rgba(6, 27, 47, 0.4)',
                                    borderBottom: 'solid 2px rgba(0, 0, 0, 0.2)',
                                    borderTop: 'solid 1px rgba(255, 255, 255, 0.2)',
                                    textTransform: 'uppercase',
                                    fontWeight: 400,
                                },
                            };
                        }}
                        getTheadThProps={(state, rowInfo, column) => {
                            const { id } = column || {};
                            return {
                                style: {
                                    border: 0,
                                    textAlign: id === 'selected' ? 'center' : 'left',
                                    ...(id !== 'selected' && { paddingLeft: '10px' }),
                                },
                            };
                        }}
                        getTrGroupProps={() => {
                            return {
                                style: {
                                    border: 0,
                                },
                            };
                        }}
                        getTrProps={(state, rowInfo) => {
                            const info = {
                                style: {
                                    borderBottom: 'solid 2px rgba(0, 0, 0, 0.2)',
                                    borderTop: 'solid 1px rgba(255, 255, 255, 0.2)',
                                    minHeight: '45px',
                                },
                            };

                            if (rowInfo && rowInfo.index) {
                                info['id'] = `rowid_${rowInfo.index}`;
                            }
                            return info;
                        }}
                        getTdProps={(state, rowInfo, column) => {
                            /**
                             * For a TreeTable, need to add a margin so that
                             * remaining columns are aligned.  There is a hidden
                             * column left of the selector.
                             */
                            const marginLeft = pivotBy && column.id === 'selected' ? '10px' : '';
                            const { editable, id } = column || {};
                            const { original } = rowInfo || {};
                            const { disabled, edit } = original || {};

                            const editCell = editable && edit;

                            const el = {
                                style: {
                                    border: 0,
                                    fontSize: '12px',
                                    fontWeight: 400,
                                    margin: 'auto',
                                    marginLeft: marginLeft,
                                    textAlign: id === 'selected' ? 'center' : 'left',
                                    verticalAlign: 'middle',
                                    ...(id !== 'selected' && !editCell && { paddingLeft: '10px' }),
                                },
                            };
                            if (column.id === 'actions') {
                                el.style['overflow'] = 'visible';
                            }
                            if (disabled) {
                                el.style['fontStyle'] = 'italic';
                            }
                            if (editCell) {
                                el.style['overflowX'] = 'visible';
                                el.style['overflowY'] = 'visible';
                            }
                            /**
                             * If the row is selected, highlight it.
                             * If the row is not selected but other are, or all rows are filtered, then
                             * we dim the row.
                             */
                            const { row } = rowInfo || {};
                            const { someFiltered, allFiltered, filteredCard } = row || {};
                            if (filteredCard) {
                                el.style['color'] = constants.STYLE_COLOR_NUVO_BLUE_LIGHT;
                                el.style['backgroundColor'] = constants.STYLE_BACKGROUND_HIGHLIGHT;
                            } else if ((someFiltered && someFiltered.length > 0) || allFiltered) {
                                el.style['opacity'] = '0.5';
                                el.style['backgroundColor'] = constants.STYLE_BACKGROUND_DIMMED;
                            }
                            return el;
                        }}
                        /**
                         * Insert separators in between header 'sections'
                         */
                        getTheadGroupTrProps={() => {
                            return {
                                style: {
                                    borderLeft: 'solid 1px rgba(255, 255, 255, 0.2)',
                                    backgroundColor: 'rgba(6, 27, 47, 0.4)',
                                },
                            };
                        }}
                        getTheadGroupThProps={() => {
                            return {
                                style: {
                                    borderRight: 'solid 1px rgba(255, 255, 255, 0.2)',
                                },
                            };
                        }}
                        getNoDataProps={() => {
                            return {
                                style: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    visibility: 'hidden',
                                },
                            };
                        }}
                        minRows={minRows}
                        noDataText={noDataText || 'no data'}
                        ref={ref => {
                            this.wrappedInstance = ref;
                        }}
                        showPagination={data && data.length > 100}
                        SubComponent={this.subrowRender()}
                        /**
                         * TreeTable specific properites
                         */
                        pivotBy={pivotBy}
                        expanded={expanded}
                        onExpandedChange={onExpandedChange}
                        onSortedChange={onSortedChange}
                        ExpanderComponent={({ isExpanded }) =>
                            isExpanded ? (
                                <span className="table-arrow-down"> &#x02C5; </span>
                            ) : (
                                <span className="table-arrow-right"> &#x02C3; </span>
                            )
                        }
                    />
                </div>
            </div>
        );
    }
}

TableWrapper.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    defaultSorted: PropTypes.array,
    expanded: PropTypes.object,
    id: PropTypes.string,
    minRows: PropTypes.number,
    multiSelect: PropTypes.bool,
    noDataText: PropTypes.string,
    onExpandedChange: PropTypes.func,
    onSortedChange: PropTypes.func,
    pivotBy: PropTypes.array,
    selectable: PropTypes.bool,
    selectedRows: PropTypes.array,
    selectToggle: PropTypes.func,
    selectToggleAll: PropTypes.func,
    subrow: PropTypes.func,
    title: PropTypes.string,
    toolbar: PropTypes.node,
};

TableWrapper.defaultProps = {
    minRows: 1,
};

export default TableWrapper;
