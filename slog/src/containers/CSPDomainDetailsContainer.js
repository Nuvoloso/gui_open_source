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
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';

import CSPDomainDetails from '../components/CSPDomainDetails';

import { getCSPStorageTypes } from '../actions/cspStorageTypeActions';
import { getAccounts } from '../actions/accountActions';
import { getClusters } from '../actions/clusterActions';
import {
    getCSPCredentials,
    getCSPs,
    patchCSP
} from '../actions/cspActions';
import { getClustersCompliance } from '../actions/complianceActions';
import { timePeriodUnit } from '../components/utils';
import { getRoles } from '../actions/roleActions';
import { sessionGetAccount } from '../sessionUtils';
import {
    getProtectionDomainMetadata,
    getProtectionDomains,
    postProtectionDomainSetActive,
} from '../actions/protectionDomainActions';
import { getVolumeSeries } from '../actions/volumeSeriesActions';

import { cspDomainMsgs } from '../messages/CSPDomain';

import * as types from '../actions/types';
import * as constants from '../constants';

class CSPDomainDetailsContainer extends Component {
    constructor(props) {
        super(props);

        this.handleSaveProtectionDomain = this.handleSaveProtectionDomain.bind(this);
        this.saveSettingsCSP = this.saveSettingsCSP.bind(this);
    }

    componentDidMount() {
        const { dispatch, intl, session, uiSettings } = this.props;
        const { formatMessage } = intl;
        const { period } = uiSettings || {};
        const startTime = moment()
            .utc()
            .subtract(1, timePeriodUnit(period));
        const endTime = moment().utc();
        const { metricsDatabaseConnected } = session;

        const name = this.getName();

        if (name) {
            dispatch({
                type: types.SET_HEADER_RESOURCE_NAME,
                resourceName: formatMessage(cspDomainMsgs.cspDetailNameLabel, { name }),
            });
        } else {
            /**
             * No details for this cluster (likely no access), so ro
             */
            this.props.history.push(`/${constants.URI_CSP_DOMAINS}`);
            return;
        }

        dispatch(getClusters());
        dispatch(getCSPs());
        dispatch(getCSPCredentials());
        dispatch(getCSPStorageTypes());
        dispatch(getRoles());
        dispatch(getAccounts());
        dispatch(getProtectionDomainMetadata());
        dispatch(getProtectionDomains());
        dispatch(getVolumeSeries());
        if (metricsDatabaseConnected === constants.METRICS_SERVICE_CONNECTED) {
            dispatch(getClustersCompliance(startTime.format(), endTime.format()));
        }
    }

    componentDidUpdate(prevProps) {
        const { dispatch, intl, match, cspsData } = this.props;
        const { formatMessage } = intl;

        // XXX use getName() ???
        const { params } = match || {};
        const { id } = params || {};
        const { csps = [] } = cspsData || {};
        const csp = csps.find(csp => csp.meta.id === id);
        const { name } = csp || {};

        const { match: prevMatch, cspsData: prevCspsData } = prevProps;
        const { params: prevParams } = prevMatch || {};
        const { id: prevId } = prevParams || {};
        const { csps: prevCsps = [] } = prevCspsData || {};
        const prevCsp = prevCsps.find(csp => csp.meta.id === prevId);
        const { name: prevName } = prevCsp || {};

        /**
         * Need to redirect to summary table if no resource found.
         */
        if (!cspsData.loading && (!csps.length === 0 || !csp)) {
            // nothing found or no access to this resource, return to top level resource page
            this.props.history.push(`/${constants.URI_CSP_DOMAINS}`);
            return;
        }

        if (name !== prevName) {
            dispatch({
                type: types.SET_HEADER_RESOURCE_NAME,
                resourceName: formatMessage(cspDomainMsgs.cspDetailNameLabel, { name }),
            });
        }
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_HEADER_RESOURCE_NAME, resourceName: null });
        // this.handleDetailsTabSelect(constants.CLUSTER_DETAILS_TABS.SETTINGS);
    }

    getName() {
        const { match, cspsData } = this.props;
        const { params } = match || {};
        const { id } = params || {};
        const { csps = [] } = cspsData || {};
        const csp = csps.find(csp => csp.meta.id === id);
        const { name = '' } = csp || {};

        return name;
    }

    saveSettingsCSP(id, params) {
        const { dispatch } = this.props;
        dispatch(patchCSP(id, params));
    }

    handleSaveProtectionDomain(dialogInfo) {
        const { dispatch } = this.props;
        const { csp, encryptionAlgorithmObj, passphrase, name } = dialogInfo;
        const encryptionPassphrase = {
            kind: 'SECRET',
            value: passphrase,
        };
        const { encryptionAlgorithm } = encryptionAlgorithmObj || {};
        const params = {
            accountId: sessionGetAccount(),
            cspDomainId: csp.meta.id,
            encryptionAlgorithm,
            encryptionPassphrase,
            name,
        };
        dispatch(postProtectionDomainSetActive(params));
    }

    getAccount() {
        const { accountsData } = this.props;
        const { accounts = [] } = accountsData || {};
        const account = accounts.find(account => account.meta.id === sessionGetAccount());

        return account;
    }

    render() {
        const {
            accountsData,
            clusterComplianceTotalsData,
            clustersData,
            cspCredentialsData,
            cspsData,
            cspStorageTypesData,
            match,
            protectionDomainMetadataData,
            protectionDomainsData,
            rolesData,
            userData,
            volumeSeriesData,
        } = this.props;
        const { params } = match || {};
        const { id } = params || {};
        const { csps = [] } = cspsData || {};
        const csp = csps.find(csp => csp.meta.id === id);
        const account = this.getAccount();

        return (
            <CSPDomainDetails
                account={account}
                accountsData={accountsData}
                clusterComplianceTotalsData={clusterComplianceTotalsData}
                clustersData={clustersData}
                csp={csp}
                cspCredentialsData={cspCredentialsData}
                cspsData={cspsData}
                cspStorageTypesData={cspStorageTypesData}
                onProtectionDomainCreateSubmit={this.handleSaveProtectionDomain}
                protectionDomainMetadataData={protectionDomainMetadataData}
                protectionDomainsData={protectionDomainsData}
                rolesData={rolesData}
                saveSettingsCSP={this.saveSettingsCSP}
                userData={userData}
                volumeSeriesData={volumeSeriesData}
            />
        );
    }
}

CSPDomainDetailsContainer.propTypes = {
    accountsData: PropTypes.object,
    clusterComplianceTotalsData: PropTypes.object.isRequired,
    clustersData: PropTypes.object.isRequired,
    cspCredentialsData: PropTypes.object.isRequired,
    cspMetadata: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    cspStorageTypesData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    protectionDomainMetadataData: PropTypes.object.isRequired,
    protectionDomainsData: PropTypes.object.isRequired,
    rolesData: PropTypes.object.isRequired,
    session: PropTypes.object,
    uiSettings: PropTypes.object,
    userData: PropTypes.object.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const {
        accountsData,
        clusterComplianceTotalsData,
        clustersData,
        cspCredentialsData,
        cspMetadata,
        cspsData,
        cspStorageTypesData,
        protectionDomainMetadataData,
        protectionDomainsData,
        rolesData,
        session,
        uiSettings,
        userData,
        volumeSeriesData,
    } = state;
    return {
        accountsData,
        clusterComplianceTotalsData,
        clustersData,
        cspCredentialsData,
        cspMetadata,
        cspsData,
        cspStorageTypesData,
        protectionDomainMetadataData,
        protectionDomainsData,
        rolesData,
        session,
        uiSettings,
        userData,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(CSPDomainDetailsContainer));
