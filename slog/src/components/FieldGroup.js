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

import '../leaplabs.css';
import './wizard.css';

const COUNTER_INCREMENT = 0.001;

class FieldGroup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            passwordVisible: false,
        };

        this.handleBlur = this.handleBlur.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    getRawType(componentType) {
        switch (componentType) {
            case 'cost':
                return 'number';
            case 'password': {
                const { passwordVisible } = this.state;
                return passwordVisible ? 'text' : 'password';
            }
            case 'password-static': {
                const { passwordVisible } = this.state;
                return passwordVisible ? 'text' : 'password';
            }
            default:
                return componentType;
        }
    }

    handleBlur(e) {
        const { onBlur } = this.props;

        if (onBlur) {
            const { target } = e || {};
            const { name } = target || {};
            onBlur(name);
        }
    }

    handleFocus(e) {
        const { onFocus } = this.props;

        if (onFocus) {
            const { target } = e || {};
            const { name } = target || {};
            onFocus(name);
        }
    }

    handleInputChange(e) {
        const { onChange, scale } = this.props;

        if (onChange) {
            const { target } = e || {};
            const { checked, name, type, value, valueAsNumber } = target || {};

            /**
             * If scale provided for the field, limit the RHS to the specified length.
             */
            if (scale) {
                const numParts = value.split('.');
                if (numParts.length === 2) {
                    if (numParts[1].length > scale) {
                        return;
                    }
                }
            }

            switch (type) {
                case 'checkbox':
                    onChange(name, checked);
                    break;
                case 'cost':
                case 'number':
                    onChange(name, valueAsNumber);
                    break;
                default:
                    onChange(name, value);
                    break;
            }
        }
    }

    handleKeyPress(e) {
        const { key } = e;
        const { onKeyPress, step, type, value } = this.props;

        if (
            ((type === 'cost' || type === 'number') && (key === '-' || key === 'e')) ||
            (type === 'number' && Number.isInteger(step) && key === '.')
        ) {
            e.preventDefault();
        }

        /**
         * Only allow a single dot ('.') for cost or numbers.
         */
        if ((type === 'cost' || type === 'number') && key === '.') {
            const numPeriods = (value.toString().match(/\./g) || []).length;
            if (numPeriods === 1) {
                e.preventDefault();
            }
        }

        if (onKeyPress) {
            onKeyPress(e);
        }
    }

    renderInputComponent() {
        const {
            classNameValue,
            id,
            inputComponent,
            max,
            min,
            name,
            placeholder,
            step,
            styleInputWidth,
            type,
            value,
        } = this.props;

        if (inputComponent) {
            return <div className={classNameValue}>{inputComponent}</div>;
        } else {
            return (
                <div className="wizard-form-input-default-wrapper">
                    <input
                        className={`wizard-form-input ${type === 'password' ? 'wizard-form-input-password' : ''}`}
                        id={id || name}
                        max={max}
                        min={min}
                        name={name}
                        onBlur={this.handleBlur}
                        onChange={this.handleInputChange}
                        onFocus={this.handleFocus}
                        onKeyPress={this.handleKeyPress}
                        placeholder={placeholder}
                        step={type === 'cost' ? COUNTER_INCREMENT : step}
                        style={{
                            ...(styleInputWidth && { width: styleInputWidth }),
                        }}
                        type={this.getRawType(type)}
                        value={value}
                    />
                    {type === 'password' ? this.renderPasswordVisibilityIcon() : null}
                </div>
            );
        }
    }

    renderInput() {
        const { classNameText, id, name, placeholder, styleInputWidth, type, value } = this.props;

        switch (type) {
            case 'static':
                return <div className={`wizard-form-input-static ${classNameText ? classNameText : ''}`}>{value}</div>;
            case 'password-static':
                return (
                    <div className={`wizard-form-input-default-wrapper ${classNameText ? classNameText : ''}`}>
                        <input
                            className={`wizard-form-input wizard-form-input-password`}
                            id={id || name}
                            name={name}
                            readOnly
                            style={{
                                ...(styleInputWidth && { width: styleInputWidth }),
                            }}
                            type={this.getRawType(type)}
                            value={value}
                        />
                        {this.renderPasswordVisibilityIcon()}
                    </div>
                );
            case 'textarea':
                return (
                    <textarea
                        className="wizard-form-input"
                        id={id || name}
                        name={name}
                        onBlur={this.handleBlur}
                        onChange={this.handleInputChange}
                        onFocus={this.handleFocus}
                        placeholder={placeholder}
                        style={{
                            ...(styleInputWidth && { width: styleInputWidth }),
                        }}
                        value={value}
                    />
                );
            default:
                return this.renderInputComponent();
        }
    }

    renderPasswordVisibilityIcon() {
        const { passwordVisible } = this.state;

        return (
            <span
                className={`wizard-form-password-icon ${passwordVisible ? 'icon-hide-left' : 'icon-show'}`}
                onClick={() => this.setState({ passwordVisible: !passwordVisible })}
            />
        );
    }

    render() {
        const {
            appendLabel,
            className,
            classNameLabel,
            hideLabelColon,
            id,
            label,
            labelMinWidth,
            name,
            type,
        } = this.props;

        return (
            <div className={`field-group ${className || 'mb10'}`} id={`field-group-${name}`}>
                {label ? (
                    <label
                        className={`wizard-form-group mb0 ${type === 'textarea' ? 'wizard-form-group-textarea' : ''}`}
                        htmlFor={id || name}
                    >
                        <span
                            className={`wizard-form-label ${classNameLabel} ${
                                type === 'static' ? 'wizard-form-label-static' : ''
                            }`}
                            style={{
                                ...(labelMinWidth && { minWidth: labelMinWidth }),
                            }}
                        >{`${label}${hideLabelColon ? '' : ': '}`}</span>
                    </label>
                ) : null}
                <div className="wizard-form-input-container">{this.renderInput()}</div>
                {appendLabel ? <div className="wizard-form-append-label">{appendLabel}</div> : null}
            </div>
        );
    }
}

FieldGroup.propTypes = {
    appendLabel: PropTypes.node,
    className: PropTypes.string,
    classNameLabel: PropTypes.string,
    classNameText: PropTypes.string,
    classNameValue: PropTypes.string,
    hideLabelColon: PropTypes.bool,
    id: PropTypes.string,
    inputComponent: PropTypes.node,
    label: PropTypes.string,
    labelMinWidth: PropTypes.string,
    max: PropTypes.number,
    min: PropTypes.number,
    name: PropTypes.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyPress: PropTypes.func,
    placeholder: PropTypes.string,
    scale: PropTypes.number,
    step: PropTypes.number,
    styleInputWidth: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.any,
};

FieldGroup.defaultProps = {
    max: undefined,
    min: 0,
    name: 'wizard-field-input',
    step: 1,
    type: 'text',
};

export default FieldGroup;
