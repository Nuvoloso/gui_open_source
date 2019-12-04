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
import React from 'react';
import { Button, Col, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import { Autorenew, Cancel, Done, Error, SyncProblem, Warning } from '@material-ui/icons';
import _ from 'lodash';
import moment from 'moment';

import '../styles.css';
import { volumeMetricsMsgs } from '../messages/VolumeMetrics';
import Highcharts from 'highcharts';

import { clusterMsgs } from '../messages/Cluster';
import { messages } from '../messages/Messages';
import { vsrMsgs } from '../messages/VolumeSeriesRequest';
const constants = require('../constants');

// lookup a value for the given key attached to the object
export function displayPropByKey(array, key) {
    if (array) {
        let idx = 0;
        idx = array.findIndex(i => i.name === key);
        if (idx === -1) {
            return '';
        } else {
            return array[idx].value;
        }
    } else {
        return '';
    }
}

export function formatBytes(bytes, si, decimals) {
    if (bytes === 0) {
        return '0 B';
    }
    const k = si ? 1000 : 1024;
    const dm = decimals || 2;
    const sizes = si
        ? ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), 8);
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * bytesToUnit
 * convert size in bytes to a specific unit's value, default to GiB
 * @param {number} bytes - size in bytes
 * @param {number} unit - exponent per desired unit (GiB or GB is 3)
 * @param {boolean} si - use decimal (GB) instead of binary (GiB)
 */
export function bytesToUnit(bytes, unit = 3, si) {
    const k = si ? 1000 : 1024;
    const size = bytes / Math.pow(k, unit);
    return size;
}

/**
 * bytesFromUnit
 * convert size to bytes from a specific unit's value, default to GiB
 * @param {number} bytes - size in bytes
 * @param {number} unit - exponent per desired unit (GiB or GB is 3)
 * @param {boolean} si - use decimal (GB) instead of binary (GiB)
 */
export function bytesFromUnit(size, unit = 3, si) {
    const k = si ? 1000 : 1024;
    const bytes = size * Math.pow(k, unit);
    return bytes;
}

/**
 * renderPropertiesForm
 * common util to render a form for view/edit of properties { key: {kind, value, immutable}, ... }
 * @param {Object} props - the properties
 * @param {function} handleChangeProperties - handler for onChange of any property values (usually to update state of parent form)
 * @param {number} keyWidth - not required. width of label in horizontal alignment. will align vertically if no value is passed.
 * @param {number} valueWidth - not required. width of field in horizontal alignment. will align vertically if no value is passed.
 */
export function renderPropertiesForm(props, handleChangeProperties, keyWidth, valueWidth) {
    const keys = Object.keys(props) || [];
    return keys.map((key, idx) => {
        return (
            <FormGroup className={idx === keys.length - 1 ? 'mb0' : ''} key={key}>
                <Col componentClass={ControlLabel} md={keyWidth}>
                    {key}
                </Col>
                <Col md={valueWidth}>
                    {props[key].immutable ? (
                        <FormControl.Static>{props[key].value}</FormControl.Static>
                    ) : (
                        <FormControl
                            componentClass="input"
                            name={key}
                            onChange={handleChangeProperties}
                            value={props[key].value}
                        />
                    )}
                </Col>
            </FormGroup>
        );
    });
}

export function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

export function renderTags(tags) {
    if (!tags || tags.length === 0) {
        return <div />;
    }
    return (
        <div>
            {tags.map((tag, id) => {
                let displaytag = '';

                if (tag.indexOf(':') === 0) {
                    // get just the value
                    displaytag = tag.substr(1);
                } else if (tag.indexOf(':') === tag.length - 1) {
                    // get just the key
                    displaytag = tag.substr(0, tag.length - 1);
                } else {
                    // it's a key:value tag
                    displaytag = tag;
                }

                return (
                    <Button bsClass="tagButton" key={id}>
                        {displaytag}
                    </Button>
                );
            })}
        </div>
    );
}

export function parseTagsToString(tags) {
    return tags.map(tag => {
        return tag.tag;
    });
}

export function equalAccountIds(ids, newIds) {
    const filteredIds = _.sortedUniq(ids.filter(id => id).sort());
    const newFilteredIds = _.sortedUniq(newIds.filter(id => id).sort());

    return _.isEqual(filteredIds, newFilteredIds);
}

