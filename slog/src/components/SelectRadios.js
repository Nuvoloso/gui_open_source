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
import { Radio } from 'react-bootstrap';

class SelectRadios extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedIdx: null,
        };
    }

    componentDidMount() {
        const { initialSelectedId, name, onChange, options = [], selectedId } = this.props;

        if (initialSelectedId || selectedId) {
            const selectedIdx = options.findIndex(option => {
                const { id } = option || {};

                return id === initialSelectedId || id === selectedId;
            });

            if (selectedIdx >= 0) {
                this.setState({ selectedIdx });

                if (onChange) {
                    const option = options[selectedIdx];
                    const { id } = option || {};

                    onChange(name, id, option);
                }
            }
        }
    }

    componentDidUpdate(prevProps) {
        const { selectedId, options = [] } = this.props;
        const { selectedId: prevSelectedId } = prevProps;

        if (selectedId !== prevSelectedId) {
            const selectedIdx = options.findIndex(option => {
                const { id } = option || {};

                return id === selectedId;
            });

            if (selectedIdx >= 0) {
                this.setState({ selectedIdx });
            }
        }
    }

    renderRadioOption(idx) {
        const { selectedIdx } = this.state;
        const { name, options = [] } = this.props;
        const option = options[idx];
        const { disabled, id, label, testid } = option || {};

        return (
            <Radio
                bsClass={`dialog-radio ${selectedIdx === idx ? 'dialog-radio-selected' : ''}`}
                checked={selectedIdx === idx}
                cy-testid={testid}
                id={id}
                disabled={disabled}
                key={idx}
                onChange={() => {
                    const { onChange } = this.props;

                    if (onChange) {
                        onChange(name, id, option);
                    }

                    this.setState({ selectedIdx: idx });
                }}
            >
                {label}
            </Radio>
        );
    }

    render() {
        const { className, id, options = [] } = this.props;

        return (
            <div className={`create-option-select ${className}`} id={id}>
                {Array.isArray(options) ? options.map((option, idx) => this.renderRadioOption(idx)) : null}
            </div>
        );
    }
}

SelectRadios.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    initialSelectedId: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    selectedId: PropTypes.string,
};

SelectRadios.defaultProps = {
    className: '',
    id: 'selectRadios',
};

export default SelectRadios;
