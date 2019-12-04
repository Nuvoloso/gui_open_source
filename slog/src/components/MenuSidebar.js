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
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { MENU_ITEMS } from './MenuConstants';
import { menuMsgs } from '../messages/Menu';
import { isAccountAdmin, isTenantAdmin, isSystemAdmin } from '../containers/userAccountUtils';

import * as constants from '../constants';

import logo from '../nuvologo.png';
import './menu.css';

class MenuSidebar extends Component {
    renderNavItems(items) {
        const { intl, rolesData, userData } = this.props;
        const { formatMessage } = intl;
        const { user } = userData || {};

        return items.map((item, idx) => {
            const { divider, exact = false, href, Icon, id, restrictedRoles } = item;

            if (divider) {
                return <div key={`${id}-${idx}`} className="sidebar-divider" />;
            }

            if (!menuMsgs[id]) {
                return null;
            }

            if (restrictedRoles) {
                if (isTenantAdmin(user, rolesData)) {
                    if (!restrictedRoles.includes(constants.ROLE_TYPES.ROLE_TENANT)) {
                        return null;
                    }
                } else if (isSystemAdmin(user, rolesData)) {
                    if (!restrictedRoles.includes(constants.ROLE_TYPES.ROLE_SYSTEM)) {
                        return null;
                    }
                } else if (isAccountAdmin(user, rolesData)) {
                    if (!restrictedRoles.includes(constants.ROLE_TYPES.ROLE_ACCOUNT_ADMIN)) {
                        return null;
                    }
                } else {
                    return null;
                }
            }

            const linkItem = (
                <LinkContainer exact={exact} key={id} to={href}>
                    <div className="sidebar-icon-container">
                        <Icon id={id} />
                    </div>
                </LinkContainer>
            );

            return (
                <OverlayTrigger
                    key={id}
                    overlay={<Tooltip id="sidebar-icon-tooltip">{formatMessage(menuMsgs[id])}</Tooltip>}
                    placement="right"
                    trigger={['hover']}
                >
                    {linkItem}
                </OverlayTrigger>
            );
        });
    }

    render() {
        return (
            <div className="sidebar">
                <div className="sidebar-logo-container">
                    <img alt="" className="sidebar-logo" src={logo} />
                </div>
                {this.renderNavItems(MENU_ITEMS)}
            </div>
        );
    }
}

MenuSidebar.propTypes = {
    intl: intlShape.isRequired,
    rolesData: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
};

export default injectIntl(MenuSidebar);
