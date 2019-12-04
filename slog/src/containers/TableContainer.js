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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as types from '../actions/types';
import Card from '../components/Card';
import TableHeader from '../components/TableHeader';
import TableWrapper from '../components/Table';
import { getProfileColumnKey, hasFilteredColumns } from '../components/table_utils';
import { patchUser } from '../actions/userActions';

import '../leaplabs.css';

class TableContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnsDisplayed: [],
            filtered: '',
            expanded: {},
        };

        this.collapseCards = this.collapseCards.bind(this);
        this.getSortedData = this.getSortedData.bind(this);
        this.handleColumnsChange = this.handleColumnsChange.bind(this);
        this.handleColumnsChangeSubmit = this.handleColumnsChangeSubmit.bind(this);
        this.isSelected = this.isSelected.bind(this);
        this.onExpandedChange = this.onExpandedChange.bind(this);
        this.onFilteredChange = this.onFilteredChange.bind(this);
        this.onSortedChange = this.onSortedChange.bind(this);
        this.selectToggle = this.selectToggle.bind(this);
        this.selectToggleAll = this.selectToggleAll.bind(this);
        this.selectToggleMode = this.selectToggleMode.bind(this);
    }

    componentDidMount() {
        const { component, componentSelectedRows, data = [], defaultFiltered, dispatch, startExpanded } = this.props;
        dispatch({
            type: componentSelectedRows ? `${types.TABLE_MOUNT}_${component.toUpperCase()}` : `${types.TABLE_MOUNT}`,
        });

        if (defaultFiltered) {
            this.setState({ filtered: defaultFiltered });
        }

        if (startExpanded) {
            const expanded = {};
            const expandAll = Object.keys(expanded).length === 0;
            data.forEach((d, idx) => {
                if (expandAll || startExpanded[idx]) {
                    expanded[idx] = {};
                }
            });

            this.setState({ expanded });
        }
    }

    componentDidUpdate(prevProps) {
        const { data = [], startExpanded } = this.props;
        const { data: prevData = [] } = prevProps;

        if (data.length !== prevData.length) {
            if (startExpanded) {
                const expanded = {};
                data.forEach((d, idx) => {
                    expanded[idx] = {};
                });

                this.setState({ expanded });
            }
        }
    }

    componentWillUnmount() {
        const { component, componentSelectedRows, dispatch } = this.props;
        dispatch({
            type: componentSelectedRows
                ? `${types.TABLE_UNMOUNT}_${component.toUpperCase()}`
                : `${types.TABLE_UNMOUNT}`,
        });
    }

    collapseCards(collapse) {
        const { component, dispatch } = this.props;
        if (collapse) {
            dispatch({ type: types.CARDS_COLLAPSED, component });
        } else {
            dispatch({ type: types.CARDS_EXPANDED, component });
        }
    }

    handleColumnsChange(newColumnsDisplayed) {
        this.setState({
            columnsDisplayed: newColumnsDisplayed,
        });
    }

    handleColumnsChangeSubmit() {
        const { component, dispatch, location, userData } = this.props;

        const { pathname = '' } = location;
        const page = pathname.split('/')[1];
        const columnKey = getProfileColumnKey(component, page);

        const { user } = userData || {};
        const { meta, profile } = user || {};
        const { id } = meta || {};

        const { columnsDisplayed } = this.state;

        const params = {
            profile: {
                ...profile,
                [columnKey]: { value: JSON.stringify(columnsDisplayed) },
            },
        };

        dispatch(patchUser(id, params));
    }

    hasFiltered(currData) {
        const { columns } = this.props;
        const { filtered } = this.state;

        return hasFilteredColumns(currData, columns, filtered);
    }

    isSelected(row) {
        const { id } = row || {};
        const { componentSelectedRows, table } = this.props;
        const { selectedRows } = table;
        const rows = componentSelectedRows || selectedRows || [];

        return (
            rows.length > 0 &&
            rows.some(row => {
                return row.id === id;
            })
        );
    }

    onFilteredChange(filtered) {
        const { component, data, dispatch, onFilteredChange } = this.props;

        // clear all selected rows if filter is changed
        if (component) {
            dispatch({ type: `${types.REMOVE_ALL_SELECTED_ROWS}_${component.toUpperCase()}` });
        } else {
            dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS });
        }

        this.setState({ filtered });
        if (onFilteredChange) {
            onFilteredChange(data, filtered);
        }
    }

    selectToggle(row, selected = false) {
        const { multiSelect } = this.props;
        const { component, componentSelectedRows, dispatch } = this.props;
        if (multiSelect) {
            if (selected) {
                dispatch({
                    type: componentSelectedRows
                        ? `${types.ADD_SELECTED_ROW}_${component.toUpperCase()}`
                        : `${types.ADD_SELECTED_ROW}`,
                    row,
                });
            } else {
                dispatch({
                    type: componentSelectedRows
                        ? `${types.REMOVE_SELECTED_ROW}_${component.toUpperCase()}`
                        : `${types.REMOVE_SELECTED_ROW}`,
                    row,
                });
            }
        } else {
            if (selected) {
                dispatch({ type: `${types.REMOVE_ALL_SELECTED_ROWS}_${component.toUpperCase()}` });
                dispatch({
                    type: componentSelectedRows
                        ? `${types.ADD_SELECTED_ROW}_${component.toUpperCase()}`
                        : `${types.ADD_SELECTED_ROW}`,
                    row,
                });
            } else {
                dispatch({ type: `${types.REMOVE_ALL_SELECTED_ROWS}_${component.toUpperCase()}` });
            }
        }
    }

    selectToggleAll() {
        const { component, componentSelectedRows, dispatch } = this.props;
        const hocWrappedInstance = this.tableWrapper.getWrappedInstance();
        const wrappedInstance = hocWrappedInstance.getWrappedInstance
            ? hocWrappedInstance.getWrappedInstance()
            : hocWrappedInstance;
        const rows = wrappedInstance.getResolvedState().sortedData;

        if (componentSelectedRows) {
            if (componentSelectedRows.length === rows.length) {
                dispatch({ type: `${types.REMOVE_ALL_SELECTED_ROWS}_${component.toUpperCase()}` });
            } else {
                dispatch({ type: `${types.ADD_SELECTED_ROWS}_${component.toUpperCase()}`, rows });
            }
        } else {
            const { table } = this.props;
            const { selectedRows = [] } = table || {};

            if (selectedRows.length === rows.length) {
                dispatch({ type: types.REMOVE_ALL_SELECTED_ROWS });
            } else {
                dispatch({ type: types.ADD_SELECTED_ROWS, rows });
            }
        }
    }

    selectToggleMode(showCards) {
        const { component, dispatch } = this.props;
        if (showCards) {
            dispatch({ type: types.CARDS_MODE, component });
        } else {
            dispatch({ type: types.TABLE_MODE, component });
        }
    }

    renderCards() {
        const {
            cardComponent,
            cardLabelWidth,
            cardTitleAccessor,
            columns,
            component,
            componentSelectedRows,
            data,
            rolesData,
            selectable,
            table,
            uiSettings,
        } = this.props;
        const { selectedRows } = table;
        const { collapsedCardsComponents = [], compares = {} } = uiSettings;

        const CardComponent = cardComponent || Card;

        return (
            <Fragment>
                <div className="divider-horizontal" />
                <div className="cards-container">
                    {data
                        .filter(currData => this.hasFiltered(currData))
                        .map((currData, idx) => {
                            const { name = cardTitleAccessor } = currData;

                            return (
                                <div id={`tableItemId${name}`} key={idx}>
                                    <CardComponent
                                        columns={columns}
                                        compares={compares}
                                        data={currData}
                                        isSelected={this.isSelected}
                                        labelWidth={cardLabelWidth}
                                        rolesData={rolesData}
                                        selectable={selectable}
                                        selectedRows={componentSelectedRows || selectedRows}
                                        selectToggle={selectable ? this.selectToggle : null}
                                        titleAccessor={cardTitleAccessor}
                                        viewCollapsed={collapsedCardsComponents.some(name => name === component)}
                                    />
                                </div>
                            );
                        })}
                </div>
            </Fragment>
        );
    }

    onExpandedChange(expanded) {
        this.setState({ expanded });
    }

    onSortedChange() {
        const { onSortedChange } = this.props;

        if (onSortedChange) {
            onSortedChange(this.getSortedData());
        }
    }

    getSortedData() {
        const instance = this.tableWrapper.getWrappedInstance();
        return instance.getResolvedState().sortedData;
    }

    // filter the passed selected row data
    filteredSelectedData(data = []) {
        return data.filter(currData => this.hasFiltered(currData));
    }

    // filter all data
    filteredData() {
        const { data } = this.props;

        return data.filter(currData => this.hasFiltered(currData));
    }

    // return the total count (ignores selected and filtered)
    getTotalCount() {
        const { data } = this.props;
        const { length = 0 } = data || [];

        return length;
    }

    renderEmptyPlaceholder() {
        const { emptyPlaceholder } = this.props;
        const { icon: IconComponent = 'span', iconClassName = '', iconStyle = {}, text = '' } = emptyPlaceholder || {};

        return (
            <div className="table-empty-placeholder">
                <IconComponent className={`table-empty-placeholder-icon ${iconClassName}`} style={iconStyle} />
                <div className="table-empty-placeholder-text">{text}</div>
            </div>
        );
    }

    renderTable() {
        const {
            columns,
            componentSelectedRows,
            defaultSorted,
            id,
            minRows,
            multiSelect,
            noDataText,
            pivotBy,
            rolesData,
            selectable,
            subrow,
            table,
        } = this.props;
        const { selectedRows } = table;
        const { columnsDisplayed = [], expanded } = this.state;

        return (
            <TableWrapper
                columns={
                    columnsDisplayed.length > 0
                        ? columns.filter(column =>
                              columnsDisplayed.find(columnDisplayed => columnDisplayed.accessor === column.accessor)
                          )
                        : columns
                }
                data={this.filteredData()}
                defaultSorted={defaultSorted}
                id={id}
                minRows={minRows}
                multiSelect={multiSelect}
                noDataText={noDataText}
                onSortedChange={this.onSortedChange}
                ref={ref => {
                    this.tableWrapper = ref;
                }}
                rolesData={rolesData}
                selectable={selectable}
                selectedRows={componentSelectedRows || selectedRows}
                selectToggle={this.selectToggle}
                selectToggleAll={this.selectToggleAll}
                subrow={subrow}
                table={table}
                /**
                 * TreeTable properties
                 */
                pivotBy={pivotBy}
                expanded={expanded}
                onExpandedChange={this.onExpandedChange}
            />
        );
    }

    render() {
        const { filtered } = this.state;
        const {
            cardsCollapsible,
            cardsMode,
            cardsModeOnly,
            columns,
            columnsCustomizable,
            component,
            componentSelectedRows,
            dataTestId,
            defaultFiltered,
            emptyPlaceholder,
            filterHidden,
            filterLeft,
            hideHeader,
            id,
            location,
            selectedRows,
            title,
            toolbar,
            uiSettings,
            userData,
        } = this.props;
        const { collapsedCardsComponents = [], showCardsComponents = [] } = uiSettings;

        const showCards = showCardsComponents.some(name => name === component);
        const filteredCount = this.filteredData().length;

        if (emptyPlaceholder && filteredCount < 1 && !filtered) {
            return this.renderEmptyPlaceholder();
        }

        const { pathname = '' } = location;
        const page = pathname.split('/')[1];
        const columnKey = getProfileColumnKey(component, page);

        return (
            <div className="table-container" data-testid={dataTestId}>
                {hideHeader ? null : (
                    <TableHeader
                        cardsCollapsible={cardsCollapsible}
                        cardsMode={cardsMode}
                        collapseCards={this.collapseCards}
                        columns={columns}
                        columnsCustomizableKey={columnsCustomizable ? columnKey : null}
                        component={component}
                        defaultFiltered={defaultFiltered}
                        filteredCount={filteredCount}
                        filterHidden={filterHidden}
                        filterLeft={filterLeft}
                        id={id}
                        onColumnsChange={this.handleColumnsChange}
                        onColumnsChangeSubmit={this.handleColumnsChangeSubmit}
                        onFilteredChange={this.onFilteredChange}
                        selectedRows={componentSelectedRows || selectedRows}
                        selectToggleMode={this.selectToggleMode}
                        showCards={cardsModeOnly || showCards}
                        title={title}
                        toolbar={toolbar}
                        totalCount={this.getTotalCount()}
                        userData={userData}
                        viewCollapsed={collapsedCardsComponents.some(name => name === component)}
                    />
                )}
                {cardsModeOnly || (cardsMode && showCards) ? this.renderCards() : this.renderTable()}
            </div>
        );
    }
}

