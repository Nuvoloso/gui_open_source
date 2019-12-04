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
import { handleError, request, send } from '../../instance';
import { API_URL } from '../../config';

import * as constants from '../../constants';

const url = `/${constants.URI_SNAPSHOTS}`;
const apiSnapshots = `${API_URL}/${constants.URI_SNAPSHOTS}`;

module.exports = function(app) {
    app.get(url, (req, res) => {
        const { query } = req || {};
        const keys = Object.keys(query) || [];
        const reqUrl = `${apiSnapshots}${
            keys.length > 0 ? `?${keys.map(key => `${key}=${query[key]}`).join('&')}` : ''
        }`;
        request(req, 'get', reqUrl)
            .then(response => {
                    send(res, response);
                },
                err => {
                    handleError(res, err);
                })
            .catch(err => {
                handleError(res, err);
            });
    });
};
