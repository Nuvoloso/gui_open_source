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
import { withRouter } from 'react-router-dom';

import { messages } from '../messages/Messages';
import VolumeSeriesContainer from './VolumeSeriesContainer';
import ConsistencyGroupsContainer from './ConsistencyGroupsContainer';
import ApplicationGroupsContainer from './ApplicationGroupsContainer';

import * as types from '../actions/types';
import * as constants from '../constants';

class VolumesContainer extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(key) {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_VOLUMES_TAB, tab: key });
    }

    componentDidMount() {
        const { dispatch, location } = this.props;
        const { state } = location || {};
        const { tabKey } = state || {};

        if (tabKey) {
            dispatch({ type: types.SET_VOLUMES_TAB, tab: tabKey });
        }
    }

    render() {
        const { intl, uiSettings } = this.props;
        const { formatMessage } = intl;
        const { volumesTab } = uiSettings;

        return (
            <Tabs
                activeKey={volumesTab}
                className="tabs-container"
                id="volumes-tabs"
                mountOnEnter
                onSelect={this.handleSelect}
            >
                <Tab
                    eventKey={constants.VOLUMES_TABS.VOLUMES}
                    title={formatMessage(messages.volumesLabel, { count: 2 })}
                >
                    <VolumeSeriesContainer selectable />
                </Tab>
                <Tab
                    eventKey={constants.VOLUMES_TABS.APPLICATION_GROUPS}
                    title={formatMessage(messages.appGroupsLabel, { count: 2 })}
                >
                    <ApplicationGroupsContainer />
                </Tab>
                <Tab
                    eventKey={constants.VOLUMES_TABS.CONSISTENCY_GROUPS}
                    title={formatMessage(messages.consistencyGroupsLabel, { count: 2 })}
                >
                    <ConsistencyGroupsContainer />
                </Tab>
            </Tabs>
        );
    }
}

VolumesContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    uiSettings: PropTypes.object,
};

function mapStateToProps(state) {
    const { uiSettings } = state;
    return {
        uiSettings,
    };
}

export default withRouter(connect(mapStateToProps)(injectIntl(VolumesContainer)));
