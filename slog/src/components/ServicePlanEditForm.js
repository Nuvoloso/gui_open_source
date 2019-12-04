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
import {
    Button,
    ButtonToolbar,
    Col,
    ControlLabel,
    Form,
    FormControl,
    FormGroup,
    InputGroup,
    Modal,
    Row,
    Well,
} from 'react-bootstrap';
import _ from 'lodash';

import HighchartContainer from '../containers/HighchartContainer';
import SelectAccountsContainer from '../containers/SelectAccountsContainer';
import { messages } from '../messages/Messages';
import { servicePlanMsgs } from '../messages/ServicePlan';
import { equalAccountIds, getCostTag, getRandomIntInclusive, renderPropertiesForm } from './utils';
import '../styles.css';

const constants = require('../constants');

class ServicePlanEditForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accounts: [],
            capacityEph: 100,
            capacityExpected: 1000,
            capacityGp2: 300,
            capacityS3: 600,
            cost: '',
            description: '',
            name: '',
            slos: {},
            originalCost: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAccount = this.handleChangeAccount.bind(this);
        this.handleChangeProperties = this.handleChangeProperties.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        const { values } = this.props;
        const { servicePlan } = values;
        const { _original } = servicePlan;
        const { accounts = [], description = '', name = '', slos = {}, tags = {} } = _original || {};
        const cost = getCostTag(tags);
        const originalCost = getCostTag(tags);
        const accountIds = accounts.map(account => {
            return account.meta.id;
        });

        this.setState({
            accounts: accountIds,
            originalCost,
            cost,
            description,
            name,
            slos,
        });

        this.name.focus();
    }

    disableSubmit() {
        const { values } = this.props;
        const { servicePlan } = values || {};
        const { _original } = servicePlan;
        const { accounts: accountsOld, description: oldDescription, name: oldName, slos: oldSlos } = _original || {};
        const {
            cost: newCost,
            accounts: accountsNew,
            description: newDescription,
            name: newName,
            slos: newSlos,
        } = this.state;

        const oldCost = this.state.originalCost;

        return (
            !newName ||
            (newDescription === oldDescription &&
                newName === oldName &&
                _.isEqual(newSlos, oldSlos) &&
                equalAccountIds(
                    accountsOld.map(account => {
                        return account.meta.id;
                    }),
                    accountsNew
                ) &&
                _.isEqual(oldCost, newCost))
        );
    }

    handleChange(e) {
        if (e.target.name === 'capacityExpected') {
            const capacityExpected = e.target.value;
            const s3 = capacityExpected ? getRandomIntInclusive(capacityExpected / 2, capacityExpected - 1) : 0;
            const gp2 = capacityExpected ? getRandomIntInclusive(0, capacityExpected - s3) : 0;
            const eph = capacityExpected ? capacityExpected - s3 - gp2 : 0;
            this.setState({
                capacityEph: eph,
                capacityGp2: gp2,
                capacityS3: s3,
            });
        }

        this.setState({ [e.target.name]: e.target.value });
    }

    handleChangeProperties(e) {
        const { slos } = this.state;
        this.setState({
            slos: {
                ...slos,
                [e.target.name]: {
                    ...slos[e.target.name],
                    value: e.target.value,
                },
            },
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        const { closeModal, config, values } = this.props;
        const { submit } = config;
        const { servicePlan } = values || {};
        const { _original, id } = servicePlan || {};
        const { accounts, description, name, slos, cost } = this.state;

        /**
         * Service plan cost is stored in the tags attribute for the SP resource.
         */
        const tags = [`${constants.TAG_SERVICE_PLAN_COST}.${cost}`];

        closeModal();
        const params = {
            ...(description !== _original.description && { description }),
            ...(name !== _original.name && { name }),
            ...(!_.isEqual(slos, _original.slos) && { slos }),
            tags,
            ...(!equalAccountIds(_original.accounts.map(account => account.meta.id), accounts) && { accounts }),
        };
        submit(id, params);
    }

    handleChangeAccount(selectedItems) {
        const accounts = [];
        selectedItems.forEach(item => {
            accounts.push(item.value);
        });
        this.setState({ accounts });
    }

    renderCostInfo() {
        const { cost } = this.state;
        return (
            <div>
                <FormGroup className="mb0">
                    <Col componentClass={ControlLabel} md={5}>
                        End User Cost
                    </Col>
                    <Col md={7}>
                        <InputGroup>
                            <InputGroup.Addon>$</InputGroup.Addon>
                            <FormControl
                                componentClass="input"
                                id={`${constants.ID_SERVICE_PLAN_EDIT_FORM_COST}`}
                                inputRef={ref => {
                                    this.cost = ref;
                                }}
                                name="cost"
                                onChange={this.handleChange}
                                type="number"
                                value={cost}
                            />
                            <InputGroup.Addon>/ GB</InputGroup.Addon>
                        </InputGroup>
                    </Col>
                </FormGroup>
            </div>
        );
    }

    renderResourcesRequired() {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { capacityEph, capacityExpected, capacityGp2, capacityS3 } = this.state;
        const options = {
            chart: {
                type: 'bar',
            },
            credits: {
                enabled: false,
            },
            series: [
                {
                    name: 'Required',
                    data: [capacityEph, capacityGp2, capacityS3],
                    animation: false,
                },
                {
                    name: 'Available',
                    data: [250, 750, 1000],
                    animation: false,
                },
            ],
            subtitle: {
                text: 'Potential Resources Required',
            },
            title: {
                text: '',
            },
            xAxis: {
                categories: ['Ephemeral', 'EBS GP2', 'S3'],
            },
            yAxis: {
                title: {
                    text: 'GB',
                },
            },
        };
        return (
            <div>
                <ControlLabel>{formatMessage(servicePlanMsgs.capacityExpectedLabel)}</ControlLabel>
                <InputGroup>
                    <FormControl
                        componentClass="input"
                        inputRef={ref => {
                            this.capacityExpected = ref;
                        }}
                        name="capacityExpected"
                        onChange={this.handleChange}
                        placeholder={formatMessage(servicePlanMsgs.capacityExpectedPlaceholder)}
                        type="number"
                        value={capacityExpected}
                    />
                    <InputGroup.Addon>GB</InputGroup.Addon>
                </InputGroup>
                <HighchartContainer container={'servicePlanResourcesRequired'} options={options} />
            </div>
        );
    }

    render() {
        const { closeModal, intl } = this.props;
        const { formatMessage } = intl;
        const { accounts, description, name, slos } = this.state;

        return (
            <div>
                <Form className="modalContent" horizontal onSubmit={this.handleSubmit}>
                    <Row>
                        <Col sm={6}>
                            <div className="mb15">
                                <ControlLabel>{formatMessage(servicePlanMsgs.nameLabel)}</ControlLabel>
                                <FormControl
                                    componentClass="input"
                                    disabled
                                    inputRef={ref => {
                                        this.name = ref;
                                    }}
                                    name="name"
                                    onChange={this.handleChange}
                                    placeholder={formatMessage(servicePlanMsgs.namePlaceholder)}
                                    value={name}
                                />
                            </div>
                            <ControlLabel>{formatMessage(servicePlanMsgs.slosTitle)}</ControlLabel>
                            <Well bsSize="small" className="mb15">
                                <div className="mtb10">
                                    {renderPropertiesForm(slos, this.handleChangeProperties, 6, 6)}
                                </div>
                            </Well>
                            <ControlLabel>{formatMessage(servicePlanMsgs.accountsTitle)}</ControlLabel>
                            <SelectAccountsContainer
                                existing={accounts}
                                isMulti={true}
                                onChangeAccount={this.handleChangeAccount}
                            />
                            <ControlLabel>{formatMessage(servicePlanMsgs.descriptionLabel)}</ControlLabel>
                            <FormControl
                                componentClass="textarea"
                                disabled
                                name="description"
                                onChange={this.handleChange}
                                placeholder={formatMessage(servicePlanMsgs.descriptionPlaceholder)}
                                value={description}
                            />
                        </Col>
                        <Col sm={6}>
                            {this.renderResourcesRequired()}
                            <ControlLabel>{formatMessage(servicePlanMsgs.costInfoTitle)}</ControlLabel>
                            <Well bsSize="small">{this.renderCostInfo()}</Well>
                        </Col>
                    </Row>
                    <Modal.Footer>
                        <ButtonToolbar>
                            <Button
                                id={`${constants.ID_SERVICE_PLAN_EDIT_SUBMIT}`}
                                bsStyle="primary"
                                className="pull-right"
                                disabled={this.disableSubmit()}
                                type="submit"
                            >
                                {formatMessage(messages.submit)}
                            </Button>
                            <Button
                                id="servicePlanEditCancel"
                                bsStyle="link"
                                className="pull-right"
                                onClick={closeModal}
                            >
                                {formatMessage(messages.cancel)}
                            </Button>
                        </ButtonToolbar>
                    </Modal.Footer>
                </Form>
            </div>
        );
    }
}

ServicePlanEditForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.shape({
        submit: PropTypes.func.isRequired,
    }).isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.shape({
        servicePlan: PropTypes.object.isRequired,
    }).isRequired,
};

export default injectIntl(ServicePlanEditForm);
