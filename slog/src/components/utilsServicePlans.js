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

import { formatBytes } from './utils';

import * as constants from '../constants';

/**
 * For the given SP, generate the object to be used to display performance information related to the SP.
 * @param {*} servicePlanId
 * @param {*} servicePlans
 */
export function genServicePlanCardData(servicePlanId, servicePlans) {
    const servicePlan = servicePlans.find(sp => sp.meta.id === servicePlanId) || {};

    const { name = '' } = servicePlan;

    const ioPattern = servicePlan.ioProfile.ioPattern.name;
    const ioMix = servicePlan.ioProfile.readWriteMix.name;
    const volumeSize = `${formatBytes(servicePlan.volumeSeriesMinMaxSize.minSizeBytes)} - ${formatBytes(
        servicePlan.volumeSeriesMinMaxSize.maxSizeBytes
    )}`;
    const provisioningUnit = servicePlan.provisioningUnit;
    const iops = provisioningUnit.iOPS;
    const throughput = provisioningUnit.throughput;
    const performance = iops ? `${iops} iOPS` : `${formatBytes(throughput, true)} / sec`;
    const slos = servicePlan.slos;
    const avgResponse = slos[constants.SLO_KEYS.RESPONSE_TIME_AVERAGE]['value'];
    const maxResponse = slos[constants.SLO_KEYS.RESPONSE_TIME_MAXIMUM]['value'];
    const rpo = slos[constants.SLO_KEYS.RPO]['value'];

    const data = {
        avgResponse,
        ioMix,
        ioPattern,
        maxResponse,
        name,
        performance,
        provisioningUnit,
        rpo,
        volumeSize,
    };

    return data;
}
