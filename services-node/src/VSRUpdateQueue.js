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

/**
 * Class to manage queue of VSRs.
 */
module.exports = class VSRUpdateQueue {
    constructor() {
        this.vsrIds = [];
    }

    /**
     * Add an entry to track.
     * @param {*} id
     * @param {*} accountId
     * @param {*} token
     * @param {*} ws
     * @param {*} message
     * @param {*} method
     */
    addId(id, accountId, token, ws, message, method) {
        const existing = this.vsrIds.find(vsrId => {
            return vsrId.id === id;
        });

        if (!existing) {
            this.vsrIds.push({ id, accountId, token, ws, message, method });
        } else {
            existing.token = token;
            existing.ws = ws;
            existing.message = message;
            existing.method = method;
        }
    }

    /**
     * Get all the added entries.
     */
    getIds() {
        return this.vsrIds;
    }

    /**
     * Clear out all the entries (e.g. if queue has been procesed)
     */
    clearIds() {
        this.vsrIds = [];
    }
};
