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

import { aboutMsgs } from '../messages/About';

class About extends Component {
    constructor(props, context) {
        super(props, context);

        this.openLicenseWindow = this.openLicenseWindow.bind(this);
    }

    openLicenseWindow() {
        window.open('https://nuvoloso.com', '_blank');
    }

    render() {
        const { intl, settings } = this.props;
        const { formatMessage } = intl;
        const { version = '' } = settings || {};

        return (
            <div className="mt15 mr15 mb15 ml15">
                <div className="mt10 dialog-title">{formatMessage(aboutMsgs.aboutAcknowledgementsTitle)}</div>
                <div className="content-text-14 mt10">{formatMessage(aboutMsgs.aboutAcknowledgementsText)}</div>
                <div className="text-left value-link">
                    <div id="oss-license-link" onClick={this.openLicenseWindow}>
                        {formatMessage(aboutMsgs.aboutLicenseLink)}
                    </div>
                </div>
                <div className="mt10 divider-horizontal-margins" />
                <div className="mt10 dialog-title">{formatMessage(aboutMsgs.aboutVersionInformationTitle)}</div>
                <div className="content-text-14 mt10">{version}</div>
            </div>
        );
    }
}

About.propTypes = {
    intl: intlShape.isRequired,
    settings: PropTypes.object,
};

export default injectIntl(About);
