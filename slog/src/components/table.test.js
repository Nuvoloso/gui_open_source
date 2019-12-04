import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import TableWrapper from './Table';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const title = 'Testing';
const wrapper = mount(<TableWrapper columns={[]} data={[]} dispatch={() => {}} title={title} />);

describe('(Component) Table ', () => {
    it('should render title for Table', () => {
        expect(wrapper.find('.table-title').text()).to.equal(title);
    });
});
