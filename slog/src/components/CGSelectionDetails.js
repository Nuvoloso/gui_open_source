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
import { connect } from 'react-redux';
import moment from 'moment';

import VolumeSeriesContainer from '../containers/VolumeSeriesContainer';

import { renderTags } from '../components/utils';
import { tagsExcludeInternal } from './utils';

import { cgSelectionMsgs } from '../messages/CGSelection';

/**
 * Show details for the selected CG.
 * Controlled component that shows CG details and lists the volumes for the CG.
 * Uses store: accountsData, consistencyGroupsData.
 */
class CGSelectionDetails extends Component {
    getAccountNameFromId(accountId) {
        const { accountsData } = this.props;
        const { accounts = [] } = accountsData || {};
        const account = accounts.find(account => {
            return account.meta.id === accountId;
        });

        return account ? account.name : '';
    }

    render() {
        const { consistencyGroupsData, intl, selectedCG } = this.props;
        const { formatMessage } = intl;
        const { consistencyGroups = [] } = consistencyGroupsData || {};

        const cg = consistencyGroups.find(cg => {
            return cg.meta.id === selectedCG;
        });
        const { name = '', description = '', tags = [], meta = {} } = cg || {};
        const { timeCreated } = meta || '';

        return (
            <div>
                <VolumeSeriesContainer
                    hideColumns={['status', 'performanceCapacityBytes', 'actions']}
                    hideHeader
                    volumeSeriesFilter={volume => volume.consistencyGroupId === selectedCG}
                    tableOnly
                />
                <div className="cg-details">
                    <div className="volume-details">
                        <div className="details-title">{formatMessage(cgSelectionMsgs.consistencyGroup)}</div>
                        <div className="content-horizontal-separator" />
                        <div className="details-content">
                            <div className="details-items">
                                <div className="details-name">{name}</div>
                                <div className="details-item">{description}</div>
                            </div>
                            <div className="details-items">
                                <div className="content-flex-column">
                                    <div className="details-label">{formatMessage(cgSelectionMsgs.accountLabel)}</div>
                                    <div className="details-label">{formatMessage(cgSelectionMsgs.createdOnLabel)}</div>
                                </div>
                                <div className="content-flex-column">
                                    <div className="details-item">{this.getAccountNameFromId(cg.accountId)}</div>
                                    <div className="details-item">{moment(timeCreated).format('ll')}</div>
                                </div>
                            </div>
                            <div className="content-flex-row">
                                <div className="details-label">{formatMessage(cgSelectionMsgs.tagsLabel)}</div>
                                <div className="details-item">{renderTags(tagsExcludeInternal(tags))}</div>
                            </div>
                        </div>
                    </div>
                    <div className="details-placeholder">
                        <div className="details-title details-placeholder-title"> </div>
                        <div className="content-horizontal-separator" />
                        <div className="details-content" />
                    </div>
                </div>
            </div>
        );
    }
}

CGSelectionDetails.propTypes = {
    accountsData: PropTypes.object.isRequired,
    consistencyGroupsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    selectedCG: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
    const { accountsData, consistencyGroupsData } = state;
    return {
        accountsData,
        consistencyGroupsData,
    };
}

export default connect(mapStateToProps)(injectIntl(CGSelectionDetails));
