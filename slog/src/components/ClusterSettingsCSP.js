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

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import SelectOptions from './SelectOptions';

import { clusterMsgs } from '../messages/Cluster';
import { ATTRIBUTE_AWS } from '../reducers/csps';

import * as constants from '../constants';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import pencil from '../pencil.svg';
import pencilUp from '../pencil-up.svg';

class ClusterSettingsCSP extends Component {
    constructor(props) {
        super(props);

        this.state = {
            cspDomainAttributes: ATTRIBUTE_AWS,
            edit: false,
            editCspCredentialId: '',
            managementHost: '',
            name: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAttributes = this.handleChangeAttributes.bind(this);
        this.handleChangeTags = this.handleChangeTags.bind(this);
        this.handleClickEdit = this.handleClickEdit.bind(this);
        this.handleEditChangeCredential = this.handleEditChangeCredential.bind(this);
        this.save = this.save.bind(this);
    }

    handleChange(name, value) {
        this.setState({ [name]: value });
    }

    handleClickEdit() {
        const { edit } = this.state;

        if (!edit) {
            const { csp } = this.props;
            const { cspCredentialId, name, cspDomainAttributes, managementHost } = csp;

            this.setState({ name, cspDomainAttributes, managementHost, editCspCredentialId: cspCredentialId });
        }
        this.setState({ edit: !edit });
    }

    handleChangeAttributes(name, value) {
        const { cspDomainAttributes } = this.state;

        this.setState({
            cspDomainAttributes: {
                ...cspDomainAttributes,
                [name]: {
                    kind: cspDomainAttributes[name].kind,
                    value: value,
                },
            },
        });
    }

    renderFetchStatus() {
        const { loading } = this.props;

        if (loading) {
            return <Loader />;
        }
    }

    save() {
        const { csp = {}, saveSettings } = this.props;
        const { cspCredentialId, meta } = csp;
        const { id } = meta;
        const { edit, editCspCredentialId, name, cspDomainAttributes, managementHost } = this.state;
        const params = {
            ...(editCspCredentialId !== cspCredentialId && { cspCredentialId: editCspCredentialId }),
            cspDomainAttributes,
            managementHost,
            name,
        };

        saveSettings(id, params);
        this.setState({
            cspDomainAttributes: ATTRIBUTE_AWS,
            edit: !edit,
            editCspCredentialId: '',
            managementHost: '',
            name: '',
        });
    }

    handleChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};

