// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { UserConfigurationStore } from 'background/stores/global/user-configuration-store';
import { Rectangle } from 'electron';
import { RoutePayload } from '../action/route-payloads';
import { WindowStateActions } from '../action/window-state-actions';
import { WindowStatePayload } from '../action/window-state-payload';
import { WindowFrameActionCreator } from './window-frame-action-creator';

export class WindowStateActionCreator {
    constructor(
        private readonly windowStateActions: WindowStateActions,
        private readonly windowFrameActionCreator: WindowFrameActionCreator,
        private readonly userConfigurationStore: UserConfigurationStore,
    ) {}

    public setRoute(payload: RoutePayload): void {
        this.windowStateActions.setRoute.invoke(payload);

        if (payload.routeId === 'deviceConnectView') {
            this.windowFrameActionCreator.setWindowSize({ width: 600, height: 391 });
        } else {
            this.setWindowBoundsFromSavedWindowBounds();
        }
    }

    public setWindowState(payload: WindowStatePayload): void {
        this.windowStateActions.setWindowState.invoke(payload);
    }

    private setWindowBoundsFromSavedWindowBounds(): void {
        const windowBounds: Rectangle = this.userConfigurationStore.getState().lastWindowBounds;
        if (windowBounds !== null) {
            this.windowFrameActionCreator.setWindowBounds(windowBounds);
        } else {
            this.windowFrameActionCreator.maximize();
        }
    }
}
