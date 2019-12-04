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

import { clusterMsgs } from '../messages/Cluster';
import { renderTags } from './utils';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import pencil from '../pencil.svg';
import pencilUp from '../pencil-up.svg';

class ClusterSettingsMeta extends Component {
    constructor(props) {
        super(props);

        this.state = {
            edit: false,
            name: '',
            description: '',
            tags: [],
        };

        this.handleClickEdit = this.handleClickEdit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.save = this.save.bind(this);
        this.handleChangeTags = this.handleChangeTags.bind(this);
    }

    handleChange(name, value) {
        this.setState({ [name]: value });
    }

    handleClickEdit() {
        const { edit } = this.state;

        if (!edit) {
            const { cluster } = this.props;

            const { name, description, tags } = cluster;

            this.setState({ name, description, tags });
        }
        this.setState({ edit: !edit });
    }

    renderFetchStatus() {
        const { loading } = this.props;

        if (loading) {
            return <Loader />;
        }
    }

    save() {
        const { cluster = {}, saveSettings } = this.props;
        const { meta } = cluster;
        const { id } = meta;
        const { edit, name, description, tags } = this.state;

        saveSettings(id, name, description, tags);
        this.setState({ edit: !edit, name: '', description: '', tags: [] });
    }

    handleChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};

        this.setState({ tags: value });
    }

    render() {
        const { edit, description: editDescription, name: editName, tags: editTags } = this.state;
        const { intl, cluster = {}, disableEdit } = this.props;
        const { formatMessage } = intl;

        const description = edit ? editDescription : cluster.description;
        const name = edit ? editName : cluster.name;
        const tags = edit ? editTags : cluster.tags || [];

        let disabled = !(
            edit &&
            (editDescription !== cluster.description || editName !== cluster.name || !_.isEqual(editTags, cluster.tags))
        );

        return (
            <div className="resource-settings">
                {this.renderFetchStatus()}
                <div className="resource-settings-header">
                    <div className="resource-settings-header-name">
                        {formatMessage(clusterMsgs.settingsMetadataTitle)}
                    </div>
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
                <div className="resource-settings-row">
                    <div className="resource-settings-col-1">
                        <FieldGroup
                            label={formatMessage(clusterMsgs.clusterNameLabel)}
                            className="name-highlighted"
                            name="name"
                            onChange={this.handleChange}
                            placeholder={formatMessage(clusterMsgs.namePlaceholder)}
                            type={edit ? 'text' : 'static'}
                            value={name}
                        />
                    </div>
                    <div className="resource-settings-col-2">
                        <FieldGroup
                            label={formatMessage(clusterMsgs.clusterDescriptionLabel)}
                            name="description"
                            onChange={this.handleChange}
                            placeholder={formatMessage(clusterMsgs.descriptionPlaceholder)}
                            type={edit ? 'textarea' : 'static'}
                            value={description}
                        />
                    </div>
                    <div className="resource-settings-col-3">
                        <FieldGroup
                            label={formatMessage(clusterMsgs.clusterTagsLabel)}
                            name="tags"
                            inputComponent={<SelectTags onChange={this.handleChangeTags} tags={tags} />}
                            type={edit ? null : 'static'}
                            value={renderTags(tags)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

ClusterSettingsMeta.defaultProps = {
    disableEdit: false,
};

ClusterSettingsMeta.propTypes = {
    cluster: PropTypes.object,
    disableEdit: PropTypes.bool,
    intl: intlShape.isRequired,
    loading: PropTypes.bool,
    saveSettings: PropTypes.func,
};

export default injectIntl(ClusterSettingsMeta);
