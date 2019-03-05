// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IChoiceGroupOption } from 'office-ui-fabric-react';
import * as React from 'react';
import { IMock, Mock, Times } from 'typemoq';

import { FeatureFlags } from '../../../../../common/feature-flags';
import { UserConfigMessageCreator } from '../../../../../common/message-creators/user-config-message-creator';
import { BugServicePropertiesMap, UserConfigurationStoreData } from '../../../../../common/types/store-data/user-configuration-store';
import { DetailsViewActionMessageCreator } from '../../../../../DetailsView/actions/details-view-action-message-creator';
import { SettingsPanel, SettingsPanelProps } from '../../../../../DetailsView/components/settings-panel';

type SettingsPanelProtectedClickFunction = (id: string, state: boolean) => void;
type SettingsPanelProtectedChoiceGroupChangeFunction = (
    ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    option?: IChoiceGroupOption,
) => void;
type SettingsPanelProtectedTextFieldChangeFunction = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string,
) => void;

class TestableSettingsPanel extends SettingsPanel {
    public getOnEnableTelemetryToggleClick(): SettingsPanelProtectedClickFunction {
        return this.onEnableTelemetryToggleClick;
    }

    public getOnEnableHighContrastModeToggleClick(): SettingsPanelProtectedClickFunction {
        return this.onHighContrastModeToggleClick;
    }

    public getOnGitHubRepositoryChange(): SettingsPanelProtectedTextFieldChangeFunction {
        return this.onGitHubRepositoryChange;
    }
}

describe('SettingsPanelTest', () => {
    let detailsActionMessageCreatorMock: IMock<DetailsViewActionMessageCreator>;
    let userConfigMessageCreatorMock: IMock<UserConfigMessageCreator>;
    let userConfigStoreData: UserConfigurationStoreData;

    beforeEach(() => {
        detailsActionMessageCreatorMock = Mock.ofType(DetailsViewActionMessageCreator);
        userConfigMessageCreatorMock = Mock.ofType(UserConfigMessageCreator);
    });

    test('constructor', () => {
        const testSubject = new SettingsPanel({} as SettingsPanelProps);
        expect(testSubject).toBeDefined();
    });

    type RenderTestCase = {
        isPanelOpen: boolean;
        enableTelemetry: boolean;
        enableHighContrast: boolean;
        bugService: string;
        bugServicePropertiesMap: BugServicePropertiesMap;
    };

    test.each([
        {
            isPanelOpen: true,
            enableTelemetry: false,
            enableHighContrast: false,
            bugService: undefined,
            bugServicePropertiesMap: null,
        } as RenderTestCase,
        {
            isPanelOpen: true,
            enableTelemetry: false,
            enableHighContrast: true,
            bugService: 'gitHub',
            bugServicePropertiesMap: null,
        } as RenderTestCase,
        {
            isPanelOpen: true,
            enableTelemetry: false,
            enableHighContrast: false,
            bugService: 'gitHub',
            bugServicePropertiesMap: {},
        } as RenderTestCase,
        {
            isPanelOpen: true,
            enableTelemetry: false,
            enableHighContrast: false,
            bugService: 'gitHub',
            bugServicePropertiesMap: { gitHub: {} },
        } as RenderTestCase,
        {
            isPanelOpen: true,
            enableTelemetry: false,
            enableHighContrast: false,
            bugService: 'gitHub',
            bugServicePropertiesMap: { gitHub: { repository: 'test-repository' } },
        } as RenderTestCase,
    ])('render - %o', (testCase: RenderTestCase) => {
        userConfigStoreData = {
            enableTelemetry: testCase.enableTelemetry,
            enableHighContrast: testCase.enableHighContrast,
            bugService: testCase.bugService,
            bugServicePropertiesMap: testCase.bugServicePropertiesMap,
        } as UserConfigurationStoreData;
        const testProps: SettingsPanelProps = {
            isOpen: testCase.isPanelOpen,
            deps: {
                detailsViewActionMessageCreator: detailsActionMessageCreatorMock.object,
                userConfigMessageCreator: userConfigMessageCreatorMock.object,
            },
            userConfigStoreState: userConfigStoreData,
            featureFlagData: { [FeatureFlags.highContrastMode]: false },
        };

        const testSubject = new TestableSettingsPanel(testProps);
        expect(testSubject.render()).toMatchSnapshot();
    });

    test.each([true, false])('verify toggle click - telemetrySettingState : %s', telemetrySettingState => {
        userConfigStoreData = {} as UserConfigurationStoreData;
        const testProps: SettingsPanelProps = {
            isOpen: true,
            deps: {
                detailsViewActionMessageCreator: detailsActionMessageCreatorMock.object,
                userConfigMessageCreator: userConfigMessageCreatorMock.object,
            },
            userConfigStoreState: userConfigStoreData,
            featureFlagData: { [FeatureFlags.highContrastMode]: true },
        };

        const testSubject = new TestableSettingsPanel(testProps);

        testSubject.getOnEnableTelemetryToggleClick()(null, telemetrySettingState);
        userConfigMessageCreatorMock.verify(u => u.setTelemetryState(telemetrySettingState), Times.once());
    });

    test.each([true, false])('verify toggle click - set high contrast button : %s', highContrastConfigState => {
        userConfigStoreData = {} as UserConfigurationStoreData;
        const testProps: SettingsPanelProps = {
            isOpen: true,
            deps: {
                detailsViewActionMessageCreator: detailsActionMessageCreatorMock.object,
                userConfigMessageCreator: userConfigMessageCreatorMock.object,
            },
            userConfigStoreState: userConfigStoreData,
            featureFlagData: { [FeatureFlags.highContrastMode]: true },
        };

        const testSubject = new TestableSettingsPanel(testProps);

        testSubject.getOnEnableHighContrastModeToggleClick()(null, highContrastConfigState);
        userConfigMessageCreatorMock.verify(u => u.setHighContrastMode(highContrastConfigState), Times.once());
    });

    interface BugServicePropertyTestCase {
        bugServiceName: string;
        propertyName: string;
        propertyValue: string;
        changeFunction: (testableSettingsPanel: TestableSettingsPanel) => SettingsPanelProtectedTextFieldChangeFunction;
    }

    const bugServicePropertyTestCases: BugServicePropertyTestCase[] = [
        {
            bugServiceName: 'gitHub',
            propertyName: 'repository',
            propertyValue: 'repository-url',
            changeFunction: (testableSettingsPanel: TestableSettingsPanel) => testableSettingsPanel.getOnGitHubRepositoryChange(),
        },
    ];

    test.each(bugServicePropertyTestCases)('verify bug service property change %o', (testCase: BugServicePropertyTestCase) => {
        userConfigStoreData = {} as UserConfigurationStoreData;
        const testProps: SettingsPanelProps = {
            isOpen: true,
            deps: {
                detailsViewActionMessageCreator: detailsActionMessageCreatorMock.object,
                userConfigMessageCreator: userConfigMessageCreatorMock.object,
            },
            userConfigStoreState: userConfigStoreData,
            featureFlagData: { [FeatureFlags.showBugFiling]: true },
        };

        const testSubject = new TestableSettingsPanel(testProps);

        testCase.changeFunction(testSubject)(null, testCase.propertyValue);

        userConfigMessageCreatorMock.verify(
            u => u.setBugServiceProperty(testCase.bugServiceName, testCase.propertyName, testCase.propertyValue),
            Times.once(),
        );
    });
});
