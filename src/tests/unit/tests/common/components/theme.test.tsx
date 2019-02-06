// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as _ from 'lodash';
import * as React from 'react';

import { ThemeDeps, ThemeInner, ThemeInnerProps } from '../../../../../common/components/theme';
import { DefaultThemePalette } from '../../../../../common/styles/default-theme-palette';
import { HighContrastThemePalette } from '../../../../../common/styles/high-contrast-theme-palette';

describe('ThemeInner', () => {
    let props: ThemeInnerProps;
    const loadThemeMock = jest.fn();

    beforeEach(() => {
        props = {
            deps: {
                loadTheme: loadThemeMock,
                storeActionMessageCreator: null,
                storesHub: null,
            } as ThemeDeps,
            storeState: {
                userConfigurationStoreData: {
                    enableHighContrast: null,
                },
            },
        } as ThemeInnerProps;
    });

    test.each([true, false])('is high contrast mode enabled: %s', (enableHighContrast: boolean) => {
        props.storeState.userConfigurationStoreData.enableHighContrast = enableHighContrast;
        const wrapper = shallow(<ThemeInner {...props} />);
        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test.each([true, false])('componentDidUpdate: is high contrast mode enabled: %s', (enableHighContrast: boolean) => {
        const theme = {
            palette: enableHighContrast ? HighContrastThemePalette : DefaultThemePalette,
        };
        const wrapper = shallow(<ThemeInner {...props} />);
        wrapper.setProps({ storeState: { userConfigurationStoreData: { enableHighContrast } } });
        expect(loadThemeMock).toBeCalledWith(theme);
    });

    test('loadTheme is not called if props did not change', () => {
        const component = new ThemeInner(props);
        component.componentDidUpdate(props);
        expect(loadThemeMock).not.toBeCalled();
    });
});
