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

export const tableInitialState = {
    selectedRows: [],
};

export default function table(state = tableInitialState, action) {
    return tableSettings(state, action);
}

export function tableSettings(state = tableInitialState, action, component) {
    switch (action.type) {
        case component ? `${types.ADD_SELECTED_ROW}_${component.toUpperCase()}` : `${types.ADD_SELECTED_ROW}`:
            return {
                ...state,
                selectedRows: [...state.selectedRows, action.row],
            };
        case component ? `${types.ADD_SELECTED_ROWS}_${component.toUpperCase()}` : `${types.ADD_SELECTED_ROWS}`:
            return {
                ...state,
                selectedRows: [
                    ...state.selectedRows,
                    ...action.rows.filter(row => state.selectedRows.every(selectedRow => row.id !== selectedRow.id)),
                ],
            };
        case component ? `${types.REMOVE_SELECTED_ROW}_${component.toUpperCase()}` : `${types.REMOVE_SELECTED_ROW}`:
            return {
                ...state,
                selectedRows: state.selectedRows.filter(row => row.id !== action.row.id),
            };
        case component
            ? `${types.REMOVE_ALL_SELECTED_ROWS}_${component.toUpperCase()}`
            : `${types.REMOVE_ALL_SELECTED_ROWS}`:
            return {
                ...state,
                selectedRows: [],
            };
        case component ? `${types.TABLE_MOUNT}_${component.toUpperCase()}` : `${types.TABLE_MOUNT}`:
            return {
                ...state,
                ...tableInitialState,
            };
        case component ? `${types.TABLE_UNMOUNT}_${component.toUpperCase()}` : `${types.TABLE_UNMOUNT}`:
            return {
                ...state,
                ...tableInitialState,
            };
        default:
            return state;
    }
}
