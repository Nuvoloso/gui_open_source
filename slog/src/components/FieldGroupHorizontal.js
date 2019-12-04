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
import { Col, ControlLabel, FormGroup } from 'react-bootstrap';

class FieldGroupHorizontal extends Component {
    render() {
        const { children, className, controlWidth, label, labelWidth = 3, validationState } = this.props;

        return (
            <FormGroup className={`field-group-horizontal ${className}`} validationState={validationState}>
                <Col componentClass={ControlLabel} md={labelWidth}>
                    {label}
                </Col>
                <Col md={controlWidth || 12 - labelWidth}>{children}</Col>
            </FormGroup>
        );
    }
}

FieldGroupHorizontal.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    controlWidth: PropTypes.number,
    label: PropTypes.string,
    labelWidth: PropTypes.number,
    validationState: PropTypes.string,
};

export default FieldGroupHorizontal;
