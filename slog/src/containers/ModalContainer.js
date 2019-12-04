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

import ModalWrapper from '../components/Modal';
import { closeModal } from '../actions/modalActions';

class ModalContainer extends Component {
    constructor(props) {
        super(props);

        this.close = this.close.bind(this);
    }

    close() {
        const { dispatch } = this.props;

        dispatch(closeModal());
    }

    render() {
        const { modal } = this.props;
        const { content } = modal;

        if (!content) {
            return null;
        }

        return <ModalWrapper closeModal={this.close} modal={modal} />;
    }
}

ModalContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    modal: PropTypes.object,
};

function mapStateToProps(state) {
    const { modal } = state;
    return {
        modal,
    };
}

export default connect(mapStateToProps)(ModalContainer);
