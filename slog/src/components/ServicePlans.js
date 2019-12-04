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
import { withRouter } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';

import Loader from './Loader';
import PoolsTableContainer from '../containers/PoolsTableContainer';
import SelectOptions from './SelectOptions';
import ServicePlanCard from './ServicePlanCard';
import TableContainer from '../containers/TableContainer';
import { genServicePlanCardData } from './utilsServicePlans';
import { servicePlanMsgs } from '../messages/ServicePlan';

import { ReactComponent as ServicePlanIcon } from '../assets/menu/collection-policy.svg';

import './dashboard.css';
import './serviceplans.css';
import '../styles.css';

import * as constants from '../constants';

class ServicePlans extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accountId: '',
            clusterId: '',
            tabKey: '',
        };

        this.handleTabSelect = this.handleTabSelect.bind(this);
    }

    componentDidMount() {
        const { location, tabKey } = this.props;
        const { state } = location || {};
        const { clusterId } = state || {};

        if (clusterId) {
            this.setState({ clusterId });
        }

        this.setState({ tabKey: tabKey || constants.SERVICE_PLANS_OVERVIEW_TABS.SERVICE_PLANS });
    }

    componentDidUpdate(prevProps) {
        const { tabKey } = this.props;
        const { tabKey: prevTabKey } = prevProps;

        if (tabKey !== prevTabKey) {
            this.setState({ tabKey });
        }
    }

    handleTabSelect(tabKey) {
        const { onTabSelect } = this.props;

        this.setState({ tabKey });

        if (onTabSelect) {
            onTabSelect(tabKey);
        }
    }

    /**
     * extracts number from duration strings to do compares (2ms, 2s, etc).
     * converts s (seconds) to ms (milliseconds).
     * for sort methods implementing JS Array sort(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     * @param {*} a first value
     * @param {*} b second value
     */
    sortByNumFromDurationString(a, b) {
        const numRegEx = RegExp(/([+-]?\d+(?:\.\d+)?)/);
        const splitA = a.split(numRegEx);
        const splitB = b.split(numRegEx);
        const numA = Number(splitA[1]);
        const numB = Number(splitB[1]);
        const msA = numA * (splitA[2] === 's' ? 1000 : 1);
        const msB = numB * (splitB[2] === 's' ? 1000 : 1);

        if (msA < msB) {
            return -1;
        }

        if (msA > msB) {
            return 1;
        }

        return 0;
    }

    /**
     * sort by number, group by performance type.
     * @param {*} a first value
     * @param {*} b second value
     */
    sortyByPerformance(a, b) {
        const numRegEx = RegExp(/([+-]?\d+(?:\.\d+)?)/);
        const splitA = a.split(numRegEx);
        const splitB = b.split(numRegEx);
        const numA = Number(splitA[1]);
        const numB = Number(splitB[1]);
        const typeA = splitA[2];
        const typeB = splitB[2];

        if (typeA < typeB || (typeA === typeB && numA < numB)) {
            return -1;
        }

        if (typeA > typeB || (typeA === typeB && numA > numB)) {
            return 1;
        }

        return 0;
    }

    renderFetchStatus() {
        const {
            accountsData = {},
            servicePlanAllocationsData = {},
            servicePlansData = {},
            rolesData = {},
        } = this.props;

        if (
            accountsData.loading ||
            servicePlanAllocationsData.loading ||
            servicePlansData.loading ||
            rolesData.loading
        ) {
            return <Loader />;
        }
    }

    onChangeCluster(value) {
        this.setState({ clusterId: value });
    }

    onChangeAccount(value) {
        this.setState({ accountId: value });
    }

    renderTabTitle(name, count) {
        return (
            <div className="content-flex-row-centered">
                <div>{name} </div>
                <div className="tab-count color-queue ml10">{count}</div>
            </div>
        );
    }

    renderToolbar() {
        const { accountsData, clustersData, intl } = this.props;
        const { accountId, clusterId } = this.state;
        const { accounts = [] } = accountsData || {};
        const { clusters = [] } = clustersData || {};
        const { formatMessage } = intl;
        const { loading: accountsLoading } = accountsData || {};
        const { loading: clustersLoading } = clustersData || {};

        const accountOptions = accounts.map(account => {
            return {
                label: account.name,
                value: account.meta.id,
            };
        });

        const clusterOptions = clusters.map(cluster => {
            return {
                label: cluster.name,
                value: cluster.meta.id,
            };
        });

        return (
            <div className="content-flex-row mr15">
                <div className="content-flex-row-centered dark">
                    <div>{formatMessage(servicePlanMsgs.viewByCluster)}:</div>
                    <div className="div-w200 ml10">
                        <SelectOptions
                            id="process-confirm-cluster-select"
                            initialValues={clusterOptions.find(option => option.value === clusterId) || null}
                            isClearable={true}
                            isLoading={clustersLoading}
                            onChange={option => {
                                const { value } = option || {};
                                this.onChangeCluster(value);
                            }}
                            options={clusterOptions.filter(cluster => {
                                return cluster.value !== clusterId;
                            })}
                            placeholder={formatMessage(servicePlanMsgs.allClusters)}
                        />
                    </div>
                    <div className="ml10" />
                    <div>{formatMessage(servicePlanMsgs.viewByAccount)}:</div>
                    <div className="div-w200 ml10">
                        <SelectOptions
                            id="process-confirm-account-select"
                            initialValues={accountOptions.find(option => option.value === accountId) || null}
                            isClearable={true}
                            isLoading={accountsLoading}
                            onChange={option => {
                                const { value } = option || {};
                                this.onChangeAccount(value);
                            }}
                            options={accountOptions.filter(account => {
                                return account.value !== accountId;
                            })}
                            placeholder={formatMessage(servicePlanMsgs.allAccounts)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    renderServicePlans() {
        const { accountsData, intl, rolesData, servicePlanAllocationsData, servicePlansData } = this.props;
        const { accountId, clusterId } = this.state;
        const { accounts = [] } = accountsData || {};
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const { servicePlans = [] } = servicePlansData || {};
        const { formatMessage } = intl;

        const columns = [
            {
                Header: formatMessage(servicePlanMsgs.tableName),
                columns: [
                    {
                        accessor: 'name',
                        minWidth: 70,
                    },
                ],
            },
            {
                Header: formatMessage(servicePlanMsgs.tableStatus),
                accessor: 'status',
                show: false,
            },
            {
                Header: 'filteredCard',
                accessor: 'filteredCard',
                show: false,
            },
            {
                Header: formatMessage(servicePlanMsgs.workloadProfiles),
                columns: [
                    {
                        Header: formatMessage(servicePlanMsgs.tableIoPattern),
                        accessor: 'ioPattern',
                        minWidth: 70,
                    },
                    {
                        Header: formatMessage(servicePlanMsgs.tableIoMix),
                        accessor: 'ioMix',
                        minWidth: 70,
                    },
                ],
            },
            {
                Header: formatMessage(servicePlanMsgs.slosTitle),
                columns: [
                    {
                        Header: formatMessage(servicePlanMsgs.provisioningUnit),
                        accessor: 'performance',
                        minWidth: 70,
                        sortMethod: this.sortyByPerformance,
                    },
                    {
                        Header: formatMessage(servicePlanMsgs.avgResponse),
                        accessor: 'avgResponse',
                        minWidth: 70,
                        sortMethod: this.sortByNumFromDurationString,
                    },
                    {
                        Header: formatMessage(servicePlanMsgs.maxResponse),
                        accessor: 'maxResponse',
                        minWidth: 70,
                        sortMethod: this.sortByNumFromDurationString,
                    },
                    {
                        Header: formatMessage(servicePlanMsgs.tableRpo),
                        accessor: 'rpo',
                        minWidth: 30,
                    },
                ],
            },
            {
                Header: formatMessage(servicePlanMsgs.pools),
                columns: [
                    {
                        accessor: 'pools',
                        minWidth: 30,
                    },
                ],
            },
            {
                Header: 'ID',
                accessor: 'id',
                show: false,
            },
            {
                accessor: 'someFiltered',
                show: false,
            },
            {
                accessor: 'allFiltered',
                show: false,
            },
        ];

        const data =
            servicePlans.length > 0
                ? servicePlans.map(servicePlan => {
                      const { accounts: accountIds = [], meta } = servicePlan || {};
                      const { id } = meta || {};
                      const spas = servicePlanAllocations.filter(spa => {
                          return (
                              spa.servicePlanId === id &&
                              (clusterId ? spa.clusterId === clusterId : true) &&
                              (accountId ? spa.authorizedAccountId === accountId : true)
                          );
                      });

                      const servicePlanCardData = genServicePlanCardData(id, servicePlans);
                      return {
                          ...servicePlan,
                          ...servicePlanCardData,
                          accounts: accounts.filter(account => accountIds.find(id => id === account.meta.id)),
                          id,
                          servicePlanAllocations: spas,
                          pools: spas.length,
                          filteredCard: servicePlanAllocations.find(spa => {
                              /**
                               * Returns true if either account and/or cluster is set
                               * and matches the selected Ids.
                               */
                              let match = false;
                              if (clusterId && accountId) {
                                  match = spa.clusterId === clusterId && spa.authorizedAccountId === accountId;
                              } else if (clusterId) {
                                  match = spa.clusterId === clusterId;
                              } else if (accountId) {
                                  match = spa.authorizedAccountId === accountId;
                              }
                              return spa.servicePlanId === id && match;
                          }),
                          allFiltered: false,
                      };
                  })
                : [];

        const someFiltered = data.filter(d => {
            return d.filteredCard;
        });
        data.forEach(d => {
            d.someFiltered = someFiltered;
            if (
                someFiltered.length === data.length ||
                (data.length > 0 && someFiltered.length === 0 && (clusterId || accountId))
            ) {
                d.allFiltered = true;
            }
        });

        return (
            <div className="service-plans">
                {this.renderFetchStatus()}
                <TableContainer
                    cardComponent={ServicePlanCard}
                    cardsMode={true}
                    columns={columns}
                    component={constants.COMPONENT_SERVICE_PLAN}
                    data={data}
                    emptyPlaceholder={{
                        icon: ServicePlanIcon,
                        text: formatMessage(servicePlanMsgs.tableEmptyServicePlansPlaceholder),
                    }}
                    filterHidden={true}
                    rolesData={rolesData}
                    selectable={false}
                    title={null}
                    toolbar={this.renderToolbar()}
                />
            </div>
        );
    }

    render() {
        const { tabKey } = this.state;
        const { intl, servicePlanAllocationsData, servicePlansData } = this.props;
        const { formatMessage } = intl;
        const { servicePlanAllocations = [] } = servicePlanAllocationsData || {};
        const { servicePlans = [] } = servicePlansData || {};

        return (
            <div className="component-page">
                <Tabs
                    activeKey={tabKey}
                    className="tabs-container"
                    id="service-plans-overview-tabs"
                    mountOnEnter
                    onSelect={this.handleTabSelect}
                >
                    <Tab
                        eventKey={constants.SERVICE_PLANS_OVERVIEW_TABS.SERVICE_PLANS}
                        title={this.renderTabTitle(formatMessage(servicePlanMsgs.tableTitle), servicePlans.length)}
                    >
                        {this.renderServicePlans()}
                    </Tab>
                    <Tab
                        eventKey={constants.SERVICE_PLANS_OVERVIEW_TABS.POOLS}
                        title={this.renderTabTitle(formatMessage(servicePlanMsgs.pools), servicePlanAllocations.length)}
                    >
                        <PoolsTableContainer />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

ServicePlans.propTypes = {
    accountsData: PropTypes.object.isRequired,
    clustersData: PropTypes.object.isRequired,
    compareRemove: PropTypes.func.isRequired,
    deleteServicePlans: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    onTabSelect: PropTypes.func,
    openModal: PropTypes.func.isRequired,
    patchServicePlan: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    rolesData: PropTypes.object.isRequired,
    selectedRows: PropTypes.array.isRequired,
    servicePlanAllocationsData: PropTypes.object.isRequired,
    servicePlansAttrs: PropTypes.array,
    servicePlansData: PropTypes.object.isRequired,
    submitAllocations: PropTypes.func.isRequired,
    tabKey: PropTypes.string,
};

export default withRouter(injectIntl(ServicePlans));
