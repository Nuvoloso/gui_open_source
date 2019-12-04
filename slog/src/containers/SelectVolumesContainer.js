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
import { intlShape, injectIntl } from 'react-intl';

import SelectOptions from '../components/SelectOptions';
import { volumeSeriesMsgs } from '../messages/VolumeSeries';

/**
 * This is only used for backup and recover so the volume filtering
 * is very specific to those process flows.
 * If the mounted prop is true, we are doing backups and need to show only
 * mounted volumes.
 * If the mounted prop is false, we are managing recovers, and we need to show
 * all volumes that have snapshots.
 */
class SelectVolumesContainer extends Component {
    isLoading() {
        const { snapshotsData = {}, volumeSeriesData = {} } = this.props;

        return snapshotsData.loading || volumeSeriesData.loading;
    }

    render() {
        const {
            createNew,
            existing = '',
            mounted,
            intl,
            onChangeGroup,
            placeHolder,
            snapshotsData,
            volumeSeriesData,
        } = this.props;
        const { snapshots = [] } = snapshotsData || {};
        const { volumeSeries = [] } = volumeSeriesData || {};
        const { formatMessage } = intl;

        const filteredVolumeSeries = mounted
            ? volumeSeries.filter(vol => {
                  const { mounts = [] } = vol || {};
                  return mounts.length > 0;
              })
            : volumeSeries.filter(vol => snapshots.some(snapshot => vol.meta.id === snapshot.volumeSeriesId));

        const options = filteredVolumeSeries.map(volume => {
            return { value: volume.meta.id, label: volume.name };
        });

        const vol = filteredVolumeSeries.find(vol => {
            return vol.meta.id === existing;
        });
        const initialValues = vol ? { value: vol.meta.id, label: vol.name } : null;

        let placeHolderValue = '';
        if (placeHolder) {
            placeHolderValue = placeHolder;
        } else {
            placeHolderValue = createNew ? formatMessage(volumeSeriesMsgs.groupPlaceholder) : '';
        }

        return (
            <SelectOptions
                id="SelectVolumesContainer"
                initialValues={initialValues}
                isLoading={this.isLoading()}
                onChange={onChangeGroup}
                options={options}
                placeholder={placeHolderValue}
            />
        );
    }
}

SelectVolumesContainer.propTypes = {
    createNew: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    existing: PropTypes.string.isRequired,
    mounted: PropTypes.bool,
    intl: intlShape.isRequired,
    onChangeGroup: PropTypes.func.isRequired,
    placeHolder: PropTypes.string.isRequired,
    snapshotsData: PropTypes.object.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { snapshotsData, volumeSeriesData } = state;
    return {
        snapshotsData,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(SelectVolumesContainer));
