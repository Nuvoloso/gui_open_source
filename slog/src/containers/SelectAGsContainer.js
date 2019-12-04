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

import SelectOptions from '../components/SelectOptions';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';

class SelectAGsContainer extends Component {
    render() {
        const { applicationGroupsData, createNew, disabled, existing = [], intl, onChangeGroup } = this.props;
        const { applicationGroups = [], loading } = applicationGroupsData || {};
        const { formatMessage } = intl;

        const options = applicationGroups.map(group => {
            return { value: group.meta.id, label: group.name };
        });

        const initialValues = [];
        existing.forEach(group => {
            const ag = applicationGroups.find(ag => {
                return ag.meta.id === group;
            });
            if (ag) {
                initialValues.push({ value: ag.meta.id, label: ag.name });
            }
        });

        return (
            <SelectOptions
                disabled={disabled}
                id="selectAGsContainer"
                initialValues={initialValues}
                isLoading={loading}
                isMulti
                onChange={onChangeGroup}
                options={options}
                placeholder={createNew ? formatMessage(volumeSeriesMsgs.groupPlaceholder) : ''}
            />
        );
    }
}

SelectAGsContainer.propTypes = {
    applicationGroupsData: PropTypes.object.isRequired,
    createNew: PropTypes.bool,
    disabled: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    existing: PropTypes.array,
    intl: intlShape.isRequired,
    onChangeGroup: PropTypes.func,
};

SelectAGsContainer.defaultProps = {
    disabled: false,
};

function mapStateToProps(state) {
    const { applicationGroupsData } = state;
    return {
        applicationGroupsData,
    };
}

export default connect(mapStateToProps)(injectIntl(SelectAGsContainer));