export function formatTime(time) {
    // date time format based on locale
    return moment(time).format('LLL');
}

// return error message from failed axios request
export function getErrorMsg(error) {
    const { response } = error || {};
    if (response) {
        const { data = {}, statusText } = response;
        return data.message || statusText;
    } else {
        const { message } = error || {};
        return message;
    }
}

export function timePeriodUnit(period) {
    switch (period) {
        case constants.METRIC_PERIOD_MONTH:
            return 'month';
        case constants.METRIC_PERIOD_WEEK:
            return 'week';
        case constants.METRIC_PERIOD_DAY:
        default:
            return 'day';
    }
}

/**
 * Map metric period to string in chart
 */
export function periodString() {
    const { intl } = this.props;
    const { formatMessage } = intl;

    const { period } = this.props;
    let periodString = '';

    if (period === constants.METRIC_PERIOD_WEEK || period === constants.METRIC_PERIOD_MONTH) {
        periodString = formatMessage(volumeMetricsMsgs.day);
    } else if (period === constants.METRIC_PERIOD_DAY) {
        periodString = formatMessage(volumeMetricsMsgs.hour);
    } else {
        periodString = formatMessage(volumeMetricsMsgs.unknown);
    }

    return periodString;
}

/**
 * Traverse the stored list of charts to find the reference by name.
 * @param {string} name
 */
export function findChartByName(name) {
    const charts = Highcharts.charts;
    if (!charts) {
        // shouldn't happen
        // eslint-disable-next-line
        console.log('no charts');
        return;
    }
    const chart = charts.find(chart => {
        if (chart) {
            return chart.renderTo.id === name;
        } else {
            return false;
        }
    });
    return chart;
}

