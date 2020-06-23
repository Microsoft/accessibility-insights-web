// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import ADB from 'appium-adb';
import { AdbWrapper, AdbWrapperFactory } from 'electron/platform/android/adb-wrapper';
import {
    AppiumAdbCreateParameters,
    AppiumAdbCreator,
} from 'electron/platform/android/appium-adb-creator';
import { AppiumAdbWrapper } from 'electron/platform/android/appium-adb-wrapper';

export class AppiumAdbWrapperFactory implements AdbWrapperFactory {
    public constructor(private readonly adbCreator: AppiumAdbCreator) {}

    public getAdbWrapper = async (sdkRoot: string): Promise<AdbWrapper> => {
        const parameters: AppiumAdbCreateParameters = sdkRoot
            ? {
                  sdkRoot,
              }
            : undefined;

        const adb: ADB = await this.adbCreator.createADB(parameters);

        return new AppiumAdbWrapper(adb);
    };
}
