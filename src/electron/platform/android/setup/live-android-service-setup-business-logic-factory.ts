// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AndroidServiceApkLocator } from 'electron/platform/android/android-service-apk-locator';
import { AndroidServiceConfiguratorFactory } from 'electron/platform/android/android-service-configurator';
import {
    AndroidServiceSetupBusinessLogic,
    LiveAndroidServiceSetupBusinessLogic,
} from 'electron/platform/android/setup/live-android-service-setup-business-logic';

export interface AndroidServiceSetupBusinessLogicFactory {
    getBusinessLogic(adbLocation: string): Promise<AndroidServiceSetupBusinessLogic>;
}

export class LiveAndroidServiceSetupBusinessLogicFactory {
    constructor(
        private readonly serviceConfiguratorFactory: AndroidServiceConfiguratorFactory,
        private readonly apkLocator: AndroidServiceApkLocator,
    ) {}

    public getBusinessLogic = async (
        adbLocation: string,
    ): Promise<AndroidServiceSetupBusinessLogic> => {
        const configurator = await this.serviceConfiguratorFactory.getServiceConfigurator(
            adbLocation,
        );
        return new LiveAndroidServiceSetupBusinessLogic(configurator, this.apkLocator);
    };
}
