// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';

import { NamedFC } from 'common/react/named-fc';
import { brand } from 'content/strings/application';
import { WindowFrameActionCreator } from 'electron/flux/action-creator/window-frame-action-creator';
import { WindowStateStoreData } from 'electron/flux/types/window-state-store-data';
import {
    WindowTitle,
    WindowTitleDeps,
} from 'electron/views/device-connect-view/components/window-title';
import { BrandWhite } from 'icons/brand/white/brand-white';
import { MaximizeRestoreButton } from './maximize-restore-button';
import * as styles from './title-bar.scss';

export type TitleBarDeps = {
    windowFrameActionCreator: WindowFrameActionCreator;
} & WindowTitleDeps;

export interface TitleBarProps {
    deps: TitleBarDeps;
    windowStateStoreData: WindowStateStoreData;
}

export const TitleBar = NamedFC<TitleBarProps>('TitleBar', (props: TitleBarProps) => {
    const minimize = () => props.deps.windowFrameActionCreator.minimize();
    const maximizeOrRestore = () =>
        isWindowMaximized(props.windowStateStoreData)
            ? props.deps.windowFrameActionCreator.restore()
            : props.deps.windowFrameActionCreator.maximize();

    const close = () => props.deps.windowFrameActionCreator.close();

    const icons = [
        <ActionButton
            ariaHidden={true}
            iconProps={{
                iconName: 'chromeMinimize',
            }}
            id="minimize-button"
            onClick={minimize}
            tabIndex={-1}
            key="minimize"
        />,
        <MaximizeRestoreButton
            onClick={maximizeOrRestore}
            isMaximized={isWindowMaximized(props.windowStateStoreData)}
            key="maximize-restore"
        />,
        <ActionButton
            ariaHidden={true}
            iconProps={{
                iconName: 'cancel',
            }}
            id="close-button"
            onClick={close}
            tabIndex={-1}
            key="close"
        />,
    ];

    return (
        <WindowTitle
            title={brand}
            actionableIcons={icons}
            windowStateStoreData={props.windowStateStoreData}
            deps={props.deps}
            className={styles.titleBar}
        >
            <BrandWhite />
        </WindowTitle>
    );
});

function isWindowMaximized(windowStateStoreData: WindowStateStoreData): boolean {
    return (
        windowStateStoreData.currentWindowState === 'maximized' ||
        windowStateStoreData.currentWindowState === 'fullScreen'
    );
}
