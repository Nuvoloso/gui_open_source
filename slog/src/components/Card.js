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
import { Col, Row } from 'react-bootstrap';
import _ from 'lodash';

import './cards.css';

class Card extends Component {
    render() {
        const {
            titleAccessor = 'name',
            columns = [],
            data,
            isSelected,
            labelWidth = 6,
            selectToggle,
            viewCollapsed,
        } = this.props;
        const selected = isSelected(data);

        return (
            <div
                className={`card card-selectable w350 ${selected ? 'selected' : ''}`}
                onClick={() => {
                    // emulate "row" object that React Table builds
                    const row = {
                        _original: data,
                    };

                    columns.forEach(col => {
                        const { accessor } = col;
                        row[accessor] = _.get(data, accessor);
                    });

                    if (selectToggle) {
                        selectToggle(row, !selected);
                    }
                }}
            >
                <div className={`card-header ${viewCollapsed && 'collapsed'}`}>{data[titleAccessor]}</div>
                {viewCollapsed ? null : (
                    <div className="card-body">
                        {columns.map((column, idx) => {
                            const { accessor, show, Cell, Header } = column;
                            const value = _.get(data, accessor);

                            if (
                                show === false ||
                                accessor === titleAccessor ||
                                accessor === 'selected' ||
                                (!value && value !== 0) ||
                                (Array.isArray(value) && value.length < 1)
                            ) {
                                return null;
                            }

                            return (
                                <Row className="mb5" key={idx}>
                                    <Col className="card-label" xs={labelWidth}>
                                        {Header}:
                                    </Col>
                                    <Col className="card-value" xs={12 - labelWidth}>
                                        {Cell ? Cell({ value }) : value}
                                    </Col>
                                </Row>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
}

Card.propTypes = {
    columns: PropTypes.array,
    data: PropTypes.object,
    intl: intlShape.isRequired,
    isSelected: PropTypes.func,
    labelWidth: PropTypes.number,
    selectToggle: PropTypes.func,
    titleAccessor: PropTypes.string,
    viewCollapsed: PropTypes.bool,
};

export default injectIntl(Card);
