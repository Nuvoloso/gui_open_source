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

import ButtonAction from './ButtonAction';
import Loader from './Loader';
import VolumeGroupsForm from './VolumeGroupsForm';
import DeleteForm from './DeleteForm';
import TableContainer from '../containers/TableContainer';
import { agMsgs } from '../messages/ApplicationGroup';
import { renderTags } from './utils';

import { DeleteForever, Edit } from '@material-ui/icons';
import { ReactComponent as AppGroupEmptyPlaceholder } from '../assets/menu/ico-app-grp.svg';
import { ReactComponent as AppGroupIcon } from '../assets/app-group.svg';
import btnCreateNewAppGrpHov from '../assets/btn-create-new-app-grp-hov.svg';
import btnCreateNewAppGrpUp from '../assets/btn-create-new-app-grp-up.svg';
import btnDeleteAllDisable from '../assets/btn-delete-all-disable.svg';
import btnDeleteAllHov from '../assets/btn-delete-all-hov.svg';
import btnDeleteAllUp from '../assets/btn-delete-all-up.svg';

class ApplicationGroups extends Component {
    renderFetchStatus() {
        const { applicationGroupsData } = this.props;
        const { loading } = applicationGroupsData || {};

        if (loading) {
            return <Loader />;
        }
    }

    renderHeader() {
        const { intl, openModal, postApplicationGroup } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="content-flex-column">
                <div className="content-flex-row">
                    <div className="layout-icon-background">
                        <AppGroupIcon className="layout-icon" />
                    </div>
                    <div className="content-flex-row layout-summary" />
                    <div className="layout-actions">
                        <div>
                            <ButtonAction
                                btnUp={btnCreateNewAppGrpUp}
                                btnHov={btnCreateNewAppGrpHov}
                                id="agToolbarCreate"
                                label={formatMessage(agMsgs.toolbarCreate)}
                                onClick={() =>
                                    openModal(VolumeGroupsForm, {
                                        dark: true,
                                        descriptionPlaceholder: formatMessage(agMsgs.descriptionPlaceholder),
                                        id: 'applicationGroupCreateFormName',
                                        namePlaceholder: formatMessage(agMsgs.namePlaceholder),
                                        postGroup: postApplicationGroup,
                                        title: formatMessage(agMsgs.createTitle),
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
        const { deleteApplicationGroups, intl, openModal, selectedRows } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="table-header-actions">
                <ButtonAction
                    btnDisable={btnDeleteAllDisable}
                    btnHov={btnDeleteAllHov}
                    btnUp={btnDeleteAllUp}
                    disabled={selectedRows.length < 1}
                    id="agToolbarDelete"
                    onClick={() => {
                        openModal(
                            DeleteForm,
                            {
                                deleteFunc: deleteApplicationGroups,
                                title: formatMessage(agMsgs.deleteTitle),
                            },
                            {
                                message: formatMessage(agMsgs.deleteMsg, {
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

    getAccountName(accountId) {
        const { accountsData } = this.props;
        const { accounts = [] } = accountsData || {};

        const account = accounts.find(account => account.meta.id === accountId);

        return (account && account.name) || '';
    }

    render() {
        const { applicationGroupsData, intl, selectedRows } = this.props;
        const { applicationGroups = [] } = applicationGroupsData || {};
        const { formatMessage } = intl;

        const columns = [
            {
                Header: formatMessage(agMsgs.tableName),
                accessor: 'name',
            },
            {
                Header: formatMessage(agMsgs.accountLabel),
                accessor: 'accountName',
                Cell: row => {
                    return this.getAccountName(row.original.accountId);
                },
            },
            {
                Header: formatMessage(agMsgs.descriptionLabel),
                accessor: 'description',
                minWidth: 350,
            },
            {
                Header: formatMessage(agMsgs.tableTags),
                accessor: 'tags',
                width: 400,
                Cell: row => <span>{renderTags(row.value)}</span>,
            },
            {
                Header: formatMessage(agMsgs.tableActions),
                accessor: 'actions',
                sortable: false,
                width: 120,
                Cell: selected => {
                    const { original, row } = selected || {};
                    const { id, name } = original || {};

                    const { deleteApplicationGroups, openModal, patchApplicationGroup } = this.props;

                    return (
                        <div className="table-actions-cell">
                            <Edit
                                id={`applicationGroupToolbarEdit-${id}`}
                                onClick={() =>
                                    openModal(
                                        VolumeGroupsForm,
                                        {
                                            dark: true,
                                            descriptionPlaceholder: formatMessage(agMsgs.descriptionPlaceholder),
                                            id: 'applicationGroupCreateFormName',
                                            namePlaceholder: formatMessage(agMsgs.namePlaceholder),
                                            patchGroup: patchApplicationGroup,
                                            title: formatMessage(agMsgs.editTitle),
                                        },
                                        { edit: row }
                                    )
                                }
                            />
                            <DeleteForever
                                id={`applicationGroupToolbarDelete-${id}`}
                                onClick={() =>
                                    openModal(
                                        DeleteForm,
                                        {
                                            deleteFunc: () => deleteApplicationGroups(row._original),
                                            title: formatMessage(agMsgs.deleteTitle),
                                        },
                                        {
                                            message: formatMessage(agMsgs.deleteMsg, {
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
            applicationGroups.length > 0
                ? applicationGroups.map(group => {
                      return {
                          name: group.name,
                          accountId: group.accountId,
                          accountName: group.accountName,
                          description: group.description,
                          tags: group.tags,
                          id: group.meta.id,
                      };
                  })
                : [];

        return (
            <div className="component-page">
                {this.renderFetchStatus()}
                {this.renderHeader()}
                <TableContainer
                    columns={columns}
                    component="APPLICATION_GROUPS_TABLE"
                    componentSelectedRows={selectedRows}
                    data={data}
                    dataTestId="application-groups-table"
                    defaultSorted={[{ id: 'name' }]}
                    emptyPlaceholder={{
                        icon: AppGroupEmptyPlaceholder,
                        text: formatMessage(agMsgs.tableEmptyPlaceholder),
                    }}
                    filterLeft
                    selectable
                    title={formatMessage(agMsgs.agTableTitle)}
                    toolbar={this.renderToolbar()}
                />
            </div>
        );
    }
}

ApplicationGroups.propTypes = {
    accountsData: PropTypes.object.isRequired,
    applicationGroupsData: PropTypes.object.isRequired,
    deleteApplicationGroups: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    openModal: PropTypes.func.isRequired,
    patchApplicationGroup: PropTypes.func.isRequired,
    postApplicationGroup: PropTypes.func.isRequired,
    selectedRows: PropTypes.array.isRequired,
};

export default injectIntl(ApplicationGroups);
