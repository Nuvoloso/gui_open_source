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
import { authMsgs } from '../messages/Auth';
import './login.css';

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            password: '',
            username: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.submitLogin = this.submitLogin.bind(this);
    }

    disableSubmit() {
        const { password, username } = this.state;

        return !password || !username;
    }

    handleChange(name, value) {
        this.setState({
            [name]: value,
        });
    }

    handleKeyPress(e) {
        const { key } = e || {};

        if (key === 'Enter' && !this.disableSubmit()) {
            this.submitLogin();
        }
    }

    submitLogin() {
        const { password, username } = this.state;
        const { config } = this.props;
        const { postLogin } = config;

        postLogin(username, password);
    }

    render() {
        const { password, username } = this.state;
        const { intl, values } = this.props;
        const { formatMessage } = intl;
        const { message = '' } = values || {};
        const messageValidationState = message.length > 0 ? 'error' : null;

        return (
            <div className="modal-content-main-box">
                <div className="modal-content-main">
                    <div className="login-title">{formatMessage(authMsgs.login)}</div>
                    <div className="login-fields">
                        <div className="login-field-label">{formatMessage(authMsgs.username)}</div>
                        <FieldGroup
                            id="loginUsername"
                            name="username"
                            onChange={this.handleChange}
                            onKeyPress={this.handleKeyPress}
                            placeholder={formatMessage(authMsgs.username)}
                            value={username}
                        />
                        <div className="login-field-label">{formatMessage(authMsgs.password)}</div>
                        <FieldGroup
                            id="loginPassword"
                            name="password"
                            onChange={this.handleChange}
                            onKeyPress={this.handleKeyPress}
                            placeholder={formatMessage(authMsgs.password)}
                            type="password"
                            value={password}
                        />
                        {messageValidationState ? <div className="login-field-error">{message}</div> : null}
                    </div>
                </div>
                <div className="modal-footer-center">
                    <Button
                        bsStyle="primary"
                        disabled={this.disableSubmit()}
                        id="loginSubmit"
                        onClick={this.submitLogin}
                    >
                        {formatMessage(authMsgs.login)}
                    </Button>
                </div>
            </div>
        );
    }
}

Login.propTypes = {
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(Login);
