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

import { volumeSeriesMsgs } from '../messages/VolumeSeries';

import ButtonAction from './ButtonAction';
import VolumeSeries from './VolumeSeries';

import btnCancelUp from '../btn-cancel-up.svg';
import btnCancelHov from '../btn-cancel-hov.svg';

/**
 * Display a table of related volumes to the given volume.
 */
class RelatedVolumes extends Component {
    render() {
        const { cancel, intl, volume = {}, volumeComplianceTotalsData = {}, volumeSeriesData = {} } = this.props;
        const { formatMessage } = intl;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const { storageParcels = {} } = volume || {};
        const storageParcelIds = Object.keys(storageParcels);

        const relatedVolumes = volumeSeries.filter(vol => {
            const { storageParcels: compareStorageParcels = {} } = vol || {};
            const compareIds = Object.keys(compareStorageParcels);

            if (vol.meta.id === volume.meta.id) {
                return false;
            }

            const found = compareIds.filter(id => {
                return storageParcelIds.includes(id);
            });

            return found.length > 0;
        });

        // Filter out only related volume series
        const filteredVolumeSeries = volumeSeries.filter(vol => {
            const { meta } = vol || {};
            const { id } = meta || {};
            const includeVolume = relatedVolumes.find(v => {
                return v.meta.id === id;
            });
            return includeVolume;
        });

        // reconstruct a VSD object to pass to component
        const filteredVolumeSeriesData = JSON.parse(JSON.stringify(volumeSeriesData));
        filteredVolumeSeriesData.volumeSeries = filteredVolumeSeries;

        return (
            <div id="volumePerformanceDialog" className="mb5">
                <div className="content-flex-row-centered">
                    <div className="ml20 mt20 mb10 dialog-title">
                        {formatMessage(volumeSeriesMsgs.relatedVolumesTitle)}
                    </div>
                    <div className="dialog-save-exit-buttons mr20 mb10">
                        <ButtonAction btnUp={btnCancelUp} btnHov={btnCancelHov} onClick={cancel} />
                    </div>
                </div>
                <VolumeSeries
                    hideColumns={[
                        'actions',
                        'applicationGroupName',
                        'consistencyGroupName',
                        'performanceCapacityBytes',
                    ]}
                    multiSelect={false}
                    tableOnly={true}
                    volumeComplianceTotalsData={volumeComplianceTotalsData}
                    volumeSeriesData={filteredVolumeSeriesData}
                />
            </div>
        );
    }
}

RelatedVolumes.propTypes = {
    cancel: PropTypes.func,
    intl: intlShape.isRequired,
    volume: PropTypes.object,
    volumeComplianceTotalsData: PropTypes.object,
    volumeSeriesData: PropTypes.object,
};

export default injectIntl(RelatedVolumes);
