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

import TimePeriodSelection from '../components/TimePeriodSelection.js';

import { setTimePeriod } from '../actions/uiSettingActions';

class TimePeriodSelectionContainer extends Component {
    constructor(props) {
        super(props);
        this.changeTimePeriod = this.changeTimePeriod.bind(this);
    }

    changeTimePeriod(newPeriod) {
        const { dispatch } = this.props;

        dispatch(setTimePeriod(newPeriod));
    }

    render() {
        const { uiSettings } = this.props;

        return <TimePeriodSelection period={uiSettings.period} selectTimePeriod={this.changeTimePeriod} />;
    }
}

TimePeriodSelectionContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    uiSettings: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { uiSettings } = state;
    return {
        uiSettings,
    };
}

export default connect(mapStateToProps)(TimePeriodSelectionContainer);
