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

import ConsistencyGroups from '../components/ConsistencyGroups';
import { openModal } from '../actions/modalActions';
import { deleteCG, getCGs, patchCG, postCG } from '../actions/consistencyGroupActions';
import { getAGs } from '../actions/applicationGroupActions';
import { getVolumeSeries } from '../actions/volumeSeriesActions';
import * as types from '../actions/types';
import { getAccounts } from '../actions/accountActions';

class ConsistencyGroupsContainer extends Component {
    constructor(props) {
        super(props);

        this.deleteConsistencyGroups = this.deleteConsistencyGroups.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchConsistencyGroup = this.patchConsistencyGroup.bind(this);
        this.postConsistencyGroup = this.postConsistencyGroup.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getAGs());
        dispatch(getCGs());
        dispatch(getAccounts());
    }

    componentDidUpdate(prevProps) {
        const { dispatch, consistencyGroupsData } = this.props;
        const { consistencyGroupsData: prevConsistencyGroupsData } = prevProps;
        const { error } = consistencyGroupsData || {};
        const { error: prevError } = prevConsistencyGroupsData || {};

        if (error !== prevError) {
            if (error) {
                const messages = [error];
                dispatch({ type: types.SET_ERROR_MESSAGES, messages });
            } else {
                dispatch({ type: types.CLEAR_ERROR_MESSAGES });
            }
        }
    }

    deleteConsistencyGroups(cg) {
        const { dispatch, tableCGs } = this.props;
        const { selectedRows = [] } = tableCGs || {};
        dispatch(deleteCG(cg ? [cg] : selectedRows));
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    patchConsistencyGroup(id, params) {
        const { dispatch } = this.props;
        dispatch(patchCG(id, params));
        dispatch(getVolumeSeries());
    }

    postConsistencyGroup(name, applicationGroupIds, description, tags) {
        const { dispatch } = this.props;
        dispatch(postCG(name, applicationGroupIds, description, tags));
    }

    render() {
        const { accountsData, applicationGroupsData, consistencyGroupsData, tableCGs } = this.props;

        return (
            <ConsistencyGroups
                accountsData={accountsData}
                applicationGroupsData={applicationGroupsData}
                consistencyGroupsData={consistencyGroupsData}
                deleteConsistencyGroups={this.deleteConsistencyGroups}
                openModal={this.openModal}
                patchConsistencyGroup={this.patchConsistencyGroup}
                postConsistencyGroup={this.postConsistencyGroup}
                selectedRows={tableCGs.selectedRows}
            />
        );
    }
}

ConsistencyGroupsContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    applicationGroupsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    tableCGs: PropTypes.object.isRequired,
    consistencyGroupsData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { accountsData, applicationGroupsData, tableCGs, consistencyGroupsData } = state;
    return {
        accountsData,
        applicationGroupsData,
        tableCGs,
        consistencyGroupsData,
    };
}

export default connect(mapStateToProps)(ConsistencyGroupsContainer);
