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
import * as types from '../actions/types';
import Highcharts from 'highcharts';

require('highcharts/js/modules/no-data-to-display')(Highcharts);

class HighchartContainer extends Component {
    componentDidMount() {
        // Extend Highcharts with modules
        if (this.props.modules) {
            this.props.modules.forEach(function(module) {
                module(Highcharts);
            });
        }
        // Set container which the chart should render to.
        this.chart = new Highcharts[this.props.type || 'Chart'](this.props.container, this.props.options);
    }

    //Destroy chart before unmount.
    componentWillUnmount() {
        this.chart.destroy();
    }

    componentDidUpdate(prevProps) {
        const { dispatch, error, loading } = this.props;
        const { error: prevError, loading: prevLoading } = prevProps;

        if (!prevLoading && loading) {
            this.chart.showLoading();
        } else if (prevLoading && !loading) {
            this.chart.hideLoading();
        }

        this.chart.reflow();
        this.chart.update(this.props.options, true, true);

        if (error && error !== prevError) {
            dispatch({ type: types.ADD_ERROR_MESSAGE, message: error });
        }
    }

    /**
     * TBD PERFORMANCE: Need to consider alternate implementation if deep
     * comparison is too slow.
     */
    shouldComponentUpdate(nextProps) {
        if (nextProps.zoomed !== this.props.zoomed || nextProps.loading !== this.props.loading) {
            return true;
        }

        if (JSON.stringify(this.props.options) === JSON.stringify(nextProps.options)) {
            return false;
        }
        return true;
    }

    //Create the div which the chart will be rendered to.
    render() {
        return <div id={this.props.container} />;
    }
}

HighchartContainer.propTypes = {
    container: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    error: PropTypes.string,
    loading: PropTypes.bool,
    options: PropTypes.object.isRequired,
    modules: PropTypes.array,
    type: PropTypes.string,
    zoomed: PropTypes.string,
};

export default connect()(HighchartContainer);
