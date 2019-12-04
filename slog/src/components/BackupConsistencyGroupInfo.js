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

import TableContainer from '../containers/TableContainer';
import Loader from './Loader';

import { backupMsgs } from '../messages/Backup';

import './process.css';
import './recoverselect.css';

class BackupConsistencyGroupInfo extends Component {
    constructor(props) {
        super(props);

        this.accountName = this.accountName.bind(this);
    }

    accountName(accountId) {
        const { accountsData } = this.props;
        const { accounts } = accountsData || {};

        const account = accounts.find(account => {
            return account.meta.id === accountId;
        });

        const { name = '' } = account || {};

        return name;
    }

    render() {
        const { accountsData = {}, consistencyGroupsData = {}, intl, selectedCG, volumeSeriesData = {} } = this.props;
        const { formatMessage } = intl;

        const { volumeSeries = [] } = volumeSeriesData;
        const { consistencyGroups = [] } = consistencyGroupsData;

        if (accountsData.loading || volumeSeriesData.loading) {
            return <Loader />;
        }

        /**
         * Find all the volumes that are part of this CG.
         */
        const cgVolumes = volumeSeries.filter(volume => {
            return volume.consistencyGroupId === selectedCG;
        });

        const cg = consistencyGroups.find(cg => {
            return cg.meta.id === selectedCG;
        });

        const affectedGroups = [cg];

        const columns = [
            {
                Header: formatMessage(backupMsgs.backupNumberPrefix),
                accessor: 'index',
                width: 40,
            },
            {
                Header: formatMessage(backupMsgs.consistencyGroup),
                accessor: 'name',
                width: 190,
            },
            {
                Header: formatMessage(backupMsgs.backupAccount),
                accessor: 'accountName',
                width: 190,
            },
            {
                Header: formatMessage(backupMsgs.volumes),
                accessor: 'volumeCount',
                width: 190,
            },
            {
                Header: formatMessage(backupMsgs.backupDescription),
                accessor: 'description',
            },
            {
                accessor: 'id',
                show: false,
            },
        ];

        const data =
            affectedGroups.length > 0
                ? affectedGroups.map((group, index) => {
                      return {
                          index: index + 1,
                          name: group.name,
                          accountName: this.accountName(group.accountId),
                          volumeCount: cgVolumes.length,
                          description: group.description,
                          id: group.meta.id,
                      };
                  })
                : [];

        return (
            <div>
                <div className="section-label flex-align-center mt15 mb5">
                    {affectedGroups.length}{' '}
                    {formatMessage(backupMsgs.backupConsistencyGroupsAffected, { count: affectedGroups.length })}
                </div>
                <TableContainer
                    columns={columns}
                    component="BACKUP_CG_CONFIRMATION_TABLE"
                    data={data}
                    defaultSorted={[{ id: 'index' }]}
                />
            </div>
        );
    }
}

BackupConsistencyGroupInfo.propTypes = {
    accountsData: PropTypes.object,
    consistencyGroupsData: PropTypes.object,
    intl: intlShape.isRequired,
    selectedCG: PropTypes.string,
    volumeSeriesData: PropTypes.object,
};

export default injectIntl(BackupConsistencyGroupInfo);
