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
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';

import SelectOptions from '../components/SelectOptions';
import { getUsers } from '../actions/userActions';
import { userMsgs } from '../messages/User';

class SelectUsersContainer extends Component {
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getUsers());
    }

    render() {
        const { usersData, existing = [], idExtension, intl, isMulti, isRequired, onChangeUser } = this.props;
        const { users = [], loading } = usersData || {};
        const { formatMessage } = intl;

        const options = users.map(user => {
            return { value: user.meta.id, label: user.authIdentifier };
        });

        const initialValues = [];
        existing.forEach(userId => {
            const user = users.find(u => {
                return u.meta.id === userId;
            });
            if (user) {
                initialValues.push({ value: user.meta.id, label: user.authIdentifier });
            }
        });

        const id = idExtension ? `selectUsersContainer-${idExtension}` : 'selectUsersContainer';

        return (
            <SelectOptions
                id={id}
                initialValues={initialValues}
                isLoading={loading}
                isMulti={isMulti}
                onChange={onChangeUser}
                options={options}
                placeholder={formatMessage(
                    isRequired ? userMsgs.selectPlaceholderRequired : userMsgs.selectPlaceholder
                )}
            />
        );
    }
}

SelectUsersContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    existing: PropTypes.array.isRequired,
    idExtension: PropTypes.string,
    intl: intlShape.isRequired,
    isMulti: PropTypes.bool,
    isRequired: PropTypes.bool,
    onChangeUser: PropTypes.func.isRequired,
    usersData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { usersData } = state;
    return {
        usersData,
    };
}

export default connect(mapStateToProps)(injectIntl(SelectUsersContainer));
