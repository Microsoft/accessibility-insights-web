// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import { forOwn } from 'lodash';
import * as React from 'react';

import { CollapsibleComponentCardsProps } from '../../../../../../DetailsView/components/cards/collapsible-component-cards';
import { ReportCollapsibleContainerControl } from '../../../../../../reports/components/report-sections/report-collapsible-container';

describe('ReportCollapsibleContainerControl', () => {
    const optionalPropertiesObject = {
        contentClassName: [undefined, 'content-class-name-a'],
        containerClassName: [undefined, 'a-container'],
        buttonAriaLabel: [undefined, 'some button label'],
        id: [undefined, 'some id'],
    };

    forOwn(optionalPropertiesObject, (propertyValues, propertyName) => {
        propertyValues.forEach(value => {
            test(`render with ${propertyName} set to: ${value}`, () => {
                const props: CollapsibleComponentCardsProps = {
                    header: <div>Some header</div>,
                    content: <div>Some content</div>,
                    headingLevel: 5,
                    [propertyName]: value,
                };
                const control = ReportCollapsibleContainerControl(props);
                const result = shallow(control);

                expect(result.getElement()).toMatchSnapshot();
            });
        });
    });
});
