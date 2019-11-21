// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { app, BrowserWindow } from 'electron';
import { OSType, PlatformInfo } from 'electron/window-management/platform-info';
import * as path from 'path';

let mainWindow: BrowserWindow;
const platformInfo = new PlatformInfo(process);
const createWindow = () => {
    const os = platformInfo.getOs();
    mainWindow = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: true },
        titleBarStyle: 'hidden',
        width: 600,
        height: 391,
        frame: os === OSType.Mac,
        minHeight: 300,
        minWidth: 400,
        icon: path.resolve(__dirname, '../icons/brand/blue/brand-blue-512px.png'),
    });
    if (platformInfo.isMac()) {
        // We need this so that if there are any system dialog, they will not be placed on top of the title bar.
        mainWindow.setSheetOffset(22);
    }

    mainWindow
        .loadFile(path.resolve(__dirname, '../electron/views/index.html'))
        .then(() => console.log('url loaded'))
        .catch(console.log);

    mainWindow.on('ready-to-show', () => {
        mainWindow.setMenu(null);
        mainWindow.show();
        enableDevMode(mainWindow);
    });
};

const enableDevMode = (window: BrowserWindow) => {
    if (process.env.DEV_MODE === 'true') {
        window.webContents.openDevTools({
            mode: 'detach',
        });
    }
};

app.on('ready', createWindow);
