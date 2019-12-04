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
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import RecoverHistory from '../components/RecoverHistory';
import Loader from '../components/Loader';

class RecoverHistoryContainer extends Component {
    render() {
        const {
            consistencyGroupsData = {},
            volumeSeriesData = {},
            volumeSeriesRequestsCompletedData = {},
        } = this.props;
        const { volumeSeriesRequestsCompleted = [] } = volumeSeriesRequestsCompletedData;

        if (consistencyGroupsData.loading || volumeSeriesData.loading || volumeSeriesRequestsCompletedData.loading) {
            return <Loader />;
        }

        return (
            <RecoverHistory
                consistencyGroupsData={consistencyGroupsData}
                volumeSeriesData={volumeSeriesData}
                volumeSeriesRequestsCompleted={volumeSeriesRequestsCompleted}
            />
        );
    }
}

RecoverHistoryContainer.propTypes = {
    consistencyGroupsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
    volumeSeriesRequestsCompletedData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { consistencyGroupsData, volumeSeriesData, volumeSeriesRequestsCompletedData } = state;
    return {
        consistencyGroupsData,
        volumeSeriesData,
        volumeSeriesRequestsCompletedData,
    };
}

export default connect(mapStateToProps)(injectIntl(RecoverHistoryContainer));
