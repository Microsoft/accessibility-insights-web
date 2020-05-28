// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';

import {
    LeftNavHamburgerButton,
    LeftNavHamburgerButtonProps,
} from 'common/components/left-nav-hamburger-button';

describe('LeftNavHamburgerButton', () => {
    it('renders per snapshot', () => {
        const props: LeftNavHamburgerButtonProps = {
            ariaLabel: 'test-aria-label',
        };

        const wrapper = shallow(<LeftNavHamburgerButton {...props} />);

        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
