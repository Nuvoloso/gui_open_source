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

import Select from 'react-select';
import CreatableSelect from 'react-select/lib/Creatable';

import './selectoptions.css';

class SelectOptions extends Component {
    constructor(props) {
        super(props);

        this.handleOnChange = this.handleOnChange.bind(this);
    }

    handleOnChange(value) {
        const { onChange } = this.props;

        if (onChange) {
            onChange(value);
        }
    }

    render() {
        const {
            classNamePrefix,
            disabled,
            id,
            initialValues,
            isClearable,
            isCreatable,
            isLoading,
            isMulti,
            isSearchable,
            options,
            placeholder,
            valueRenderer,
        } = this.props;

        const SelectComponentName = isCreatable ? CreatableSelect : Select;

        return (
            <SelectComponentName
                classNamePrefix={classNamePrefix}
                isDisabled={disabled}
                id={id}
                isClearable={isClearable}
                isLoading={isLoading}
                isMulti={isMulti}
                isSearchable={isSearchable}
                name="select-options"
                onChange={this.handleOnChange}
                options={options}
                value={initialValues}
                valueRenderer={valueRenderer}
                placeholder={placeholder}
            />
        );
    }
}

SelectOptions.propTypes = {
    classNamePrefix: PropTypes.string,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    initialValues: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    isClearable: PropTypes.bool,
    isCreatable: PropTypes.bool,
    isLoading: PropTypes.bool,
    isMulti: PropTypes.bool,
    isSearchable: PropTypes.bool,
    onChange: PropTypes.func,
    options: PropTypes.array.isRequired,
    placeholder: PropTypes.string,
    valueRenderer: PropTypes.func,
};

SelectOptions.defaultProps = {
    classNamePrefix: 'select-options',
    isDisabled: false,
    isClearable: true,
    isLoading: false,
    isSearchable: true,
    placeholder: '',
};

export default SelectOptions;
