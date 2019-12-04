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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Button } from 'react-bootstrap';

import { messages } from '../messages/Messages';
import '../styles.css';

class Alert extends Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        const { closeModal, config } = this.props;
        const { submit } = config || {};

        if (submit) {
            submit();
        }

        closeModal();
    }

    render() {
        const { closeModal, config, intl, values } = this.props;
        const { formatMessage } = intl;
        const { submit } = config || {};
        const { content } = values || {};

        return (
            <Fragment>
                <div className="modalContent">
                    <div className="mb10">{content || formatMessage(messages.alertMsg)}</div>
                </div>
                <div className="modal-footer">
                    <Button bsStyle="primary" onClick={this.handleSubmit}>
                        {formatMessage(messages.ok)}
                    </Button>
                    {submit ? <Button onClick={closeModal}>{formatMessage(messages.cancel)}</Button> : null}
                </div>
            </Fragment>
        );
    }
}

Alert.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(Alert);
