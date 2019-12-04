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
import { withRouter } from 'react-router-dom';
import { CSSTransitionGroup } from 'react-transition-group';

import * as types from '../actions/types';
import { ALERT_TYPES } from '../components/AlertMessageConstants';
import AlertMessage from '../components/AlertMessage';

class AlertMessagesContainer extends Component {
    constructor(props) {
        super(props);

        this.closeAlert = this.closeAlert.bind(this);
        this.closeError = this.closeError.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { dispatch, location } = this.props;
        const { pathname } = location || {};
        const { location: prevLocation } = prevProps;
        const { pathname: prevPathname } = prevLocation || {};

        if (prevPathname !== pathname) {
            dispatch({ type: types.CLEAR_ALL_MESSAGES });
        }
    }

    closeAlert(message) {
        const { dispatch } = this.props;
        dispatch({ type: types.REMOVE_ALERT_MESSAGE, message });
    }

    closeError(message) {
        const { dispatch } = this.props;
        dispatch({ type: types.REMOVE_ERROR_MESSAGE, message });
    }

    /**
     * dedupedMessages is an array of objects with the attributes:
     * duplicates: number of duplicates
     * message: error message as a string
     */
    getDedupedMessages(messages = []) {
        const dedupedMessages = [];

        messages.forEach(message => {
            const idx = dedupedMessages.findIndex(dedupedMessage => dedupedMessage.message === message);

            if (idx >= 0) {
                const { duplicates = 0 } = dedupedMessages[idx] || {};
                dedupedMessages[idx].duplicates = duplicates + 1;
            } else {
                dedupedMessages.push({
                    duplicates: 0,
                    message,
                });
            }
        });

        return dedupedMessages;
    }

    render() {
        const { alertMessages } = this.props;
        const { alerts = [], errors = [] } = alertMessages || {};

        if (alerts.length === 0 && errors.length === 0) {
            return null;
        }

        const dedupedErrors = this.getDedupedMessages(errors);
        const dedupedAlerts = this.getDedupedMessages(alerts);

        return (
            <div className="alert-messages-container" key="alert-messages-container">
                <CSSTransitionGroup
                    transitionName="alert-messages"
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={100}
                >
                    {dedupedErrors.map((dedupedError, idx) => {
                        const { duplicates, message } = dedupedError || {};

                        return (
                            <AlertMessage
                                closeAlert={this.closeError}
                                duplicates={duplicates}
                                key={idx}
                                level={ALERT_TYPES.ERROR}
                                message={message}
                            />
                        );
                    })}
                </CSSTransitionGroup>
                <CSSTransitionGroup
                    transitionName="alert-messages"
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={100}
                >
                    {dedupedAlerts.map((dedupedAlert, idx) => {
                        const { duplicates, message } = dedupedAlert || {};

                        return (
                            <AlertMessage
                                closeAlert={this.closeAlert}
                                duplicates={duplicates}
                                key={idx}
                                message={message}
                            />
                        );
                    })}
                </CSSTransitionGroup>
            </div>
        );
    }
}

AlertMessagesContainer.propTypes = {
    alertMessages: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { alertMessages } = state;
    return {
        alertMessages,
    };
}

export default withRouter(connect(mapStateToProps)(AlertMessagesContainer));
