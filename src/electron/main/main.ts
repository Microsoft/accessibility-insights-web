// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as path from 'path';
import { FileSystemConfiguration } from 'common/configuration/file-system-configuration';
import { UserConfigMessageCreator } from 'common/message-creators/user-config-message-creator';
import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { AutoUpdaterClient } from 'electron/auto-update/auto-updater-client';
import { getElectronIconPath } from 'electron/common/get-electron-icon-path';
import { IPC_FROMRENDERER_MAIN_WINDOW_INITIALIZED_CHANNEL_NAME } from 'electron/ipc/ipc-channel-names';
import { IpcMessageDispatcher, IpcMessageSink } from 'electron/ipc/ipc-message-dispatcher';
import { MainWindowRendererMessageHandlers } from 'electron/main/main-window-renderer-message-handlers';
import { OSType, PlatformInfo } from 'electron/window-management/platform-info';
import { mainWindowConfig } from './main-window-config';
import { NativeHighContrastModeListener } from './native-high-contrast-mode-listener';

let mainWindow: BrowserWindow;
let mainWindowRendererMessageHandlers: MainWindowRendererMessageHandlers;
const platformInfo = new PlatformInfo(process);
const os = platformInfo.getOs();
const config = new FileSystemConfiguration();

const ipcMessageDispatcher = new IpcMessageDispatcher();
const userConfigMessageCreator = new UserConfigMessageCreator(ipcMessageDispatcher);
const nativeHighContrastModeListener = new NativeHighContrastModeListener(
    nativeTheme,
    userConfigMessageCreator,
);

log.transports.file.level = 'info';
autoUpdater.logger = log;

if (platformInfo.isLinux()) {
    // Avoid a conflict between Parallels VM and Electron. See https://github.com/microsoft/accessibility-insights-web/issues/4140
    app.disableHardwareAcceleration();
}

let recurringUpdateCheck;
const electronAutoUpdateCheck = new AutoUpdaterClient(autoUpdater);

const createWindow = () => {
    mainWindow = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: true, contextIsolation: false },
        titleBarStyle: 'hidden',
        width: mainWindowConfig.defaultWidth,
        height: mainWindowConfig.defaultHeight,
        frame: os === OSType.Mac,
        minHeight: mainWindowConfig.minHeight,
        minWidth: mainWindowConfig.minWidth,
        icon: getElectronIconPath(config, os),
    });
    if (platformInfo.isMac()) {
        // We need this so that if there are any system dialog, they will not be placed on top of the title bar.
        mainWindow.setSheetOffset(22);
    }

    const mainWindowMessageSink: IpcMessageSink = (id, msg) => mainWindow.webContents.send(id, msg);

    ipcMain.on(IPC_FROMRENDERER_MAIN_WINDOW_INITIALIZED_CHANNEL_NAME, () => {
        ipcMessageDispatcher.registerMessageSink(mainWindowMessageSink);
        mainWindowRendererMessageHandlers.startListening();
        nativeHighContrastModeListener.startListening();
    });

    mainWindowRendererMessageHandlers = new MainWindowRendererMessageHandlers(
        mainWindow,
        ipcMain,
        app,
        dialog,
    );

    mainWindow
        .loadFile(path.resolve(__dirname, '../electron/views/index.html'))
        .then(() => console.log('url loaded'))
        .catch(console.log);

    mainWindow.on('ready-to-show', () => {
        mainWindow.setMenu(null);
        mainWindow.show();
        enableDevMode(mainWindow);
    });

    mainWindow.on('closed', () => {
        // Drop all references to the window object, to force garbage collection
        ipcMessageDispatcher.unregisterMessageSink(mainWindowMessageSink);
        mainWindow = null!;
    });

    electronAutoUpdateCheck
        .check()
        .then(() => {
            console.log('checked for updates');
            setupRecurringUpdateCheck();
        })
        .catch(console.log);
};
const enableDevMode = (window: BrowserWindow) => {
    if (process.env.DEV_MODE === 'true') {
        const devTools = new BrowserWindow();
        window.webContents.setDevToolsWebContents(devTools.webContents);
        window.webContents.openDevTools({
            mode: 'detach',
        });
    }
};

const setupRecurringUpdateCheck = () => {
    recurringUpdateCheck = setInterval(async () => {
        await electronAutoUpdateCheck.check();
    }, 60 * 60 * 1000);
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    nativeHighContrastModeListener.stopListening();
    mainWindowRendererMessageHandlers.stopListening();
    clearInterval(recurringUpdateCheck);
    app.quit();
});
