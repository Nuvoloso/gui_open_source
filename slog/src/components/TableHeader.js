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
import { intlShape, injectIntl } from 'react-intl';
import { Button, Checkbox, Dropdown, DropdownButton, FormControl, InputGroup, MenuItem } from 'react-bootstrap';
import _ from 'lodash';

import { getProfileColumn } from './table_utils';
import { messages } from '../messages/Messages';
import ButtonAction from './ButtonAction';
import './table.css';
import '../styles.css';

import { ReactComponent as SwitchCardOff } from '../assets/switch-card-off.svg';
import { ReactComponent as SwitchListOff } from '../assets/switch-list-off.svg';
import btnManageHov from '../assets/btn-manage-hov.svg';
import btnManageUp from '../assets/btn-manage-up.svg';

class TableHeader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columnsDisplayed: [],
            columnsMenuOpen: false,
            filtered: '',
        };

        this.handleColumnsChangeCancel = this.handleColumnsChangeCancel.bind(this);
        this.handleColumnsChangeSubmit = this.handleColumnsChangeSubmit.bind(this);
        this.handleColumnsMenuToggle = this.handleColumnsMenuToggle.bind(this);
        this.handleFilteredChange = this.handleFilteredChange.bind(this);
    }

    componentDidMount() {
        const { defaultFiltered, onColumnsChange } = this.props;
        if (defaultFiltered) {
            this.setState({ filtered: defaultFiltered });
        }

        const columnsDisplayed = this.initColumns();
        if (onColumnsChange) {
            onColumnsChange(columnsDisplayed);
        }
    }

    handleColumnChange(accessor, checked) {
        const { columns = [], onColumnsChange } = this.props;
        const { columnsDisplayed = [] } = this.state;
        const newColumnsDisplayed = checked
            ? [...columnsDisplayed, columns.find(column => column.accessor === accessor)]
            : columnsDisplayed.filter(column => column.accessor !== accessor);

        this.setState({
            columnsDisplayed: newColumnsDisplayed,
        });

        if (onColumnsChange) {
            onColumnsChange(newColumnsDisplayed);
        }
    }

    handleColumnsChangeCancel() {
        const columnsDisplayed = this.initColumns();

        const { onColumnsChange } = this.props;
        if (onColumnsChange) {
            onColumnsChange(columnsDisplayed);
        }

        this.setState({ columnsMenuOpen: false });
    }

    handleColumnsChangeSubmit() {
        const { onColumnsChangeSubmit } = this.props;

        if (onColumnsChangeSubmit) {
            onColumnsChangeSubmit();
        }

        this.setState({ columnsMenuOpen: false });
    }

    handleColumnsMenuToggle() {
        const { columnsMenuOpen } = this.state;

        if (columnsMenuOpen) {
            this.handleColumnsChangeCancel();
        } else {
            this.setState({ columnsMenuOpen: true });
        }
    }

    handleFilteredChange(e) {
        const filtered = e.target.value;

        this.setState({ filtered });

        const { onFilteredChange } = this.props;

        onFilteredChange(filtered);
    }

    initColumns() {
        const { columns = [], columnsCustomizableKey, userData } = this.props;

        const customizedColumns = getProfileColumn(userData, columnsCustomizableKey);
        const columnsDisplayed = customizedColumns.length > 0 ? customizedColumns : columns;

        this.setState({ columnsDisplayed });

        return columnsDisplayed;
    }

    isColumnsSaveDisabled() {
        const { columnsCustomizableKey, userData } = this.props;
        const userCustomizedColumns = getProfileColumn(userData, columnsCustomizableKey);

        const { columnsDisplayed } = this.state;

        const userColumnsSorted = _.sortBy(
            userCustomizedColumns
                .filter(column => column.show !== false && typeof column.Header === 'string')
                .map(column => {
                    const { Header, accessor } = column || {};

                    return { Header, accessor };
                }),
            ['accessor']
        );
        const columnsDisplayedSorted = _.sortBy(
            columnsDisplayed
                .filter(column => column.show !== false && typeof column.Header === 'string')
                .map(column => {
                    const { Header, accessor } = column || {};

                    return { Header, accessor };
                }),
            ['accessor']
        );

        return columnsDisplayedSorted.length < 1 || _.isEqual(userColumnsSorted, columnsDisplayedSorted);
    }

    /**
     * Render title and default display for total, displayed, and selected.
     * If there is no title specified, then this portion of the table
     * header is not displayed.
     */
    renderTitle() {
        const { filteredCount, intl, selectedRows = [], title, totalCount } = this.props;
        const { filtered } = this.state;
        const { formatMessage } = intl;
        const { length } = selectedRows;

        if (!title) {
            return null;
        }

        const id = `tableTitle-${title}`;
        return (
            <Fragment>
                <div id={id} className="table-title content-flex-row-centered">
                    <div>{title}</div>
                    <div id="table-header-total-count" className="count-text">
                        {totalCount}
                    </div>
                    {filtered ? (
                        <Fragment>
                            <div className="optional-count-text ml20">{formatMessage(messages.displayedLabel)}</div>
                            <div id="table-header-displayed-count" className="optional-count-text">
                                {filteredCount}
                            </div>
                        </Fragment>
                    ) : null}
                    {Array.isArray(selectedRows) && length > 0 ? (
                        <Fragment>
                            <div className="optional-count-text ml20">{formatMessage(messages.selectedLabel)}</div>
                            <div id="table-header-selected-count" className="optional-count-text">
                                {length}
                            </div>
                        </Fragment>
                    ) : null}
                </div>
            </Fragment>
        );
    }

    renderFilter() {
        const { id } = this.props;
        const { filtered } = this.state;

        return (
            <InputGroup className="table-filter">
                <FormControl
                    className="filtered-input"
                    id={id}
                    onChange={this.handleFilteredChange}
                    type="text"
                    value={filtered}
                />
                <InputGroup.Addon>
                    <i className="fa fa-search" aria-hidden="true" />
                </InputGroup.Addon>
            </InputGroup>
        );
    }

    renderSettings() {
        const { columns = [], intl } = this.props;
        const { formatMessage } = intl;
        const { columnsDisplayed = [], columnsMenuOpen } = this.state;

        return (
            <Dropdown
                className="nv-dropdown"
                id="nav-user-dropdown"
                onToggle={this.handleColumnsMenuToggle}
                open={columnsMenuOpen}
                pullRight
            >
                <ButtonAction bsRole="toggle" btnHov={btnManageHov} btnUp={btnManageUp} onClick={() => {}} />
                <Dropdown.Menu>
                    <div className="header-account-dropdown-menu-title">{formatMessage(messages.displayedColumns)}</div>
                    {columns.map(column => {
                        const { Header, accessor, show } = column || {};

                        if (show === false || typeof Header !== 'string') {
                            return null;
                        }

                        const isColumnDisplayed = columnsDisplayed.some(columnDisplayed => {
                            const { accessor: displayedAccessor } = columnDisplayed || {};

                            return displayedAccessor === accessor;
                        });

                        return (
                            <Checkbox
                                checked={isColumnDisplayed}
                                className="table-settings-column-checkbox"
                                key={accessor}
                                name={accessor}
                                onChange={e => {
                                    const { target } = e || {};
                                    const { checked, name } = target || {};

                                    this.handleColumnChange(name, checked);
                                }}
                            >
                                {Header}
                            </Checkbox>
                        );
                    })}
                    <div className="divider-horizontal" />
                    <div className="table-settings-actions">
                        <Button
                            bsStyle="primary"
                            className="table-settings-action"
                            disabled={this.isColumnsSaveDisabled()}
                            onClick={this.handleColumnsChangeSubmit}
                        >
                            {formatMessage(messages.saveChanges)}
                        </Button>
                        <Button className="table-settings-action" onClick={this.handleColumnsChangeCancel}>
                            {formatMessage(messages.cancel)}
                        </Button>
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    renderToolbar() {
        const { columnsCustomizableKey, filterHidden, filterLeft, toolbar } = this.props;

        const buttonGroup = (
            <div className="toolbar-button-group">
                {toolbar}
                {columnsCustomizableKey ? this.renderSettings() : null}
            </div>
        );

        return (
            <div className="toolbar-container">
                {!filterLeft ? buttonGroup : null}
                <div>
                    {filterHidden ? null : <div className="mr5">{this.renderFilter()}</div>}
                    {this.renderToggleMode()}
                </div>
                {filterLeft ? buttonGroup : null}
            </div>
        );
    }

    renderToggleMode() {
        const { cardsMode, selectToggleMode, showCards } = this.props;

        return (
            <div className="content-flex-row-centered">
                {showCards ? this.renderToggleCardView() : null}
                {cardsMode ? (
                    <div className="content-flex-row-centered">
                        <div className="table-toggle-mode-button">
                            <SwitchCardOff
                                className={showCards ? 'active' : ''}
                                onClick={() => {
                                    selectToggleMode(true);
                                }}
                            />
                        </div>
                        <div className="table-toggle-mode-button">
                            <SwitchListOff
                                className={!showCards ? 'active' : ''}
                                onClick={() => {
                                    selectToggleMode(false);
                                }}
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }

    renderToggleCardView() {
        const { cardsCollapsible, collapseCards, intl, viewCollapsed } = this.props;
        const { formatMessage } = intl;

        if (!cardsCollapsible) {
            return null;
        }

        const idActions = 'cardViewActions';
        const idCollapse = 'cardViewCollapse';
        const idExpand = 'cardViewExpand';

        return (
            <DropdownButton className="mr5" id={idActions} pullRight title="">
                <MenuItem header>{formatMessage(messages.viewOptions)}</MenuItem>
                <MenuItem
                    id={idCollapse}
                    disabled={viewCollapsed}
                    onClick={() => {
                        collapseCards(true);
                    }}
                >
                    {formatMessage(messages.collapse)}
                </MenuItem>
                <MenuItem
                    id={idExpand}
                    disabled={!viewCollapsed}
                    onClick={() => {
                        collapseCards(false);
                    }}
                >
                    {formatMessage(messages.expand)}
                </MenuItem>
            </DropdownButton>
        );
    }

    render() {
        const { id, title, toolbar } = this.props;
        if (title || toolbar) {
            return (
                <div id={`${id}-header`} className="table-header">
                    {this.renderTitle()}
                    {this.renderToolbar()}
                </div>
            );
        } else {
            return null;
        }
    }
}

TableHeader.propTypes = {
    cardsCollapsible: PropTypes.bool,
    cardsMode: PropTypes.bool,
    collapseCards: PropTypes.func,
    columns: PropTypes.array,
    columnsCustomizableKey: PropTypes.string,
    defaultFiltered: PropTypes.string,
    filteredCount: PropTypes.number,
    filterHidden: PropTypes.bool,
    filterLeft: PropTypes.bool,
    id: PropTypes.string,
    intl: intlShape.isRequired,
    onColumnsChange: PropTypes.func,
    onColumnsChangeSubmit: PropTypes.func,
    onFilteredChange: PropTypes.func,
    selectedRows: PropTypes.array,
    selectToggleMode: PropTypes.func,
    showCards: PropTypes.bool,
    title: PropTypes.string,
    toolbar: PropTypes.node,
    totalCount: PropTypes.number,
    userData: PropTypes.object,
    viewCollapsed: PropTypes.bool,
};

TableHeader.defaultProps = {
    defaultFiltered: '',
};

export default injectIntl(TableHeader);
