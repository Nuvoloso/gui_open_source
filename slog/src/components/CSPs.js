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

import Loader from './Loader';
import TableContainer from '../containers/TableContainer';
import TableWrapper from './Table';
import { cspMsgs } from '../messages/CSP';
import { renderTags } from './utils';

class CSPs extends Component {
    getAttributes() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return {
            aws_region: {
                message: formatMessage(cspMsgs.awsRegionLabel),
            },
            aws_availability_zone: {
                message: formatMessage(cspMsgs.awsAvailabilityZoneLabel),
            },
            aws_access_key_id: {
                message: formatMessage(cspMsgs.awsAccessKeyIdLabel),
            },
            aws_secret_access_key: {
                message: formatMessage(cspMsgs.awsSecretAccessKeyLabel),
            },
        };
    }

    renderFetchStatus() {
        const { cspsData = {} } = this.props;
        const { loading } = cspsData || {};

        if (loading) {
            return <Loader />;
        }
    }

    renderSubrow(row) {
        const { original } = row;
        const { cspDomainAttributes = {}, description } = original || {};

        const columns = [];
        const data = {};
        const attributes = this.getAttributes();
        Object.keys(attributes).forEach(key => {
            columns.push({
                Header: attributes[key].message,
                accessor: key,
            });

            const { value = '' } = cspDomainAttributes[key] || {};

            data[key] = value;
        });

        return (
            <div className="subrow">
                <div className="mb10 subrow-description">{description}</div>
                {columns.length > 0 ? (
                    <div className="mb15">
                        <TableWrapper columns={columns} data={[data]} minRows={1} />
                    </div>
                ) : null}
            </div>
        );
    }

    getAccountName(accountId) {
        const { accountsData } = this.props;
        const { accounts } = accountsData || {};

        const account = accounts.find(account => {
            return account.meta.id === accountId;
        });

        if (account) {
            return account.name;
        } else {
            return '';
        }
    }

    render() {
        const { selectedRows, cspsData, intl } = this.props;
        const { csps = [] } = cspsData || {};
        const { formatMessage } = intl;

        const columns = [
            {
                Header: formatMessage(cspMsgs.tableName),
                accessor: 'name',
            },
            {
                Header: formatMessage(cspMsgs.tableCSP),
                accessor: 'cspDomainType',
                width: 150,
            },
            {
                Header: formatMessage(cspMsgs.tableAccount),
                accessor: 'accountName',
                width: 120,
            },
            {
                Header: formatMessage(cspMsgs.tableTags),
                accessor: 'tags',
                width: 400,
                Cell: row => <span>{renderTags(row.value)}</span>,
            },
            {
                Header: formatMessage(cspMsgs.tableManagementHost),
                accessor: 'managementHost',
            },
            {
                Header: 'id',
                show: false,
                accessor: 'id',
            },
            {
                Header: 'cspDomainAttributes',
                show: false,
                accessor: 'cspDomainAttributes',
            },
        ];

        const data =
            csps.length > 0
                ? csps.map(csp => {
                      return {
                          accountId: csp.accountId,
                          accountName: this.getAccountName(csp.accountId),
                          id: csp.meta.id,
                          name: csp.name,
                          cspDomainType: csp.cspDomainType,
                          cspDomainAttributes: csp.cspDomainAttributes,
                          managementHost: csp.managementHost,
                          tags: csp.tags,
                          description: csp.description,
                      };
                  })
                : [];

        return (
            <div>
                {this.renderFetchStatus()}
                <TableContainer
                    columns={columns}
                    component="CSPS"
                    componentSelectedRows={selectedRows}
                    data={data}
                    defaultSorted={[{ id: 'name' }]}
                    dataTestId="csps-table"
                    selectable
                    subrow={this.renderSubrow.bind(this)}
                    title={formatMessage(cspMsgs.tableTitle)}
                />
            </div>
        );
    }
}

CSPs.propTypes = {
    accountsData: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    selectedRows: PropTypes.array.isRequired,
};

export default injectIntl(CSPs);