export function getVolumeSeriesStateMsg(volumeSeriesRequestState) {
    const { VSR_OPERATIONS, VSR_COMPLETED_STATES, VSR_STATES } = constants;

    switch (volumeSeriesRequestState) {
        // completed states
        case VSR_COMPLETED_STATES.SUCCEEDED:
            return vsrMsgs.succeededDesc;
        case VSR_COMPLETED_STATES.FAILED:
            return vsrMsgs.failedDesc;
        case VSR_COMPLETED_STATES.CANCELED:
            return vsrMsgs.canceledDesc;

        // operations
        case VSR_OPERATIONS.ALLOCATE_CAPACITY:
            return vsrMsgs.allocateCapacityDesc;
        case VSR_OPERATIONS.BIND:
            return vsrMsgs.bindDesc;
        case VSR_OPERATIONS.CG_SNAPSHOT_CREATE:
            return vsrMsgs.cgSnapshotCreateDesc;
        case VSR_OPERATIONS.CHANGE_SERVICE_PLAN:
            return vsrMsgs.changeServicePlanDesc;
        case VSR_OPERATIONS.CREATE_FROM_SNAPSHOT:
            return vsrMsgs.createFromSnapshotDesc;
        case VSR_OPERATIONS.CREATE:
            return vsrMsgs.createDesc;
        case VSR_OPERATIONS.DELETE:
            return vsrMsgs.deleteDesc;
        case VSR_OPERATIONS.GROW:
            return vsrMsgs.growDesc;
        case VSR_OPERATIONS.MOUNT:
            return vsrMsgs.mountDesc;
        case VSR_OPERATIONS.PROVISION:
            return vsrMsgs.provisionDesc;
        case VSR_OPERATIONS.RENAME:
            return vsrMsgs.renameDesc;
        case VSR_OPERATIONS.UNMOUNT:
            return vsrMsgs.unmountDesc;
        case VSR_OPERATIONS.VOL_SNAPSHOT_CREATE:
            return vsrMsgs.volSnapshotCreateDesc;
        case VSR_OPERATIONS.VOL_SNAPSHOT_DELETE:
            return vsrMsgs.volSnapshotDeleteDesc;
        case VSR_OPERATIONS.VOL_SNAPSHOT_RESTORE:
            return vsrMsgs.volSnapshotRestoreDesc;

        // states
        case VSR_STATES.ALLOCATING_CAPACITY:
            return vsrMsgs.allocatingCapacityDesc;
        case VSR_STATES.ATTACHING_FS:
            return vsrMsgs.attachingFileSystemDesc;
        case VSR_STATES.BINDING:
            return vsrMsgs.bindingDesc;
        case VSR_STATES.CANCELED:
            return vsrMsgs.canceled;
        case VSR_STATES.CAPACITY_WAIT:
            return vsrMsgs.capacityWaitDesc;
        case VSR_STATES.CG_SNAPSHOT_FINALIZE:
            return vsrMsgs.cgSnapshotFinalizeDesc;
        case VSR_STATES.CG_SNAPSHOT_VOLUMES:
            return vsrMsgs.cgSnapshotVolumesDesc;
        case VSR_STATES.CG_SNAPSHOT_WAIT:
            return vsrMsgs.cgSnapshotWaitDesc;
        case VSR_STATES.CHANGING_CAPACITY:
            return vsrMsgs.changingCapacityDesc;
        case VSR_STATES.CREATED_PIT:
            return vsrMsgs.createdPITDesc;
        case VSR_STATES.CREATING:
            return vsrMsgs.creatingDesc;
        case VSR_STATES.CREATING_FROM_SNAPSHOT:
            return vsrMsgs.creatingFromSnapshotDesc;
        case VSR_STATES.CREATING_PIT:
            return vsrMsgs.creatingPITDesc;
        case VSR_STATES.DELETING_SPA:
            return vsrMsgs.deletingSpaDesc;
        case VSR_STATES.FAILED:
            return vsrMsgs.failedDesc;
        case VSR_STATES.FINALIZING_SNAPSHOT:
            return vsrMsgs.finalizingSnapshotDesc;
        case VSR_STATES.NEW:
            return vsrMsgs.newDesc;
        case VSR_STATES.PAUSED_IO:
            return vsrMsgs.pausedIODesc;
        case VSR_STATES.PAUSING_IO:
            return vsrMsgs.pausingIODesc;
        case VSR_STATES.PLACEMENT:
            return vsrMsgs.placementDesc;
        case VSR_STATES.PUBLISHING:
            return vsrMsgs.publishingDesc;
        case VSR_STATES.PUBLISHING_SERVICE_PLAN:
            return vsrMsgs.publishingServicePlanDesc;
        case VSR_STATES.RENAMING:
            return vsrMsgs.renamingDesc;
        case VSR_STATES.SIZING:
            return vsrMsgs.sizingDesc;
        case VSR_STATES.SNAPSHOT_RESTORE:
            return vsrMsgs.snapshotRestoreDesc;
        case VSR_STATES.SNAPSHOT_RESTORE_DONE:
            return vsrMsgs.snapshotRestoreDoneDesc;
        case VSR_STATES.SNAPSHOT_RESTORE_FINALIZE:
            return vsrMsgs.snapshotRestoreFinalizeDesc;
        case VSR_STATES.SNAPSHOT_UPLOADING:
            return vsrMsgs.snapshotUploadingDesc;
        case VSR_STATES.SNAPSHOT_UPLOAD_DONE:
            return vsrMsgs.snapshotUploadDoneDesc;
        case VSR_STATES.STORAGE_WAIT:
            return vsrMsgs.storageWaitDesc;

        case VSR_STATES.UNDO_ALLOCATING_CAPACITY:
            return vsrMsgs.undoAllocateCapacityDesc;
        case VSR_STATES.UNDO_ATTACHING_FS:
            return vsrMsgs.undoAttachingFileSystemDesc;
        case VSR_STATES.UNDO_BINDING:
            return vsrMsgs.undoBindingDesc;
        case VSR_STATES.UNDO_CG_SNAPSHOT_VOLUMES:
            return vsrMsgs.undoCgSnapshotVolumesDesc;
        case VSR_STATES.UNDO_CHANGING_CAPACITY:
            return vsrMsgs.undoChangingCapacityDesc;
        case VSR_STATES.UNDO_CREATED_PIT:
            return vsrMsgs.undoCreatedPITDesc;
        case VSR_STATES.UNDO_CREATING:
            return vsrMsgs.undoCreatingDesc;
        case VSR_STATES.UNDO_CREATING_FROM_SNAPSHOT:
            return vsrMsgs.undoCreatingFromSnapshotDesc;
        case VSR_STATES.UNDO_CREATING_PIT:
            return vsrMsgs.undoCreatingPITDesc;

        case VSR_STATES.UNDO_PAUSED_IO:
            return vsrMsgs.undoPausedIODesc;
        case VSR_STATES.UNDO_PAUSING_IO:
            return vsrMsgs.undoPausingIODesc;
        case VSR_STATES.UNDO_PLACEMENT:
            return vsrMsgs.undoPlacementDesc;
        case VSR_STATES.UNDO_PUBLISHING:
            return vsrMsgs.undoPublishingDesc;
        case VSR_STATES.UNDO_RENAMING:
            return vsrMsgs.undoRenamingDesc;
        case VSR_STATES.UNDO_SIZING:
            return vsrMsgs.undoSizingDesc;

        case VSR_STATES.UNDO_SNAPSHOT_RESTORE:
            return vsrMsgs.undoSnapshotRestoreDesc;
        case VSR_STATES.UNDO_SNAPSHOT_UPLOADING:
            return vsrMsgs.undoSnapshotUploadingDesc;
        case VSR_STATES.UNDO_VOLUME_CONFIG:
            return vsrMsgs.undoVolumeConfigDesc;
        case VSR_STATES.UNDO_VOLUME_EXPORT:
            return vsrMsgs.undoVolumeExportDesc;
        case VSR_STATES.UPLOAD_DONE:
            return vsrMsgs.uploadDoneDesc;
        case VSR_STATES.VOLUME_CONFIG:
            return vsrMsgs.volumeConfigDesc;
        case VSR_STATES.VOLUME_EXPORT:
            return vsrMsgs.volumeExportDesc;

        default:
            return messages.na;
    }
}

