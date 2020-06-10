// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AndroidSetupActions } from 'electron/flux/action/android-setup-actions';
import { AndroidSetupStore } from 'electron/flux/store/android-setup-store';
import {
    AndroidSetupStateMachine,
    AndroidSetupStateMachineFactory,
    AndroidSetupStepTransitionCallback,
} from 'electron/flux/types/android-setup-state-machine-types';
import { AndroidSetupStoreData } from 'electron/flux/types/android-setup-store-data';
import { createStoreWithNullParams, StoreTester } from 'tests/unit/common/store-tester';
import { It, Mock, Times } from 'typemoq';

const mockableStateMachineFactory = (
    stepTransition: AndroidSetupStepTransitionCallback,
): AndroidSetupStateMachine => {
    return null;
};

describe('AndroidSetupStore', () => {
    describe('constructor', () => {
        it('has no side effects', () => {
            const testObject = createStoreWithNullParams(AndroidSetupStore);
            expect(testObject).toBeDefined();
        });
    });

    it('invoked actions result in state machine invoke calls', () => {
        const actionNames = Object.keys(new AndroidSetupActions()) as (keyof AndroidSetupActions)[];

        const stateMachineMock = Mock.ofType<AndroidSetupStateMachine>();

        for (const actionName of actionNames) {
            stateMachineMock
                .setup(m => m.invokeAction(actionName, It.isAny()))
                .verifiable(Times.once());
        }

        const stateMachineFactoryMock = Mock.ofInstance(mockableStateMachineFactory);
        stateMachineFactoryMock
            .setup(m => m(It.isAny()))
            .returns(_ => stateMachineMock.object)
            .verifiable(Times.once());

        const setupActions = new AndroidSetupActions();

        const store = new AndroidSetupStore(setupActions, stateMachineFactoryMock.object);
        store.initialize();

        setupActions.cancel.invoke();
        setupActions.next.invoke();
        setupActions.rescan.invoke();
        setupActions.saveAdbPath.invoke('');
        setupActions.setSelectedDevice.invoke('');

        stateMachineFactoryMock.verifyAll();
        stateMachineMock.verifyAll();
    });

    it('action parameters are passed through as expected', () => {
        const testString = 'may the force be with you';

        const stateMachineMock = Mock.ofType<AndroidSetupStateMachine>();
        stateMachineMock
            .setup(m => m.invokeAction('saveAdbPath', testString))
            .verifiable(Times.once());

        const stateMachineFactoryMock = Mock.ofInstance(mockableStateMachineFactory);
        stateMachineFactoryMock
            .setup(m => m(It.isAny()))
            .returns(_ => stateMachineMock.object)
            .verifiable(Times.once());

        const setupActions = new AndroidSetupActions();

        const store = new AndroidSetupStore(setupActions, stateMachineFactoryMock.object);
        store.initialize();

        setupActions.saveAdbPath.invoke(testString);

        stateMachineFactoryMock.verifyAll();
        stateMachineMock.verifyAll();
    });

    it('ensure step transition function results in store update', () => {
        const initialData: AndroidSetupStoreData = { currentStepId: 'detect-adb' };
        const expectedData: AndroidSetupStoreData = { currentStepId: 'prompt-choose-device' };

        let stepTransition: AndroidSetupStepTransitionCallback;

        const stateMachineMock = Mock.ofType<AndroidSetupStateMachine>();
        stateMachineMock
            .setup(m => m.invokeAction('cancel', It.isAny()))
            .callback((action, payload) => stepTransition('prompt-choose-device'))
            .verifiable(Times.once());

        const stateMachineFactoryMock = Mock.ofInstance(mockableStateMachineFactory);
        stateMachineFactoryMock
            .setup(m => m(It.isAny()))
            .callback(st => (stepTransition = st))
            .returns(_ => stateMachineMock.object)
            .verifiable(Times.once());

        const storeTester = createAndroidSetupStoreTester('cancel', stateMachineFactoryMock.object);
        storeTester.testListenerToBeCalledOnce(initialData, expectedData);

        stateMachineFactoryMock.verifyAll();
        stateMachineMock.verifyAll();
    });

    const createAndroidSetupStoreTester = (
        actionToInvoke: keyof AndroidSetupActions,
        stateMachineFactory: AndroidSetupStateMachineFactory,
    ): StoreTester<AndroidSetupStoreData, AndroidSetupActions> => {
        const storeFactory = (actions: AndroidSetupActions) =>
            new AndroidSetupStore(actions, stateMachineFactory);

        return new StoreTester(AndroidSetupActions, actionToInvoke, storeFactory);
    };
});
