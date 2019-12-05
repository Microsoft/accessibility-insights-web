// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import {
    TelemetryPermissionDialog,
    TelemetryPermissionDialogDeps,
} from 'common/components/telemetry-permission-dialog';
import { NamedFC } from 'common/react/named-fc';
import { UserConfigurationStoreData } from 'common/types/store-data/user-configuration-store';
import { brand } from 'content/strings/application';
import { WindowStateStoreData } from 'electron/flux/types/window-state-store-data';
import { BrandBlue } from 'icons/brand/blue/brand-blue';
import * as React from 'react';

import { DeviceStoreData } from '../../../flux/types/device-store-data';
import { deviceConnectView, mainContentWrapper } from '../device-connect-view.scss';
import { DeviceConnectBody, DeviceConnectBodyDeps } from './device-connect-body';
import { WindowTitle, WindowTitleDeps } from './window-title';

export type DeviceConnectViewContainerDeps = TelemetryPermissionDialogDeps &
    DeviceConnectBodyDeps &
    WindowTitleDeps;

export type DeviceConnectViewContainerProps = {
    deps: DeviceConnectViewContainerDeps;
    userConfigurationStoreData: UserConfigurationStoreData;
    deviceStoreData: DeviceStoreData;
    windowStateStoreData: WindowStateStoreData;
};

export const DeviceConnectViewContainer = NamedFC<DeviceConnectViewContainerProps>(
    'DeviceConnectViewContainer',
    props => {
        return (
            <div className={deviceConnectView}>
                <WindowTitle
                    title={brand}
                    deps={props.deps}
                    windowStateStoreData={props.windowStateStoreData}
                >
                    <BrandBlue />
                </WindowTitle>
                <div className={mainContentWrapper}>
                    <DeviceConnectBody
                        deps={props.deps}
                        viewState={{
                            deviceConnectState: props.deviceStoreData.deviceConnectState,
                            connectedDevice: props.deviceStoreData.connectedDevice,
                        }}
                    />
                    <TelemetryPermissionDialog
                        deps={props.deps}
                        isFirstTime={props.userConfigurationStoreData.isFirstTime}
                    />
                </div>
            </div>
        );
    },
);
