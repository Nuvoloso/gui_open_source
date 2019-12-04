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

import { Button, ButtonToolbar } from 'react-bootstrap';

class ServicePlanTuning extends Component {
    disableNext() {
        // check all fields valid
        return false;
    }

    render() {
        const { next, previous } = this.props;

        return (
            <form onSubmit={next}>
                <div>service plan tunings</div>
                <ButtonToolbar>
                    <Button bsStyle="primary" className="pull-right" disabled={this.disableNext()} type="submit">
                        Submit
                    </Button>
                    <Button bsStyle="danger" className="pull-right" onClick={previous}>
                        Previous
                    </Button>
                </ButtonToolbar>
            </form>
        );
    }
}

ServicePlanTuning.propTypes = {
    next: PropTypes.func.isRequired,
    previous: PropTypes.func.isRequired,
};

export default ServicePlanTuning;
