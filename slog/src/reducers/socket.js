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
import * as types from '../actions/types';

/**
 * socket shape is
 * connected: WebSocket is connected to services-node
 */
export const initialState = {
    connected: false,
    connecting: false,
    message: '',
    watcherConnected: false,
    watcherConnecting: false,
    watcherMessage: '',
};

export default function(state = initialState, action) {
    switch (action.type) {
        case types.SOCKET_CONNECTED:
            return {
                ...state,
                connected: true,
                connecting: false,
                message: action.message,
            };
        case types.SOCKET_CONNECTING:
            return {
                ...state,
                connecting: true,
                message: action.message,
            };
        case types.SOCKET_DISCONNECTED:
            return {
                ...state,
                connected: false,
                message: state.connecting ? state.message : action.message,
            };
        case types.WATCHER_CONNECTED:
            return {
                ...state,
                watcherConnected: true,
                watcherConnecting: false,
                watcherMessage: action.message,
            };
        case types.WATCHER_CONNECTING:
            return {
                ...state,
                watcherConnecting: true,
                watcherMessage: action.message,
            };
        case types.WATCHER_DISCONNECTED:
            return {
                ...state,
                watcherConnected: false,
                watcherMessage: state.watcherConnecting ? state.message : action.message,
            };
        default:
            return state;
    }
}
