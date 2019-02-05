// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
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

    test.each([true, false])('componentWillUpdate: is high contrast mode enabled: %s', (enableHighContrast: boolean) => {
        const theme = {
            palette: enableHighContrast ? HighContrastThemePalette : DefaultThemePalette,
        };
        props.storeState.userConfigurationStoreData.enableHighContrast = enableHighContrast;
        const component = new ThemeInner(props);
        component.componentWillUpdate(props);
        expect(loadThemeMock).toBeCalledWith(theme);
    });
});
