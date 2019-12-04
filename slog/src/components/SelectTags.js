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

import SelectOptions from './SelectOptions';
import { messages } from '../messages/Messages';

class SelectTags extends Component {
    constructor(props) {
        super(props);

        const { tags } = props;
        const initialTags = tags.map(tag => {
            return {
                label: tag,
                value: tag,
            };
        });

        this.state = {
            initialTags,
            selectedOptions: initialTags,
        };

        this.handleOnChange = this.handleOnChange.bind(this);
    }

    handleOnChange(selectedOptions = []) {
        const { onChange } = this.props;

        if (onChange) {
            onChange({
                target: {
                    name: 'tags',
                    value: selectedOptions.map(o => o.value),
                },
            });
        }

        this.setState({ selectedOptions });
    }

    render() {
        const { id, intl } = this.props;
        const { formatMessage } = intl;
        const { initialTags, selectedOptions } = this.state;

        return (
            <SelectOptions
                id={id}
                initialValues={selectedOptions}
                isCreatable
                isMulti
                onChange={this.handleOnChange}
                options={initialTags}
                placeholder={formatMessage(messages.tagsPlaceholder)}
            />
        );
    }
}

SelectTags.propTypes = {
    id: PropTypes.string,
    intl: intlShape.isRequired,
    onChange: PropTypes.func,
    tags: PropTypes.array,
};

SelectTags.defaultProps = {
    id: 'selectTags',
    tags: [],
};

export default injectIntl(SelectTags);
