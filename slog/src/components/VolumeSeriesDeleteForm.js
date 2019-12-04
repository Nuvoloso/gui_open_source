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
import { Button, Carousel, Col, Row } from 'react-bootstrap';

import SelectOptions from './SelectOptions';
import VolumeCapacityContainer from '../containers/VolumeCapacityContainer';
import { applicationGroupsNames, applicationGroupsNamesAsArray, findApplicationGroupIds } from './utils_ags';
import { messages } from '../messages/Messages';
import { formatBytes } from './utils';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';

class VolumeSeriesDeleteForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0,
        };

        this.handleSelect = this.handleSelect.bind(this);
        this.handleSelectOption = this.handleSelectOption.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSelect(index) {
        this.setState({ index });
    }

    handleSelectOption(option) {
        const { value } = option || {};

        this.setState({ index: value });
    }

    // grab the information for the items, hide the modal, and send the DELETE
    handleSubmit(event) {
        event.preventDefault();

        const { closeModal, config } = this.props;
        const { deleteFunc } = config;

        closeModal();
        deleteFunc();
    }

    renderInfo(vs) {
        const { intl, values } = this.props;
        const { formatMessage } = intl;
        const { applicationGroupsData, consistencyGroupsData } = values || {};
        const { applicationGroups = [] } = applicationGroupsData || {};
        const { consistencyGroups = [] } = consistencyGroupsData || {};

        const { consistencyGroupId, consistencyGroupName, sizeBytes } = vs;
        const labelWidth = 6;

        const agIds = findApplicationGroupIds(consistencyGroups, consistencyGroupId);
        const agNames = applicationGroupsNames(applicationGroups, agIds);

        return (
            <Fragment>
                <Row className="mb5">
                    <Col className="card-label" xs={labelWidth}>
                        {`${formatMessage(volumeSeriesMsgs.sizeLabel)}:`}
                    </Col>
                    <Col className="card-value" xs={12 - labelWidth}>
                        {formatBytes(sizeBytes)}
                    </Col>
                </Row>
                <Row className="mb5">
                    <Col className="card-label" xs={labelWidth}>
                        {`${formatMessage(volumeSeriesMsgs.applicationGroupLabel)}:`}
                    </Col>
                    <Col className="card-value" xs={12 - labelWidth}>
                        {agNames}
                    </Col>
                </Row>
                <Row className="mb5">
                    <Col className="card-label" xs={labelWidth}>
                        {`${formatMessage(volumeSeriesMsgs.consistencyGroupLabel)}:`}
                    </Col>
                    <Col className="card-value" xs={12 - labelWidth}>
                        {consistencyGroupName}
                    </Col>
                </Row>
            </Fragment>
        );
    }

    renderSummary() {
        const { intl, values } = this.props;
        const { formatMessage } = intl;
        const { applicationGroupsData, consistencyGroupsData, volumeSeries = [] } = values || {};
        const { applicationGroups = [] } = applicationGroupsData || {};
        const { consistencyGroups = [] } = consistencyGroupsData || {};

        const summary = volumeSeries.reduce(
            (acc, curr) => {
                const { consistencyGroupId } = curr || {};
                const agIds = findApplicationGroupIds(consistencyGroups, consistencyGroupId);
                const agNames = applicationGroupsNamesAsArray(applicationGroups, agIds);

                return {
                    applicationGroupName: [...acc.applicationGroupName, ...agNames],
                    consistencyGroupName: [...acc.consistencyGroupName, curr.consistencyGroupName],
                    sizeBytes: acc.sizeBytes + curr.sizeBytes,
                };
            },
            { applicationGroupName: [], consistencyGroupName: [], sizeBytes: 0 }
        );

        const { applicationGroupName = [], consistencyGroupName, sizeBytes } = summary;
        const uniqueAgs = new Set(applicationGroupName);
        const uniqueCgs = new Set(consistencyGroupName);
        const collapseSize = 5;
        const labelWidth = 6;

        return (
            <Fragment>
                <Row className="mb5">
                    <Col className="card-label" xs={labelWidth}>
                        {`${formatMessage(volumeSeriesMsgs.summarySizeLabel)}:`}
                    </Col>
                    <Col className="card-value" xs={12 - labelWidth}>
                        {formatBytes(sizeBytes)}
                    </Col>
                </Row>
                <Row className="mb5">
                    <Col className="card-label" xs={labelWidth}>
                        {`${formatMessage(volumeSeriesMsgs.summaryAgLabel, { count: uniqueAgs.size })}:`}
                    </Col>
                    <Col className="card-value" xs={12 - labelWidth}>
                        {uniqueAgs.size > collapseSize ? uniqueAgs.size : [...uniqueAgs].join(', ')}
                    </Col>
                </Row>
                <Row className="mb5">
                    <Col className="card-label" xs={labelWidth}>
                        {`${formatMessage(volumeSeriesMsgs.summaryCgLabel, { count: uniqueCgs.size })}:`}
                    </Col>
                    <Col className="card-value" xs={12 - labelWidth}>
                        {uniqueCgs.size > collapseSize ? uniqueCgs.size : [...uniqueCgs].join(', ')}
                    </Col>
                </Row>
            </Fragment>
        );
    }

    render() {
        const { index } = this.state;
        const { closeModal, intl, values } = this.props;
        const { formatMessage } = intl;
        const { message, volumeSeries = [] } = values || {};

        return (
            <div className="vs-delete-form">
                <div className="mb15 ml20 mr20 resource-details">
                    <p>{message}</p>
                    {volumeSeries.length > 1 ? (
                        <Fragment>
                            <Carousel
                                activeIndex={index}
                                className="carousel-vs"
                                indicators={false}
                                interval={null}
                                onSelect={this.handleSelect}
                            >
                                <Carousel.Item>
                                    <div className="card w500">
                                        <div className="card-header">
                                            {formatMessage(volumeSeriesMsgs.summaryTitle)}
                                        </div>
                                        <div className="card-body">{this.renderSummary()}</div>
                                    </div>
                                </Carousel.Item>
                                {volumeSeries.map(vs => {
                                    const { meta, name } = vs || {};
                                    const { id } = meta || {};
                                    return (
                                        <Carousel.Item key={id}>
                                            <div className="card w500">
                                                <div className="card-header">{name}</div>
                                                <div className="card-body">{this.renderInfo(vs)}</div>
                                            </div>
                                        </Carousel.Item>
                                    );
                                })}
                            </Carousel>
                            <SelectOptions
                                id="selectDeleteInfoIdx"
                                initialValues={{
                                    label: index
                                        ? formatMessage(volumeSeriesMsgs.indexOfTotalCount, {
                                              index,
                                              count: volumeSeries.length,
                                          })
                                        : formatMessage(volumeSeriesMsgs.summaryTitle),
                                    value: index,
                                }}
                                isClearable={false}
                                isSearchable={false}
                                onChange={this.handleSelectOption}
                                options={[
                                    { label: formatMessage(volumeSeriesMsgs.summaryTitle), value: 0 },
                                    ...volumeSeries.map((vs, idx) => {
                                        const { name } = vs || {};
                                        const index = idx + 1;
                                        return {
                                            label: `${index}: ${name}`,
                                            value: index,
                                        };
                                    }),
                                ]}
                            />
                        </Fragment>
                    ) : (
                        <div className="mt20">{this.renderInfo(volumeSeries[0])}</div>
                    )}
                    {volumeSeries.length > 1 && index === 0 ? null : (
                        <div className="mt20">
                            <VolumeCapacityContainer
                                volumeSeries={volumeSeries[volumeSeries.length > 1 ? index - 1 : index]}
                            />
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <Button id="deleteFormButtonDelete" bsStyle="primary" onClick={this.handleSubmit}>
                        {formatMessage(messages.delete)}
                    </Button>
                    <Button onClick={closeModal}>{formatMessage(messages.cancel)}</Button>
                </div>
            </div>
        );
    }
}

VolumeSeriesDeleteForm.propTypes = {
    closeModal: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    values: PropTypes.object,
};

export default injectIntl(VolumeSeriesDeleteForm);
