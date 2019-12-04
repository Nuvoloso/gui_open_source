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
import { withRouter } from 'react-router-dom';

import ButtonAction from './ButtonAction';
import Loader from './Loader';
import ConsistencyGroupsForm from './ConsistencyGroupsForm';
import DeleteForm from './DeleteForm';
import TableContainer from '../containers/TableContainer';
import { cgMsgs } from '../messages/ConsistencyGroup';
import { applicationGroupsNames } from './utils_ags';
import { renderTags } from './utils';

import { DeleteForever, Edit } from '@material-ui/icons';
import { ReactComponent as ConsisGroupEmptyPlaceholder } from '../assets/menu/ico-consis-grp.svg';
import { ReactComponent as ConsisGroupIcon } from '../assets/consis-group.svg';
import btnCreateConsisGrpHov from '../assets/btn-create-consis-grp-hov.svg';
import btnCreateConsisGrpUp from '../assets/btn-create-consis-grp-up.svg';
import btnDeleteAllDisable from '../assets/btn-delete-all-disable.svg';
import btnDeleteAllHov from '../assets/btn-delete-all-hov.svg';
import btnDeleteAllUp from '../assets/btn-delete-all-up.svg';

class ConsistencyGroups extends Component {
    renderFetchStatus() {
        const { applicationGroupsData = {}, consistencyGroupsData = {} } = this.props;

        if (consistencyGroupsData.loading || applicationGroupsData.loading) {
            return <Loader />;
        }
    }

