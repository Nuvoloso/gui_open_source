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
import { intlShape, injectIntl } from 'react-intl';
import { Warning } from '@material-ui/icons';

import { errorBoundaryMsgs } from './messages/ErrorBoundary';
import './errorboundary.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null, errorInfo: null };
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        const { error, errorInfo } = this.state;
        const { componentStack } = errorInfo || {};

        if (errorInfo) {
            // Error path
            return (
                <div className="error-boundary">
                    <Warning className="error-boundary-icon" style={{ height: '48px', width: '48px' }} />
                    <div className="error-boundary-title">{formatMessage(errorBoundaryMsgs.somethingWrongMessage)}</div>
                    <div className="error-boundary-subtitle">{formatMessage(errorBoundaryMsgs.reloadInstruction)}</div>
                    <details className="error-boundary-details">
                        {error ? error.toString() : null}
                        <br />
                        {componentStack}
                    </details>
                </div>
            );
        }
        // Normally, just render children
        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
};

export default injectIntl(ErrorBoundary);
