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
import { getAccounts } from '../actions/accountActions';
import { accountMsgs } from '../messages/Account';

class SelectAccountsContainer extends Component {
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getAccounts());
    }

    render() {
        const { accountsData, disabled, existing = '', intl, isMulti = false, onChangeAccount } = this.props;
        const { accounts = [], loading } = accountsData || {};
        const { formatMessage } = intl;

        const options = accounts.map(account => {
            return { value: account.meta.id, label: account.name };
        });

        const initialValues = [];
        if (!isMulti) {
            const account = accounts.find(account => {
                return account.meta.id === existing[0];
            });
            if (account) {
                initialValues.push({ value: account.meta.id, label: account.name });
            }
        } else {
            existing.forEach(account => {
                const acct = accounts.find(acct => {
                    return acct.meta.id === account;
                });
                if (acct) {
                    initialValues.push({ value: acct.meta.id, label: acct.name });
                }
            });
        }

        return (
            <SelectOptions
                disabled={disabled}
                id="SelectAccountsContainer"
                initialValues={isMulti ? initialValues : initialValues[0]}
                isLoading={loading}
                isMulti={isMulti}
                onChange={onChangeAccount}
                options={options}
                placeholder={formatMessage(accountMsgs.selectPlaceholder)}
            />
        );
    }
}

SelectAccountsContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
    existing: PropTypes.array.isRequired,
    intl: intlShape.isRequired,
    isMulti: PropTypes.bool,
    onChangeAccount: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const { accountsData } = state;
    return {
        accountsData,
    };
}

export default connect(mapStateToProps)(injectIntl(SelectAccountsContainer));
