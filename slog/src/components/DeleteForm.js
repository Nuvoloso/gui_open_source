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
import { Button } from 'react-bootstrap';

import { messages } from '../messages/Messages';

class DeleteForm extends Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // grab the information for the items, hide the modal, and send the DELETE
    handleSubmit(event) {
        event.preventDefault();

        const { closeModal, config, values } = this.props;
        const { data } = values || {};
        const { deleteFunc } = config;

        closeModal();
        deleteFunc(data);
    }

    render() {
        const { closeModal, intl, values } = this.props;
        const { formatMessage } = intl;
        const { message } = values || {};

        return (
            <div>
                <div className="modalContent">{message || formatMessage(messages.alertMsg)}</div>
                <div className="modal-footer">
                    <Button id="deleteFormButtonDelete" bsStyle="primary" onClick={this.handleSubmit} type="submit">
                        {formatMessage(messages.delete)}
                    </Button>
                    <Button onClick={closeModal}>{formatMessage(messages.cancel)}</Button>
                </div>
            </div>
        );
    }
}

DeleteForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    data: PropTypes.array,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(DeleteForm);