// Service State

export function getServiceStateDescriptionMsg(state) {
    switch (state) {
        case constants.SERVICE_STATES.ERROR:
            return clusterMsgs.serviceStateErrorDesc;
        case constants.SERVICE_STATES.NOT_READY:
            return clusterMsgs.serviceStateNotReadyDesc;
        case constants.SERVICE_STATES.READY:
            return clusterMsgs.serviceStateReadyDesc;
        case constants.SERVICE_STATES.STARTING:
            return clusterMsgs.serviceStateStartingDesc;
        case constants.SERVICE_STATES.STOPPED:
            return clusterMsgs.serviceStateStoppedDesc;
        case constants.SERVICE_STATES.STOPPING:
            return clusterMsgs.serviceStateStoppingDesc;
        case constants.SERVICE_STATES.UNKNOWN:
            return clusterMsgs.serviceStateUnknownDesc;
        default:
            return null;
    }
}

export function getServiceStateMsg(state) {
    switch (state) {
        case constants.SERVICE_STATES.ERROR:
            return clusterMsgs.serviceStateError;
        case constants.SERVICE_STATES.NOT_READY:
            return clusterMsgs.serviceStateNotReady;
        case constants.SERVICE_STATES.READY:
            return clusterMsgs.serviceStateReady;
        case constants.SERVICE_STATES.STARTING:
            return clusterMsgs.serviceStateStarting;
        case constants.SERVICE_STATES.STOPPED:
            return clusterMsgs.serviceStateStopped;
        case constants.SERVICE_STATES.STOPPING:
            return clusterMsgs.serviceStateStopping;
        case constants.SERVICE_STATES.UNKNOWN:
            return clusterMsgs.serviceStateUnknown;
        default:
            return state;
    }
}

export function renderServiceStateIcon(state) {
    const style = { fontSize: '16px', opacity: 0.7 };

    switch (state) {
        case constants.SERVICE_STATES.ERROR:
            return <Error style={{ ...style, fill: 'var(--critical-red)' }} />;
        case constants.SERVICE_STATES.NOT_READY:
        case constants.SERVICE_STATES.STARTING:
            return <Autorenew className="cluster-table-icon-rotate" style={{ ...style, fill: 'var(--safe-green)' }} />;
        case constants.SERVICE_STATES.STOPPED:
            return <Cancel style={{ ...style, fill: 'var(--critical-red)' }} />;
        case constants.SERVICE_STATES.STOPPING:
            return <SyncProblem style={{ ...style, fill: 'var(--critical-red)' }} />;
        case constants.SERVICE_STATES.UNKNOWN:
            return <Warning style={{ ...style, fill: 'var(--neutral-yellow)' }} />;
        case constants.SERVICE_STATES.READY:
            return <Done style={{ ...style, fill: 'var(--safe-green)' }} />;
        default:
            return null;
    }
}

