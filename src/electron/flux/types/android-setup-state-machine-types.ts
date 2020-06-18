// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { DeviceInfo } from 'electron/platform/android/android-service-configurator';
import { AndroidSetupStepId } from 'electron/platform/android/setup/android-setup-step-id';
import { StateMachine } from 'electron/platform/android/setup/state-machine/state-machine';
import { AndroidSetupActions } from '../action/android-setup-actions';

export type AndroidSetupStateMachine = StateMachine<AndroidSetupStepId, AndroidSetupActions>;

export type AndroidSetupStepTransitionCallback = (nextStep: AndroidSetupStepId) => void;

export type AndroidSetupStoreCallbacks = {
    stepTransition: AndroidSetupStepTransitionCallback;
    setSelectedDevice: (device: DeviceInfo) => void;
    setAvailableDevices: (devices: DeviceInfo[]) => void;
    setScanPort: (scanPort: number) => void;
};

export type AndroidSetupStateMachineFactory = (
    storeCallbacks: AndroidSetupStoreCallbacks,
) => AndroidSetupStateMachine;
