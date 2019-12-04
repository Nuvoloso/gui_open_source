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
import { Route, BrowserRouter, Switch } from 'react-router-dom';
import { intlShape, injectIntl } from 'react-intl';

import companyName from './assets/company-name.png';
import logo from './nuvologo.png';

import AccountsUsersContainer from './containers/AccountsUsersContainer';
import AccountDetailsContainer from './containers/AccountDetailsContainer';
import AlertMessagesContainer from './containers/AlertMessagesContainer';
import BackupContainer from './containers/BackupContainer';
import ClusterDetailsContainer from './containers/ClusterDetailsContainer';
import ClustersContainer from './containers/ClustersContainer';
import CSPDomainDetailsContainer from './containers/CSPDomainDetailsContainer';
import CSPDomainsContainer from './containers/CSPDomainsContainer';
import DashboardContainer from './containers/DashboardContainer';
import DevContainer from './dev/DevContainer';
import ErrorBoundary from './ErrorBoundary';
import HeaderContainer from './containers/HeaderContainer';
import Login from './components/Login';
import MenuSidebar from './components/MenuSidebar';
import ModalContainer from './containers/ModalContainer';
import RecoverContainer from './containers/RecoverContainer';
import ServicePlansContainer from './containers/ServicePlansContainer';
import SettingsContainer from './containers/SettingsContainer';
import VolumeDetailsContainer from './containers/VolumeDetailsContainer';
import VolumesContainer from './containers/VolumesContainer';

import './App.css';
import './styles.css';
import './components/header.css';
import './components/login.css';

import { getLogin, logout, postLogin } from './actions/authActions';
import { getRoles } from './actions/roleActions';
import { getUser } from './actions/userActions';
import { logMessage } from './utils';
import { openModal } from './actions/modalActions';
import { sessionGetAccount, sessionGetToken, sessionSetAccount } from './sessionUtils';
import { sessionReloadDone, sessionReloadStart } from './actions/sessionActions';

import { authMsgs } from './messages/Auth';
import { messages } from './messages/Messages';
import * as constants from './constants';
import * as types from './actions/types';

