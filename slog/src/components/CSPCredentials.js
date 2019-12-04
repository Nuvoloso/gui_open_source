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
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import ButtonAction from './ButtonAction';
import DeleteForm from './DeleteForm';
import FieldGroup from './FieldGroup';
import TableContainer from '../containers/TableContainer';

import { cspDomainMsgs } from '../messages/CSPDomain';
import { ATTRIBUTE_AWS } from '../reducers/csps';

import * as constants from '../constants';

import './table.css';

import { DeleteForever, Edit, VpnKey } from '@material-ui/icons';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';

class CSPCredentials extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editCredentialAttributes: ATTRIBUTE_AWS,
            editName: '',
            editResource: null,
        };

        this.handleChangeAttributes = this.handleChangeAttributes.bind(this);
        this.handleEditChange = this.handleEditChange.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
    }

    disableEditSubmit() {
        const { editCredentialAttributes, editName, editResource } = this.state;
        const { _original } = editResource || {};
        const { credentialAttributes, name } = _original || {};

        return editName === name && _.isEqual(editCredentialAttributes, credentialAttributes);
    }

    handleEdit(selectedRow) {
        const { _original } = selectedRow || {};
        const { credentialAttributes = '', name = '' } = _original || {};

        this.setState({
            editCredentialAttributes: credentialAttributes,
            editName: name,
            editResource: selectedRow,
        });
    }

    handleChangeAttributes(name, value) {
        const { editCredentialAttributes } = this.state;

        this.setState({
            editCredentialAttributes: {
                ...editCredentialAttributes,
                [name]: {
                    kind: editCredentialAttributes[name].kind,
                    value: value,
                },
            },
        });
    }

    handleEditChange(name, value) {
        this.setState({ [name]: value });
    }

    handleEditChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ editTags: value });
    }

    handleEditSubmit() {
        const { cspDomainType, patchCredential } = this.props;
        const { editCredentialAttributes, editName, editResource } = this.state;

        const { _original } = editResource || {};
        const { credentialAttributes, id, name } = _original || {};

        const params = {
            ...(editName !== name && { name: editName }),
            ...(cspDomainType === constants.CSP_DOMAINS.AWS &&
                (editCredentialAttributes[constants.AWS_ACCESS_KEY_ID].value !== [constants.AWS_ACCESS_KEY_ID].value ||
                    editCredentialAttributes[constants.AWS_SECRET_ACCESS_KEY].value !==
                        credentialAttributes[constants.AWS_SECRET_ACCESS_KEY].value) && {
                    credentialAttributes: editCredentialAttributes,
                }),
            ...(cspDomainType === constants.CSP_DOMAINS.GCP &&
                editCredentialAttributes[constants.GC_CRED].value !== [constants.GC_CRED].value && {
                    credentialAttributes: editCredentialAttributes,
                }),
        };

        if (patchCredential) {
            patchCredential(id, params);
        }

        this.handleEdit(null);
    }

    render() {
        const {
            cspCredentialsData,
            cspDomainType: filterCspDomainType,
            deleteCredential,
            intl,
            location,
            openModal,
        } = this.props;
        const { formatMessage } = intl;
        const { search } = location;
        const params = new URLSearchParams(search);
        const filter = params.get('filter');
        const { editResource } = this.state;
        const { cspCredentials = [] } = cspCredentialsData || {};

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
                    const { id: editVolumeId } = editResource || {};

                    if (id === editVolumeId) {
                        return (
                            <FieldGroup name="editName" onChange={this.handleEditChange} type="text" value={editName} />
                        );
                    } else {
                        return value;
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableKey),
                accessor: 'key',
                minWidth: 120,
                show: filterCspDomainType === constants.CSP_DOMAINS.AWS,
                Cell: row => {
                    const { editCredentialAttributes } = this.state;
                    const { original } = row || {};
                    const { id = '' } = original || {};
                    const { id: editResourceId } = editResource || {};

                    const credentialAttributes = editResource
                        ? editCredentialAttributes
                        : original.credentialAttributes;

                    const key =
                        (credentialAttributes[constants.AWS_ACCESS_KEY_ID] &&
                            credentialAttributes[constants.AWS_ACCESS_KEY_ID].value) ||
                        '';

                    if (!key) {
                        return <FieldGroup type="static" value="N/A" />;
                    }

                    if (id === editResourceId) {
                        return (
                            <FieldGroup
                                name="aws_access_key_id"
                                onChange={this.handleChangeAttributes}
                                type="password"
                                value={key}
                            />
                        );
                    } else {
                        return (
                            <FieldGroup
                                classNameText="password-static"
                                name="aws_access_key_id"
                                type="password-static"
                                value={key}
                            />
                        );
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableSecret),
                accessor: 'secret',
                minWidth: 200,
                show: filterCspDomainType === constants.CSP_DOMAINS.AWS,
                Cell: row => {
                    const { editCredentialAttributes } = this.state;
                    const { original } = row || {};
                    const { id = '' } = original || {};
                    const { id: editResourceId } = editResource || {};

                    const credentialAttributes = editResource
                        ? editCredentialAttributes
                        : original.credentialAttributes;

                    const secret =
                        (credentialAttributes[constants.AWS_SECRET_ACCESS_KEY] &&
                            credentialAttributes[constants.AWS_SECRET_ACCESS_KEY].value) ||
                        '';

                    if (id === editResourceId) {
                        return (
                            <FieldGroup
                                name="aws_secret_access_key"
                                onChange={this.handleChangeAttributes}
                                type="password"
                                value={secret}
                            />
                        );
                    } else {
                        return (
                            <FieldGroup
                                classNameText="password-static"
                                name="aws_secret_access_key"
                                onChange={this.handleChangeAttributes}
                                type="password-static"
                                value={secret}
                            />
                        );
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableCred),
                accessor: 'gc_cred',
                minWidth: 200,
                maxWidth: 400,
                show: filterCspDomainType === constants.CSP_DOMAINS.GCP,
                Cell: row => {
                    const { editCredentialAttributes } = this.state;
                    const { original } = row || {};
                    const { id = '' } = original || {};
                    const { id: editResourceId } = editResource || {};

                    const credentialAttributes = editResource
                        ? editCredentialAttributes
                        : original.credentialAttributes;

                    const gc_cred =
                        (credentialAttributes[constants.GC_CRED] && credentialAttributes[constants.GC_CRED].value) ||
                        '';

                    if (id === editResourceId) {
                        return (
                            <FieldGroup
                                name="gc_cred"
                                onChange={this.handleChangeAttributes}
                                type="textarea"
                                value={gc_cred}
                            />
                        );
                    } else {
                        return (
                            <FieldGroup
                                classNameText="password-static"
                                name="gc_cred"
                                onChange={this.handleChangeAttributes}
                                type="password-static"
                                value={gc_cred}
                            />
                        );
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableActions),
                accessor: 'actions',
                sortable: false,
                minWidth: 60,
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
                                        id={`cspCredentialToolbarDelete-${id}`}
                                        cy-testid={`cspCredentialToolbarDelete-${name}`}
                                        onClick={() =>
                                            openModal(
                                                DeleteForm,
                                                {
                                                    deleteFunc: () => deleteCredential(row._original),
                                                    title: formatMessage(cspDomainMsgs.cspDeleteDomainTitle),
                                                },
                                                {
                                                    message: formatMessage(cspDomainMsgs.cspDeleteCSPCredential, {
                                                        name,
                                                    }),
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
            cspCredentials.length > 0
                ? cspCredentials
                      .map(credential => {
                          const { credentialAttributes, cspDomainType, meta, name } = credential;
                          const { id } = meta;
                          const key =
                              (credential &&
                                  credentialAttributes &&
                                  credentialAttributes[constants.AWS_ACCESS_KEY_ID] &&
                                  credentialAttributes[constants.AWS_ACCESS_KEY_ID].value) ||
                              '';
                          const secret =
                              (credential &&
                                  credentialAttributes &&
                                  credentialAttributes[constants.AWS_SECRET_ACCESS_KEY] &&
                                  credentialAttributes[constants.AWS_SECRET_ACCESS_KEY].value) ||
                              '';
                          const gc_cred =
                              (credentialAttributes[constants.GC_CRED] &&
                                  credentialAttributes[constants.GC_CRED].value) ||
                              '';

                          return {
                              credentialAttributes,
                              cspDomainType,
                              gc_cred,
                              id,
                              key,
                              name,
                              secret,
                          };
                      })
                      .filter(credential => {
                          const { cspDomainType } = credential;

                          return cspDomainType === filterCspDomainType;
                      })
                : [];

        return (
            <div className="dark component-page">
                <div>
                    <TableContainer
                        columns={columns}
                        component="CSP_CREDENTIALS_TABLE"
                        data={data}
                        dataTestId={`csp-credentials-table-${filterCspDomainType}`}
                        defaultFiltered={filter}
                        defaultSorted={[{ id: 'name' }]}
                        emptyPlaceholder={{
                            icon: VpnKey,
                            iconStyle: { height: '120px', width: '120px' },
                            text: formatMessage(cspDomainMsgs.tableEmptyCredentialsPlaceholder),
                        }}
                        title={formatMessage(cspDomainMsgs.cspCredentialsTableTitle)}
                    />
                </div>
            </div>
        );
    }
}

// Property type validation
CSPCredentials.propTypes = {
    cspCredentialsData: PropTypes.object,
    cspDomainType: PropTypes.string,
    deleteCredential: PropTypes.func,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    openModal: PropTypes.func,
    patchCredential: PropTypes.func,
};

export default withRouter(injectIntl(CSPCredentials));
