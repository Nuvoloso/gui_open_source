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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Collapse } from 'react-bootstrap';
import _ from 'lodash';

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import Loader from './Loader';
import CreateProtectionDomainDialog from './CreateProtectionDomainDialog';
import DeleteForm from './DeleteForm';
import SelectTags from './SelectTags';

import { renderTags } from './utils';

import TableActionIcon from './TableActionIcon';

import ProtectionDomainDetailsForm from './ProtectionDomainDetailsForm';
import TableContainer from '../containers/TableContainer';

import { cspDomainMsgs} from '../messages/CSPDomain';

import * as constants from '../constants';

import { Check, Details, DeleteForever, Edit } from '@material-ui/icons';
import { ReactComponent as AccountIcon } from '../assets/account.svg';
import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';
import btnDeleteAllDisable from '../assets/btn-delete-all-disable.svg';
import btnDeleteAllHov from '../assets/btn-delete-all-hov.svg';
import btnDeleteAllUp from '../assets/btn-delete-all-up.svg';

class ProtectionDomains extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editId: '',
            editProtectionDomain: '',
            editTags: [],
        };

        this.handleEdit = this.handleEdit.bind(this);
        this.handleEditChange = this.handleEditChange.bind(this);
        this.handleEditChangeTags = this.handleEditChangeTags.bind(this);
        this.handleEditSubmit = this.handleEditSubmit.bind(this);
        this.handleSetActiveDomain = this.handleSetActiveDomain.bind(this);
    }

    disableEditSubmit() {
        const { editProtectionDomain, editTags } = this.state;
        const { _original } = editProtectionDomain || {};
        const { tags } = _original || {};

        return _.isEqual(editTags, tags);
    }

    handleDelete(protectionDomain) {
        const { deleteProtectionDomain, intl, openModal, selectedRows } = this.props;
        const { formatMessage } = intl;
        const { name } = protectionDomain || selectedRows[0] || {};

        openModal(
            DeleteForm,
            {
                title: formatMessage(cspDomainMsgs.deleteProtectionDomainTitle, {
                    count: protectionDomain ? 1 : selectedRows.length,
                }),
                deleteFunc: () => {
                    return deleteProtectionDomain(protectionDomain);
                },
            },
            {
                message: (
                    <div>
                        <div>
                            {formatMessage(cspDomainMsgs.deleteProtectionDomainMsg, {
                                count: protectionDomain ? 1 : selectedRows.length,
                                name,
                            })}
                        </div>
                    </div>
                ),
            }
        );
    }

    handleEdit(selectedRow) {
        const { _original, id } = selectedRow || {};
        const { tags = [] } = _original || {};

        this.setState({
            editId: id,
            editProtectionDomain: selectedRow,
            editTags: tags,
        });
    }

    handleEditChange(name, value) {
        if (name) {
            this.setState({ [name]: value });
        }
    }

    handleEditChangeTags(e) {
        const { target } = e || {};
        const { value = [] } = target || {};
        this.setState({ editTags: value });
    }

    handleEditSubmit() {
        const { patchProtectionDomain } = this.props;
        const { editId, editProtectionDomain, editTags } = this.state;
        const { _original } = editProtectionDomain || {};
        const { tags } = _original || {};

        if (patchProtectionDomain) {
            const params = {
                ...(!_.isEqual(editTags, tags) && { tags: editTags }),
            };
            patchProtectionDomain(editId, params);
        }

        this.handleEdit(null);
    }

    renderFetchStatus() {
        const { protectionDomainHistoryData, protectionDomainsData } = this.props;

        if (protectionDomainsData.loading || protectionDomainHistoryData.loading) {
            return <Loader />;
        }
    }

    renderHeader() {
        const { dialogOpenCreate, postProtectionDomain } = this.props;

        return (
            <div className="content-flex-column">
                <div className="content-flex-row">
                    <div className="layout-icon-background">
                        <AccountIcon className="layout-icon" />
                    </div>
                    <div className="content-flex-row layout-summary" />
                </div>
                <div className="divider-horizontal" />
                <Collapse in={dialogOpenCreate} unmountOnExit>
                    <div>
                        <CreateProtectionDomainDialog
                            cancel={this.dialogToggleCreate}
                            onSubmit={postProtectionDomain}
                        />
                    </div>
                </Collapse>
            </div>
        );
    }

    renderToolbar() {
        const { selectedRows } = this.props;

        return (
            <div className="table-header-actions">
                <ButtonAction
                    btnDisable={btnDeleteAllDisable}
                    btnHov={btnDeleteAllHov}
                    btnUp={btnDeleteAllUp}
                    disabled={selectedRows.length < 1}
                    id="userToolbarDelete"
                    onClick={() => this.handleDelete()}
                />
            </div>
        );
    }

    handleSetActiveDomain(protectionDomain, resourceId) {
        const { postAccountProtectionDomainSet } = this.props;

        if (postAccountProtectionDomainSet) {
            postAccountProtectionDomainSet(protectionDomain, resourceId);
        }
    }

    renderActions(selected) {
        const { intl, openModal } = this.props;
        const { formatMessage } = intl;
        const { editProtectionDomain } = this.state;
        const { original, row } = selected || {};
        const { id } = original || {};

        return (
            <div className="table-actions-cell">
                {editProtectionDomain && editProtectionDomain.id === id ? (
                    <Fragment>
                        <ButtonAction
                            btnUp={btnAltSaveUp}
                            btnHov={btnAltSaveHov}
                            btnDisable={btnAltSaveDisable}
                            disabled={this.disableEditSubmit()}
                            onClick={this.handleEditSubmit}
                        />
                        <ButtonAction btnUp={btnCancelUp} btnHov={btnCancelHov} onClick={() => this.handleEdit(null)} />
                    </Fragment>
                ) : (
                    <Fragment>
                        <TableActionIcon
                            id={`volumeSeriesToolbarBind-${id}`}
                            materialIcon={Details}
                            onClick={() => {
                                openModal(
                                    ProtectionDomainDetailsForm,
                                    {
                                        dark: true,
                                        id: 'protectionDomainsSetActiveDomain',
                                        title: formatMessage(cspDomainMsgs.protectionInformationDialogTitle),
                                    },
                                    {
                                        protectionDomain: row._original,
                                    }
                                );
                            }}
                            tooltip={formatMessage(cspDomainMsgs.protectionInformationActionTooltip)}
                        />
                        <Edit id={`protectionDomainEdit-${id}`} onClick={() => this.handleEdit(row)} />
                        <DeleteForever
                            id={`volumeSeriesToolbarDelete-${id}`}
                            onClick={() => this.handleDelete(row._original)}
                        />
                    </Fragment>
                )}
            </div>
        );
    }

    render() {
        const {
            account,
            csp,
            intl,
            protectionDomainHistoryData,
            protectionDomainsData,
            selectedRows,
            tableOnly,
        } = this.props;
        const { formatMessage } = intl;
        const { editProtectionDomain } = this.state;
        const { protectionDomains = [] } = protectionDomainsData || {};
        const { protectionDomainHistory = [] } = protectionDomainHistoryData || {};

        const columns = [
            {
                Header: formatMessage(cspDomainMsgs.protectionDomainTableHeaderName),
                accessor: 'name',
                editable: false,
                width: 300,
            },
            {
                Header: formatMessage(cspDomainMsgs.protectionDomainTableHeaderActive),
                accessor: 'isAssociated',
                editable: false,
                width: 70,
                Cell: row => {
                    const { original } = row || {};
                    const { isAssociated } = original || {};

                    if (isAssociated) {
                        return (
                            <div className="table-check">
                                <Check />
                            </div>
                        );
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableType),
                accessor: 'pdType',
                editable: false,
                width: 70,
            },
            {
                Header: formatMessage(cspDomainMsgs.protectionDomainTableHeaderEncryption),
                accessor: 'encryptionAlgorithm',
                editable: false,
                width: 120,
            },
            {
                Header: formatMessage(cspDomainMsgs.protectionDomainTableHeaderPassphrase),
                accessor: 'passphrase',
                editable: false,
                width: 200,
                Cell: row => {
                    const { index, original } = row || {};
                    const { encryptionPassphrase } = original || {};
                    const { value } = encryptionPassphrase || {};

                    return (
                        <FieldGroup
                            id={`protectionDomainsTable-${index}`}
                            type="password-static"
                            classNameText="password-static"
                            value={value}
                        />
                    );
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.protectionDomainTableHeaderRegion),
                accessor: 'region',
                width: 80,
            },
            {
                Header: formatMessage(cspDomainMsgs.protectionDomainTableHeaderBucket),
                accessor: 'bucketName',
                width: 300,
            },
            {
                Header: 'Tags',
                accessor: 'tags',
                editable: true,
                Cell: row => {
                    const { editTags } = this.state;
                    const { original, value = [] } = row || {};
                    const { id } = original || {};
                    const { id: editProtectionDomainId } = editProtectionDomain || {};

                    if (id === editProtectionDomainId) {
                        return <SelectTags onChange={this.handleEditChangeTags} tags={editTags} />;
                    } else {
                        const displayTags = value.filter(tag => !tag.startsWith('snap-'));
                        return renderTags(displayTags);
                    }
                },
            },
            {
                Header: formatMessage(cspDomainMsgs.tableActions),
                accessor: 'actions',
                sortable: false,
                width: 120,
                Cell: (selected = {}) => {
                    return this.renderActions(selected);
                },
            },
            {
                Header: 'id',
                show: false,
                accessor: 'id',
            },
        ];

        // look up default protection domain
        const { protectionDomains: accountProtectionDomains = {}, snapshotCatalogPolicy = {} } = account || {};
        const defaultProtectionDomain = csp
            ? accountProtectionDomains[csp.meta.id]
            : accountProtectionDomains[constants.PROTECTION_DOMAIN_DEFAULT] || '';
        const snapshotCatalogId = snapshotCatalogPolicy['protectionDomainId'] || '';

        const data = [];
        protectionDomains.forEach(pd => {
            const { editId } = this.state;
            const { meta, encryptionAlgorithm, name, encryptionPassphrase, tags } = pd || {};
            const { id } = meta || {};
            const { cspDomainAttributes } = csp || {};
            const { aws_protection_store_bucket_name, aws_region } = cspDomainAttributes || {};
            const { value: bucketName } = aws_protection_store_bucket_name || {};
            const { value: region } = aws_region || {};

            const previous = protectionDomainHistory.find(record => {
                return record.objectId === id && record.refObjectId === csp.meta.id;
            });

            if (!previous && defaultProtectionDomain !== id && snapshotCatalogId !== id) {
                return;
            }

            const pdType = snapshotCatalogId === id ? formatMessage(cspDomainMsgs.tableTypeCatalog) : formatMessage(cspDomainMsgs.tableTypeData);

            data.push({
                bucketName,
                edit: id === editId,
                encryptionAlgorithm,
                encryptionPassphrase,
                id,
                isAssociated: defaultProtectionDomain === id || snapshotCatalogId === id,
                pdType,
                name,
                region,
                tags,
            });
        });

        return (
            <div className="dark">
                {this.renderFetchStatus()}
                {tableOnly ? null : this.renderHeader()}
                <TableContainer
                    columns={columns}
                    component="PROTECTION_DOMAINS"
                    componentSelectedRows={selectedRows}
                    data={data}
                    defaultSorted={[{ id: 'name' }]}
                    id="protection-domains"
                    filterLeft
                    selectable
                    title={formatMessage(cspDomainMsgs.protectionDomainsTableTitle)}
                    toolbar={this.renderToolbar()}
                />
            </div>
        );
    }
}

ProtectionDomains.propTypes = {
    account: PropTypes.object,
    csp: PropTypes.object.isRequired,
    deleteProtectionDomain: PropTypes.func.isRequired,
    dialogOpenCreate: PropTypes.bool,
    intl: intlShape.isRequired,
    openModal: PropTypes.func.isRequired,
    patchProtectionDomain: PropTypes.func,
    postAccountProtectionDomainSet: PropTypes.func,
    postProtectionDomain: PropTypes.func,
    protectionDomainHistoryData: PropTypes.object,
    protectionDomainsData: PropTypes.object,
    selectedRows: PropTypes.array.isRequired,
    tableOnly: PropTypes.bool,
};

export default injectIntl(ProtectionDomains);
