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
import { intlShape, injectIntl } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { CheckCircle, Error, Warning } from '@material-ui/icons';

import {
    ALERT_LEVEL_ERROR,
    ALERT_LEVEL_OK,
    ALERT_LEVEL_WARNING,
    COLOR_ERROR,
    COLOR_OK,
    COLOR_WARNING,
} from '../constants';
import { messages } from '../messages/Messages';
import './nudonut.css';

const WIDTH = 40; // width of svg context and viewbox, true width is determined by parent
const HEIGHT = 40; // height of svg context and viewbox, true height is determined by parent
const CENTER_X = WIDTH / 2;
const CENTER_Y = HEIGHT / 2;
const CIRCUMFERENCE = 100; // circumference of 100%, adjust if more granularity is needed
const RADIUS = CIRCUMFERENCE / (2 * Math.PI); // 15.9155
const DIAMETER = RADIUS * 2; // 31.831

const START_X = WIDTH / 2;
const START_Y = (HEIGHT - DIAMETER) / 2;
const HOVER_START_Y = START_Y - 1;
const HOVER_RADIUS = RADIUS + 1;

class NuDonut extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hoverError: false,
            hoverOk: false,
            hoverWarning: false,
        };
    }

    countToDegrees(count) {
        const { countError, countOk, countWarning } = this.props;
        const total = countError + countOk + countWarning;

        if (total <= 0) {
            return 0;
        }

        // count / total = degree / 360
        return (360 * count) / total;
    }

    getColor(level) {
        switch (level) {
            case ALERT_LEVEL_OK:
                return COLOR_OK;
            case ALERT_LEVEL_WARNING:
                return COLOR_WARNING;
            case ALERT_LEVEL_ERROR:
                return COLOR_ERROR;
            default:
                return COLOR_OK;
        }
    }

    getCount(level) {
        const { countError, countOk, countWarning } = this.props;

        switch (level) {
            case ALERT_LEVEL_OK:
                return countOk;
            case ALERT_LEVEL_WARNING:
                return countWarning;
            case ALERT_LEVEL_ERROR:
                return countError;
            default:
                return 0;
        }
    }

    getLevelName(level) {
        const { intl } = this.props;
        const { formatMessage } = intl;

        switch (level) {
            case ALERT_LEVEL_OK:
                return formatMessage(messages.good);
            case ALERT_LEVEL_WARNING:
                return formatMessage(messages.warning);
            case ALERT_LEVEL_ERROR:
                return formatMessage(messages.error);
            default:
                return formatMessage(messages.good);
        }
    }

    handleClickArc(e, level) {
        const { onClickError, onClickOk, onClickWarning } = this.props;

        switch (level) {
            case ALERT_LEVEL_OK:
                if (onClickOk) {
                    onClickOk(e, level);
                }
                break;
            case ALERT_LEVEL_WARNING:
                if (onClickWarning) {
                    onClickWarning(e, level);
                }
                break;
            case ALERT_LEVEL_ERROR:
                if (onClickError) {
                    onClickError(e, level);
                }
                break;
            default:
                break;
        }
    }

    handleHover(level, hoverEnabled = false) {
        switch (level) {
            case ALERT_LEVEL_OK:
                this.setState({ hoverOk: hoverEnabled });
                break;
            case ALERT_LEVEL_WARNING:
                this.setState({ hoverWarning: hoverEnabled });
                break;
            case ALERT_LEVEL_ERROR:
                this.setState({ hoverError: hoverEnabled });
                break;
            default:
                break;
        }
    }

    hasClickHandler(level) {
        const { onClickError, onClickOk, onClickWarning } = this.props;

        if (
            (level === ALERT_LEVEL_OK && onClickOk) ||
            (level === ALERT_LEVEL_WARNING && onClickWarning) ||
            (level === ALERT_LEVEL_ERROR && onClickError)
        ) {
            return true;
        }

        return false;
    }

    polarToCartesian(radius, angleInDegrees) {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

        return {
            x: CENTER_X + radius * Math.cos(angleInRadians),
            y: CENTER_Y + radius * Math.sin(angleInRadians),
        };
    }

    /**
     *
     * @param {number} x is the starting x-coordinate
     * @param {*} y is the starting y-coordinate
     * @param {*} angle value is used to calculate whether to set large-arc-flag (> 180 degrees)
     * @param {*} dX is the destination x-coordinate
     * @param {*} dY is the destination y-coordinate
     * @param {string} level is one of ALERT_LEVEL_OK, ALERT_LEVEL_WARNING, ALERT_LEVEL_ERROR
     * @param {boolean} isHover is rendering the hover overlay of the arc
     */
    renderArc(x, y, angle, dX, dY, level = ALERT_LEVEL_OK, isHover) {
        const { strokeWidth } = this.props;
        const strokeWidthString = Number(strokeWidth).toString();
        const hoverStrokeWidthString = Number(strokeWidth * 1.1).toString();

        const radius = isHover ? HOVER_RADIUS : RADIUS;

        const className = this.hasClickHandler(level) ? 'nu-donut-arc-clickable' : '';

        const path =
            angle === 360 ? (
                <circle
                    className={className}
                    cx={CENTER_X}
                    cy={CENTER_Y}
                    fill="none"
                    stroke={this.getColor(level)}
                    strokeOpacity={isHover ? '0.6' : '1'}
                    strokeWidth={isHover ? hoverStrokeWidthString : strokeWidthString}
                    onClick={e => this.handleClickArc(e, level)}
                    onMouseEnter={() => this.handleHover(level, true)}
                    onMouseLeave={() => this.handleHover(level, false)}
                    r={radius}
                />
            ) : (
                <path
                    className={className}
                    d={`M${x} ${y}
                    A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${dX} ${dY}`}
                    fill="none"
                    stroke={this.getColor(level)}
                    strokeOpacity={isHover ? '0.6' : '1'}
                    strokeWidth={isHover ? hoverStrokeWidthString : strokeWidthString}
                    onClick={e => this.handleClickArc(e, level)}
                    onMouseEnter={() => this.handleHover(level, true)}
                    onMouseLeave={() => this.handleHover(level, false)}
                />
            );

        if (isHover) {
            return (
                <OverlayTrigger
                    overlay={
                        <Tooltip id="tooltip">
                            {this.getLevelName(level)}{' '}
                            <span style={{ color: this.getColor(level) }}>{this.getCount(level)}</span>
                        </Tooltip>
                    }
                >
                    {path}
                </OverlayTrigger>
            );
        }

        return path;
    }

    renderDonut() {
        const { countError, countOk, countWarning, intl, loading, strokeWidth } = this.props;
        const { formatMessage } = intl;
        const { hoverError, hoverOk, hoverWarning } = this.state;

        const backgroundRadius = RADIUS + Math.max(strokeWidth * 0.8, 3);

        const okAngle = this.countToDegrees(countOk);
        const warningAngle = this.countToDegrees(countWarning);
        const errorAngle = this.countToDegrees(countError);

        const okEnd = this.polarToCartesian(RADIUS, okAngle);
        const okHoverEnd = this.polarToCartesian(HOVER_RADIUS, okAngle);
        const warningStart = okEnd;
        const warningHoverStart = okHoverEnd;
        const warningEnd = this.polarToCartesian(RADIUS, okAngle + warningAngle);
        const warningHoverEnd = this.polarToCartesian(HOVER_RADIUS, okAngle + warningAngle);
        const errorStart = warningEnd;
        const errorHoverStart = warningHoverEnd;
        const errorEnd = this.polarToCartesian(RADIUS, okAngle + warningAngle + errorAngle);
        const errorHoverEnd = this.polarToCartesian(HOVER_RADIUS, okAngle + warningAngle + errorAngle);

        return (
            <div className="nu-donut-container">
                <svg
                    version="1.1"
                    baseProfile="full"
                    className="nu-donut"
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle className="nu-donut-bg" cx={CENTER_X} cy={CENTER_Y} r={backgroundRadius} />
                    {loading ? (
                        <text className="nu-donut-loading" x={CENTER_X} y={CENTER_Y}>
                            {formatMessage(messages.loading)}
                        </text>
                    ) : (
                        <Fragment>
                            {this.renderArc(START_X, START_Y, okAngle, okEnd.x, okEnd.y, ALERT_LEVEL_OK)}
                            {hoverOk
                                ? this.renderArc(
                                      START_X,
                                      HOVER_START_Y,
                                      okAngle,
                                      okHoverEnd.x,
                                      okHoverEnd.y,
                                      ALERT_LEVEL_OK,
                                      true
                                  )
                                : null}
                            {this.renderArc(
                                warningStart.x,
                                warningStart.y,
                                warningAngle,
                                warningEnd.x,
                                warningEnd.y,
                                ALERT_LEVEL_WARNING
                            )}
                            {hoverWarning
                                ? this.renderArc(
                                      warningHoverStart.x,
                                      warningHoverStart.y,
                                      warningAngle,
                                      warningHoverEnd.x,
                                      warningHoverEnd.y,
                                      ALERT_LEVEL_WARNING,
                                      true
                                  )
                                : null}
                            {this.renderArc(
                                errorStart.x,
                                errorStart.y,
                                errorAngle,
                                errorEnd.x,
                                errorEnd.y,
                                ALERT_LEVEL_ERROR
                            )}
                            {hoverError
                                ? this.renderArc(
                                      errorHoverStart.x,
                                      errorHoverStart.y,
                                      errorAngle,
                                      errorHoverEnd.x,
                                      errorHoverEnd.y,
                                      ALERT_LEVEL_ERROR,
                                      true
                                  )
                                : null}
                            {this.renderInfo()}
                        </Fragment>
                    )}
                </svg>
            </div>
        );
    }

    renderInfo() {
        const { countError, countOk, countWarning, intl, showDetails } = this.props;
        const { formatMessage } = intl;
        const total = countOk + countWarning + countError;
        const hasProblems = countWarning > 0 || countError > 0;
        const labelOffsetY = showDetails && hasProblems ? 6 : 4;
        const totalOffsetY = showDetails && hasProblems ? 2 : 4;
        const dividerX1 = START_X - 7;
        const dividerX2 = WIDTH - dividerX1;
        const dividerY = CENTER_Y + totalOffsetY + 2;
        const detailsY = dividerY + 4;

        return (
            <g className="nu-donut-info">
                <text className="nu-donut-total-label" x={CENTER_X} y={CENTER_Y - labelOffsetY}>
                    {formatMessage(messages.total)}
                </text>
                <text className="nu-donut-total-value" x={CENTER_X} y={CENTER_Y + totalOffsetY}>
                    {total}
                </text>
                {showDetails && hasProblems ? (
                    <Fragment>
                        <line className="nu-donut-divider" x1={dividerX1} y1={dividerY} x2={dividerX2} y2={dividerY} />
                        <text x={CENTER_X} y={detailsY}>
                            {countError ? <tspan className="nu-donut-error-value">{`${countError} `}</tspan> : null}
                            {countWarning ? <tspan className="nu-donut-warning-value">{countWarning}</tspan> : null}
                        </text>
                    </Fragment>
                ) : null}
            </g>
        );
    }

    renderLegend() {
        const { countError, countOk, countWarning, intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="nu-donut-legend-container">
                <div className="nu-donut-legend">
                    <div className="nu-donut-legend-row">
                        <div className="nu-donut-legend-label">
                            <Error className="nu-donut-legend-icon nuvo-color-critical-red" />
                            {formatMessage(messages.error)}
                        </div>
                        <div className="nu-donut-legend-value nuvo-color-critical-red">{countError}</div>
                    </div>
                    <div className="divider-horizontal mb15" />
                    <div className="nu-donut-legend-row">
                        <div className="nu-donut-legend-label">
                            <Warning className="nu-donut-legend-icon nuvo-color-neutral-yellow" />
                            {formatMessage(messages.warning)}
                        </div>
                        <div className="nu-donut-legend-value nuvo-color-neutral-yellow">{countWarning}</div>
                    </div>
                    <div className="divider-horizontal mb15" />
                    <div className="nu-donut-legend-row">
                        <div className="nu-donut-legend-label">
                            <CheckCircle className="nu-donut-legend-icon nuvo-color-safe-green" />
                            {formatMessage(messages.good)}
                        </div>
                        <div className="nu-donut-legend-value nuvo-color-safe-green">{countOk}</div>
                    </div>
                    <div className="divider-horizontal" />
                </div>
            </div>
        );
    }

    render() {
        const { id, legend, name } = this.props;

        return (
            <div className="nu-donut-set" id={id}>
                {name ? <div className="nu-donut-name">{name}</div> : null}
                {legend ? (
                    <div className="nu-donut-and-legend-container">
                        <div className="nu-donut-and-legend">
                            {this.renderDonut()}
                            {this.renderLegend()}
                        </div>
                    </div>
                ) : (
                    this.renderDonut()
                )}
            </div>
        );
    }
}

NuDonut.propTypes = {
    countError: PropTypes.number,
    countOk: PropTypes.number,
    countWarning: PropTypes.number,
    id: PropTypes.string,
    intl: intlShape.isRequired,
    legend: PropTypes.bool,
    loading: PropTypes.bool,
    name: PropTypes.node,
    onClickError: PropTypes.func,
    onClickOk: PropTypes.func,
    onClickWarning: PropTypes.func,
    showDetails: PropTypes.bool,
    strokeWidth: PropTypes.number,
};

NuDonut.defaultProps = {
    countError: 0,
    countOk: 0,
    countWarning: 0,
    id: 'nu-donut',
    strokeWidth: 5,
};

export default injectIntl(NuDonut);
