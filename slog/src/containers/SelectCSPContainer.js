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

import { clusterMsgs } from '../messages/Cluster';

class SelectCSPContainer extends Component {
    render() {
        const { cspsData, existing = [], intl, onChangeCsp } = this.props;
        const { csps = [], loading } = cspsData || {};
        const { formatMessage } = intl;

        const options = csps.map(csp => {
            return { value: csp.meta.id, label: csp.name };
        });

        const initialValues = [];
        existing.forEach(cspId => {
            const csp = csps.find(csp => {
                return csp.meta.id === cspId;
            });
            if (csp) {
                initialValues.push({ value: csp.meta.id, label: csp.name });
            }
        });

        return (
            <SelectOptions
                disabled={false}
                id="selectCSPContainer"
                initialValues={initialValues}
                isLoading={loading}
                onChange={onChangeCsp}
                options={options}
                placeholder={formatMessage(clusterMsgs.selectExistingCsp)}
            />
        );
    }
}

SelectCSPContainer.propTypes = {
    cspsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    existing: PropTypes.array.isRequired,
    intl: intlShape.isRequired,
    onChangeCsp: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const { cspsData } = state;
    return {
        cspsData,
    };
}

export default connect(mapStateToProps)(injectIntl(SelectCSPContainer));
