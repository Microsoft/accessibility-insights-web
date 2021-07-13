// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import {
    App,
    BrowserWindow,
    Dialog,
    IpcMain,
    IpcMainEvent,
    IpcMainInvokeEvent,
    OpenDialogOptions,
    OpenDialogReturnValue,
} from 'electron';
import { Rectangle } from 'electron';
import {
    SetSizePayload,
    WindowBoundsChangedPayload,
} from 'electron/flux/action/window-frame-actions-payloads';
import { WindowState } from 'electron/flux/types/window-state';
import {
    IPC_FROMBROWSERWINDOW_CLOSE_CHANNEL_NAME,
    IPC_FROMBROWSERWINDOW_ENTERFULLSCREEN_CHANNEL_NAME,
    IPC_FROMBROWSERWINDOW_MAXIMIZE_CHANNEL_NAME,
    IPC_FROMBROWSERWINDOW_UNMAXIMIZE_CHANNEL_NAME,
    IPC_FROMBROWSERWINDOW_WINDOWBOUNDSCHANGED_CHANNEL_NAME,
    IPC_FROMRENDERER_CLOSE_BROWSERWINDOW_CHANNEL_NAME,
    IPC_FROMRENDERER_FULL_SCREEN_BROWSER_WINDOW_CHANNEL_NAME,
    IPC_FROMRENDERER_GET_APP_PATH_CHANNEL_NAME,
    IPC_FROMRENDERER_MAXIMIZE_BROWSER_WINDOW_CHANNEL_NAME,
    IPC_FROMRENDERER_MINIMIZE_BROWSER_WINDOW_CHANNEL_NAME,
    IPC_FROMRENDERER_RESTORE_BROWSER_WINDOW_CHANNEL_NAME,
    IPC_FROMRENDERER_SETSIZEANDCENTER_BROWSER_WINDOW_CHANNEL_NAME,
    IPC_FROMRENDERER_SETWINDOWBOUNDS_BROWSER_WINDOW_CHANNEL_NAME,
    IPC_FROMRENDERER_SHOW_OPEN_FILE_DIALOG,
} from 'electron/ipc/ipc-channel-names';

type EventCallback<EventT> = {
    eventName: string;
    eventHandler: (event: EventT, ...args: any[]) => void;
};

export class MainWindowRendererMessageHandlers {
    private ipcMainHandlers: EventCallback<IpcMainInvokeEvent>[];
    private ipcMainListeners: EventCallback<IpcMainEvent>[];
    private browserWindowCallbacks: EventCallback<Electron.Event>[];
    private haveNotifiedRendererOfClose: boolean = false;

    public constructor(
        private readonly browserWindow: BrowserWindow,
        private readonly ipcMain: IpcMain,
        private readonly app: App,
        private readonly dialog: Dialog,
    ) {}

    private populateCallbacks(): void {
        this.ipcMainHandlers = [
            {
                eventName: IPC_FROMRENDERER_GET_APP_PATH_CHANNEL_NAME,
                eventHandler: this.handleGetAppPathFromRenderer,
            },
            {
                eventName: IPC_FROMRENDERER_SHOW_OPEN_FILE_DIALOG,
                eventHandler: this.handleShowOpenFileDialogFromRenderer,
            },
        ];

        this.ipcMainListeners = [
            {
                eventName: IPC_FROMRENDERER_FULL_SCREEN_BROWSER_WINDOW_CHANNEL_NAME,
                eventHandler: this.onFullScreenFromRenderer,
            },
            {
                eventName: IPC_FROMRENDERER_MAXIMIZE_BROWSER_WINDOW_CHANNEL_NAME,
                eventHandler: this.onMaximizeFromRenderer,
            },
            {
                eventName: IPC_FROMRENDERER_MINIMIZE_BROWSER_WINDOW_CHANNEL_NAME,
                eventHandler: this.onMinimizeFromRenderer,
            },
            {
                eventName: IPC_FROMRENDERER_RESTORE_BROWSER_WINDOW_CHANNEL_NAME,
                eventHandler: this.onRestoreFromRenderer,
            },
            {
                eventName: IPC_FROMRENDERER_CLOSE_BROWSERWINDOW_CHANNEL_NAME,
                eventHandler: this.onCloseMessageFromRenderer,
            },
            {
                eventName: IPC_FROMRENDERER_SETSIZEANDCENTER_BROWSER_WINDOW_CHANNEL_NAME,
                eventHandler: this.onSetSizeAndCenterFromRenderer,
            },
            {
                eventName: IPC_FROMRENDERER_SETWINDOWBOUNDS_BROWSER_WINDOW_CHANNEL_NAME,
                eventHandler: this.onSetWindowBoundsFromRenderer,
            },
        ];

        this.browserWindowCallbacks = [
            { eventName: 'maximize', eventHandler: this.onMaximizeFromMainWindow },
            { eventName: 'unmaximize', eventHandler: this.onUnmaximizeFromMainWindow },
            { eventName: 'enter-full-screen', eventHandler: this.onEnterFullScreenFromMainWindow },
            { eventName: 'leave-full-screen', eventHandler: this.onLeaveFullScreenFromMainWindow },
            { eventName: 'close', eventHandler: e => this.onCloseFromMainWindow(e) },
            { eventName: 'resize', eventHandler: this.onWindowBoundsChanged },
            { eventName: 'move', eventHandler: this.onWindowBoundsChanged },
        ];
    }

