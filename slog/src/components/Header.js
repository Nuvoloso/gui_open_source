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
import { Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { withRouter, Link } from 'react-router-dom';
import { AccountCircle, KeyboardArrowDown, PowerSettingsNew } from '@material-ui/icons';
import Spinner from 'react-spinkit';
import _ from 'lodash';

import TasksContainer from '../containers/TasksContainer';
import TimePeriodSelectionContainer from '../containers/TimePeriodSelectionContainer';
import { MENU_ITEMS } from './MenuConstants';
import { menuMsgs } from '../messages/Menu';
import { messages } from '../messages/Messages';
import { sessionGetAccount } from '../sessionUtils';
import * as constants from '../constants';

import { ReactComponent as IcoSystemAdmin } from '../assets/ico-system-admin.svg';
import { ReactComponent as IcoTenantAdmin } from '../assets/ico-tenant-admin.svg';
import './header.css';
import '../styles.css';

// Handle the navigation bar across the pages for the SPA
class Header extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hoverAccount: null,
        };
    }

    getAuthIdentifier() {
        const { userData } = this.props;
        const { user } = userData || {};
        const { authIdentifier } = user || {};

        return authIdentifier;
    }

    getConnectionErrorStatusMsg() {
        const { intl, socket } = this.props;
        const { formatMessage } = intl;
        const { connected, message, watcherConnected, watcherMessage } = socket || {};

        if (!connected) {
            return message || formatMessage(messages.disconnected);
        }

        if (!watcherConnected) {
            return watcherMessage;
        }

        return null;
    }

    getRoleName() {
        const { userData } = this.props;
        const { user } = userData || {};
        const { accountRoles = [] } = user || {};
        const accountId = sessionGetAccount();
        const accountRole = accountRoles.find(ar => ar.accountId === accountId);
        const { roleName } = accountRole || {};

        return roleName;
    }

    getUsername() {
        const { userData } = this.props;
        const { user } = userData || {};
        const { authIdentifier, profile } = user || {};
        const { userName } = profile || {};
        const { value } = userName || {};

        return value || authIdentifier || '';
    }

    renderAccountToggle() {
        const { sessionAccountName, socket } = this.props;
        const { connecting } = socket || {};
        return (
            <div className="header-menu-title">
                <div className="header-menu-title-icon">
                    {this.renderIconToggle(this.getRoleName())}
                    {connecting ? <Spinner className="header-menu-title-icon-loader" name="three-bounce" /> : null}
                </div>
                {`${this.getUsername()} | ${sessionAccountName}`}
                <KeyboardArrowDown className="header-menu-caret" />
            </div>
        );
    }

    renderBreadcrumbs() {
        const { intl, location, resourceName } = this.props;
        const { formatMessage } = intl;
        const { pathname = '' } = location;
        const pathItems = pathname.split('/') || [];
        const base = pathItems[1] || '';
        const basePath = `/${base}`;
        const identifier = pathItems[2];

        const menuItem = MENU_ITEMS.find(item => item.href === basePath) || {};
        const { id: menuMsgId } = menuItem || {};
        const menuName = menuMsgId ? formatMessage(menuMsgs[menuMsgId]) : null;

        return (
            <div>
                <span className="header-breadcrumbs-base">
                    {identifier ? (
                        <Link className="header-link" to={basePath}>
                            {menuName}
                        </Link>
                    ) : (
                        menuName
                    )}
                </span>
                {resourceName ? (
                    <Fragment>
                        <span className="header-breadcrumbs-divider">/</span>
                        {resourceName}
                    </Fragment>
                ) : null}
            </div>
        );
    }

    renderIcon(roleName) {
        switch (roleName) {
            case constants.ROLE_NAME_SYSTEM_ADMIN:
                return <IcoSystemAdmin id="icon-system-admin" />;
            case constants.ROLE_NAME_TENANT_ADMIN:
                return <IcoTenantAdmin />;
            default:
                return <AccountCircle />;
        }
    }

    renderIconToggle(roleName) {
        const { socket } = this.props;
        const { connected, watcherConnected } = socket || {};
        const className =
            connected && watcherConnected
                ? 'header-account-dropdown-socket-connected'
                : 'header-account-dropdown-socket-disconnected';

        switch (roleName) {
            case constants.ROLE_NAME_SYSTEM_ADMIN:
            case constants.ROLE_NAME_TENANT_ADMIN:
                return <div className={`${className}-fill`}>{this.renderIcon(roleName)}</div>;
            default:
                return <div className={className}>{this.renderIcon(roleName)}</div>;
        }
    }

    renderIconSelect(roleName, isSelected, isHover) {
        const className = isHover ? 'header-account-dropdown-select-bg-hover' : 'header-account-dropdown-select-bg';
        const fillClassName = `${className} ${className}-fill header-account-dropdown-accounts-select-box-fill ${
            isSelected ? 'header-account-dropdown-select-box-selected-fill' : ''
        }`;
        switch (roleName) {
            case constants.ROLE_NAME_SYSTEM_ADMIN:
            case constants.ROLE_NAME_TENANT_ADMIN:
                return <div className={fillClassName}>{this.renderIcon(roleName)}</div>;
            default:
                return <div className={className}>{this.renderIcon(roleName)}</div>;
        }
    }

    renderUserNav(simple) {
        const { intl, onChangeAccount, sessionAccountName, socket, userData } = this.props;
        const { formatMessage } = intl;
        const { connected, message, watcherConnected } = socket || {};
        const { user } = userData || {};
        const { accountRoles = [] } = user || {};
        const { hoverAccount } = this.state;
        const sessionAccountId = sessionGetAccount();
        const errorMsg = this.getConnectionErrorStatusMsg();

        return (
            <Dropdown className="nv-dropdown" id="nav-user-dropdown" pullRight>
                <Dropdown.Toggle bsStyle="link" noCaret={simple}>
                    {this.renderAccountToggle()}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <div className="header-account-dropdown-menu-title">
                        <div>
                            {this.getAuthIdentifier()}
                            <div
                                className={`header-account-dropdown-socket-message
                                    ${
                                        connected && watcherConnected
                                            ? 'header-account-dropdown-socket-connected'
                                            : 'header-account-dropdown-socket-disconnected'
                                    }
                                `}
                            >
                                {errorMsg || message}
                            </div>
                        </div>
                        <OverlayTrigger
                            placement="left"
                            overlay={<Tooltip id="logout-tooltip">{formatMessage(menuMsgs.userLogOut)}</Tooltip>}
                        >
                            <PowerSettingsNew
                                className="header-account-dropdown-logout"
                                id="logout-icon"
                                onClick={() => {
                                    const { logout } = this.props;

                                    if (logout) {
                                        logout();
                                    }
                                }}
                            />
                        </OverlayTrigger>
                    </div>
                    <div className="header-account-dropdown-accounts">
                        {_.sortBy(accountRoles, ['roleName', 'accountName']).map((accountRole, idx) => {
                            const { accountId, accountName, roleName } = accountRole || {};
                            const { hoverAccount } = this.state;
                            const { accountId: hoverAccountId } = hoverAccount || {};
                            return (
                                <div
                                    className={`header-account-dropdown-select-box ${
                                        accountId === sessionAccountId
                                            ? 'header-account-dropdown-select-box-selected'
                                            : ''
                                    } ${!hoverAccount ? 'header-account-dropdown-select-box-disabled' : ''}`}
                                    id={accountName}
                                    key={idx}
                                    onClick={() => onChangeAccount(accountId, this.getAuthIdentifier())}
                                    onMouseEnter={() => {
                                        if (accountId !== sessionAccountId) {
                                            this.setState({ hoverAccount: accountRole });
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        this.setState({ hoverAccount: null });
                                    }}
                                >
                                    {this.renderIconSelect(
                                        roleName,
                                        accountId === sessionAccountId,
                                        accountId === hoverAccountId
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div
                        className={
                            hoverAccount
                                ? 'header-account-dropdown-description-hover'
                                : 'header-account-dropdown-description'
                        }
                    >
                        <div className="header-account-dropdown-description-title">
                            {hoverAccount ? hoverAccount.roleName : this.getRoleName()}
                        </div>
                        {hoverAccount ? hoverAccount.accountName : sessionAccountName}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    renderFilterTitle(simple) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <span className="header-menu-title">
                <i className={`fa fa-filter ${simple ? '' : 'pad-10-r'}`} aria-hidden="true" />
                {simple ? null : <b>{formatMessage(menuMsgs.filter)}</b>}
            </span>
        );
    }

    renderFilterOptions(simple) {
        return (
            <DropdownButton
                bsStyle="link"
                id="nav-dashboard-filter"
                noCaret={simple}
                pullRight
                title={this.renderFilterTitle(simple)}
            >
                <TimePeriodSelectionContainer />
            </DropdownButton>
        );
    }

    render() {
        return (
            <div id="nuvoloso-header" className="header">
                <div className="header-breadcrumbs">{this.renderBreadcrumbs()}</div>
                <div className="header-info">
                    <TasksContainer />
                    {this.renderUserNav(true)}
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
    onChangeAccount: PropTypes.func,
    resourceName: PropTypes.string,
    sessionAccountName: PropTypes.string,
    socket: PropTypes.object,
    user: PropTypes.object,
    userData: PropTypes.object,
};

export default withRouter(injectIntl(Header));