        this.setState({ tags: value });
    }

    handleEditChangeCredential(selectedItem) {
        const { value = '' } = selectedItem || {};

        this.setState({ editCspCredentialId: value });
    }

    renderRegionZoneInfo() {
        const { csp, intl } = this.props;
        const { formatMessage } = intl;
        const { cspDomainAttributes = {}, cspDomainType } = csp || {};

        switch (cspDomainType) {
            case constants.CSP_DOMAINS.AWS: {
                const region =
                    cspDomainAttributes[constants.AWS_REGION] && cspDomainAttributes[constants.AWS_REGION].value;
                const zone =
                    (csp &&
                        cspDomainAttributes &&
                        cspDomainAttributes[constants.AWS_AVAILABILITY_ZONE] &&
                        cspDomainAttributes[constants.AWS_AVAILABILITY_ZONE].value) ||
                    '';
                return (
                    <Fragment>
                        <div className="resource-settings-row-2-col">
                            <div className="resource-settings-col-1">
                                <FieldGroup
                                    label={formatMessage(clusterMsgs.accessRegionLabel)}
                                    name="aws_region"
                                    placeholder={formatMessage(clusterMsgs.enterRegionPlaceholder)}
                                    type="static"
                                    value={region}
                                />
                            </div>
                        </div>
                        <div className="resource-settings-row-2-col">
                            <div className="resource-settings-col-1">
                                <FieldGroup
                                    label={formatMessage(clusterMsgs.accessZoneLabel)}
                                    name="aws_availability_zone"
                                    placeholder={formatMessage(clusterMsgs.enterZonePlaceholder)}
                                    type="static"
                                    value={zone}
                                />
                            </div>
                        </div>
                    </Fragment>
                );
            }
            case constants.CSP_DOMAINS.GCP: {
                const zone = cspDomainAttributes[constants.GC_ZONE] && cspDomainAttributes[constants.GC_ZONE].value;

                return (
                    <Fragment>
                        <div className="resource-settings-row-2-col">
                            <div className="resource-settings-col-1">
                                <FieldGroup
                                    label={formatMessage(clusterMsgs.zoneLabel)}
                                    name="aws_availability_zone"
                                    placeholder={formatMessage(clusterMsgs.enterZonePlaceholder)}
                                    type="static"
                                    value={zone}
                                />
                            </div>
                        </div>
                    </Fragment>
                );
            }
            default:
                return null;
        }
    }

    render() {
        const { edit, editCspCredentialId, managementHost: editManagementHost, name: editName } = this.state;
        const { cspCredentialsData, csp = {}, disableEdit, hideCredential, intl } = this.props;
        const { cspCredentials = [] } = cspCredentialsData || {};
        const { formatMessage } = intl;

        const name = edit ? editName : csp.name;
        const managementHost = edit ? editManagementHost : csp.managementHost;
        const cspDomainType = csp.cspDomainType; // not editable
        const cspCredential = cspCredentials.find(cspCredential => cspCredential.meta.id === csp.cspCredentialId);
        const { name: cspName = '' } = cspCredential || {};
        const initialId = editCspCredentialId ? editCspCredentialId : csp.cspCredentialId;
        const initialCsp = edit ? cspCredentials.find(cred => cred.meta.id === initialId) : {};
        const initialValues =
            edit && !hideCredential
                ? {
                      label: initialCsp.name,
                      value: initialCsp.meta.id,
                  }
                : {};

        const disabled = !(
            edit &&
            (editName !== csp.name ||
                editManagementHost !== csp.managementHost ||
                editCspCredentialId !== csp.cspCredentialId)
        );

        return (
            <div className="resource-settings">
                {this.renderFetchStatus()}
                <div className="resource-settings-header">
                    <div className="resource-settings-header-name">{formatMessage(clusterMsgs.cspDomainLabel)}</div>
                    {!disableEdit ? (
                        <Fragment>
                            <div id="dialog-save-exit">
                                <ButtonAction
                                    btnUp={btnAltSaveUp}
                                    btnHov={btnAltSaveHov}
                                    btnDisable={btnAltSaveDisable}
                                    disabled={disabled}
                                    onClick={this.save}
                                />
                                {edit ? (
                                    <ButtonAction
                                        btnUp={btnCancelUp}
                                        btnHov={btnCancelHov}
                                        onClick={this.handleClickEdit}
                                    />
                                ) : (
                                    <ButtonAction btnUp={pencilUp} btnHov={pencil} onClick={this.handleClickEdit} />
                                )}
                            </div>
                        </Fragment>
                    ) : null}
                </div>
                <div className="resource-settings-row-2-col">
                    <div className="resource-settings-col-1">
                        <FieldGroup
                            label={formatMessage(clusterMsgs.domainNameLabel)}
                            name="name"
                            onChange={this.handleChange}
                            placeholder={formatMessage(clusterMsgs.namePlaceholder)}
                            type={edit ? 'text' : 'static'}
                            value={name}
                        />
                    </div>
                    <div className="resource-settings-col-2">
                        <FieldGroup
                            label={formatMessage(clusterMsgs.managementHostLabel)}
                            name="managementHost"
                            onChange={this.handleChange}
                            placeholder={formatMessage(clusterMsgs.enterHostPlaceholder)}
                            type={edit ? 'text' : 'static'}
                            value={managementHost}
                        />
                    </div>
                </div>
                <div className="resource-settings-row-2-col">
                    <div className="resource-settings-col-1">
                        <FieldGroup
                            label={formatMessage(clusterMsgs.serviceProviderLabel)}
                            name="cspDomainType"
                            placeholder={formatMessage(clusterMsgs.selectProviderPlaceholder)}
                            type="static"
                            value={cspDomainType}
                        />
                    </div>
                    {!hideCredential ? (
                        <div className="resource-settings-col-2">
                            {edit ? (
                                <FieldGroup
                                    inputComponent={
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
                                    }
                                    className="field-group-left"
                                    label={formatMessage(clusterMsgs.cspCSPCredentialLabel)}
                                />
                            ) : (
                                <FieldGroup
                                    label={formatMessage(clusterMsgs.cspCSPCredentialLabel)}
                                    name="cspCredential"
                                    type="static"
                                    value={cspName}
                                />
                            )}
                        </div>
                    ) : null}
                </div>
                {this.renderRegionZoneInfo()}
            </div>
        );
    }
}

ClusterSettingsCSP.defaultProps = {
    disableEdit: false,
};

ClusterSettingsCSP.propTypes = {
    csp: PropTypes.object,
    cspCredentialsData: PropTypes.object,
    disableEdit: PropTypes.bool,
    hideCredential: PropTypes.bool,
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
    saveSettings: PropTypes.func,
};

export default injectIntl(ClusterSettingsCSP);
