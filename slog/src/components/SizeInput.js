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

import FieldGroup from './FieldGroup';
import SelectOptions from './SelectOptions';
import { bytesFromUnit, bytesToUnit } from './utils';
import { messages } from '../messages/Messages';

class SizeInput extends Component {
    constructor(props) {
        super(props);

        const { sizeBytes } = this.props;

        // need input's size as string type to detect and disallow invalid characters
        const size = Number(sizeBytes) || sizeBytes === 0 ? bytesToUnit(sizeBytes) : '';

        this.state = {
            selectedUnit: messages.gib,
            size,
            units: [messages.gib, messages.tib],
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeUnit = this.handleChangeUnit.bind(this);
    }

    handleChange(name, value) {
        const isValidSize = value === 0 || Number(value);
        this.setState({ size: isValidSize ? value : '' });

        const { onChange } = this.props;
        if (onChange) {
            const { selectedUnit } = this.state;
            const isValidSize = value === 0 || Number(value);

            onChange(isValidSize ? bytesFromUnit(value, selectedUnit.id === messages.tib.id ? 4 : 3) : 0);
        }
    }

    handleChangeUnit(select) {
        const { value } = select || {};
        this.setState({ selectedUnit: value });

        const { onChange } = this.props;
        if (onChange) {
            const { size } = this.state;
            const isValidSize = size === 0 || Number(size);

            onChange(isValidSize ? bytesFromUnit(size, value.id === messages.tib.id ? 4 : 3) : 0);
        }
    }

    render() {
        const { disabled, id, intl, label, placeholder } = this.props;
        const { formatMessage } = intl;
        const { selectedUnit, size, units } = this.state;

        return (
            <div className="mb10 size-input">
                <FieldGroup
                    className="size-input-field"
                    disabled={disabled}
                    id={id}
                    label={label}
                    min={0}
                    onChange={this.handleChange}
                    placeholder={placeholder}
                    type="number"
                    value={size}
                />
                <div className="size-input-unit-select">
                    <SelectOptions
                        disabled={disabled}
                        id={`${id}-unit-select`}
                        initialValues={{ label: formatMessage(selectedUnit), value: selectedUnit }}
                        isClearable={false}
                        isSearchable={false}
                        onChange={this.handleChangeUnit}
                        options={units
                            .filter(unit => unit.id !== selectedUnit.id)
                            .map(unit => {
                                return { label: formatMessage(unit), value: unit };
                            })}
                    />
                </div>
            </div>
        );
    }
}

SizeInput.propTypes = {
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    inputRef: PropTypes.func,
    intl: intlShape.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    sizeBytes: PropTypes.number,
};

export default injectIntl(SizeInput);
