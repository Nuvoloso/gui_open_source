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
import { withRouter } from 'react-router-dom';

import CSPCredentials from '../components/CSPCredentials';

import { ATTRIBUTE_AWS, ATTRIBUTE_GCP } from '../reducers/csps';
import { openModal } from '../actions/modalActions';
import { deleteCredentials, postCredentialCSP, patchCredential } from '../actions/cspActions';
import { isTenantAdmin } from './userAccountUtils';

import * as constants from '../constants';

class CSPCredentialsContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialogOpenCreate: false,
        };

        this.deleteCredential = this.deleteCredential.bind(this);
        this.dialogSaveCredential = this.dialogSaveCredential.bind(this);
        this.dialogToggleCreate = this.dialogToggleCreate.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchCredential = this.patchCredential.bind(this);
    }

    /**
     * Check to see if the user switched accounts and force to dashboard
     * page if not a tenant admin.
     */
    componentDidUpdate(prevProps) {
        const { rolesData, session, userData } = this.props;
        const { session: prevSession } = prevProps;
        const { user } = userData || {};

        // only compare after initial login
        if (prevSession.accountId && session.accountId !== prevSession.accountId) {
            if (!isTenantAdmin(user, rolesData)) {
                this.props.history.push('/');
            }
        }
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    patchCredential(id, params) {
        const { dispatch } = this.props;
        dispatch(patchCredential(id, params));
    }

    dialogToggleCreate() {
        const { dialogOpenCreate } = this.state;

        this.setState({ dialogOpenCreate: !dialogOpenCreate });
    }

    deleteCredential(credential) {
        const { dispatch } = this.props;
        dispatch(deleteCredentials([credential]));
    }

    domainAttributes(options) {
        const { accessKeyId, accessRegion, accessZone, cspDomainType, secretKey } = options;

        switch (cspDomainType) {
            case constants.CSP_DOMAINS.AWS: {
                const cspDomainAttributes = ATTRIBUTE_AWS;

                cspDomainAttributes[constants.AWS_ACCESS_KEY_ID].value = accessKeyId;
                cspDomainAttributes[constants.AWS_SECRET_ACCESS_KEY].value = secretKey;

                cspDomainAttributes[constants.AWS_REGION].value = accessRegion;
                cspDomainAttributes[constants.AWS_AVAILABILITY_ZONE].value = accessZone;

                return cspDomainAttributes;
            }
            case constants.CSP_DOMAINS.GCP: {
                const cspDomainAttributes = ATTRIBUTE_GCP;

                cspDomainAttributes[constants.GC_ZONE].value = accessZone;

                return cspDomainAttributes;
            }
            default:
                return {};
        }
    }

    /**
     * Need all the options from the dialog, including for CSP
     */
    dialogSaveCredential(options) {
        const { dispatch } = this.props;
        const { cspDescription: description, cspTags: tags, domainName } = options;
        const name = domainName;
        const cspDomainAttributes = this.domainAttributes(options);
        const params = {
            ...(name && { name }),
            ...(Object.keys(cspDomainAttributes).length > 0 && { cspDomainAttributes }),
            ...(tags.length > 0 && { tags }),
            ...(description && { description }),
        };

        dispatch(postCredentialCSP(params));

        this.setState({ dialogOpenCreate: false });
    }

    render() {
        const { cspCredentialsData, cspDomainType } = this.props;

        return (
            <CSPCredentials
                cspCredentialsData={cspCredentialsData}
                cspDomainType={cspDomainType}
                patchCredential={this.patchCredential}
                deleteCredential={this.deleteCredential}
                openModal={this.openModal}
            />
        );
    }
}

CSPCredentialsContainer.propTypes = {
    cspCredentialsData: PropTypes.object.isRequired,
    cspDomainType: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object,
    rolesData: PropTypes.object,
    session: PropTypes.object,
    userData: PropTypes.object,
};

function mapStateToProps(state) {
    const { cspCredentialsData, rolesData, session, userData } = state;
    return {
        cspCredentialsData,
        rolesData,
        session,
        userData,
    };
}

export default withRouter(connect(mapStateToProps)(CSPCredentialsContainer));
