// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { DeviceInfo } from 'electron/platform/android/android-service-configurator';

export type AndroidSetupDeps = {
    hasAdbPath: () => Promise<boolean>;
    setAdbPath: (path: string) => void;
    getDevices: () => Promise<DeviceInfo[]>;
    setSelectedDeviceId: (id: string) => void;
    hasExpectedServiceVersion: () => Promise<boolean>;
    installService: () => Promise<boolean>;
    hasExpectedPermissions: () => Promise<boolean>;
};
