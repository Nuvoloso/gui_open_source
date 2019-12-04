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
import { Tab, Tabs } from 'react-bootstrap';

import About from '../components/About';

import { getRoles } from '../actions/roleActions';
import { getVersion } from '../actions/settingsActions';
import { aboutMsgs } from '../messages/About';

import * as types from '../actions/types';

class SettingsContainer extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(getVersion());
    }

    handleSelect(key) {
        const { dispatch } = this.props;
        dispatch(getRoles());
        dispatch({ type: types.SET_SETTINGS_TAB, tab: key });
    }

    render() {
        const { intl, settings, uiSettings } = this.props;
        const { formatMessage } = intl;
        const { settingsTab } = uiSettings;

        return (
            <Tabs
                activeKey={settingsTab}
                className="tabs-container"
                id="settings-tabs"
                mountOnEnter
                onSelect={this.handleSelect}
            >
                <Tab eventKey={0} title={formatMessage(aboutMsgs.aboutTab)}>
                    <About settings={settings} />
                </Tab>
            </Tabs>
        );
    }
}

SettingsContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    settings: PropTypes.object.isRequired,
    uiSettings: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { settings, uiSettings } = state;
    return {
        settings,
        uiSettings,
    };
}

export default connect(mapStateToProps)(injectIntl(SettingsContainer));
