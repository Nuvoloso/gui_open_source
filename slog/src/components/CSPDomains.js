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
import { Collapse } from 'react-bootstrap';
import { withRouter, Link } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';

import _ from 'lodash';

import ButtonAction from './ButtonAction';
import CSPCredentialsContainer from '../containers/CSPCredentialsContainer';
import CreateCSPCredentialDialog from './CreateCSPCredentialDialog';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import SelectOptions from './SelectOptions';
import TableContainer from '../containers/TableContainer';
import DeleteForm from './DeleteForm';
import CreateCSPDomainDialog from './CreateCSPDomainDialog';

import { sessionGetAccount } from '../sessionUtils';
import { isAccountAdmin, isTenantAdmin } from '../containers/userAccountUtils';

import { cspDomainMsgs } from '../messages/CSPDomain';
import { ATTRIBUTE_AWS } from '../reducers/csps';

import * as constants from '../constants';

import './table.css';

import { CloudQueue, CloudQueueTwoTone, DeleteForever, Edit, VpnKey } from '@material-ui/icons';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnDomainHov from '../assets/btn-domain-hov.svg';
import btnDomainUp from '../assets/btn-domain-up.svg';

class CSPDomains extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editCSPdomainAttributes: ATTRIBUTE_AWS,
            editManagementHost: [],
            editName: '',
            editResource: null,
            editCspCredentialId: '',
        };

        this.handleChangeAttributes = this.handleChangeAttributes.bind(this);
        this.handleEditChange = this.handleEditChange.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.handleEditChangeCredential = this.handleEditChangeCredential.bind(this);
    }

    disableEditSubmit() {
        const { editCspCredentialId, editCSPdomainAttributes, editManagementHost, editName, editResource } = this.state;
        const { _original } = editResource || {};
        const { cspCredentialId, managementHost, cspDomainAttributes, name } = _original || {};

        return (
            editManagementHost === managementHost &&
            editName === name &&
            _.isEqual(editCSPdomainAttributes, cspDomainAttributes) &&
            editCspCredentialId === cspCredentialId
        );
    }

    handleEdit(selectedRow) {
        const { _original } = selectedRow || {};
        const { cspCredentialId, cspDomainAttributes = '', managementHost = '', name = '' } = _original || {};

        this.setState({
            editCSPdomainAttributes: cspDomainAttributes,
            editManagementHost: managementHost,
            editName: name,
            editResource: selectedRow,
            editCspCredentialId: cspCredentialId,
        });
    }

    handleChangeAttributes(name, value) {
        const { editCSPdomainAttributes } = this.state;

        this.setState({
            editCSPdomainAttributes: {
                ...editCSPdomainAttributes,
                [name]: {
                    kind: editCSPdomainAttributes[name].kind,
                    value: value,
                },
            },
        });
    }

    handleEditChangeCredential(selectedItem) {
        const { value = '' } = selectedItem || {};
        this.setState({ editCspCredentialId: value });
    }

    handleEditChange(name, value) {
        this.setState({ [name]: value });
    }

    handleEditChangeCluster(selectedItem) {
        const { value = '' } = selectedItem || {};
        this.setState({ editClusterId: value });
    }

    handleEditChangeCGs(selectedItem) {
        const { value = '' } = selectedItem || {};
        this.setState({ editConsistencyGroupId: value });
    }

    handleEditChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ editTags: value });
    }

    handleEditSubmit() {
        const { patchDomain } = this.props;
        const { editCspCredentialId, editManagementHost, editName, editResource } = this.state;

        const { _original } = editResource || {};
        const { cspCredentialId, id, managementHost, name } = _original || {};

        const params = {
            ...(editManagementHost !== managementHost && { managementHost: editManagementHost }),
            ...(editName !== name && { name: editName }),
            ...(editCspCredentialId !== cspCredentialId && { cspCredentialId: editCspCredentialId }),
        };

        if (patchDomain) {
            patchDomain(id, params);
        }

        this.handleEdit(null);
    }

    renderFetchStatus() {
        const {
            accountsData = {},
            cspCredentialsData = {},
            cspsData = {},
            protectionDomainMetadataData = {},
            systemData = {},
        } = this.props;

        if (
            (accountsData.loading,
            cspCredentialsData.loading,
            cspsData.loading,
            protectionDomainMetadataData.loading,
            systemData.loading)
        ) {
            return <Loader />;
        }
    }

    renderHeader() {
        const {
            accountsData,
            cspCredentialsData,
            cspMetadataData,
            dialogCreateCredential,
            dialogCreateCredentialToggle,
            dialogOpenCreate,
            dialogSaveCredential,
            dialogSaveDomain,
            dialogToggleCreate,
            getSystemHostname,
            handleServiceProviderChange,
            intl,
            protectionDomainMetadataData,
            rolesData,
            systemData,
            userData,
        } = this.props;
        const { cspCredentials = [] } = cspCredentialsData || {};
        const { formatMessage } = intl;
        const accountId = sessionGetAccount();
        const { accounts = [] } = accountsData || {};
        const account = accounts.find(acct => acct.meta.id === accountId);
        const { snapshotCatalogPolicy } = account || {};
        const { protectionDomainId = '' } = snapshotCatalogPolicy || {};
        const { user } = userData || {};
        const tenantAdmin = isTenantAdmin(user, rolesData);

        return (
            <Fragment>
                <div className="content-flex-column">
                    <div className="content-flex-row">
                        <div className="layout-icon-background">
                            <div className="layout-icon">
                                <CloudQueueTwoTone />
                            </div>
                        </div>
                        <div className="content-flex-row layout-summary" />
                        <div className="layout-actions">
                            {tenantAdmin ? (
                                <Fragment>
                                    <div>
                                        <ButtonAction
                                            btnUp={btnDomainUp}
                                            btnHov={btnDomainHov}
                                            id="cspDomainCreate"
                                            onClick={dialogToggleCreate}
                                            label={formatMessage(cspDomainMsgs.dialogCreateDomainLabel)}
                                        />
                                    </div>
                                    <div>
                                        <ButtonAction
                                            btnUp={btnDomainUp}
                                            btnHov={btnDomainHov}
                                            icon={<VpnKey className="credential-icon" />}
                                            id="cspCredentialCreate"
                                            onClick={dialogCreateCredentialToggle}
                                            label={formatMessage(cspDomainMsgs.dialogCreateCredentialLabel)}
                                        />
                                    </div>
                                </Fragment>
                            ) : null}
                        </div>
                    </div>
                    <div />
                </div>
                <div className="divider-horizontal" />
                <Fragment>
                    <Collapse in={dialogOpenCreate} unmountOnExit>
                        <div>
                            <CreateCSPDomainDialog
                                createSnapshotCatalogPolicy={!protectionDomainId}
                                cspCredentials={cspCredentials}
                                cspMetadataData={cspMetadataData}
                                dialogSaveDomain={dialogSaveDomain}
                                dialogToggleCreate={dialogToggleCreate}
                                getSystemHostname={getSystemHostname}
                                handleServiceProviderChange={handleServiceProviderChange}
                                protectionDomainMetadataData={protectionDomainMetadataData}
                                systemData={systemData}
                            />
                        </div>
                    </Collapse>
                    <Collapse in={dialogCreateCredential} unmountOnExit>
                        <div>
                            <CreateCSPCredentialDialog
                                cspCredentials={cspCredentials}
                                dialogSaveCredential={dialogSaveCredential}
                                dialogCreateCredentialToggle={dialogCreateCredentialToggle}
                            />
                        </div>
                    </Collapse>
                </Fragment>
            </Fragment>
        );
    }

    renderDomains() {
        const {
            cspCredentialsData,
            cspsData,
            deleteDomain,
            intl,
            location,
            openModal,
            rolesData,
            selectedRows,
            userData,
        } = this.props;
        const { formatMessage } = intl;
        const { search } = location;
        const params = new URLSearchParams(search);
        const filter = params.get('filter');
        const { editResource } = this.state;
        const { id: editResourceId } = editResource || {};
        const { csps = [] } = cspsData || {};
        const { cspCredentials = [] } = cspCredentialsData || {};
        const { user } = userData || {};
        const normalAccount = isAccountAdmin(user, rolesData);

        const columns = [
            {
                Header: formatMessage(cspDomainMsgs.tableName),
                accessor: 'name',
                editable: true,
                minWidth: 100,
                Cell: row => {
                    const { editName } = this.state;
                    const { original, value } = row || {};
                    const { id = '' } = original || {};
                    const { id: editResourceId } = editResource || {};

                    if (id === editResourceId) {
                        return (
                            <FieldGroup name="editName" onChange={this.handleEditChange} type="text" value={editName} />
                        );
                    } else {
                        return (
                            <Link
                                className="table-name-link"
                                id={`csp-domains-table-link-${value}`}
                                to={{ pathname: `/${constants.URI_CSP_DOMAINS}/${id}`, state: { name: row.value } }}
                            >
                                {row.value}
                            </Link>
                        );
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableProvider),
                accessor: 'cspDomainType',
                minWidth: 60,
            },
            {
                Header: formatMessage(cspDomainMsgs.tableDetails),
                Cell: row => {
                    const { original } = row || {};
                    const { cspDomainType, region, zone } = original || {};

                    switch (cspDomainType) {
                        case constants.CSP_DOMAINS.AWS: {
                            const detailsRegion = `${formatMessage(cspDomainMsgs.regionLabel)}: ${region}`;
                            const detailsZone = `${formatMessage(cspDomainMsgs.zoneLabel)}: ${zone}`;

                            return (
                                <div>
                                    <div>{detailsRegion}</div>
                                    <div>{detailsZone}</div>
                                </div>
                            );
                        }
                        case constants.CSP_DOMAINS.GCP: {
                            const detailsZone = `${formatMessage(cspDomainMsgs.zoneLabel)}: ${zone}`;

                            return (
                                <div>
                                    <div>{detailsZone}</div>
                                </div>
                            );
                        }
                        default:
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableManagementHost),
                accessor: 'managementHost',
                minWidth: 350,
                Cell: row => {
                    const { editManagementHost } = this.state;
                    const { original } = row || {};
                    const { id = '' } = original || {};
                    const { id: editResourceId } = editResource || {};

                    if (id === editResourceId) {
                        return (
                            <FieldGroup
                                name="editManagementHost"
                                onChange={this.handleEditChange}
                                type="text"
                                value={editManagementHost}
                            />
                        );
                    } else {
                        return row.value;
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableCSPCredentials),
                accessor: 'cspCredentialId',
                editable: true,
                Cell: row => {
                    const { editCspCredentialId } = this.state;
                    const { original } = row || {};
                    const { cspCredentialId = '', id = '' } = original || {};
                    const cspCredential = cspCredentials.find(cred => cred.meta.id === cspCredentialId);
                    const { meta, name = '' } = cspCredential || {};
                    const { id: credentialId } = meta || {};
                    const { id: editResourceId } = editResource || {};

                    if (id === editResourceId) {
                        const initialId = editCspCredentialId ? editCspCredentialId : credentialId;
                        const initialCsp = cspCredentials.find(cred => cred.meta.id === initialId);
                        const initialValues = initialCsp
                            ? {
                                  label: initialCsp.name,
                                  value: initialCsp.meta.id,
                              }
                            : {};

                        return (
                            <SelectOptions
                                id="cspSelectCredential"
                                initialValues={initialValues}
                                isLoading={cspCredentialsData.loading}
                                isClearable={false}
                                onChange={this.handleEditChangeCredential}
                                value={editCspCredentialId}
                                options={cspCredentials.map(cred => {
                                    const { meta, name } = cred || {};
                                    const { id } = meta || {};
                                    return { value: id, label: name };
                                })}
                            />
                        );
                    } else {
                        return name;
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableActions),
                accessor: 'actions',
                sortable: false,
                minWidth: 60,
                show: !normalAccount,
                Cell: (selected = {}) => {
                    const { original, row } = selected || {};
                    const { id, name } = original || {};

                    return (
                        <div className="table-actions-cell">
                            {editResource && editResource.id === id ? (
                                <Fragment>
                                    <ButtonAction
                                        btnUp={btnAltSaveUp}
                                        btnHov={btnAltSaveHov}
                                        btnDisable={btnAltSaveDisable}
                                        disabled={this.disableEditSubmit()}
                                        onClick={this.handleEditSubmit}
                                    />
                                    <ButtonAction
                                        btnUp={btnCancelUp}
                                        btnHov={btnCancelHov}
                                        onClick={() => this.handleEdit(null)}
                                    />
                                </Fragment>
                            ) : (
                                <Fragment>
                                    <Edit id={`volumeSeriesToolbarEdit-${id}`} onClick={() => this.handleEdit(row)} />
                                    <DeleteForever
                                        id={`cspDomainToolbarDelete-${id}`}
                                        cy-testid={`cspDomainToolbarDelete-${name}`}
                                        onClick={() =>
                                            openModal(
                                                DeleteForm,
                                                {
                                                    deleteFunc: () => deleteDomain(row._original),
                                                    title: formatMessage(cspDomainMsgs.cspDeleteDomainTitle),
                                                },
                                                {
                                                    message: formatMessage(cspDomainMsgs.cspDeleteDomain, { name }),
                                                }
                                            )
                                        }
                                    />
                                </Fragment>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'ID',
                accessor: 'id',
                show: false,
            },
        ];

        const data =
            csps.length > 0
                ? csps.map(csp => {
                      const { cspCredentialId, cspDomainAttributes, cspDomainType, managementHost, meta, name } =
                          csp || {};
                      const { value: region = '' } = cspDomainAttributes[constants.AWS_REGION] || {};
                      const { value: zone = '' } =
                          cspDomainAttributes[constants.AWS_AVAILABILITY_ZONE] ||
                          cspDomainAttributes[constants.GC_ZONE] ||
                          {};
                      const { value: key = '' } = cspDomainAttributes[constants.AWS_ACCESS_KEY_ID] || {};
                      const { value: secret = '' } = cspDomainAttributes[constants.AWS_SECRET_ACCESS_KEY] || {};
                      const { id } = meta;

                      return {
                          cspCredentialId,
                          cspDomainAttributes,
                          cspDomainType,
                          edit: id === editResourceId ? true : false,
                          id,
                          key,
                          managementHost,
                          name,
                          region,
                          secret,
                          zone,
                      };
                  })
                : [];

        return (
            <div className="dark component-page">
                <TableContainer
                    columns={columns}
                    component="CSP_DOMAINS_TABLE"
                    componentSelectedRows={selectedRows}
                    data={data}
                    dataTestId="csp-domains-table"
                    defaultFiltered={filter}
                    defaultSorted={[{ id: 'name' }]}
                    emptyPlaceholder={{
                        icon: CloudQueue,
                        iconStyle: { height: '120px', width: '120px' },
                        text: formatMessage(cspDomainMsgs.tableEmptyDomainsPlaceholder),
                    }}
                    id="csp-domains-table"
                    title={formatMessage(cspDomainMsgs.cspDomainsTableTitle)}
                />
            </div>
        );
    }

    renderCredentials(cspDomainType) {
        return <CSPCredentialsContainer cspDomainType={cspDomainType} />;
    }

    renderCredentialTabs() {
        const { intl, rolesData, userData } = this.props;
        const { formatMessage } = intl;
        const { user } = userData || {};
        const tenantAdmin = isTenantAdmin(user, rolesData);

        if (!tenantAdmin) {
            return null;
        }

        return [
            <Tab
                key={constants.CSP_DOMAINS.AWS}
                eventKey={constants.CSP_DOMAINS.AWS}
                title={formatMessage(cspDomainMsgs.credentialsTabLabelAWS)}
            >
                <div className="content-flex-column">{this.renderCredentials(constants.CSP_DOMAINS.AWS)}</div>
            </Tab>,
            <Tab
                eventKey={constants.CSP_DOMAINS.GCP}
                key={constants.CSP_DOMAINS.GCP}
                title={formatMessage(cspDomainMsgs.credentialsTabLabelGCP)}
            >
                <div className="content-flex-column">{this.renderCredentials(constants.CSP_DOMAINS.GCP)}</div>
            </Tab>,
        ];
    }

    renderTabs() {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { tabKey } = this.state;

        return (
            <Tabs
                activeKey={tabKey}
                className="tabs-container"
                id="resource-details-tabs"
                mountOnEnter
                onSelect={this.handleTabSelect}
            >
                <Tab eventKey={constants.CSP_TABS.DOMAINS} title={formatMessage(cspDomainMsgs.domainsTabLabel)}>
                    {this.renderDomains()}
                </Tab>
                {this.renderCredentialTabs()}
            </Tabs>
        );
    }

    render() {
        return (
            <div id="csp-domains-overview" className="resource-details dark component-page">
                {this.renderFetchStatus()}
                {this.renderHeader()}
                {this.renderTabs()}
            </div>
        );
    }
}

// Property type validation
CSPDomains.propTypes = {
    accountsData: PropTypes.object,
    cspCredentialsData: PropTypes.object,
    cspMetadataData: PropTypes.object,
    cspsData: PropTypes.object,
    deleteDomain: PropTypes.func,
    dialogCreateCredential: PropTypes.bool,
    dialogCreateCredentialToggle: PropTypes.func,
    dialogOpenCreate: PropTypes.bool,
    dialogSaveCredential: PropTypes.func,
    dialogSaveDomain: PropTypes.func,
    dialogToggleCreate: PropTypes.func,
    getSystemHostname: PropTypes.func,
    handleServiceProviderChange: PropTypes.func,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    openModal: PropTypes.func,
    patchDomain: PropTypes.func,
    protectionDomainMetadataData: PropTypes.object,
    rolesData: PropTypes.object,
    selectedRows: PropTypes.array,
    systemData: PropTypes.object,
    userData: PropTypes.object,
};

export default withRouter(injectIntl(CSPDomains));
