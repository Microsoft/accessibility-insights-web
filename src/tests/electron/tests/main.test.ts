// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Application } from 'spectron';
import { createApplication } from 'tests/electron/common/create-application';
import { dismissTelemetryOptInDialog } from 'tests/electron/common/dismiss-telemetry-opt-in-dialog';
import * as WebdriverIO from 'webdriverio';

import { CommonSelectors } from '../common/element-identifiers/common-selectors';
import { DEFAULT_ELECTRON_TEST_TIMEOUT_MS } from '../setup/timeouts';

describe('Electron E2E', () => {
    let app: Application;

    beforeEach(async () => {
        app = await createApplication();
    });

    // spectron wraps calls to electron APIs as promises. Unfortunately, only electron typings are used,
    // so tslint thinks some of the methods do not return promises.
    // tslint:disable: await-promise

    async function ensureAppIsInDeviceConnectionDialog(): Promise<void> {
        const webDriverClient: WebdriverIO.Client<void> = app.client;
        await webDriverClient.waitForVisible(CommonSelectors.rootContainer, DEFAULT_ELECTRON_TEST_TIMEOUT_MS);
        expect(await app.webContents.getTitle()).toBe('Accessibility Insights for Mobile');
    }

    beforeEach(async () => {
        await dismissTelemetryOptInDialog(app);
    });

    afterEach(async () => {
        if (app && app.isRunning()) {
            await app.stop();
        }
    });

    test('test that app opened & set initial state', async () => {
        await ensureAppIsInDeviceConnectionDialog();

        const webDriverClient: WebdriverIO.Client<void> = app.client;
        expect(await webDriverClient.isEnabled(CommonSelectors.cancelButton)).toBe(true);
        expect(await webDriverClient.isEnabled(CommonSelectors.portNumber)).toBe(true);
        expect(await webDriverClient.isEnabled(CommonSelectors.startButton)).toBe(false);
        expect(await webDriverClient.isEnabled(CommonSelectors.validateButton)).toBe(false);
    });

    test('test that validate port remains disabled when we provide an invalid port number', async () => {
        await ensureAppIsInDeviceConnectionDialog();

        const webDriverClient: WebdriverIO.Client<void> = app.client;
        await webDriverClient.click(CommonSelectors.portNumber);
        await webDriverClient.element(CommonSelectors.portNumber).keys('abc');
        expect(await webDriverClient.isEnabled(CommonSelectors.validateButton)).toBe(false);
        expect(await webDriverClient.isEnabled(CommonSelectors.startButton)).toBe(false);
    });

    test('test that validate port enables when we provide a valid port number', async () => {
        await ensureAppIsInDeviceConnectionDialog();

        const webDriverClient: WebdriverIO.Client<void> = app.client;
        await webDriverClient.click(CommonSelectors.portNumber);
        await webDriverClient.element(CommonSelectors.portNumber).keys('999');
        expect(await webDriverClient.isEnabled(CommonSelectors.validateButton)).toBe(true);
        expect(await webDriverClient.isEnabled(CommonSelectors.startButton)).toBe(false);
    });
});
