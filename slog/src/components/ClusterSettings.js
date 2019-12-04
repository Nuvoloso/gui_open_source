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

import ClusterSettingsCSP from './ClusterSettingsCSP';
import ClusterSettingsMeta from './ClusterSettingsMeta';

import { isAccountAdmin, isAccountUser } from '../containers/userAccountUtils';

class ClusterSettings extends Component {
    render() {
        const {
            cluster = {},
            csp = {},
            cspCredentialsData = {},
            loading,
            rolesData,
            saveSettingsCSP,
            saveSettingsMeta,
            userData,
        } = this.props;
        const { user } = userData;
        const disableEdit = isAccountUser(user, rolesData) || isAccountAdmin(user, rolesData);
        const normalAccount = isAccountAdmin(user, rolesData);

        return (
            <div className="resource-settings">
                <ClusterSettingsMeta
                    cluster={cluster}
                    disableEdit={disableEdit}
                    loading={loading}
                    saveSettings={saveSettingsMeta}
                />
                <ClusterSettingsCSP
                    cluster={cluster}
                    csp={csp}
                    cspCredentialsData={cspCredentialsData}
                    disableEdit={disableEdit}
                    hideCredential={normalAccount}
                    loading={loading}
                    saveSettings={saveSettingsCSP}
                />
            </div>
        );
    }
}

ClusterSettings.propTypes = {
    cluster: PropTypes.object,
    csp: PropTypes.object,
    cspCredentialsData: PropTypes.object,
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
    rolesData: PropTypes.object,
    saveSettingsCSP: PropTypes.func,
    saveSettingsMeta: PropTypes.func,
    userData: PropTypes.object,
};

export default injectIntl(ClusterSettings);
