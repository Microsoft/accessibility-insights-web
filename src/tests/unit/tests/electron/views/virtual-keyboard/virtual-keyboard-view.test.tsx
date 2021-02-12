// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { NarrowModeStatus } from 'DetailsView/components/narrow-mode-detector';
import { VirtualKeyboardButtonsDeps } from 'electron/views/virtual-keyboard/virtual-keyboard-buttons';
import {
    VirtualKeyboardView,
    VirtualKeyboardViewDeps,
    VirtualKeyboardViewProps,
} from 'electron/views/virtual-keyboard/virtual-keyboard-view';
import { shallow } from 'enzyme';
import * as React from 'react';

describe('VirtualKeyboardView', () => {
    let props: VirtualKeyboardViewProps;
    let deps: VirtualKeyboardButtonsDeps;

    beforeEach(() => {
        deps = {
            deviceFocusControllerFactory: {},
        } as VirtualKeyboardViewDeps;
        props = {
            deps,
            deviceId: 'some-device-id',
            narrowModeStatus: {
                isVirtualKeyboardCollapsed: true,
            } as NarrowModeStatus,
        } as VirtualKeyboardViewProps;
    });

    test('renders', () => {
        const render = shallow(<VirtualKeyboardView {...props} />);

        expect(render.getElement()).toMatchSnapshot();
    });
});
