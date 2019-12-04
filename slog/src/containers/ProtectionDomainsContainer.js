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
import _ from 'lodash';

import ProtectionDomains from '../components/ProtectionDomains';

import { openModal } from '../actions/modalActions';
import { patchAccount } from '../actions/accountActions';
import {
    deleteProtectionDomains,
    getProtectionDomains,
    postProtectionDomain,
    patchProtectionDomain,
} from '../actions/protectionDomainActions';
import { getProtectionDomainHistory } from '../actions/auditLogActions';
import { getCSPs } from '../actions/cspActions';

class ProtectionDomainsContainer extends Component {
    constructor(props) {
        super(props);

        this.deleteProtectionDomain = this.deleteProtectionDomain.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchProtectionDomain = this.patchProtectionDomain.bind(this);
        this.postProtectionDomain = this.postProtectionDomain.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(getProtectionDomains());
        dispatch(getCSPs());
        dispatch(getProtectionDomainHistory());
    }

    componentDidUpdate(prevProps) {
        const { account, dispatch } = this.props;
        const { account: prevAccount } = prevProps;

        const { protectionDomains } = account || {};
        const { protectionDomains: prevProtectionDomains } = prevAccount || {};

        if (!_.isEqual(protectionDomains, prevProtectionDomains)) {
            dispatch(getProtectionDomainHistory());
        }
    }

    deleteProtectionDomain(protectionDomain) {
        const { dispatch, tableProtectionDomains } = this.props;
        dispatch(deleteProtectionDomains(protectionDomain ? [protectionDomain] : tableProtectionDomains.selectedRows));
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    patchAccount(id, params, authIdentifier, deleteUsersList) {
        const { dispatch } = this.props;
        dispatch(patchAccount(id, params, authIdentifier, deleteUsersList));
    }

    patchProtectionDomain(id, params) {
        const { dispatch } = this.props;
        dispatch(patchProtectionDomain(id, params));
    }

    postProtectionDomain(params) {
        const { account, dispatch } = this.props;
        const { meta } = account || {};
        const { id } = meta || {};

        dispatch(
            postProtectionDomain({
                ...params,
                accountId: id,
            })
        );
    }

    removeUsers(usersToRemove = [], deleteAfter) {
        const { account, dispatch, userData } = this.props;
        const { meta, userRoles = {} } = account || {};
        const { id: accountId } = meta || {};
        const { user } = userData || {};
        const { authIdentifier } = user || {};

        const filteredUserRoles = {};
        Object.keys(userRoles)
            .filter(roleUserId => usersToRemove.every(user => user.id !== roleUserId))
            .forEach(id => {
                filteredUserRoles[id] = userRoles[id];
            });

        const params = {
            userRoles: filteredUserRoles,
        };

        dispatch(patchAccount(accountId, params, authIdentifier, deleteAfter ? usersToRemove : null));
    }

    render() {
        const {
            account,
            csp,
            cspsData,
            openDialogCreateProtectionDomain,
            protectionDomainHistoryData,
            protectionDomainsData,
            tableOnly,
            tableProtectionDomains = {},
        } = this.props;

        return (
            <div>
                <ProtectionDomains
                    account={account}
                    csp={csp}
                    cspsData={cspsData}
                    deleteProtectionDomain={this.deleteProtectionDomain}
                    openDialogCreateProtectionDomain={openDialogCreateProtectionDomain}
                    openModal={this.openModal}
                    patchProtectionDomain={this.patchProtectionDomain}
                    postProtectionDomain={this.postProtectionDomain}
                    protectionDomainHistoryData={protectionDomainHistoryData}
                    protectionDomainsData={protectionDomainsData}
                    selectedRows={tableProtectionDomains.selectedRows}
                    tableOnly={tableOnly}
                />
            </div>
        );
    }
}

ProtectionDomainsContainer.propTypes = {
    account: PropTypes.object,
    csp: PropTypes.object,
    cspsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    openDialogCreateProtectionDomain: PropTypes.bool,
    protectionDomainHistoryData: PropTypes.object.isRequired,
    protectionDomainMetadataData: PropTypes.object.isRequired,
    protectionDomainsData: PropTypes.object.isRequired,
    rolesData: PropTypes.object.isRequired,
    tableOnly: PropTypes.bool,
    tableProtectionDomains: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    usersData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const {
        cspsData,
        protectionDomainHistoryData,
        protectionDomainMetadataData,
        protectionDomainsData,
        rolesData,
        tableProtectionDomains,
        userData,
        usersData,
    } = state;
    return {
        cspsData,
        protectionDomainHistoryData,
        protectionDomainMetadataData,
        protectionDomainsData,
        rolesData,
        tableProtectionDomains,
        userData,
        usersData,
    };
}

export default connect(mapStateToProps)(ProtectionDomainsContainer);
