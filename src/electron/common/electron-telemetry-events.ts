// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BaseTelemetryData } from 'common/extension-telemetry-events';

export const APP_INITIALIZED: string = 'AppInitialized';
export const VALIDATE_PORT: string = 'ValidatePort';
export const SCAN_STARTED: string = 'ScanStarted';
export const SCAN_COMPLETED: string = 'ScanCompleted';
export const SCAN_FAILED: string = 'ScanFailed';
export const DEVICE_SETUP_STEP: string = 'DeviceSetupStep';
export const DEVICE_FOCUS_ENABLE: string = 'DeviceFocusEnable';
export const DEVICE_FOCUS_DISABLE: string = 'DeviceFocusDisable';
export const DEVICE_FOCUS_RESET: string = 'DeviceFocusReset';
export const DEVICE_FOCUS_KEYEVENT: string = 'DeviceFocusKeyEvent';

export type AndroidSetupStepTelemetryData = {
    prevStep: string;
    newStep: string;
    prevDuration: number;
} & BaseTelemetryData;
