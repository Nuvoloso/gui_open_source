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
import { Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';

class TableActionIcon extends Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        const { disabled, onClick } = this.props;

        if (onClick && !disabled) {
            onClick();
        }
    }

    renderIcon() {
        const { className, disabled, glyph, id, materialIcon, testid } = this.props;

        const Icon = glyph ? Glyphicon : materialIcon || 'i';

        return (
            <Icon
                aria-hidden="true"
                className={`${className} ${disabled ? 'disabled' : ''}`}
                data-testid={testid}
                glyph={glyph}
                id={id}
                onClick={this.handleClick}
            />
        );
    }

    render() {
        const { id, tooltip } = this.props;

        if (tooltip) {
            return (
                <OverlayTrigger overlay={<Tooltip id={`${id}-tooltip`}>{tooltip}</Tooltip>} placement="top">
                    {this.renderIcon()}
                </OverlayTrigger>
            );
        }

        return this.renderIcon();
    }
}

TableActionIcon.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    glyph: PropTypes.string,
    id: PropTypes.string,
    materialIcon: PropTypes.func,
    onClick: PropTypes.func,
    testid: PropTypes.string,
    tooltip: PropTypes.string,
};

TableActionIcon.defaultProps = {
    className: '',
};

export default TableActionIcon;
