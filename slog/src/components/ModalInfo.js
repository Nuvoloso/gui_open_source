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

import './modal.css';

class ModalInfo extends Component {
    render() {
        const { children } = this.props;

        return (
            <div>
                <div className="modal-divider" />
                <div className="modal-info-outer">
                    <div className="modal-info-inner">
                        <div className="modal-info-content">{children}</div>
                    </div>
                </div>
            </div>
        );
    }
}

ModalInfo.propTypes = {
    children: PropTypes.node,
};

export default ModalInfo;
