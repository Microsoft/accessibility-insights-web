// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';
import { HeaderSection } from '../../../../../../../DetailsView/reports/components/report-sections/header-section';

describe('HeaderSection', () => {
    it('renders', () => {
        const wrapper = shallow(<HeaderSection pageUrl="url://page" pageTitle="page-title" />);
        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
