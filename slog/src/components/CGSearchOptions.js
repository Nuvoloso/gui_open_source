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
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import SelectOptions from '../components/SelectOptions';

import { backupMsgs } from '../messages/Backup';

import * as constants from '../constants';

class CGSearchOptions extends Component {
    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(selectedItem) {
        const { onChange } = this.props;
        onChange(selectedItem);
    }

    render() {
        const { intl, searchType } = this.props;
        const { formatMessage } = intl;

        const options = [
            {
                label: formatMessage(backupMsgs.searchOptionsGroupName),
                value: constants.SEARCH_OPTION_GROUP_NAME,
            },
            {
                label: formatMessage(backupMsgs.searchOptionVolumeName),
                value: constants.SEARCH_OPTION_VOLUME_NAME,
            },
        ];
        let initialValues = '';

        if (searchType === '') {
            initialValues = options[0];
        } else {
            initialValues = options.find(option => {
                if (searchType === option.value) {
                    return option;
                } else {
                    return false;
                }
            });
        }
        return (
            <div className="process-select-cg-search-bar-item-search">
                <SelectOptions
                    id={'process-select'}
                    initialValues={initialValues}
                    isClearable={false}
                    isSearchable={false}
                    onChange={this.onChange}
                    options={options}
                />
            </div>
        );
    }
}

CGSearchOptions.propTypes = {
    intl: intlShape.isRequired,
    searchType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default injectIntl(CGSearchOptions);
