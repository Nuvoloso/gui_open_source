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

//
// tagsTable is represented by an array of objects
// [
//      {
//          id: uniqueid,
//          tag: tag
//      }
// ]

const initialState = {
    tags: [],
};

export default function table(state = initialState, action) {
    function nextId() {
        let maxId = 0;

        state.tags.forEach(tag => {
            if (tag.id > maxId) {
                maxId = tag.id;
            }
        });

        return ++maxId;
    }

    switch (action.type) {
        case types.ADD_TAG:
            return {
                ...state,
                tags: state.tags.concat({
                    id: nextId(),
                    tag: ':',
                }),
            };

        case types.DELETE_TAG:
            return {
                tags: state.tags.filter(tableTag => {
                    // for each tag, look through the passed set of selectedrows
                    // to see if it's ID is included
                    let found = false;
                    for (let i = 0; i < action.rows.length; i++) {
                        if (tableTag.id === action.rows[i].id) {
                            found = true;
                        }
                    }
                    return !found;
                }),
            };

        case types.UPDATE_TAG:
            return {
                // generate a new array for the tags
                tags: state.tags.map(tableTag => {
                    if (tableTag.id === action.tagId) {
                        let newTag = '';
                        let kvp = tableTag.tag.split(':');

                        // TBD columnKeys as a constant
                        if (action.columnKey === 'tagkey') {
                            // update the key
                            newTag = newTag.concat(action.newValue, ':', kvp[1]);
                        } else {
                            // update the value
                            newTag = newTag.concat(kvp[0], ':', action.newValue);
                        }
                        return {
                            id: tableTag.id,
                            tag: newTag,
                        };
                    }
                    return tableTag;
                }),
            };

        case types.MOUNT_TAG:
            return {
                tags: action.tags.map((tag, id) => {
                    return { tag, id };
                }),
            };

        case types.UNMOUNT_TAGS:
            return {
                ...initialState,
            };

        default:
            return state;
    }
}