    renderHeader() {
        const { intl, openModal, postConsistencyGroup } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="dark content-flex-column">
                <div className="content-flex-row">
                    <div className="layout-icon-background">
                        <ConsisGroupIcon className="layout-icon" />
                    </div>
                    <div className="content-flex-row layout-summary" />
                    <div className="layout-actions">
                        <div>
                            <ButtonAction
                                btnUp={btnCreateConsisGrpUp}
                                btnHov={btnCreateConsisGrpHov}
                                id="cgToolbarCreate"
                                label={formatMessage(cgMsgs.toolbarCreate)}
                                onClick={() =>
                                    openModal(ConsistencyGroupsForm, {
                                        dark: true,
                                        descriptionPlaceholder: formatMessage(cgMsgs.descriptionPlaceholder),
                                        id: 'consistencyGroupCreateFormName',
                                        namePlaceholder: formatMessage(cgMsgs.namePlaceholder),
                                        postGroup: postConsistencyGroup,
                                        title: formatMessage(cgMsgs.createTitle),
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="divider-horizontal" />
            </div>
        );
    }

    renderToolbar() {
        const { deleteConsistencyGroups, intl, openModal, selectedRows } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="table-header-actions">
                <ButtonAction
                    btnDisable={btnDeleteAllDisable}
                    btnHov={btnDeleteAllHov}
                    btnUp={btnDeleteAllUp}
                    disabled={selectedRows.length < 1}
                    id="cgToolbarDelete"
                    onClick={() => {
                        openModal(
                            DeleteForm,
                            {
                                deleteFunc: deleteConsistencyGroups,
                                title: formatMessage(cgMsgs.deleteTitle),
                            },
                            {
                                message: formatMessage(cgMsgs.deleteMsg, {
                                    count: selectedRows.length,
                                    name: selectedRows[0].name,
                                }),
                            }
                        );
                    }}
                />
            </div>
        );
    }

    applicationGroupIdsToNames(ids) {
        const { applicationGroupsData } = this.props;
        const { applicationGroups = [] } = applicationGroupsData || {};

        return applicationGroupsNames(applicationGroups, ids);
    }

    getAccountName(accountId) {
        const { accountsData } = this.props;
        const { accounts = [] } = accountsData || {};

        const account = accounts.find(account => account.meta.id === accountId);

        return (account && account.name) || '';
    }

    render() {
        const { applicationGroupsData = {}, consistencyGroupsData = {}, intl, location, selectedRows } = this.props;
        const { consistencyGroups = [] } = consistencyGroupsData;
        const { state = {} } = location;
        const { cgFilter } = state || {}; // filter passed in from link
        const { formatMessage } = intl;

        const columns = [
            {
                Header: formatMessage(cgMsgs.nameLabel),
                accessor: 'name',
            },
            {
                Header: formatMessage(cgMsgs.tableApplicationGroup),
                accessor: 'applicationGroupNames',
            },
            {
                Header: formatMessage(cgMsgs.accountLabel),
                accessor: 'accountName',
                Cell: row => {
                    return this.getAccountName(row.original.accountId);
                },
            },
            {
                Header: formatMessage(cgMsgs.descriptionLabel),
                accessor: 'description',
                minWidth: 350,
            },
            {
                Header: formatMessage(cgMsgs.tableTags),
                accessor: 'tags',
                width: 400,
                Cell: row => <span>{renderTags(row.value)}</span>,
            },
            {
                Header: formatMessage(cgMsgs.tableActions),
                accessor: 'actions',
                sortable: false,
                width: 120,
                Cell: selected => {
                    const { original, row } = selected || {};
                    const { id, name } = original || {};

                    const { deleteConsistencyGroups, openModal, patchConsistencyGroup } = this.props;

                    return (
                        <div className="table-actions-cell">
                            <Edit
                                id={`applicationGroupToolbarEdit-${id}`}
                                onClick={() =>
                                    openModal(
                                        ConsistencyGroupsForm,
                                        {
                                            dark: true,
                                            descriptionPlaceholder: formatMessage(cgMsgs.descriptionPlaceholder),
                                            id: 'consistencyGroupCreateFormName',
                                            namePlaceholder: formatMessage(cgMsgs.namePlaceholder),
                                            patchGroup: patchConsistencyGroup,
                                            title: formatMessage(cgMsgs.editTitle),
                                        },
                                        { edit: row }
                                    )
                                }
                            />
                            <DeleteForever
                                id={`consistencyGroupToolbarDelete-${id}`}
                                onClick={() =>
                                    openModal(
                                        DeleteForm,
                                        {
                                            deleteFunc: () => deleteConsistencyGroups(row._original),
                                            title: formatMessage(cgMsgs.deleteTitle),
                                        },
                                        {
                                            message: formatMessage(cgMsgs.deleteMsg, {
                                                count: 1,
                                                name,
                                            }),
                                        }
                                    )
                                }
                            />
                        </div>
                    );
                },
            },
            {
                Header: 'id',
                show: false,
                accessor: 'id',
            },
        ];

        const data =
            consistencyGroups.length > 0
                ? consistencyGroups.map(group => {
                      return {
                          name: group.name,
                          accountId: group.accountId,
                          accountName: group.accountName,
                          applicationGroupIds: group.applicationGroupIds,
                          applicationGroupNames: this.applicationGroupIdsToNames(group.applicationGroupIds),
                          description: group.description,
                          tags: group.tags,
                          id: group.meta.id,
                      };
                  })
                : [];

        const loading = consistencyGroupsData.loading || applicationGroupsData.loading;

        return (
            <div className="component-page">
                {this.renderFetchStatus()}
                {this.renderHeader()}
                <TableContainer
                    columns={columns}
                    component="CONSISTENCY_GROUPS_TABLE"
                    componentSelectedRows={selectedRows}
                    data={data}
                    defaultFiltered={cgFilter}
                    defaultSorted={[{ id: 'name' }]}
                    emptyPlaceholder={{
                        icon: ConsisGroupEmptyPlaceholder,
                        text: formatMessage(cgMsgs.tableEmptyPlaceholder),
                    }}
                    filterLeft
                    loading={loading}
                    selectable
                    dataTestId="consistency-groups-table"
                    title={formatMessage(cgMsgs.cgTableTitle)}
                    toolbar={this.renderToolbar()}
                />
            </div>
        );
    }
}

ConsistencyGroups.propTypes = {
    accountsData: PropTypes.object.isRequired,
    applicationGroupsData: PropTypes.object.isRequired,
    consistencyGroupsData: PropTypes.object.isRequired,
    deleteConsistencyGroups: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    openModal: PropTypes.func.isRequired,
    patchConsistencyGroup: PropTypes.func.isRequired,
    postConsistencyGroup: PropTypes.func.isRequired,
    selectedRows: PropTypes.array.isRequired,
};

export default withRouter(injectIntl(ConsistencyGroups));
