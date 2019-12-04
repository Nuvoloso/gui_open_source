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
import { intlShape, injectIntl } from 'react-intl';

import ButtonAction from './ButtonAction';
import FieldGroup from './FieldGroup';
import Slider from 'rc-slider';

import { bytesFromUnit, bytesToUnit, formatBytes } from './utils';
import { messages } from '../messages/Messages';
import { servicePlanMsgs } from '../messages/ServicePlan';
import { spaTagGetCost } from '../containers/spaUtils';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';

import btnAltSaveDisable from '../btn-alt-save-disable.svg';
import btnAltSaveHov from '../btn-alt-save-hov.svg';
import btnAltSaveUp from '../btn-alt-save-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';
import btnCancelUp from '../btn-cancel-up.svg';

class PerformanceDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            initialCapacity: 0,
            performanceCapacity: 0,
        };

        this.disablePerformanceSave = this.disablePerformanceSave.bind(this);
        this.onSliderChange = this.onSliderChange.bind(this);
        this.save = this.save.bind(this);
        this.volumeCost = this.volumeCost.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        const { volume = {} } = this.props;
        const totalCapacity = bytesToUnit(volume.sizeBytes) + bytesToUnit(volume.spaAdditionalBytes);

        if (volume) {
            this.setState({
                performanceCapacity: totalCapacity,
                initialCapacity: totalCapacity,
            });
        }
    }

    volumeCost() {
        const { volume = {}, servicePlanAllocationsData = {} } = this.props;
        const { servicePlanAllocationId } = volume || {};
        const { servicePlanAllocations } = servicePlanAllocationsData || {};
        const spa = servicePlanAllocations.find(spa => {
            const { meta } = spa || {};
            const { id } = meta || {};
            return id === servicePlanAllocationId;
        });
        const { tags } = spa || {};

        return spaTagGetCost(tags);
    }

    /**
     * Can set value based on slider or input.
     * @param {*} value
     */
    onSliderChange(value) {
        const { updateCapacity } = this.props;

        this.setState({ performanceCapacity: value });
        if (updateCapacity) {
            updateCapacity(value);
        }
    }

    /**
     * Compute max based on pool/spa capacity and already created volumes (including this one).
     */
    maxCapacityIncrease() {
        const { servicePlanAllocationsData, volume } = this.props;
        const { servicePlanAllocations } = servicePlanAllocationsData || {};
        const { servicePlanAllocationId, sizeBytes } = volume || {};
        const spa = servicePlanAllocations.find(spa => spa.meta.id === servicePlanAllocationId);
        const { reservableCapacityBytes } = spa || {};

        return bytesToUnit(reservableCapacityBytes) + bytesToUnit(sizeBytes);
    }

    renderPerformance(sizeBytes) {
        const { intl, servicePlan } = this.props;
        const { formatMessage } = intl;
        const { provisioningUnit } = servicePlan || {};
        const { iOPS = 0, throughput = 0 } = provisioningUnit || {};

        const multiplier = bytesToUnit(sizeBytes) || 0;

        if (iOPS) {
            return `${multiplier * iOPS} ${formatMessage(servicePlanMsgs.iops)}`;
        }

        return formatMessage(servicePlanMsgs.provisioningUnitThroughputValue, {
            formattedBytes: formatBytes(multiplier * throughput, true),
        });
    }

    /**
     * Disable the save option if the capacity hasn't changed or if it's less than the volume size.
     */
    disablePerformanceSave() {
        const { initialCapacity, performanceCapacity } = this.state;
        const { volume = {} } = this.props;
        const performanceCapacityNum = isNaN(performanceCapacity) ? 0 : performanceCapacity;

        return performanceCapacityNum === initialCapacity || performanceCapacityNum < bytesToUnit(volume.sizeBytes);
    }

    save() {
        const { save } = this.props;
        const { performanceCapacity } = this.state;

        if (save) {
            save(performanceCapacity);
        }
    }

    handleChange(name, value) {
        const { updateCapacity } = this.props;

        this.setState({ [name]: value });
        if (updateCapacity) {
            updateCapacity(value);
        }
    }

    render() {
        const { cancel, intl, volume = {} } = this.props;
        const { formatMessage } = intl;
        const { performanceCapacity = 0 } = this.state;
        const { sizeBytes = 0 } = volume;
        const cost = this.volumeCost();

        const maxPerformanceSize = this.maxCapacityIncrease();

        /**
         * Performance capacity can be set to an empty string if they clear the input field.
         * Need to provide a mechanism here to default to a number for calculations in the
         * dialog.
         */
        const performanceCapacityNum = Number.isNaN(performanceCapacity) ? 0 : performanceCapacity;
        const placeholder =
            performanceCapacityNum < bytesToUnit(volume.sizeBytes)
                ? `${formatMessage(volumeSeriesMsgs.minSizeHelper)} ${bytesToUnit(volume.sizeBytes)}`
                : '';

        // Cannot set the overall capacity (size + capacity) to be less than the allocated volume size
        const minimumNotMet = performanceCapacityNum < bytesToUnit(volume.sizeBytes) ? 'error-text' : '';
        const roundedMaxPerformanceSize = Math.round(maxPerformanceSize);

        return (
            <div id="volumePerformanceDialog" className="mb5">
                <div className="content-flex-row-centered">
                    <div className="ml20 mt20 mb10 dialog-title">
                        {formatMessage(volumeSeriesMsgs.titleCapacityDialog)}
                    </div>
                    <div className="dialog-save-exit-buttons mr20 mb10">
                        <ButtonAction
                            btnUp={btnAltSaveUp}
                            btnHov={btnAltSaveHov}
                            btnDisable={btnAltSaveDisable}
                            disabled={this.disablePerformanceSave()}
                            onClick={this.save}
                        />
                        <ButtonAction btnUp={btnCancelUp} btnHov={btnCancelHov} onClick={cancel} />
                    </div>
                </div>
                <div className="ml20 mt10 content-flex-row">
                    <div className="flex-left content-flex-column ml20">
                        <FieldGroup
                            appendLabel={formatMessage(messages.gib)}
                            id="volume-details-performance-capacity-size"
                            label={formatMessage(volumeSeriesMsgs.sizeLabel)}
                            name={'performance-capacity-size'}
                            type="static"
                            value={bytesToUnit(volume.sizeBytes)}
                        />
                        <FieldGroup
                            id="volume-details-performance-capacity-performance"
                            label={formatMessage(volumeSeriesMsgs.baselineOps)}
                            name={'performance-capacity-performance'}
                            type="static"
                            value={this.renderPerformance(sizeBytes)}
                        />
                        <FieldGroup
                            appendLabel={formatMessage(volumeSeriesMsgs.labelCapacityDialogPerMonth)}
                            className="dialog-performance-capacity-cost mb40"
                            id="volume-details-performance-capacity-cost"
                            label={formatMessage(volumeSeriesMsgs.labelCapacityDialogCostSymbol)}
                            name="performance-capacity-cost"
                            type="static"
                            value={bytesToUnit(sizeBytes) * cost}
                        />
                    </div>
                    <div className="dialog-performance-capacity ml40">
                        <div className="content-flex-column">
                            <div className="content-flex-column">
                                <div className="mr10 ml10">
                                    {formatMessage(volumeSeriesMsgs.labelCapacityPerformanceSize, {
                                        maxPerformanceSize: roundedMaxPerformanceSize,
                                    })}
                                </div>
                                <div style={{ width: 200, margin: 10 }}>
                                    <Slider
                                        max={roundedMaxPerformanceSize}
                                        value={Math.round(performanceCapacity)}
                                        onChange={this.onSliderChange}
                                        handleStyle={[
                                            {
                                                width: '13px',
                                                height: '13px',
                                                boxShadow: '0 1px 1px 0 rgba(0, 0, 0, 0.99)',
                                                backgroundColor: '#2a81ba',
                                                borderColor: '#2a81ba',
                                                backgroundImage: 'linear-gradient(tobottom, #1a9dd5, #2a81ba)',
                                            },
                                        ]}
                                        railStyle={{ backgroundColor: 'rgba(6, 27, 47, 0.7)', height: '5px' }}
                                        trackStyle={[
                                            {
                                                height: '5px',
                                                opacity: '0.5',
                                                borderRadius: '8.5px',
                                                backgroundColor: '#1298d3',
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                            <FieldGroup
                                appendLabel={formatMessage(messages.gib)}
                                className={`mb0 ml10 ${minimumNotMet}`}
                                id="volume-details-performance-capacity"
                                max={maxPerformanceSize}
                                name="performanceCapacity"
                                onChange={this.handleChange}
                                placeholder={placeholder}
                                type="number"
                                value={performanceCapacity}
                            />
                        </div>
                    </div>
                    <div className="content-flex-column ml40">
                        <FieldGroup
                            className="mb0"
                            id="volume-details-performance-throughput"
                            label={formatMessage(volumeSeriesMsgs.newMaxIOPS)}
                            name="performance-throughput"
                            type="static"
                            value={this.renderPerformance(bytesFromUnit(performanceCapacityNum))}
                        />

                        <FieldGroup
                            appendLabel={formatMessage(volumeSeriesMsgs.labelCapacityDialogPerMonth)}
                            className="dialog-performance-capacity-cost mb40"
                            id="volume-details-performance-capacity-cost"
                            label={formatMessage(volumeSeriesMsgs.labelCapacityDialogCostSymbol)}
                            name="performance-capacity-cost"
                            type="static"
                            value={performanceCapacityNum * cost}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

PerformanceDialog.propTypes = {
    cancel: PropTypes.func,
    intl: intlShape.isRequired,
    save: PropTypes.func,
    servicePlan: PropTypes.object,
    servicePlanAllocationsData: PropTypes.object,
    updateCapacity: PropTypes.func,
    volume: PropTypes.object,
};

export default injectIntl(PerformanceDialog);
