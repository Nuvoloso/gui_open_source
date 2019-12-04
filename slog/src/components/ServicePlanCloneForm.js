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
import { Button, ButtonToolbar, Form, FormControl, Modal } from 'react-bootstrap';

import FieldGroupHorizontal from './FieldGroupHorizontal';
import { messages } from '../messages/Messages';
import { servicePlanMsgs } from '../messages/ServicePlan';

class ServicePlanCloneForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.name.focus();
    }

    disableSubmit() {
        const { values } = this.props;
        const { servicePlan } = values || {};
        const { name: oldName } = servicePlan || {};
        const { name: newName } = this.state;

        return !newName || newName === oldName;
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();

        const { closeModal, config, values } = this.props;
        const { submit } = config;
        const { servicePlan } = values || {};
        const { id } = servicePlan || {};
        const { name } = this.state;

        closeModal();
        submit(id, name);
    }

    render() {
        const { closeModal, intl } = this.props;
        const { formatMessage } = intl;
        const { name } = this.state;

        return (
            <Form className="modalContent" horizontal onSubmit={this.handleSubmit}>
                <FieldGroupHorizontal label={formatMessage(servicePlanMsgs.cloneNameLabel)}>
                    <FormControl
                        componentClass="input"
                        inputRef={ref => {
                            this.name = ref;
                        }}
                        name="name"
                        onChange={this.handleChange}
                        placeholder={formatMessage(servicePlanMsgs.cloneNamePlaceholder)}
                        value={name}
                    />
                    <FormControl.Feedback />
                </FieldGroupHorizontal>
                <Modal.Footer>
                    <ButtonToolbar>
                        <Button bsStyle="primary" className="pull-right" disabled={this.disableSubmit()} type="submit">
                            {formatMessage(messages.submit)}
                        </Button>
                        <Button bsStyle="link" className="pull-right" onClick={closeModal}>
                            {formatMessage(messages.cancel)}
                        </Button>
                    </ButtonToolbar>
                </Modal.Footer>
            </Form>
        );
    }
}

ServicePlanCloneForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.shape({
        submit: PropTypes.func.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.shape({
        servicePlan: PropTypes.object.isRequired,
    }).isRequired,
};

export default injectIntl(ServicePlanCloneForm);
