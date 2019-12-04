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

import ApplicationGroups from '../components/ApplicationGroups';
import { openModal } from '../actions/modalActions';
import { deleteAG, getAGs, patchAG, postAG } from '../actions/applicationGroupActions';
import * as types from '../actions/types';
import { getVolumeSeries } from '../actions/volumeSeriesActions';
import { getAccounts } from '../actions/accountActions';

class ApplicationGroupsContainer extends Component {
    constructor(props) {
        super(props);

        this.deleteApplicationGroups = this.deleteApplicationGroups.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchApplicationGroup = this.patchApplicationGroup.bind(this);
        this.postApplicationGroup = this.postApplicationGroup.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getAGs());
        dispatch(getAccounts());
    }

    componentDidUpdate(prevProps) {
        const { dispatch, applicationGroupsData } = this.props;
        const { applicationGroupsData: prevApplicationGroupsData } = prevProps;
        const { error } = applicationGroupsData || {};
        const { error: prevError } = prevApplicationGroupsData || {};

        if (error !== prevError) {
            if (error) {
                const messages = [error];
                dispatch({ type: types.SET_ERROR_MESSAGES, messages });
            } else {
                dispatch({ type: types.CLEAR_ERROR_MESSAGES });
            }
        }
    }

    deleteApplicationGroups(ag) {
        const { dispatch, tableAGs } = this.props;
        dispatch(deleteAG(ag ? [ag] : tableAGs.selectedRows));
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    patchApplicationGroup(id, params) {
        const { dispatch } = this.props;
        dispatch(patchAG(id, params));
        dispatch(getVolumeSeries());
    }

    postApplicationGroup(name, description, tags) {
        const { dispatch } = this.props;
        dispatch(postAG(name, description, tags));
    }

    render() {
        const { accountsData, applicationGroupsData, servicePlansData, tableAGs } = this.props;

        return (
            <ApplicationGroups
                accountsData={accountsData}
                applicationGroupsData={applicationGroupsData}
                deleteApplicationGroups={this.deleteApplicationGroups}
                openModal={this.openModal}
                patchApplicationGroup={this.patchApplicationGroup}
                postApplicationGroup={this.postApplicationGroup}
                selectedRows={tableAGs.selectedRows}
                servicePlansData={servicePlansData}
            />
        );
    }
}

ApplicationGroupsContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    applicationGroupsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    servicePlansData: PropTypes.object.isRequired,
    tableAGs: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { accountsData, applicationGroupsData, servicePlansData, tableAGs } = state;
    return {
        accountsData,
        applicationGroupsData,
        servicePlansData,
        tableAGs,
    };
}

export default connect(mapStateToProps)(ApplicationGroupsContainer);
