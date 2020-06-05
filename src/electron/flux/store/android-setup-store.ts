// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BaseStoreImpl } from 'background/stores/base-store-impl';
import { StoreNames } from 'common/stores/store-names';
import { AndroidSetupStepId } from 'electron/platform/android/setup/android-setup-step-id';
import { AndroidSetupActions } from '../action/android-setup-actions';
import { AndroidSetupStoreData } from '../types/android-setup-store-data';

import {
    AndroidSetupStateMachine,
    AndroidSetupStateMachineFactory,
} from '../types/android-setup-state-machine-types';

export class AndroidSetupStore extends BaseStoreImpl<AndroidSetupStoreData> {
    private stateMachine: AndroidSetupStateMachine;

    constructor(
        private readonly androidSetupActions: AndroidSetupActions,
        private createAndroidSetupStateMachine: AndroidSetupStateMachineFactory,
    ) {
        super(StoreNames.AndroidSetupStore);
    }

    public initialize(initialState?: AndroidSetupStoreData): void {
        super.initialize(initialState);
        this.stateMachine = this.createAndroidSetupStateMachine(this.stepTransition);
    }

    public getDefaultState(): AndroidSetupStoreData {
        // the value of currentStepId below is not especially meaningful
        // because the state will be overridden on the call to initialize
        // when the state machine factory is run.
        return { currentStepId: 'detect-adb' };
    }

    protected addActionListeners(): void {
        const actionNames = Object.keys(this.androidSetupActions) as (keyof AndroidSetupActions)[];

        for (const actionName of actionNames) {
            this.androidSetupActions[actionName].addListener(payload =>
                this.stateMachine.invokeAction(actionName, payload),
            );
        }
    }

    private stepTransition = (nextStep: AndroidSetupStepId): void => {
        this.state.currentStepId = nextStep;
        this.emitChanged();
    };
}