TableContainer.defaultProps = {
    cardsMode: false,
    cardsModeOnly: false,
    defaultFiltered: '',
    hideHeader: false,
    multiSelect: true,
};

TableContainer.propTypes = {
    cardComponent: PropTypes.func,
    cardLabelWidth: PropTypes.number,
    cardsCollapsible: PropTypes.bool,
    cardsMode: PropTypes.bool,
    cardsModeOnly: PropTypes.bool,
    cardTitleAccessor: PropTypes.string,
    columns: PropTypes.array.isRequired,
    columnsCustomizable: PropTypes.bool,
    component: PropTypes.string,
    componentSelectedRows: PropTypes.array,
    data: PropTypes.array.isRequired,
    dataTestId: PropTypes.string,
    defaultFiltered: PropTypes.string,
    defaultSorted: PropTypes.array,
    dispatch: PropTypes.func.isRequired,
    emptyPlaceholder: PropTypes.object,
    filterHidden: PropTypes.bool,
    filterLeft: PropTypes.bool,
    hideHeader: PropTypes.bool,
    id: PropTypes.string,
    location: PropTypes.object.isRequired,
    minRows: PropTypes.number,
    multiSelect: PropTypes.bool,
    noDataText: PropTypes.string,
    onDataLoad: PropTypes.func,
    onFilteredChange: PropTypes.func,
    onSortedChange: PropTypes.func,
    pivotBy: PropTypes.array,
    rolesData: PropTypes.object,
    selectable: PropTypes.bool,
    selectedRows: PropTypes.array,
    startExpanded: PropTypes.object,
    subrow: PropTypes.func,
    table: PropTypes.object,
    title: PropTypes.string,
    toolbar: PropTypes.object,
    uiSettings: PropTypes.object,
    userData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { table, uiSettings, userData } = state;
    return {
        table,
        uiSettings,
        userData,
    };
}

export default withRouter(connect(mapStateToProps)(TableContainer));
