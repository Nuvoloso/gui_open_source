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
import * as types from './types';

export function loadTags(tags) {
    return {
        type: types.MOUNT_TAG,
        tags,
    };
}

export function addTag(tag) {
    return {
        type: types.ADD_TAG,
        tag: tag,
    };
}

// update the tag
export function updateTag(tagId, columnKey, newValue) {
    return {
        type: types.UPDATE_TAG,
        tagId,
        columnKey,
        newValue,
    };
}

// rows is the array of selectedRows
export function deleteTags(rows) {
    return {
        type: types.DELETE_TAG,
        rows,
    };
}

// clear out the tags
export function unmountTags() {
    return {
        type: types.UNMOUNT_TAGS,
    };
}
