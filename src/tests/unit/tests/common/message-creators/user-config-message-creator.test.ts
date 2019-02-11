// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import {
    SetBugServicePayload,
    SetHighContrastModePayload,
    SetTelemetryStatePayload,
} from '../../../../../background/actions/action-payloads';
import { UserConfigMessageCreator } from '../../../../../common/message-creators/user-config-message-creator';
import { Messages } from '../../../../../common/messages';

describe('UserConfigMessageCreator', () => {
    let postMessageMock: IMock<(message) => void>;
    let testSubject: UserConfigMessageCreator;
    let tabId: number;

    beforeEach(() => {
        postMessageMock = Mock.ofInstance(message => {}, MockBehavior.Strict);
        tabId = 1;

        testSubject = new UserConfigMessageCreator(postMessageMock.object, tabId);
    });

    afterEach(() => {
        postMessageMock.verifyAll();
    });

    test('setTelemetryState', () => {
        const enableTelemetry = false;
        const payload: SetTelemetryStatePayload = {
            enableTelemetry,
        };
        const expectedMessage = {
            tabId: 1,
            type: Messages.UserConfig.SetTelemetryConfig,
            payload,
        };

        postMessageMock.setup(pm => pm(It.isValue(expectedMessage))).verifiable(Times.once());

        testSubject.setTelemetryState(enableTelemetry);

        postMessageMock.verifyAll();
    });

    test('setHighContrastModeConfig', () => {
        const enableHighContrast = true;
        const payload: SetHighContrastModePayload = {
            enableHighContrast,
        };
        const expectedMessage = {
            tabId: 1,
            type: Messages.UserConfig.SetHighContrastConfig,
            payload,
        };

        postMessageMock.setup(pm => pm(It.isValue(expectedMessage))).verifiable(Times.once());

        testSubject.setHighContrastMode(enableHighContrast);

        postMessageMock.verifyAll();
    });

    test('setBugService', () => {
        const bugServiceName = 'UserConfigMessageCreatorTest bug service name';
        const payload: SetBugServicePayload = {
            bugServiceName,
        };
        const expectedMessage = {
            tabId: 1,
            type: Messages.UserConfig.SetBugServiceConfig,
            payload,
        };

        postMessageMock.setup(pm => pm(It.isValue(expectedMessage))).verifiable(Times.once());

        testSubject.setBugService(bugServiceName);

        postMessageMock.verifyAll();
    });
});
