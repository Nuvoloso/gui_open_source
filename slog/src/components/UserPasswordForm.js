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

import FieldGroup from './FieldGroup';
import { messages } from '../messages/Messages';
import { userMsgs } from '../messages/User';

class UserPasswordForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            confirmPassword: '',
            password: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(name, value) {
        if (name) {
            this.setState({ [name]: value });
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        const { closeModal, config, values } = this.props;
        const { id } = values || {};
        const { patchUser } = config;
        const { password } = this.state;

        closeModal();
        patchUser(id, { password });
    }

    isSubmitDisabled() {
        const { confirmPassword, password } = this.state;

        if (!password || password !== confirmPassword) {
            return true;
        }

        return false;
    }

    render() {
        const { closeModal, intl } = this.props;
        const { formatMessage } = intl;
        const { confirmPassword, password } = this.state;

        const isSubmitDisabled = this.isSubmitDisabled();
        const labelMinWidth = '150px';

        return (
            <div>
                <div className="modalContent">
                    <FieldGroup
                        id="userPasswordFormNewPassword"
                        label={formatMessage(userMsgs.newPasswordLabel)}
                        labelMinWidth={labelMinWidth}
                        name="password"
                        onChange={this.handleChange}
                        placeholder={formatMessage(userMsgs.newPasswordPlaceholder)}
                        type="password"
                        value={password}
                    />
                    <FieldGroup
                        id="userPasswordFormConfirmNewPassword"
                        label={formatMessage(userMsgs.confirmNewPasswordLabel)}
                        labelMinWidth={labelMinWidth}
                        name="confirmPassword"
                        onChange={this.handleChange}
                        placeholder={formatMessage(userMsgs.confirmNewPasswordPlaceholder)}
                        type="password"
                        value={confirmPassword}
                    />
                </div>
                <div className="modal-footer">
                    <Button
                        id="userPasswordFormButtonSubmit"
                        bsStyle="primary"
                        disabled={isSubmitDisabled}
                        onClick={this.handleSubmit}
                        type="submit"
                    >
                        {formatMessage(messages.submit)}
                    </Button>
                    <Button onClick={closeModal}>{formatMessage(messages.cancel)}</Button>
                </div>
            </div>
        );
    }
}

UserPasswordForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    data: PropTypes.array,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(UserPasswordForm);
