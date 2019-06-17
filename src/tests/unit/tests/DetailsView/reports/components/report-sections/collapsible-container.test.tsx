// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';

import {
    CollapsibleContainer,
    CollapsibleContainerProps,
} from '../../../../../../../DetailsView/reports/components/report-sections/collapsible-container';

describe('CollapsibleContainer', () => {
    it('renders, no optional fields', () => {
        const props: CollapsibleContainerProps = {
            id: 'test-id',
            summaryContent: <div>this is the summary content</div>,
            detailsContent: <div> this is the details content </div>,
            buttonAriaLabel: 'button aria label',
        };

        const wrapped = shallow(<CollapsibleContainer {...props} />);

        expect(wrapped.getElement()).toMatchSnapshot();
    });

    it('renders, with extra class name for the container div', () => {
        const props: CollapsibleContainerProps = {
            id: 'test-id',
            summaryContent: <div>this is the summary content</div>,
            detailsContent: <div> this is the details content </div>,
            buttonAriaLabel: 'button aria label',
            containerClassName: 'extra-class-name',
        };

        const wrapped = shallow(<CollapsibleContainer {...props} />);

        expect(wrapped.getElement()).toMatchSnapshot();
    });

    it('renders, with heading level for the title container', () => {
        const props: CollapsibleContainerProps = {
            id: 'test-id',
            summaryContent: <div>this is the summary content</div>,
            detailsContent: <div> this is the details content </div>,
            buttonAriaLabel: 'button aria label',
            titleHeadingLevel: 5,
        };

        const wrapped = shallow(<CollapsibleContainer {...props} />);

        expect(wrapped.getElement()).toMatchSnapshot();
    });
});
