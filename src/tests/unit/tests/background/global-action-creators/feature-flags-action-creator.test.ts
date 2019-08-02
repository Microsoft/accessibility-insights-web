// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { isFunction } from 'lodash';
import { IMock, It, Mock, Times } from 'typemoq';

import { FeatureFlagActions, FeatureFlagPayload } from 'background/actions/feature-flag-actions';
import { FeatureFlagsActionCreator } from 'background/global-action-creators/feature-flags-action-creator';
import { Interpreter } from 'background/interpreter';
import { TelemetryEventHandler } from 'background/telemetry/telemetry-event-handler';
import { Action } from '../../../../../common/flux/action';
import { Messages } from '../../../../../common/messages';

describe('FeatureFlagsActionCreator', () => {
    let interpreterMock: IMock<Interpreter>;
    let telemetryHandlerMock: IMock<TelemetryEventHandler>;
    let featureFlagActionsMock: IMock<FeatureFlagActions>;

    let testSubject: FeatureFlagsActionCreator;

    beforeEach(() => {
        interpreterMock = Mock.ofType<Interpreter>();
        telemetryHandlerMock = Mock.ofType<TelemetryEventHandler>();
        featureFlagActionsMock = Mock.ofType<FeatureFlagActions>();

        testSubject = new FeatureFlagsActionCreator(interpreterMock.object, featureFlagActionsMock.object, telemetryHandlerMock.object);
    });

    it('handles GetFeatureFlags message', () => {
        const expectedMessage = Messages.FeatureFlags.GetFeatureFlags;

        setupInterpreterMock(expectedMessage);

        const getCurrentStateMock = createActionMock();

        setupActionsMock('getCurrentState', getCurrentStateMock.object);

        testSubject.registerCallbacks();

        getCurrentStateMock.verifyAll();
    });

    it('handles SetFeatureFlag', () => {
        const expectedMessage = Messages.FeatureFlags.SetFeatureFlag;

        const payload: FeatureFlagPayload = {
            enabled: true,
            feature: 'test-feature-flag',
        };

        setupInterpreterMock(expectedMessage, payload);

        const setFeatureFlagMock = createActionMock(payload);

        setupActionsMock('setFeatureFlag', setFeatureFlagMock.object);

        testSubject.registerCallbacks();

        setFeatureFlagMock.verifyAll();
    });

    it('handles ResetFeatureFlag', () => {
        const expectedMessage = Messages.FeatureFlags.ResetFeatureFlag;

        setupInterpreterMock(expectedMessage);

        const resetFeatureFlagMock = createActionMock();

        setupActionsMock('resetFeatureFlags', resetFeatureFlagMock.object);

        testSubject.registerCallbacks();

        resetFeatureFlagMock.verifyAll();
    });

    const setupInterpreterMock = <Payload>(expectedMessage: string, payload?: Payload): void => {
        interpreterMock
            .setup(interpreter => interpreter.registerTypeToPayloadCallback(expectedMessage, It.is(isFunction)))
            .callback((message, handler) => {
                if (payload) {
                    handler(payload);
                } else {
                    handler();
                }
            });
    };

    const createActionMock = <Payload = void>(payload: Payload = null): IMock<Action<Payload>> => {
        const actionMock = Mock.ofType<Action<Payload>>();

        actionMock.setup(action => action.invoke(payload)).verifiable(Times.once());

        return actionMock;
    };

    const setupActionsMock = <ActionName extends keyof FeatureFlagActions>(
        actionName: ActionName,
        action: FeatureFlagActions[ActionName],
    ) => {
        featureFlagActionsMock.setup(actions => actions[actionName]).returns(() => action);
    };
});
