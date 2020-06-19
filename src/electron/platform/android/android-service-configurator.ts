// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type DeviceInfo = {
    id: string;
    isEmulator: boolean;
    friendlyName: string;
};

export type PackageInfo = {
    versionCode?: number;
    versionName?: string;
};

export type PermissionInfo = {
    screenshotGranted: boolean;
};

export interface AndroidServiceConfigurator {
    getConnectedDevices(): Promise<Array<DeviceInfo>>;
    getPackageInfo(deviceId: string): Promise<PackageInfo>;
    getPermissionInfo(deviceId: string): Promise<PermissionInfo>;
    installService(deviceId: string): Promise<void>;
    uninstallService(deviceId: string): Promise<void>;
    setTcpForwarding(deviceId: string, localPort: number, devicePort: number): Promise<void>;
    removeTcpForwarding(deviceId: string, devicePort: number): Promise<void>;
}

export interface AndroidServiceConfiguratorFactory {
    getServiceConfigurator(sdkRoot: string): Promise<AndroidServiceConfigurator>;
}
