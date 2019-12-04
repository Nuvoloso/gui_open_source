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
const API_PROTOCOL = process.env.API_HOST || process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT ? ':'.concat(process.env.API_PORT) : '';
const NUVO_METRICSDB_STATUS_INTERVAL = process.env.NUVO_METRICSDB_STATUS_INTERVAL || 30000;

module.exports = {
    API_AUTH: `${API_PROTOCOL}${API_HOST}${process.env.AUTH_PORT ? `:${process.env.AUTH_PORT}` : ''}/auth/`,
    API_MOCK_DELAY: 100,
    API_URL: API_PROTOCOL.concat(API_HOST, API_PORT, '/api/v1'),
    CA_CRT: process.env.CA_CRT || 'ssl/ca.crt',
    CLIENT_CRT: process.env.CLIENT_CRT || 'ssl/client.crt',
    CLIENT_KEY: process.env.CLIENT_KEY || 'ssl/client.key',
    SERVER_CRT: process.env.SERVER_CRT || 'ssl/server.crt',
    SERVER_KEY: process.env.SERVER_KEY || 'ssl/server.key',
    PORT: process.env.PORT || '8000',
    NUVO_METRICSDB_STATUS_INTERVAL,
};
