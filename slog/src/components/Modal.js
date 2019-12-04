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

import { Modal } from 'react-bootstrap';
import Draggable from 'react-draggable';

import DeleteForm from './DeleteForm';

class ModalWrapper extends Component {
    renderModal() {
        const { closeModal, modal } = this.props;
        const { config, content, values } = modal;
        const { className, dark, disableClose, disableDraggable, small, title } = config || '';

        const ModalComponent = content;

        return (
            <Modal
                backdrop={disableClose ? 'static' : true}
                backdropClassName={`${className} ${dark ? 'dark' : ''}`}
                bsSize={small ? 'sm' : 'lg'}
                className={`${className} ${dark || ModalComponent === DeleteForm ? 'dark' : ''}`}
                keyboard={!disableClose}
                onHide={closeModal}
                show={content !== null}
            >
                {title ? (
                    <Modal.Header className={`modalHeader ${disableDraggable ? 'disable-draggable' : ''}`}>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                ) : null}
                <ModalComponent closeModal={closeModal} config={config} values={values} />
            </Modal>
        );
    }

    render() {
        const { modal } = this.props;
        const { config } = modal;
        const { disableDraggable } = config || '';

        if (disableDraggable) {
            return this.renderModal();
        }

        return <Draggable handle=".modalHeader">{this.renderModal()}</Draggable>;
    }
}

ModalWrapper.propTypes = {
    closeModal: PropTypes.func.isRequired,
    modal: PropTypes.object.isRequired,
};

export default ModalWrapper;
