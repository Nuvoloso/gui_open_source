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
const passport = require('passport');
const cel = require('connect-ensure-login');

import * as constants from '../../constants';

module.exports = function(app) {
    app.get(constants.URI_AUTH.LOGIN, cel.ensureLoggedIn(), (req, res) => {
        const { user } = req;
        res.send({ user });
    });

    app.post(constants.URI_AUTH.LOGIN, passport.authenticate('local'), (req, res) => {
        const { user } = req;
        res.send({ user });
    });

    app.post(constants.URI_AUTH.LOGOUT, (req, res) => {
        const { user } = req;
        const { username = '' } = user || {};
        req.logout();
        res.send({ message: 'logged out user: '.concat(username) });
    });
};
