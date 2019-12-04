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
import { Button, ButtonGroup, ButtonToolbar, Glyphicon } from 'react-bootstrap';

import TableContainer from '../containers/TableContainer';

import './TagsTable.css';
import { messages } from '../messages';

class TagsTable extends Component {
    constructor(props) {
        super(props);

        this.renderEditable = this.renderEditable.bind(this);
    }

    renderToolbar() {
        const { selectedRows, addTag, deleteTags } = this.props;

        return (
            <ButtonToolbar>
                <ButtonGroup>
                    <Button
                        onClick={e => {
                            addTag(e);
                        }}
                    >
                        <Glyphicon glyph="plus-sign" /> {messages.TAGS_ADD_TAG}
                    </Button>
                    <Button
                        disabled={selectedRows.length < 1}
                        onClick={e => {
                            deleteTags(e);
                        }}
                    >
                        <Glyphicon glyph="trash" /> {messages.TAGS_DELETE_TAG}
                    </Button>
                </ButtonGroup>
            </ButtonToolbar>
        );
    }

    // parse tag strings into array of items for use in Table
    parseTags(tags) {
        if (!tags || tags.length < 1) {
            return [];
        }

        return tags.map(tag => {
            const kvp = tag.tag.split(':');
            return {
                tagkey: kvp[0],
                value: kvp[1],
                id: tag.id,
            };
        });
    }

    renderEditable(cellInfo) {
        return (
            <input
                type="text"
                required={cellInfo.column.id === 'tagkey' ? 'required' : ''}
                placeholder={cellInfo.column.id === 'value' ? 'optional' : ''}
                value={cellInfo.value}
                onBlur={e => {
                    this.props.updateTags(e, cellInfo.row, cellInfo.column);
                }}
                onChange={e => {
                    this.props.updateTags(e, cellInfo.row, cellInfo.column);
                }}
            />
        );
    }

    render() {
        const { tags } = this.props;

        const data = this.parseTags(tags);

        const columns = [
            {
                Header: messages.TAGS_TABLE_KEY,
                accessor: 'tagkey',
                Cell: this.renderEditable,
            },
            {
                Header: messages.TAGS_TABLE_VALUE,
                accessor: 'value',
                Cell: this.renderEditable,
            },
            {
                Header: 'ID',
                accessor: 'id',
                show: false,
            },
        ];

        return <TableContainer columns={columns} data={data} selectable toolbar={this.renderToolbar()} />;
    }
}

TagsTable.propTypes = {
    addTag: PropTypes.func.isRequired,
    deleteTags: PropTypes.func.isRequired,
    selectedRows: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    updateTags: PropTypes.func.isRequired,
};

export default TagsTable;