// Cluster/Node State

export function getClusterStateDescriptionMsg(state) {
    switch (state) {
        case constants.CLUSTER_STATES.DEPLOYABLE:
            return clusterMsgs.stateDeployableDesc;
        case constants.CLUSTER_STATES.MANAGED:
            return clusterMsgs.stateManagedDesc;
        case constants.CLUSTER_STATES.RESETTING:
            return clusterMsgs.stateResettingDesc;
        case constants.CLUSTER_STATES.TEAR_DOWN:
            return clusterMsgs.stateTearDownDesc;
        case constants.CLUSTER_STATES.TIMED_OUT:
            return clusterMsgs.stateTimedOutDesc;
        default:
            return null;
    }
}

export function getClusterStateMsg(state) {
    switch (state) {
        case constants.CLUSTER_STATES.DEPLOYABLE:
            return clusterMsgs.stateDeployable;
        case constants.CLUSTER_STATES.MANAGED:
            return clusterMsgs.stateManaged;
        case constants.CLUSTER_STATES.RESETTING:
            return clusterMsgs.stateResetting;
        case constants.CLUSTER_STATES.TEAR_DOWN:
            return clusterMsgs.stateTearDown;
        case constants.CLUSTER_STATES.TIMED_OUT:
            return clusterMsgs.stateTimedOut;
        default:
            return state;
    }
}

/**
 * Parse the given tags array and look for the Service Plan cost tag.
 * Returns empty string if found, otherwise configured value.
 * @param {[]} tags
 */
export function getCostTag(tags) {
    let cost = null;

    const costTag = tags.find(tag => {
        const values = tag.split('.');
        if (values[0] === constants.TAG_SERVICE_PLAN_COST) {
            return 1;
        } else {
            return 0;
        }
    });

    if (costTag) {
        const tagStrings = costTag.split('.');
        if (tagStrings[1]) {
            cost = tagStrings[1];
        }
    }
    return cost ? `${cost}` : '';
}

/**
 * validate a success HTTP status code
 */
export function validateStatus(status) {
    return status >= 200 && status < 400;
}

/**
 * Look for format of a snapshot tag.
 * @param {*} tag
 */
export function isSnapTag(tag) {
    return tag.startsWith('snap') && tag.endsWith('exists');
}

/**
 * Used to exclude any internal tags when display volume information.
 * @param {*} tags
 */
export function tagsExcludeInternal(tags) {
    return (tags && tags.filter(tag => !isSnapTag(tag))) || [];
}

export function cacheStatus(volume) {
    const { cacheAllocations = {} } = volume || {};

    const warning = Object.keys(cacheAllocations).some(allocationId => {
        const allocation = cacheAllocations[allocationId];

        const { allocatedSizeBytes, requestedSizeBytes } = allocation || {};

        return allocatedSizeBytes < requestedSizeBytes;
    });

    return warning ? constants.METRIC_VIOLATION_LEVELS.WARNING : constants.METRIC_VIOLATION_LEVELS.OK;
}

export function getVsrStateColorClassName(state) {
    switch (state) {
        case constants.VSR_COMPLETED_STATES.CANCELED:
            return 'nuvo-color-neutral-yellow';
        case constants.VSR_COMPLETED_STATES.FAILED:
            return 'nuvo-color-critical-red';
        case constants.VSR_COMPLETED_STATES.SUCCEEDED:
            return 'nuvo-color-safe-green';
        default:
            return 'nuvo-color-blue';
    }
}

function getMetricStatusValue(level) {
    const key = Object.keys(constants.METRIC_VIOLATION_LEVELS).find(key => key.toUpperCase() === level.toUpperCase());

    return constants.METRIC_VIOLATION_LEVELS[key] || -1;
}

export function metricStatusSortMethod(a, b) {
    const aVal = getMetricStatusValue(a);
    const bVal = getMetricStatusValue(b);

    return aVal - bVal;
}
