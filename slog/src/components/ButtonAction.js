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

/**
 * Wrapper for icons to display correct icon depending on state: normal,
 * hover, disabled.
 * Label: Optional I18N string
 */
class ButtonAction extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hover: false,
        };
        this.hoverOn = this.hoverOn.bind(this);
        this.hoverOff = this.hoverOff.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    hoverOn() {
        this.setState({ hover: true });
    }

    hoverOff() {
        this.setState({ hover: false });
    }

    onClick() {
        const { disabled, onClick } = this.props;

        if (onClick && !disabled) {
            onClick();
        }
    }

    getImgSrc() {
        const { btnDisable, btnHov, btnUp, disabled } = this.props;
        const { hover } = this.state;

        return disabled ? btnDisable : hover ? btnHov : btnUp;
    }

    renderImage() {
        const { disabled, icon } = this.props;

        const iconCursorClassName = disabled ? 'action-icon-disabled' : '';

        if (icon) {
            return <div className={`action-icon ${iconCursorClassName}`}>{icon}</div>;
        }

        return <img alt="" className={iconCursorClassName} src={this.getImgSrc()} />;
    }

    render() {
        const { id, label } = this.props;

        return (
            <div
                className="action-item content-flex-row"
                id={id}
                onMouseOver={this.hoverOn}
                onMouseOut={this.hoverOff}
                onClick={this.onClick}
            >
                {this.renderImage()}
                {label ? <div className="nuvo-action-text">{label}</div> : null}
            </div>
        );
    }
}

ButtonAction.propTypes = {
    btnDisable: PropTypes.string,
    btnHov: PropTypes.string,
    btnUp: PropTypes.string,
    disabled: PropTypes.bool,
    icon: PropTypes.object,
    id: PropTypes.string,
    label: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

export default ButtonAction;
