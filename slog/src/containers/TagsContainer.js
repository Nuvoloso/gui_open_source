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

import * as types from '../actions/types';

import TagsTable from '../components/TagsTable';

import { addTag, updateTag, deleteTags } from '../actions/tagsTableActions';

class TagsContainer extends Component {
    constructor(props) {
        super(props);

        this.updateTags = this.updateTags.bind(this);
        this.addTag = this.addTag.bind(this);
        this.deleteTags = this.deleteTags.bind(this);
    }

    // update the tags based on the row/column info
    updateTags(e, row, column) {
        const { dispatch } = this.props;

        if (row && column) {
            dispatch(updateTag(row.id, column.id, e.target.value));
        }
    }

    // add an empty tag
    addTag() {
        const { dispatch } = this.props;

        dispatch(addTag());
    }

    // delete 1 or more tags that were selected using table mechanism
    deleteTags() {
        const { dispatch, table } = this.props;

        dispatch(deleteTags(table.selectedRows));

        // clear out any selected rows now
        table.selectedRows.forEach(row => {
            dispatch({ type: types.REMOVE_SELECTED_ROW, row });
        });
    }

    // render
    // tags are retrieved from the store
    render() {
        const { table, tableTags } = this.props;
        const { tags } = tableTags;

        return (
            <TagsTable
                selectedRows={table.selectedRows}
                table={table}
                tags={tags}
                updateTags={this.updateTags}
                addTag={this.addTag}
                deleteTags={this.deleteTags}
            />
        );
    }
}

TagsContainer.propTypes = {
    dispatch: PropTypes.func.isRequired,
    table: PropTypes.object.isRequired,
    tableTags: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    const { table, tableTags } = state;
    return {
        table,
        tableTags,
    };
}

export default connect(mapStateToProps)(TagsContainer);
