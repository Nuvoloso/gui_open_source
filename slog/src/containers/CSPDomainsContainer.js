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
import { connect } from 'react-redux';

import CSPDomains from '../components/CSPDomains';
import ProtectionDomainDetailsForm from '../components/ProtectionDomainDetailsForm';

import { ATTRIBUTE_AWS, ATTRIBUTE_GCP, ATTRIBUTE_AWS_NO_CRED, ATTRIBUTE_GCP_NO_CRED } from '../reducers/csps';
import { getCSPs } from '../actions/cspActions';
import { getRoles } from '../actions/roleActions';
import { openModal } from '../actions/modalActions';
import {
    deleteCSPs,
    getCSPMetaData,
    getCSPCredentials,
    patchCSP,
    postCredentialCSP,
    postCSP,
    postCspCredentials,
} from '../actions/cspActions';
import { getProtectionDomains, getProtectionDomainMetadata } from '../actions/protectionDomainActions';
import { getSystemHostname } from '../actions/systemActions';
import { sessionGetAccount } from '../sessionUtils';
import { isAccountAdmin, isTenantAdmin } from './userAccountUtils';

import * as constants from '../constants';

import { accountMsgs } from '../messages/Account';

class CSPDomainsContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dialogCreateCredential: false,
            dialogOpenCreate: false,
        };

        this.deleteDomain = this.deleteDomain.bind(this);
        this.dialogCreateCredentialToggle = this.dialogCreateCredentialToggle.bind(this);
        this.dialogSaveCredential = this.dialogSaveCredential.bind(this);
        this.dialogSaveDomain = this.dialogSaveDomain.bind(this);
        this.dialogToggleCreate = this.dialogToggleCreate.bind(this);
        this.getSystemHostname = this.getSystemHostname.bind(this);
        this.handleServiceProviderChange = this.handleServiceProviderChange.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchDomain = this.patchDomain.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(getCSPCredentials());
        dispatch(getCSPs());
        dispatch(getRoles());
        dispatch(getProtectionDomains());
        dispatch(getProtectionDomainMetadata());
        dispatch(getCSPMetaData(constants.CSP_DOMAINS.AWS));
    }

    handleServiceProviderChange(selectedProvider) {
        const { dispatch } = this.props;

        dispatch(getCSPMetaData(selectedProvider));
    }

    protectionDetailsModal() {
        const { accountsData, dispatch, intl, session } = this.props;
        const { accountId } = session || {};
        const { formatMessage } = intl;
        const { protectionDomainsData } = this.props;
        const { protectionDomains = [] } = protectionDomainsData || {};
        const { accounts = [] } = accountsData || {};
        const account = accounts.find(acct => acct.meta.id === accountId);
        const { snapshotCatalogPolicy } = account || {};
        const { protectionDomainId } = snapshotCatalogPolicy || {};
        const protectionDomain = protectionDomains.find(pd => pd.meta.id === protectionDomainId);
        const { cspsData } = this.props || {};
        const { csps = [] } = cspsData || {};
        const csp = csps.find(csp => {
            return csp.accountId === accountId;
        });
        const { cspDomainAttributes } = csp || {};
        const { aws_protection_store_bucket_name, aws_region } = cspDomainAttributes || {};
        const { value: bucketName } = aws_protection_store_bucket_name || {};
        const { value: region } = aws_region || {};

        // add the id, bucketname, region separately as the dialog is also called from the table
        // with a slightly different object
        const constructedRow = {
            ...protectionDomain,
            bucketName,
            id: protectionDomainId,
            region,
        };

        dispatch(
            openModal(
                ProtectionDomainDetailsForm,
                {
                    dark: true,
                    id: 'protectionDomainsSetActiveDomain',
                    title: formatMessage(accountMsgs.protectionInformationDialogTitle),
                },
                {
                    protectionDomain: constructedRow,
                    snapshotCatalogCreated: true,
                }
            )
        );
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
            if (!isTenantAdmin(user, rolesData) && !isAccountAdmin(user, rolesData)) {
                this.props.history.push('/');
            }
        }

        const { accountsData } = this.props;
        const { accountsData: prevAccountsData } = prevProps;
        const { settingPolicy } = accountsData || {};
        const { settingPolicy: prevSettingPolicy } = prevAccountsData || {};

        if (!settingPolicy && prevSettingPolicy) {
            this.protectionDetailsModal();
        }
    }

    getSystemHostname() {
        const { dispatch } = this.props;
        dispatch(getSystemHostname());
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    patchDomain(id, params) {
        const { dispatch } = this.props;
        dispatch(patchCSP(id, params));
    }

    dialogToggleCreate() {
        const { dialogOpenCreate } = this.state;

        this.setState({ dialogOpenCreate: !dialogOpenCreate, dialogCreateCredential: false });
    }

    dialogCreateCredentialToggle() {
        const { dialogCreateCredential } = this.state;

        this.setState({ dialogCreateCredential: !dialogCreateCredential, dialogOpenCreate: false });
    }

    deleteDomain(domain) {
        const { dispatch } = this.props;
        dispatch(deleteCSPs([domain]));
    }

    domainAttributes(options) {
        const { accessKeyId, accessRegion, accessZone, cspDomainType, gc_cred, secretKey } = options;

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

                cspDomainAttributes[constants.GC_CRED].value = gc_cred;

                cspDomainAttributes[constants.GC_ZONE].value = accessZone;

                return cspDomainAttributes;
            }
            default:
                return {};
        }
    }

    domainAttributesPruned(options) {
        const { accessRegion, accessZone, cspDomainType } = options;

        switch (cspDomainType) {
            case constants.CSP_DOMAINS.AWS: {
                const cspDomainAttributes = ATTRIBUTE_AWS_NO_CRED;

                cspDomainAttributes[constants.AWS_REGION].value = accessRegion;
                cspDomainAttributes[constants.AWS_AVAILABILITY_ZONE].value = accessZone;

                return cspDomainAttributes;
            }
            case constants.CSP_DOMAINS.GCP: {
                const cspDomainAttributes = ATTRIBUTE_GCP_NO_CRED;

                cspDomainAttributes[constants.GC_ZONE].value = accessZone;

                return cspDomainAttributes;
            }
            default:
                return {};
        }
    }

    dialogSaveCredential(options) {
        const { dispatch } = this.props;
        const { cspCredentialName, cspDescription: description, cspDomainType, cspTags: tags } = options;

        const cspDomainAttributes = this.domainAttributes(options);

        const params = {
            ...(cspCredentialName && { cspCredentialName }),
            ...(cspDomainType && { cspDomainType }),
            ...(Object.keys(cspDomainAttributes).length > 0 && { cspDomainAttributes }),
            ...(tags.length > 0 && { tags }),
            ...(description && { description }),
        };

        dispatch(postCspCredentials(params));
        this.setState({ dialogCreateCredential: false });
    }

    /**
     * Need all the options from the dialog, including for CSP
     */
    dialogSaveDomain(options) {
        const { dispatch } = this.props;
        const {
            createSnapshotCatalogPolicy,
            cspCredentialId,
            cspCredentialName,
            cspDescription: description,
            cspDomainType,
            cspTags: tags,
            domainName: name,
            encryptionAlgorithmObj,
            managementHost,
            passphrase,
            selectedCredentialType,
        } = options;
        const encryptionPassphrase = {
            kind: 'SECRET',
            value: passphrase,
        };
        const { encryptionAlgorithm } = encryptionAlgorithmObj || {};

        const cspDomainAttributes =
            selectedCredentialType === constants.OPTION_USE_EXISTING
                ? this.domainAttributesPruned(options)
                : this.domainAttributes(options);

        const protectionDomainName = `SNAPSHOT_CATALOG`;
        const params = {
            ...(name && { name }),
            ...(cspDomainType && { cspDomainType }),
            ...(Object.keys(cspDomainAttributes).length > 0 && { cspDomainAttributes }),
            ...(cspCredentialName && { cspCredentialName }),
            ...(selectedCredentialType === constants.OPTION_USE_EXISTING && { cspCredentialId }),
            ...(managementHost && { managementHost }),
            ...(tags.length > 0 && { tags }),
            ...(description && { description }),
            ...(encryptionAlgorithm && { encryptionAlgorithm }),
            ...(protectionDomainName && { protectionDomainName }),
            ...(encryptionPassphrase && { encryptionPassphrase }),
            ...(createSnapshotCatalogPolicy && { createSnapshotCatalogPolicy }),
            accountId: sessionGetAccount(),
        };

        if (selectedCredentialType === constants.OPTION_CREATE_NEW) {
            dispatch(postCredentialCSP(params));
        } else {
            dispatch(postCSP(params));
        }

        this.setState({ dialogOpenCreate: false });
    }

    render() {
        const {
            accountsData,
            cspCredentialsData,
            cspMetadataData,
            cspsData,
            protectionDomainMetadataData,
            rolesData,
            systemData,
            tableClusters,
            userData,
        } = this.props;
        const { dialogOpenCreate, dialogCreateCredential } = this.state;

        return (
            <CSPDomains
                accountsData={accountsData}
                cspCredentialsData={cspCredentialsData}
                cspMetadataData={cspMetadataData}
                cspsData={cspsData}
                deleteDomain={this.deleteDomain}
                dialogCreateCredential={dialogCreateCredential}
                dialogCreateCredentialToggle={this.dialogCreateCredentialToggle}
                dialogOpenCreate={dialogOpenCreate}
                dialogSaveCredential={this.dialogSaveCredential}
                dialogSaveDomain={this.dialogSaveDomain}
                dialogToggleCreate={this.dialogToggleCreate}
                handleServiceProviderChange={this.handleServiceProviderChange}
                getSystemHostname={this.getSystemHostname}
                openModal={this.openModal}
                patchDomain={this.patchDomain}
                protectionDomainMetadataData={protectionDomainMetadataData}
                rolesData={rolesData}
                selectedRows={tableClusters.selectedRows}
                systemData={systemData}
                userData={userData}
            />
        );
    }
}

CSPDomainsContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    cspCredentialsData: PropTypes.object.isRequired,
    cspMetadataData: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object,
    intl: intlShape.isRequired,
    protectionDomainMetadataData: PropTypes.object,
    protectionDomainsData: PropTypes.object.isRequired,
    rolesData: PropTypes.object,
    session: PropTypes.object,
    systemData: PropTypes.object.isRequired,
    tableClusters: PropTypes.object.isRequired,
    userData: PropTypes.object,
};

function mapStateToProps(state) {
    const {
        accountsData,
        clusterComplianceTotalsData,
        clustersData,
        cspCredentialsData,
        cspMetadataData,
        cspsData,
        protectionDomainMetadataData,
        protectionDomainsData,
        rolesData,
        session,
        systemData,
        tableClusters,
        userData,
        volumeSeriesData,
    } = state;
    return {
        accountsData,
        clusterComplianceTotalsData,
        clustersData,
        cspCredentialsData,
        cspMetadataData,
        cspsData,
        protectionDomainMetadataData,
        protectionDomainsData,
        rolesData,
        session,
        systemData,
        tableClusters,
        userData,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(CSPDomainsContainer));
