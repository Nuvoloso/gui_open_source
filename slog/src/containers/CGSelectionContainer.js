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
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CGSelectionDetails from '../components/CGSelectionDetails';
import SelectCGsContainer from '../containers/SelectCGsContainer';
import SelectVolumesContainer from '../containers/SelectVolumesContainer';

import { cgSelectionMsgs } from '../messages/CGSelection';

import * as constants from '../constants';
import * as types from '../actions/types';

import '../components/process.css';
import '../components/recoverselect.css';

class CGSelectionContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchType: constants.SEARCH_OPTION_VOLUME_NAME, // cg or volume search
        };

        this.onSearchChange = this.onSearchChange.bind(this);
        this.onChangeGroup = this.onChangeGroup.bind(this);
        this.onChangeVolume = this.onChangeVolume.bind(this);
        this.search = this.search.bind(this);
    }

    /**
     * Track search type (consistency group or volume search)
     * @param {*} selectedItem
     */
    onSearchChange(selectedItem) {
        const { selectCG } = this.props;

        if (selectedItem) {
            this.setState({ searchType: selectedItem.value, selectedVolume: '' });
            selectCG('');
        } else {
            this.setState({ searchType: '' });
        }
    }

    onChangeGroup(selectedItem) {
        const { selectCG } = this.props;
        if (selectedItem) {
            this.setState({ selectedVolume: '' });
            selectCG(selectedItem.value);
        } else {
            this.setState({ selectedCG: '' });
            selectCG('');
        }
    }

    onChangeVolume(selectedItem) {
        const { selectCG, selectVolume, volumeSeriesData } = this.props;
        if (selectedItem) {
            const volume = volumeSeriesData.volumeSeries.find(vol => {
                return vol.meta.id === selectedItem.value;
            });

            selectVolume((volume && volume.meta.id) || '');
            selectCG((volume && volume.consistencyGroupId) || '');
        } else {
            this.setState({ selectedVolume: '' });
            selectCG('');
        }
    }

    search() {
        this.setState({ selectionComplete: true });
    }

    /**
     * We only support single volume selection so do not load a
     * resource navigation list
     */
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({ type: types.SET_RESOURCE_NAVIGATION_DATA, data: [] });
    }

    render() {
        const { intl, mounted = true, selectedCG, selectedVolume, volumeSeriesData } = this.props;
        const { searchType } = this.state;
        const { formatMessage } = intl;
        const { volumeSeries = [] } = volumeSeriesData || {};
        const volume = volumeSeries.find(vol => vol.meta.id === selectedVolume);
        const { consistencyGroupId } = volume || {};

        return (
            <div className="dark">
                <div className="process-select-cg-search-bar">
                    <div className="process-select-cg-search-bar-item">
                        {formatMessage(cgSelectionMsgs.searchForVolume)}:
                    </div>
                    {/* <CGSearchOptions searchType={searchType} onChange={this.onSearchChange} /> */}
                    <div className="process-select-cg-search-bar-item-search">
                        {searchType === constants.SEARCH_OPTION_GROUP_NAME ? (
                            <SelectCGsContainer
                                createNew={false}
                                existing={selectedCG}
                                onChangeGroup={this.onChangeGroup}
                                placeHolder={formatMessage(cgSelectionMsgs.enterName)}
                            />
                        ) : (
                            <SelectVolumesContainer
                                createNew={false}
                                existing={selectedVolume}
                                mounted={mounted}
                                onChangeGroup={this.onChangeVolume}
                                placeHolder={formatMessage(cgSelectionMsgs.enterName)}
                            />
                        )}
                    </div>
                </div>
                {selectedCG || selectedVolume ? (
                    <CGSelectionDetails selectedCG={consistencyGroupId || selectedCG} />
                ) : (
                    /** TBD need a placeholder and use fixed height with scrolling */
                    ''
                )}
            </div>
        );
    }
}

CGSelectionContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    mounted: PropTypes.bool,
    selectCG: PropTypes.func,
    selectedCG: PropTypes.string,
    selectVolume: PropTypes.func,
    selectedVolume: PropTypes.string,
    volumeSeriesData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { volumeSeriesData } = state;
    return {
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(CGSelectionContainer));
