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

class SelectCGsContainer extends Component {
    render() {
        const { consistencyGroupsData, createNew, disabled, existing, intl, onChangeGroup, placeHolder } = this.props;
        const { consistencyGroups = [], loading } = consistencyGroupsData || {};
        const { formatMessage } = intl;

        const options = consistencyGroups.map(group => {
            return { value: group.meta.id, label: group.name };
        });

        const cg = consistencyGroups.find(cg => {
            return cg.meta.id === existing;
        });
        const initialValues = cg ? { value: cg.meta.id, label: cg.name } : null;

        let placeHolderValue = '';
        if (placeHolder) {
            placeHolderValue = placeHolder;
        } else {
            placeHolderValue = createNew ? formatMessage(volumeSeriesMsgs.groupPlaceholder) : '';
        }

        return (
            <SelectOptions
                disabled={disabled}
                id="selectCGsContainer"
                initialValues={initialValues}
                isLoading={loading}
                onChange={onChangeGroup}
                options={options}
                placeholder={placeHolderValue}
            />
        );
    }
}

SelectCGsContainer.propTypes = {
    consistencyGroupsData: PropTypes.object.isRequired,
    createNew: PropTypes.bool,
    disabled: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    existing: PropTypes.string,
    intl: intlShape.isRequired,
    onChangeGroup: PropTypes.func,
    placeHolder: PropTypes.string,
};

SelectCGsContainer.defaultProps = {
    disabled: false,
};

function mapStateToProps(state) {
    const { consistencyGroupsData } = state;
    return {
        consistencyGroupsData,
    };
}

export default connect(mapStateToProps)(injectIntl(SelectCGsContainer));