export class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            initialSocketConnect: true,
            initialWatcherConnect: true,
        };

        this.handleSocketMessage = this.handleSocketMessage.bind(this);
        this.initSocket = this.initSocket.bind(this);
        this.logout = this.logout.bind(this);
        this.postLogin = this.postLogin.bind(this);

        this.socket = null;
    }

    componentDidMount() {
        const { auth, dispatch } = this.props;
        dispatch(getLogin());
        this.loginCheck(auth);
    }

    componentDidUpdate(prevProps) {
        const { auth: prevAuth, session: prevSession } = prevProps;
        const { loggedIn: prevLoggedIn } = prevAuth || {};
        const { accountId: prevAccountId } = prevSession || {};

        const { auth, dispatch, session } = this.props;
        const { loggedIn, loggedOut } = auth || {};
        const { accountId } = session || {};
        this.loginCheck(auth);

        if (!loggedOut) {
            if ((!prevLoggedIn && loggedIn) || (!accountId && prevAccountId)) {
                const { user } = auth || {};
                const { username } = user || {};
                dispatch(getUser(username, true));
                dispatch(getRoles());
            }

            if (accountId !== prevAccountId) {
                sessionSetAccount(accountId);
                dispatch(sessionReloadStart());
            }
        }

        if (accountId && !prevAccountId) {
            const { location } = window || {};
            const { host, hostname } = location || {};

            this.initSocket(hostname === 'localhost' ? 'localhost:8000' : host, accountId);
            this.setState({ initialSocketConnect: true, initialWatcherConnect: true });
        } else if (accountId !== prevAccountId && this.socket !== null) {
            /**
             * Switch WS account if we aren't logging out.
             */
            const message = {
                id: constants.WS_MESSAGE_ACCOUNT_UPDATE,
                accountId: accountId,
            };

            if (!accountId) {
                this.socket.close(4403, 'session timeout');
                this.socket = null;
            } else {
                this.socket.send(JSON.stringify(message));
            }
        }

        if (session.reset) {
            dispatch(sessionReloadDone());
        }
    }

    handleSocketMessage(event) {
        const { intl, volumeSeriesData = {} } = this.props;
        const { formatMessage } = intl;
        const { volumeSeries } = volumeSeriesData || {};
        const { data } = event || {};
        const { data: payload, message, method, object } = JSON.parse(data || '{}');

        const { dispatch, session } = this.props;

        const { pathname } = window.location || {};

        switch (object) {
            case constants.URI_ACCOUNTS:
                /**
                 * Need to refetch user information to update account dropdown
                 * for context selection.
                 */

                if (
                    pathname.split('/').some(str => str === constants.URI_ACCOUNTS) ||
                    pathname.split('/').some(str => str === constants.URI_CSP_DOMAINS)
                ) {
                    if (method === 'POST') {
                        dispatch({
                            type: types.GET_ACCOUNTS_SUCCESS,
                            payload: Array.isArray(payload) ? payload : [payload],
                        });
                        dispatch(getUser(session.authIdentifier, false));
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_ACCOUNTS_SUCCESS, payload });
                        dispatch(getUser(session.authIdentifier, false));
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_ACCOUNTS_SUCCESS, payload });
                        dispatch(getUser(session.authIdentifier, false));
                    }
                }
                break;
            case constants.URI_CONSISTENCY_GROUPS:
                // Need to look for CGs wherever volumes are created
                if (pathname === `/${constants.URI_VOLUME_SERIES}` || pathname === '/setup') {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_CG_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_CG_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_CG_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_APPLICATION_GROUPS:
                if (pathname === `/${constants.URI_VOLUME_SERIES}`) {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_AG_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_AG_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_AG_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_CLUSTERS:
                if (pathname.split('/').some(str => str === constants.URI_CLUSTERS) || pathname === '/dev') {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_CLUSTERS_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_CLUSTERS_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_CLUSTERS_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_CSP_CREDENTIALS:
                if (pathname.split('/').some(str => str === constants.URI_CSP_DOMAINS) || pathname === '/dev') {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_CSP_CREDENTIALS_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_CSP_CREDENTIALS_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_CSP_CREDENTIALS_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_CSP_DOMAINS:
                if (
                    pathname.split('/').some(str => str === constants.URI_CLUSTERS) ||
                    pathname === '/dev' ||
                    pathname.split('/').some(str => str === constants.URI_CSP_DOMAINS) ||
                    pathname === `${constants.URI_SERVICE_PLANS}`
                ) {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_CSPS_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_CSPS_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_CSPS_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_METRICS:
                if (pathname === '/' || pathname === '/compliance') {
                    dispatch({ type: types.INVALIDATE_METRICS });
                    dispatch({ type: types.ADD_ALERT_MESSAGE, message: `${message}` });
                }
                break;
            case constants.URI_NODES:
                if (pathname.split('/').some(str => str === constants.URI_CLUSTERS) || pathname === '/dev') {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_NODES_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_NODES_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_NODES_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_SERVICE_PLAN_ALLOCATIONS:
                if (
                    pathname === '/' ||
                    pathname.split('/').some(str => str === 'accounts') ||
                    pathname === `/${constants.URI_SERVICE_PLANS}` ||
                    pathname === '/setup' ||
                    pathname.split('/').some(str => str === constants.URI_CLUSTERS) ||
                    pathname === `/${constants.URI_VOLUME_SERIES}`
                ) {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_SPA_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_SPA_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_SPAS_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_PROTECTION_DOMAINS:
                if (pathname.split('/').some(str => str === constants.URI_CSP_DOMAINS) || pathname === '/dev') {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_PROTECTION_DOMAINS_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_PROTECTION_DOMAINS_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_PROTECTION_DOMAINS_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_SERVICE_PLANS:
                if (pathname === `/${constants.URI_SERVICE_PLANS}` || pathname === '/setup') {
                    if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_SERVICE_PLANS_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_SNAPSHOTS:
                if (pathname === `/${constants.URI_BACKUP}` || pathname === `/${constants.URI_RECOVER}`) {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_SNAPSHOTS_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_POOLS:
                if (pathname === '/resources') {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_STORAGE_PROVISIONERS_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_STORAGE_PROVISIONERS_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_STORAGE_PROVISIONERS_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_VOLUME_SERIES:
                if (
                    pathname.split('/').some(str => str === constants.URI_VOLUME_SERIES) ||
                    pathname === '/setup' ||
                    pathname.split('/').some(str => str === constants.URI_CLUSTERS) ||
                    pathname === `/${constants.URI_BACKUP}` ||
                    pathname === `/${constants.URI_RECOVER}` ||
                    pathname === '/dev'
                ) {
                    if (method === 'POST') {
                        dispatch({ type: types.GET_VOLUME_SERIES_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_VOLUME_SERIES_SUCCESS, payload });
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_VOLUME_SERIES_SUCCESS, payload });
                    }
                }
                break;
            case constants.URI_VOLUME_SERIES_REQUESTS:
                if (payload.volumeSeriesRequestState === constants.VSR_COMPLETED_STATES.FAILED) {
                    const {
                        requestMessages,
                        requestedOperations = [],
                        volumeSeriesRequestState,
                        volumeSeriesCreateSpec,
                        volumeSeriesId = '',
                    } = payload || {};

                    /**
                     * Look up volume name for snapshot failures.
                     */
                    if (
                        requestedOperations.includes(constants.VSR_OPERATIONS.VOL_SNAPSHOT_CREATE) ||
                        requestedOperations.includes(constants.VSR_OPERATIONS.CG_SNAPSHOT_CREATE)
                    ) {
                        const { consistencyGroupId } = payload || {};
                        const volume = volumeSeries.find(vol => vol.consistencyGroupId === consistencyGroupId);
                        const { name = '' } = volume || {};
                        volumeSeriesCreateSpec.name = name;
                    } else if (!volumeSeriesCreateSpec.name && volumeSeriesId) {
                        const volume = volumeSeries.find(vol => vol.meta.id === volumeSeriesId);
                        const { name = '' } = volume || {};
                        volumeSeriesCreateSpec.name = name;
                    }

                    if (requestedOperations.includes(constants.VSR_OPERATIONS.ALLOCATE_CAPACITY)) {
                        dispatch({
                            type: types.ADD_ERROR_MESSAGE,
                            message: `${requestedOperations.join(', ')} ${volumeSeriesRequestState}`,
                        });
                    } else {
                        const { name } = volumeSeriesCreateSpec || {};
                        // Filter down alert messages to include key details.
                        const messages = requestMessages.filter(
                            msg =>
                                msg.message.includes('error') ||
                                msg.message.includes('failed') ||
                                msg.message.startsWith('Fail')
                        );
                        // dedupe the alert messages
                        const alertMessages = [
                            ...new Set(
                                messages.map(msg => {
                                    return msg.message;
                                })
                            ),
                        ];
                        dispatch({
                            type: types.ADD_ERROR_MESSAGE,
                            message: `${name} ${requestedOperations.join(
                                ', '
                            )} ${volumeSeriesRequestState} ${alertMessages.join(',')}`,
                            id: payload.volumeSeriesId,
                        });
                    }
                }
                if (method === 'POST') {
                    dispatch({ type: types.POST_VSR_SUCCESS, payload });
                } else if (method === 'PATCH') {
                    dispatch({ type: types.UPDATE_VSR_SUCCESS, payload });
                }
                break;
            case constants.URI_USERS:
                if (
                    pathname.split('/').some(str => str === constants.URI_ACCOUNTS) ||
                    pathname === `/${constants.URI_VOLUME_SERIES}` ||
                    pathname === '/dev'
                ) {
                    if (method === 'POST') {
                        dispatch({ type: types.POST_USERS_SUCCESS, payload });
                    } else if (method === 'PATCH') {
                        dispatch({ type: types.UPDATE_USERS_SUCCESS, payload });
                        const { authIdentifier } = payload || {};
                        if (authIdentifier === session.authIdentifier) {
                            dispatch({ type: types.GET_USER_SUCCESS, payload });
                        }
                    } else if (method === 'DELETE') {
                        dispatch({ type: types.DELETE_USERS_SUCCESS, payload });
                    }
                }
                break;
            case constants.SOCKET:
                if (payload === constants.SOCKET_CONNECTED) {
                    dispatch({ type: types.SOCKET_CONNECTED, message });
                    this.setState({ initialSocketConnect: false });
                }
                break;
            case constants.WATCHER:
                if (message === constants.WS_MESSAGES.WATCHER_CONNECTED) {
                    dispatch({ type: types.WATCHER_CONNECTED, message });
                    this.setState({ initialWatcherConnect: false });
                } else if (message === constants.WS_MESSAGES.WATCHER_CONNECTING) {
                    dispatch({ type: types.WATCHER_CONNECTING, message: formatMessage(messages.watcherConnecting) });
                } else if (message === constants.WS_MESSAGES.WATCHER_DISCONNECTED) {
                    dispatch({
                        type: types.WATCHER_DISCONNECTED,
                        message: formatMessage(messages.watcherDisconnected),
                    });
                    this.setState({ initialWatcherConnect: false });
                }
                break;
            case constants.WS_EXPIRED_AUTH:
                this.logout(message);
                break;
            case constants.WS_MESSAGES.METRICS_DB_READY:
                dispatch({ type: types.METRICS_DATABASE_READY, message });
                break;
            case constants.WS_MESSAGES.METRICS_DB_DISCONNECTED:
                dispatch({ type: types.METRICS_DATABASE_DISCONNECTED, message });
                break;
            default:
                if (message) {
                    dispatch({ type: types.ADD_ALERT_MESSAGE, message: `${message}` });
                }
                break;
        }
    }

    initSocket(host, accountId) {
        // Create WebSocket connection.

        if (!accountId) {
            return;
        }
        this.socket = new WebSocket(`wss://${host}/ws?accountId=${accountId}&token=${sessionGetToken()}`);

        // Listen for messages
        this.socket.addEventListener('close', () => {
            const { dispatch, intl } = this.props;
            const { formatMessage } = intl;
            dispatch({ type: types.SOCKET_DISCONNECTED, message: formatMessage(messages.disconnected) });
            this.setState({ initialSocketConnect: false });

            /**
             * If we close socket down ourself, we still get an event for the close
             * handshake.
             * If the remote sent a close event, attempt to reconnect periodically.
             */

            if (this.socket !== null) {
                setTimeout(() => {
                    const { session } = this.props;
                    if (session.accountId) {
                        dispatch({ type: types.SOCKET_CONNECTING, message: formatMessage(messages.reconnecting) });
                        this.initSocket(host, session.accountId);
                    }
                }, constants.WS_RECONNECT_INTERVAL);
            }
        });
        this.socket.addEventListener('error', err => {
            logMessage('WebSocket error: ', err);
            this.setState({ initialSocketConnect: false });
        });
        this.socket.addEventListener('message', this.handleSocketMessage);
    }

    isAlertBannerVisible() {
        const { session, socket } = this.props;
        const { metricsDatabaseConnected } = session || {};
        const { connected, watcherConnected } = socket || {};
        const { initialSocketConnect, initialWatcherConnect } = this.state;

        if (
            !initialSocketConnect &&
            !initialWatcherConnect &&
            (!connected || !watcherConnected || metricsDatabaseConnected !== constants.METRICS_SERVICE_CONNECTED)
        ) {
            return true;
        }

        return false;
    }

    loginCheck(auth) {
        const { dispatch } = this.props;
        const { loggedIn, loggedOut, message } = auth;

        if (!loggedIn || loggedOut) {
            dispatch(
                openModal(
                    Login,
                    {
                        className: 'login',
                        dark: true,
                        disableClose: true,
                        disableDraggable: true,
                        postLogin: this.postLogin,
                        title: this.loginTitle(),
                    },
                    {
                        message,
                    }
                )
            );
        }
    }

    loginTitle() {
        const { intl } = this.props;
        const { formatMessage } = intl;

        return (
            <div className="loginHeader">
                <img className="loginLogo" src={logo} alt={formatMessage(authMsgs.login)} />
                <img className="loginCompanyName" src={companyName} alt={formatMessage(authMsgs.companyName)} />
            </div>
        );
    }

    logout(message) {
        const { dispatch } = this.props;
        /**
         * Close the WS connection if there is one open.  See initSocket()
         * for the handshake.
         */
        if (this.socket) {
            this.socket.close(1000, 'normal termination');
            this.socket = null;
        }
        dispatch(logout(message));
        this.setState({ initialSocketConnect: true, initialWatcherConnect: true });
    }

    postLogin(username, password) {
        const { dispatch } = this.props;
        dispatch(postLogin(username, password));
    }

    renderAlertBanner() {
        const { intl, session, socket } = this.props;
        const { formatMessage } = intl;
        const { metricsDatabaseConnected } = session || {};
        const { connected, connecting, message, watcherConnected, watcherConnecting, watcherMessage } = socket || {};

        const socketMessage = connected
            ? ''
            : `${formatMessage(messages.offlineMode)} ${connecting ? message : formatMessage(messages.offlineRefresh)}`;

        const metricsMessage =
            metricsDatabaseConnected !== constants.METRICS_SERVICE_CONNECTED
                ? formatMessage(messages.waitingForMetricsDB)
                : '';

        const socketWatcherMessage = watcherConnected
            ? ''
            : `${formatMessage(messages.offlineMode)} ${
                  watcherConnecting ? watcherMessage : formatMessage(messages.watcherDisconnectedBanner)
              }`;

        const bannerMessage = socketMessage || metricsMessage || socketWatcherMessage;

        if (bannerMessage) {
            return (
                <div className="service-warning content-flex-row-centered">
                    <div className="service-warning-text flex-item-centered">{bannerMessage}</div>
                </div>
            );
        }

        return null;
    }

    renderRoutes() {
        return (
            <Switch>
                <Route path="/" exact component={DashboardContainer} />
                <Route path={`/${constants.URI_BACKUP}`} component={BackupContainer} />
                <Route path={`/${constants.URI_RECOVER}`} component={RecoverContainer} />
                <Route path={`/${constants.URI_VOLUME_SERIES}/:id`} component={VolumeDetailsContainer} />
                <Route path={`/${constants.URI_VOLUME_SERIES}`} component={VolumesContainer} />
                <Route path={`/${constants.URI_SERVICE_PLANS}`} component={ServicePlansContainer} />
                <Route path={`/${constants.URI_CLUSTERS}/:id`} component={ClusterDetailsContainer} />
                <Route path={`/${constants.URI_CLUSTERS}`} component={ClustersContainer} />
                <Route path={`/${constants.URI_ACCOUNTS}/:id`} component={AccountDetailsContainer} />
                <Route path={`/${constants.URI_ACCOUNTS}`} component={AccountsUsersContainer} />
                <Route path={`/${constants.URI_SETTINGS}`} component={SettingsContainer} />
                <Route path="/dev" component={DevContainer} />
                <Route path={`/${constants.URI_CSP_DOMAINS}/:id`} component={CSPDomainDetailsContainer} />
                <Route path={`/${constants.URI_CSP_DOMAINS}`} component={CSPDomainsContainer} />
            </Switch>
        );
    }

    renderMainContent() {
        const contentHeightClass = this.isAlertBannerVisible() ? 'content-service-warning-height' : 'content-height';

        if (!sessionGetAccount()) {
            return '';
        } else {
            return (
                <div className={`content ${contentHeightClass}`}>
                    <ErrorBoundary>{this.renderRoutes()}</ErrorBoundary>
                </div>
            );
        }
    }

    renderContent() {
        const { auth, rolesData, session, userData } = this.props;
        const { loggedIn, user } = auth || {};
        const { reset } = session || {};

        if (!loggedIn) {
            return null;
        }

        /**
         * Need to reload all content on page.
         */
        if (reset) {
            return null;
        }

        return (
            <div className="app-layout">
                <div className="sidebar-container">
                    <Switch>
                        <Route path="/" component={() => <MenuSidebar rolesData={rolesData} userData={userData} />} />
                    </Switch>
                </div>
                <div className="app-main-layout">
                    <Route render={props => <HeaderContainer {...props} logout={this.logout} user={user} />} />
                    {this.isAlertBannerVisible() ? this.renderAlertBanner() : null}
                    {this.renderMainContent()}
                </div>
            </div>
        );
    }

    render() {
        const { auth } = this.props;
        const { loggedIn } = auth || {};

        return (
            <div className="App">
                <BrowserRouter>
                    <div>
                        {this.renderContent()}
                        {loggedIn ? <AlertMessagesContainer /> : null}
                        <ModalContainer />
                    </div>
                </BrowserRouter>
            </div>
        );
    }
}

App.propTypes = {
    auth: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    rolesData: PropTypes.object.isRequired,
    session: PropTypes.object.isRequired,
    socket: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired,
    volumeSeriesData: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { auth, rolesData, session, socket, userData, volumeSeriesData } = state;
    return {
        auth,
        rolesData,
        session,
        socket,
        userData,
        volumeSeriesData,
    };
}

export default connect(mapStateToProps)(injectIntl(App));
