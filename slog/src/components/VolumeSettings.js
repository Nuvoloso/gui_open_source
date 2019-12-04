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
import _ from 'lodash';

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import SelectTags from './SelectTags';

import { servicePlanMsgs } from '../messages/ServicePlan';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';
import { bytesToUnit, formatBytes, renderTags } from './utils';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import pencil from '../pencil.svg';
import pencilUp from '../pencil-up.svg';

import * as constants from '../constants';

class VolumeSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            editDescription: '',
            editName: '',
            editTags: [],
            snapTags: [],
        };

        this.getStatus = this.getStatus.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeTags = this.handleChangeTags.bind(this);
        this.handleClickCancel = this.handleClickCancel.bind(this);
        this.handleClickEdit = this.handleClickEdit.bind(this);
        this.handleClickSave = this.handleClickSave.bind(this);
    }

    handleChange(name, value) {
        this.setState({ [name]: value });
    }

    handleChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ editTags: value });
    }

    handleClickCancel() {
        this.setState({ edit: false });
    }

    handleClickEdit() {
        const { volume } = this.props;
        const { description, name, tags } = volume || {};
        const editTags = (tags && tags.filter(tag => !tag.startsWith('snap-'))) || [];
        const snapTags = (tags && tags.filter(tag => tag.startsWith('snap-'))) || [];

        this.setState({ edit: true, editDescription: description, editName: name, editTags, snapTags });
    }

    handleClickSave() {
        const { onPatchVolume, volume } = this.props;

        if (onPatchVolume && volume) {
            const { description, meta, name, tags } = volume || {};
            const { id } = meta || {};
            const { editDescription, editName, editTags, snapTags } = this.state;
            const params = {
                ...(editDescription !== description && { description: editDescription }),
                ...(editName !== name && { name: editName }),
                ...(!_.isEqual(editTags, tags.filter(tag => !tag.startsWith('snap-'))) && { tags: editTags }),
            };

            if (params.tags) {
                params.tags = [...params.tags, ...snapTags];
            }

            onPatchVolume(id, null, params);
            this.setState({ edit: false });
        }
    }

    disableSubmit() {
        const { volume } = this.props;
        const { description, name, tags } = volume || {};
        const { editDescription, editName, editTags } = this.state;

        return (
            editDescription === description &&
            editName === name &&
            _.isEqual(editTags, tags.filter(tag => !tag.startsWith('snap-')))
        );
    }

    renderFetchStatus() {
        const { loading } = this.props;

        if (loading) {
            return <Loader />;
        }
    }

    renderPerformance(sizeBytes) {
        const { intl, servicePlan } = this.props;
        const { formatMessage } = intl;
        const { provisioningUnit } = servicePlan || {};
        const { iOPS = 0, throughput = 0 } = provisioningUnit || {};

        const multiplier = bytesToUnit(sizeBytes) || 0;

        if (iOPS) {
            return `${multiplier * iOPS} ${formatMessage(servicePlanMsgs.iops)}`;
        }

        return formatMessage(servicePlanMsgs.provisioningUnitThroughputValue, {
            formattedBytes: formatBytes(multiplier * throughput, true),
        });
    }

    getStatus(violationLevel) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (violationLevel) {
            case constants.METRIC_VIOLATION_LEVELS.ERROR:
                return formatMessage(volumeSeriesMsgs.statusError);
            case constants.METRIC_VIOLATION_LEVELS.WARNING:
                return formatMessage(volumeSeriesMsgs.statusWarning);
            case constants.METRIC_VIOLATION_LEVELS.OK:
                return formatMessage(volumeSeriesMsgs.statusOk);
            default:
                return '';
        }
    }

    render() {
        const { intl, servicePlan, volume } = this.props;
        const { formatMessage } = intl;
        const { name: servicePlanName } = servicePlan || {};
        const { description, name, sizeBytes = 0, spaAdditionalBytes = 0, tags } = volume || {};
        const { edit, editDescription, editName } = this.state;
        const disabled = this.disableSubmit();

        const displayTags = (tags && tags.filter(tag => !tag.startsWith('snap-'))) || [];

        return (
            <div className="dark resource-settings">
                {this.renderFetchStatus()}
                <div className="resource-settings-header">
                    <div className="resource-settings-header-name">
                        {formatMessage(volumeSeriesMsgs.settingsMetadataTitle)}
                    </div>
                    <div id="dialog-save-exit">
                        {edit ? (
                            <Fragment>
                                <ButtonAction
                                    btnUp={btnAltSaveUp}
                                    btnHov={btnAltSaveHov}
                                    btnDisable={btnAltSaveDisable}
                                    disabled={disabled}
                                    onClick={this.handleClickSave}
                                />
                                <ButtonAction
                                    btnUp={btnCancelUp}
                                    btnHov={btnCancelHov}
                                    onClick={this.handleClickCancel}
                                />
                            </Fragment>
                        ) : (
                            <ButtonAction btnUp={pencilUp} btnHov={pencil} onClick={this.handleClickEdit} />
                        )}
                    </div>
                </div>
                <div className="resource-settings-row">
                    <div className="resource-settings-col-1">
                        <FieldGroup
                            label={formatMessage(volumeSeriesMsgs.nameLabel)}
                            name="editName"
                            onChange={this.handleChange}
                            placeholder={formatMessage(volumeSeriesMsgs.namePlaceholder)}
                            styleInputWidth="300px"
                            type={edit ? 'text' : 'static'}
                            value={edit ? editName : name}
                        />
                    </div>
                    <div className="resource-settings-col-2">
                        <FieldGroup
                            label={formatMessage(volumeSeriesMsgs.settingsDescriptionLabel)}
                            name="editDescription"
                            onChange={this.handleChange}
                            placeholder={formatMessage(volumeSeriesMsgs.descriptionPlaceholder)}
                            styleInputWidth="300px"
                            type={edit ? 'textarea' : 'static'}
                            value={edit ? editDescription : description}
                        />
                    </div>
                    <div>
                        <FieldGroup
                            inputComponent={<SelectTags onChange={this.handleChangeTags} tags={displayTags} />}
                            label={formatMessage(volumeSeriesMsgs.settingsTagsLabel)}
                            name="editTags"
                            type={edit ? null : 'static'}
                            value={renderTags(displayTags)}
                        />
                    </div>
                </div>
                <div className="resource-settings-header">
                    <div className="resource-settings-header-name">
                        {formatMessage(volumeSeriesMsgs.settingsAllocationsTitle)}
                    </div>
                </div>
                <div className="resource-settings-row">
                    <div className="resource-settings-col-1">
                        <FieldGroup
                            label={formatMessage(volumeSeriesMsgs.servicePlanLabel)}
                            name="serviceplan"
                            onChange={this.handleChange}
                            placeholder={formatMessage(volumeSeriesMsgs.servicePlanPlaceholder)}
                            type="static"
                            value={servicePlanName}
                        />
                    </div>
                    <div className="resource-settings-col-2">
                        <FieldGroup
                            classNameLabel="wizard-form-label-static"
                            classNameValue="wizard-form-input-value"
                            inputComponent={
                                <div>
                                    {formatBytes(sizeBytes)}
                                    <span className="ml20">{this.renderPerformance(sizeBytes)}</span>
                                </div>
                            }
                            label={formatMessage(volumeSeriesMsgs.sizeLabel)}
                            name="size"
                        />
                    </div>
                    <div className="resource-settings-col-3">
                        <FieldGroup
                            classNameLabel="wizard-form-label-static"
                            classNameValue="wizard-form-input-value"
                            inputComponent={
                                <div>
                                    {formatBytes(sizeBytes + spaAdditionalBytes)}
                                    {spaAdditionalBytes > 0 ? (
                                        <Fragment>
                                            <span className="ml5">(+{formatBytes(spaAdditionalBytes)})</span>
                                            <span className="ml20">
                                                {this.renderPerformance(sizeBytes + spaAdditionalBytes)}
                                            </span>
                                        </Fragment>
                                    ) : null}
                                </div>
                            }
                            label={formatMessage(volumeSeriesMsgs.labelPerformanceCapacity)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

VolumeSettings.propTypes = {
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
    onPatchVolume: PropTypes.func,
    servicePlan: PropTypes.object,
    volume: PropTypes.object,
};

export default injectIntl(VolumeSettings);
