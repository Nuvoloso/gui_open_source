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

import CSPs from '../components/CSPs';
import { deleteCSPs, getCSPs, patchCSP, postCSP } from '../actions/cspActions';
import { openModal } from '../actions/modalActions';
import { getAccounts } from '../actions/accountActions';

class CSPsContainer extends Component {
    constructor(props) {
        super(props);

        this.deleteCSPs = this.deleteCSPs.bind(this);
        this.openModal = this.openModal.bind(this);
        this.patchCSP = this.patchCSP.bind(this);
        this.postCSP = this.postCSP.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(getAccounts());
        dispatch(getCSPs());
    }

    deleteCSPs() {
        const { dispatch, tableCsps } = this.props;
        const { selectedRows = [] } = tableCsps || {};
        dispatch(deleteCSPs(selectedRows));
    }

    openModal(content, config, values) {
        const { dispatch } = this.props;
        dispatch(openModal(content, config, values));
    }

    patchCSP(id, params) {
        const { dispatch } = this.props;
        dispatch(patchCSP(id, params));
    }

    postCSP(params) {
        const { dispatch, session } = this.props;
        const { accountId } = session;
        dispatch(postCSP({ ...params, accountId }));
    }

    render() {
        const { accountsData, cspsData, tableCsps } = this.props;
        return (
            <CSPs
                accountsData={accountsData}
                cspsData={cspsData}
                deleteCSPs={this.deleteCSPs}
                openModal={this.openModal}
                patchCSP={this.patchCSP}
                postCSP={this.postCSP}
                selectedRows={tableCsps.selectedRows}
            />
        );
    }
}

CSPsContainer.propTypes = {
    accountsData: PropTypes.object.isRequired,
    cspsData: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    session: PropTypes.object.isRequired,
    tableCsps: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { accountsData, cspsData, session, tableCsps } = state;
    return {
        accountsData,
        cspsData,
        session,
        tableCsps,
    };
}

export default connect(mapStateToProps)(CSPsContainer);
