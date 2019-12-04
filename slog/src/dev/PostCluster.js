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
import { Button, ButtonGroup, ButtonToolbar, Glyphicon } from 'react-bootstrap';

import Loader from '../components/Loader';
import NodeForm from './NodeForm';
import PostClusterForm from './PostClusterForm';
import TableContainer from '../containers/TableContainer';
import TableWrapper from '../components/Table';
import { clusterMsgs } from '../messages/Cluster';
import { formatTime, renderTags } from '../components/utils';

class PostCluster extends Component {
    renderFetchStatus() {
        const { clustersData } = this.props;
        const { loading } = clustersData || {};

        if (loading) {
            return <Loader />;
        }
    }

    renderSubrow(row) {
        const { intl } = this.props;
        const { formatMessage } = intl;
        const { original } = row;
        const { nodes = [] } = original || {};

        const columns = [
            {
                Header: formatMessage(clusterMsgs.tableNode),
                accessor: 'name',
            },
            {
                Header: formatMessage(clusterMsgs.tableServiceState),
                accessor: 'state',
            },
            {
                Header: formatMessage(clusterMsgs.tableLastHeartbeat),
                accessor: 'heartbeatTime',
                Cell: row => <div>{formatTime(row.value)}</div>,
            },
            {
                Header: formatMessage(clusterMsgs.tableTags),
                accessor: 'tags',
                width: 400,
                Cell: row => <span>{renderTags(row.value)}</span>,
            },
        ];

        const data = nodes.map(node => {
            const { meta, name, service, tags } = node;
            const { id } = meta || {};
            const { heartbeatTime, state } = service || {};

            return {
                id,
                heartbeatTime,
                name,
                state,
                tags,
            };
        });

        return (
            <div className="subrow">
                {columns.length > 0 ? (
                    <div className="mb15">
                        <TableWrapper columns={columns} data={data} minRows={1} />
                    </div>
                ) : null}
            </div>
        );
    }

    renderToolbar() {
        const { clustersData, deleteNode, openModal, postCluster, patchNode, postNode } = this.props;
        const { clusters = [] } = clustersData || {};

        return (
            <ButtonToolbar>
                <ButtonGroup className="nv-toolbar">
                    <Button
                        id="clusterToolbarCreate"
                        onClick={() => openModal(PostClusterForm, { title: 'Create Cluster', postCluster })}
                    >
                        <Glyphicon glyph="plus-sign" /> Create Cluster
                    </Button>
                </ButtonGroup>
                <ButtonGroup className="nv-toolbar">
                    <Button
                        id="nodeToolbarCreate"
                        onClick={() => openModal(NodeForm, { title: 'Add Node', postNode }, { clusters })}
                    >
                        <Glyphicon glyph="plus-sign" /> Add Node
                    </Button>
                    <Button
                        id="nodeToolbarUpdate"
                        onClick={() =>
                            openModal(NodeForm, { updateMode: true, title: 'Edit Node', patchNode }, { clusters })
                        }
                    >
                        <Glyphicon glyph="pencil" /> Edit Node
                    </Button>
                    <Button
                        id="nodeToolbarDelete"
                        onClick={() =>
                            openModal(NodeForm, { deleteMode: true, title: 'Delete Node', deleteNode }, { clusters })
                        }
                    >
                        <Glyphicon glyph="trash" /> Delete Node
                    </Button>
                </ButtonGroup>
            </ButtonToolbar>
        );
    }

    render() {
        const { clustersData, intl } = this.props;
        const { clusters = [] } = clustersData || {};
        const { formatMessage } = intl;

        const columns = [
            {
                Header: formatMessage(clusterMsgs.tableName),
                accessor: 'name',
            },
            {
                Header: formatMessage(clusterMsgs.tableCspDomain),
                accessor: 'cspDomainName',
            },
            {
                Header: formatMessage(clusterMsgs.tableClusterType),
                accessor: 'clusterType',
            },
            {
                Header: 'id',
                accessor: 'id',
                show: false,
            },
            {
                Header: 'cspDomainId',
                accessor: 'cspDomainId',
                show: false,
            },
        ];

        const data =
            clusters.length > 0
                ? clusters.map(cluster => {
                      return {
                          id: cluster.meta.id,
                          clusterAttributes: cluster.clusterAttributes,
                          clusterType: cluster.clusterType,
                          cspDomainId: cluster.cspDomainId,
                          cspDomainName: cluster.cspDomainName,
                          name: cluster.name,
                          nodes: cluster.nodes,
                      };
                  })
                : [];

        return (
            <div>
                {this.renderFetchStatus()}
                <TableContainer
                    columns={columns}
                    component="DEV_CLUSTERS"
                    data={data}
                    defaultSorted={[{ id: 'name' }]}
                    dataTestId="clusters-table"
                    subrow={this.renderSubrow.bind(this)}
                    title={formatMessage(clusterMsgs.tableTitle)}
                    toolbar={this.renderToolbar()}
                />
            </div>
        );
    }
}

PostCluster.propTypes = {
    clustersData: PropTypes.object.isRequired,
    deleteNode: PropTypes.func,
    intl: intlShape.isRequired,
    openModal: PropTypes.func.isRequired,
    postCluster: PropTypes.func,
    patchNode: PropTypes.func,
    postNode: PropTypes.func,
};

export default injectIntl(PostCluster);