    public startListening(): void {
        this.populateCallbacks();

        this.ipcMainHandlers.forEach(callback => {
            try {
                this.ipcMain.handle(callback.eventName, callback.eventHandler);
            } catch (err) {
                //we tried to register the handler twice
                console.error(err);
            }
        });

        this.ipcMainListeners.forEach(callback => {
            this.ipcMain.on(callback.eventName, callback.eventHandler);
        });

        this.browserWindowCallbacks.forEach(callback => {
            this.browserWindow.on(callback.eventName as any, callback.eventHandler);
        });
    }

    public stopListening(): void {
        this.ipcMainHandlers.forEach(callback => {
            this.ipcMain.removeHandler(callback.eventName);
        });

        this.ipcMainListeners.forEach(callback => {
            this.ipcMain.removeListener(callback.eventName, callback.eventHandler);
        });

        this.browserWindowCallbacks.forEach(callback => {
            this.browserWindow.removeListener(callback.eventName as any, callback.eventHandler);
        });
    }

    private onFullScreenFromRenderer = (): void => {
        this.browserWindow.setFullScreen(true);
    };

    private onMaximizeFromRenderer = (): void => {
        this.browserWindow.maximize();
    };

    private onMinimizeFromRenderer = (): void => {
        this.browserWindow.minimize();
    };

    private onRestoreFromRenderer = (): void => {
        if (this.browserWindow.isFullScreen()) {
            this.browserWindow.setFullScreen(false);
        } else {
            this.browserWindow.unmaximize();
        }
    };

    private onCloseMessageFromRenderer = (): void => {
        try {
            this.browserWindow.close();
        } catch (err) {
            //already closed, likely in tests
            console.error(err);
        }
    };

    private onSetSizeAndCenterFromRenderer = (_: IpcMainEvent, args: SetSizePayload): void => {
        this.browserWindow.setSize(args.width, args.height);
        this.browserWindow.center();
    };

    private onSetWindowBoundsFromRenderer = (_: IpcMainEvent, windowBounds: Rectangle): void => {
        this.browserWindow.setBounds(windowBounds);
    };

    private handleGetAppPathFromRenderer = async (): Promise<string> => {
        return this.app.getAppPath();
    };

    private handleShowOpenFileDialogFromRenderer = async (
        _: IpcMainInvokeEvent,
        opts: OpenDialogOptions,
    ): Promise<OpenDialogReturnValue> => {
        return await this.dialog.showOpenDialog(this.browserWindow, opts);
    };

    private onCloseFromMainWindow = (e: Event): void => {
        if (this.haveNotifiedRendererOfClose) {
            return;
        }

        this.browserWindow.webContents.send(IPC_FROMBROWSERWINDOW_CLOSE_CHANNEL_NAME);
        this.haveNotifiedRendererOfClose = true;
        e.preventDefault();
        return;
    };

    private onMaximizeFromMainWindow = (): void => {
        this.browserWindow.webContents.send(IPC_FROMBROWSERWINDOW_MAXIMIZE_CHANNEL_NAME);
    };

    private onUnmaximizeFromMainWindow = (): void => {
        this.browserWindow.webContents.send(IPC_FROMBROWSERWINDOW_UNMAXIMIZE_CHANNEL_NAME);
    };

    private onEnterFullScreenFromMainWindow = (): void => {
        this.browserWindow.webContents.send(IPC_FROMBROWSERWINDOW_ENTERFULLSCREEN_CHANNEL_NAME);
    };

    private onLeaveFullScreenFromMainWindow = (): void => {
        if (this.browserWindow.isMaximized()) {
            this.onMaximizeFromMainWindow();
        } else {
            this.onUnmaximizeFromMainWindow();
        }
    };

    private onWindowBoundsChanged = (): void => {
        const windowState: WindowState = this.browserWindow.isFullScreen()
            ? 'full-screen'
            : this.browserWindow.isMaximized()
            ? 'maximized'
            : 'normal';

        const payload: WindowBoundsChangedPayload = {
            windowState: windowState,
            windowBounds: this.browserWindow.getBounds(),
        };

        this.browserWindow.webContents.send(
            IPC_FROMBROWSERWINDOW_WINDOWBOUNDSCHANGED_CHANNEL_NAME,
            payload,
        );
    };
}
