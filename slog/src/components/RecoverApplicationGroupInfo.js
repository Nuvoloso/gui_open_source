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

import { recoverMsgs } from '../messages/Recover';

import './process.css';
import './recoverselect.css';

class RecoverApplicationGroupInfo extends Component {
    constructor(props) {
        super(props);

        this.accountName = this.accountName.bind(this);
        this.countCGs = this.countCGs.bind(this);
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

    countCGs(affectedAG) {
        const { consistencyGroupsData } = this.props;
        const { consistencyGroups = [] } = consistencyGroupsData;

        const matchingCG = consistencyGroups.filter(cg => {
            return cg.applicationGroupIds.includes(affectedAG);
        });

        return matchingCG.length;
    }

    render() {
        const {
            accountsData = {},
            applicationGroupsData = {},
            consistencyGroupsData = {},
            intl,
            selectedCG,
            volumeSeriesData = {},
        } = this.props;
        const { formatMessage } = intl;

        const { applicationGroups = [] } = applicationGroupsData;
        const { volumeSeries = [] } = volumeSeriesData;
        const { consistencyGroups = [] } = consistencyGroupsData;

        if (applicationGroupsData.loading || accountsData.loading || volumeSeriesData.loading) {
            return <Loader />;
        }

        /**
         * Find all the volumes that are part of this CG.
         */
        const cgVolumes = volumeSeries.filter(volume => {
            return volume.consistencyGroupId === selectedCG;
        });

        /**
         * For each volume found that was in the CG, find all
         * the affected application groups and push them into the array.
         * Store the object, not the id.
         */
        const affectedAGs = [];
        cgVolumes.forEach(cgVolume => {
            // Find the matching CG resource for this volume
            const matchingCG = consistencyGroups.find(cg => {
                return cg.meta.id === cgVolume.consistencyGroupId;
            });

            /**
             * For each application group ID of the matching resource,
             * see if it has been added to the list of matched AGs.
             */
            matchingCG.applicationGroupIds.forEach(agId => {
                // see if the AG has already been found to the list
                const affectedAG = affectedAGs.find(ag => {
                    return ag.meta.id === agId;
                });

                /*
                 * if the AG is not already on the list and there are
                 * more than one AG...
                 */
                if (!affectedAG && applicationGroups.length > 0) {
                    // find the AG for the matching CG's AGID
                    const ag = applicationGroups.find(ag => {
                        return ag.meta.id === agId;
                    });
                    affectedAGs.push(ag);
                }
            });
        });

        const columns = [
            {
                Header: 'No.',
                accessor: 'index',
                width: 45,
            },
            {
                Header: formatMessage(recoverMsgs.applicationName),
                accessor: 'name',
                width: 190,
            },
            {
                Header: formatMessage(recoverMsgs.account),
                accessor: 'accountName',
                width: 190,
            },
            {
                Header: formatMessage(recoverMsgs.consistencyGroups),
                accessor: 'cgCount',
                width: 190,
            },
            {
                Header: formatMessage(recoverMsgs.description),
                accessor: 'description',
            },
            {
                accessor: 'id',
                show: false,
            },
        ];

        const data =
            affectedAGs.length > 0
                ? affectedAGs.map((ag, index) => {
                      return {
                          index: index + 1,
                          name: ag.name,
                          accountName: this.accountName(ag.accountId),
                          cgCount: this.countCGs(ag.meta.id),
                          description: ag.description,
                          id: ag.meta.id,
                      };
                  })
                : [];

        return (
            <div>
                <div className="section-label flex-align-center mt20 mb10">
                    <span className="mr5">{affectedAGs.length}</span>
                    {formatMessage(recoverMsgs.applicationGroupsAffected, { count: affectedAGs.length })}
                </div>
                <TableContainer
                    columns={columns}
                    component="AFFECTED_APPLICATION_GROUP_TABLE"
                    data={data}
                    defaultSorted={[{ id: 'index' }]}
                />
            </div>
        );
    }
}

RecoverApplicationGroupInfo.propTypes = {
    accountsData: PropTypes.object,
    applicationGroupsData: PropTypes.object,
    consistencyGroupsData: PropTypes.object,
    intl: intlShape.isRequired,
    selectedCG: PropTypes.string,
    volumeSeriesData: PropTypes.object,
};

export default injectIntl(RecoverApplicationGroupInfo);
