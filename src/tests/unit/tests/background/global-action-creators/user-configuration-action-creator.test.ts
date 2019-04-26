// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { isFunction } from 'lodash';
import { It, Mock, Times } from 'typemoq';

import {
    SaveIssueFilingSettingsPayload,
    SetBugServicePayload,
    SetBugServicePropertyPayload,
    SetHighContrastModePayload,
    SetIssueTrackerPathPayload,
    SetTelemetryStatePayload,
} from '../../../../../background/actions/action-payloads';
import { UserConfigurationActions } from '../../../../../background/actions/user-configuration-actions';
import { UserConfigurationActionCreator } from '../../../../../background/global-action-creators/user-configuration-action-creator';
import { Interpreter } from '../../../../../background/interpreter';
import { Action } from '../../../../../common/flux/action';
import { Messages } from '../../../../../common/messages';
import { TelemetryEventSource, TriggeredBy } from '../../../../../common/telemetry-events';

describe('UserConfigurationActionCreator', () => {
    it('handles GetCurrentState message', () => {
        const payload = null;

        const getCurrentStateMock = createActionMock<null>(payload);

        const actionsMock = createActionsMock('getCurrentState', getCurrentStateMock.object);

        const interpreterMock = createInterpreterMock(Messages.UserConfig.GetCurrentState, payload);

        const testSubject = new UserConfigurationActionCreator(interpreterMock.object, actionsMock.object);

        testSubject.registerCallback();

        getCurrentStateMock.verifyAll();
    });

    it('should SetTelemetryConfig message', () => {
        const payload: SetTelemetryStatePayload = {
            enableTelemetry: true,
            telemetry: {
                triggeredBy: 'test' as TriggeredBy,
                source: -1 as TelemetryEventSource,
            },
        };

        const setTelemetryStateMock = createActionMock(payload);

        const actionsMock = createActionsMock('setTelemetryState', setTelemetryStateMock.object);

        const interpreterMock = createInterpreterMock(Messages.UserConfig.SetTelemetryConfig, payload);

        const testSubject = new UserConfigurationActionCreator(interpreterMock.object, actionsMock.object);

        testSubject.registerCallback();

        setTelemetryStateMock.verifyAll();
    });

    it('should SetHighContrastConfig message', () => {
        const payload: SetHighContrastModePayload = {
            enableHighContrast: true,
        };

        const setHighContrastConfigMock = createActionMock(payload);

        const actionsMock = createActionsMock('setHighContrastMode', setHighContrastConfigMock.object);

        const interpreterMock = createInterpreterMock(Messages.UserConfig.SetHighContrastConfig, payload);

        const testSubject = new UserConfigurationActionCreator(interpreterMock.object, actionsMock.object);

        testSubject.registerCallback();

        setHighContrastConfigMock.verifyAll();
    });

    it('should SetBugService message', () => {
        const payload: SetBugServicePayload = {
            bugServiceName: 'none',
        };

        const setBugServiceMock = createActionMock(payload);

        const actionsMock = createActionsMock('setBugService', setBugServiceMock.object);

        const interpreterMock = createInterpreterMock(Messages.UserConfig.SetBugService, payload);

        const testSubject = new UserConfigurationActionCreator(interpreterMock.object, actionsMock.object);

        testSubject.registerCallback();

        setBugServiceMock.verifyAll();
    });

    it('should SetBugServiceProperty message', () => {
        const payload: SetBugServicePropertyPayload = {
            bugServiceName: 'bug-service-name',
            propertyName: 'property-name',
            propertyValue: 'property-value',
        };

        const setBugServicePropertyMock = createActionMock(payload);

        const actionsMock = createActionsMock('setBugServiceProperty', setBugServicePropertyMock.object);

        const interpreterMock = createInterpreterMock(Messages.UserConfig.SetBugServiceProperty, payload);

        const testSubject = new UserConfigurationActionCreator(interpreterMock.object, actionsMock.object);

        testSubject.registerCallback();

        setBugServicePropertyMock.verifyAll();
    });

    it('should SetIssueTrackerPath message', () => {
        const payload: SetIssueTrackerPathPayload = {
            enableTelemetry: true,
            isFirstTime: false,
            enableHighContrast: true,
            issueTrackerPath: 'example/example',
            bugService: 'none',
            bugServicePropertiesMap: {},
        };

        const setIssueTrackerPath = createActionMock(payload);

        const actionsMock = createActionsMock('setIssueTrackerPath', setIssueTrackerPath.object);

        const interpreterMock = createInterpreterMock(Messages.UserConfig.SetIssueTrackerPath, payload);

        const testSubject = new UserConfigurationActionCreator(interpreterMock.object, actionsMock.object);

        testSubject.registerCallback();

        setIssueTrackerPath.verifyAll();
    });

    it('should SaveIssueFilingSettings message', () => {
        const payload: SaveIssueFilingSettingsPayload = {
            bugServiceName: 'test bug service',
            bugFilingSettings: { name: 'issueFilingSettings' },
        };

        const setIssueFilingSettings = createActionMock(payload);

        const actionsMock = createActionsMock('saveIssueFilingSettings', setIssueFilingSettings.object);

        const interpreterMock = createInterpreterMock(Messages.UserConfig.SaveIssueFilingSettings, payload);

        const testSubject = new UserConfigurationActionCreator(interpreterMock.object, actionsMock.object);

        testSubject.registerCallback();

        setIssueFilingSettings.verifyAll();
    });

    function createActionMock<Payload>(payload: Payload) {
        const actionMock = Mock.ofType<Action<Payload>>();
        actionMock.setup(action => action.invoke(payload)).verifiable(Times.once());
        return actionMock;
    }

    function createActionsMock<ActionName extends keyof UserConfigurationActions>(
        actionName: ActionName,
        action: UserConfigurationActions[ActionName],
    ) {
        const actionsMock = Mock.ofType<UserConfigurationActions>();
        actionsMock.setup(actions => actions[actionName]).returns(() => action);
        return actionsMock;
    }

    function createInterpreterMock<Payload>(message: string, payload: Payload) {
        const interpreterMock = Mock.ofType<Interpreter>();
        interpreterMock
            .setup(interpreter => interpreter.registerTypeToPayloadCallback(message, It.is(isFunction)))
            .callback((message, handler) => handler(payload));
        return interpreterMock;
    }
});
