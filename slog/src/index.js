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
import ReactDOM from 'react-dom';
import { addLocaleData, IntlProvider } from 'react-intl';
import './index.css';
import 'typeface-open-sans';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { sessionGetAccount, sessionGetToken, sessionSetToken } from './sessionUtils';
import thunk from 'redux-thunk';
import reducers from './reducers';

import axios from 'axios';
import logger from 'redux-logger';

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';

import App from './App';
import { getErrorMsg } from './components/utils';
import { logout } from './actions/authActions';

const constants = require('./constants');

const middleware = [thunk];
if (process.env.REACT_APP_NUVO_GUI_LOGGING === 'log') {
    middleware.push(logger);
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const createStoreWithMiddleware = composeEnhancers(applyMiddleware(...middleware))(createStore);

const store = createStoreWithMiddleware(reducers);

axios.interceptors.request.use(
    config => {
        const account = sessionGetAccount();
        if (account) {
            config.headers['X-Account'] = account;
        }

        const token = sessionGetToken();
        if (token) {
            config.headers['X-Auth'] = token;
        }

        config.url = `/${constants.SERVICES_NODE_API}${config.url}`;

        return config;
    },
    error => Promise.reject(error)
);

axios.interceptors.response.use(
    response => {
        const { headers } = response || {};
        const token = headers['x-auth'];
        if (token) {
            sessionSetToken(token);
        }

        return response;
    },
    error => {
        const { response } = error || {};
        const { status } = response || {};
        const message = getErrorMsg(error) || '';

        // only log out user if token is invalid
        // we should pass through other "forbidden" error messages
        if (status === 401 || (status === 403 && message.toLowerCase().includes('token'))) {
            store.dispatch(logout(message));
        }

        return Promise.reject(error);
    }
);

window.onbeforeunload = () => {
    sessionStorage.clear();
};

const messages = {};
const locales = ['en-US', 'zh-CN'];
locales.forEach(locale => {
    messages[locale] = require(`../public/assets/${locale}.json`);
    addLocaleData(require(`react-intl/locale-data/${locale.split('-')[0]}.js`));
});

const locale =
    (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage || 'en-US';

ReactDOM.render(
    <IntlProvider locale={locale} messages={messages[locale]}>
        <Provider store={store}>
            <App />
        </Provider>
    </IntlProvider>,
    document.getElementById('root')
);
