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
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';

import PostCluster from './PostCluster';
import TableHeader from '../components/TableHeader';
import UsersContainer from '../containers/UsersContainer';
import VolumeSeriesContainer from '../containers/VolumeSeriesContainer';
import { getClusters } from '../actions/clusterActions';
import { getCSPs } from '../actions/cspActions';
import { openModal } from '../actions/modalActions';
import { deleteNode, postCluster, patchNode, postNode } from './devActions';
import { userMsgs } from '../messages/User';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';
import * as types from '../actions/types';
import './dev.css';

class DevContainer extends Component {
    constructor(props) {
        super(props);

        this.deleteNode = this.deleteNode.bind(this);
        this.openModal = this.openModal.bind(this);
        this.postCluster = this.postCluster.bind(this);
        this.patchNode = this.patchNode.bind(this);
        this.postNode = this.postNode.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getClusters());
        dispatch(getCSPs());
    }

    deleteNode(id, name) {
        const { dispatch } = this.props;
        dispatch(deleteNode(id, name));
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    postCluster(name, cspDomainId) {
        const { dispatch } = this.props;
        dispatch(postCluster(name, cspDomainId));
    }

    patchNode(id, paramsAsJsonString) {
        const { dispatch } = this.props;
        try {
            const params = JSON.parse(paramsAsJsonString) || {};
            dispatch(patchNode(id, params));
        } catch (e) {
            const { message = '' } = e || {};
            dispatch({ type: types.ADD_ERROR_MESSAGE, message: `Error parsing JSON: ${message}` });
        }
    }

    postNode(name, clusterId) {
        const { dispatch } = this.props;
        dispatch(postNode(name, clusterId));
    }

    renderClusters() {
        const { clustersData, cspsData } = this.props;

        return (
            <PostCluster
                clustersData={clustersData}
                cspsData={cspsData}
                deleteNode={this.deleteNode}
                openModal={this.openModal}
                postCluster={this.postCluster}
                patchNode={this.patchNode}
                postNode={this.postNode}
            />
        );
    }

    renderUsers() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div>
                <TableHeader title={formatMessage(userMsgs.tableTitle)} />
                <div className="divider-horizontal " />
                <UsersContainer />
            </div>
        );
    }

    renderVolumes() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div>
                <TableHeader title={formatMessage(volumeSeriesMsgs.tableTitle)} />
                <div className="divider-horizontal " />
                <VolumeSeriesContainer enableDelete enableMount selectable />
            </div>
        );
    }

    render() {
        return (
            <Fragment>
                {this.renderClusters()}
                {this.renderVolumes()}
                {this.renderUsers()}
                <div className="mb15" />
            </Fragment>
        );
    }
}

DevContainer.propTypes = {
    clustersData: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
};

function mapStateToProps(state) {
    const { clustersData, cspsData } = state;
    return {
        clustersData,
        cspsData,
    };
}

export default injectIntl(connect(mapStateToProps)(DevContainer));
