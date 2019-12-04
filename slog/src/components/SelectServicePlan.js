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
import { OverlayTrigger, Popover } from 'react-bootstrap';

import ServicePlanCard from './ServicePlanCard';
import FieldGroup from './FieldGroup';
import SelectOptions from './SelectOptions';

import { genServicePlanCardData } from './utilsServicePlans';

import { volumeSeriesMsgs } from '../messages/VolumeSeries';

import { Info } from '@material-ui/icons';

class SelectServicePlan extends Component {
    renderServicePlanInfo() {
        const { intl, servicePlansData, servicePlanId } = this.props;
        const { formatMessage } = intl;
        const { servicePlans = [] } = servicePlansData;

        if (!servicePlanId) {
            return (
                <Popover className="info-popover" id="service-plan-info-popover" placement="bottom">
                    {formatMessage(volumeSeriesMsgs.servicePlanInfoPlaceholder)}
                </Popover>
            );
        }

        const data = genServicePlanCardData(servicePlanId, servicePlans);

        return (
            <Popover className="info-popover-card" id="service-plan-info-popover">
                <ServicePlanCard data={data} renderPools={false} />
            </Popover>
        );
    }

    render() {
        const {
            filteredServicePlans,
            intl,
            onChangeServicePlan,
            placeholderLabel,
            servicePlanLabel,
            servicePlansData = {},
            servicePlanSelectObj,
        } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="service-plan-input">
                <FieldGroup
                    appendLabel={
                        <OverlayTrigger overlay={this.renderServicePlanInfo()} placement="top">
                            <Info className="info-circle" aria-hidden="true" />
                        </OverlayTrigger>
                    }
                    inputComponent={
                        <SelectOptions
                            id="selectServicePlan"
                            initialValues={servicePlanSelectObj}
                            isLoading={servicePlansData.loading}
                            onChange={onChangeServicePlan}
                            options={filteredServicePlans.map(servicePlan => {
                                const { meta, name } = servicePlan || {};
                                const { id } = meta || {};
                                return { value: id, label: name };
                            })}
                            placeholder={placeholderLabel || formatMessage(volumeSeriesMsgs.servicePlanPlaceholder)}
                        />
                    }
                    label={servicePlanLabel || formatMessage(volumeSeriesMsgs.servicePlanLabel)}
                />
            </div>
        );
    }
}

SelectServicePlan.propTypes = {
    filteredServicePlans: PropTypes.array,
    intl: intlShape.isRequired,
    onChangeServicePlan: PropTypes.func,
    placeholderLabel: PropTypes.string,
    servicePlanId: PropTypes.string,
    servicePlanLabel: PropTypes.string,
    servicePlansData: PropTypes.object,
    servicePlanSelectObj: PropTypes.object,
};

export default injectIntl(SelectServicePlan);
