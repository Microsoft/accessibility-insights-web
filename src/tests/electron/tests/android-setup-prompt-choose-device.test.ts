// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as path from 'path';
import { deviceDescriptionAutomationId } from 'electron/views/device-connect-view/components/android-setup/device-description';
import {
    leftFooterButtonAutomationId,
    rescanAutomationId,
    rightFooterButtonAutomationId,
} from 'electron/views/device-connect-view/components/automation-ids';
import { getAutomationIdSelector } from 'tests/common/get-automation-id-selector';
import { createApplication } from 'tests/electron/common/create-application';
import { scanForAccessibilityIssuesInAllModes } from 'tests/electron/common/scan-for-accessibility-issues';
import { AndroidSetupViewController } from 'tests/electron/common/view-controllers/android-setup-view-controller';
import { AppController } from 'tests/electron/common/view-controllers/app-controller';
import {
    commonAdbConfigs,
    delayAllCommands,
    emulatorDeviceName,
    MockAdbConfig,
    physicalDeviceName1,
    setupMockAdb,
    simulateServiceNotInstalled,
} from '../../miscellaneous/mock-adb/setup-mock-adb';

const [closeId, nextId, rescanId] = [
    leftFooterButtonAutomationId,
    rightFooterButtonAutomationId,
    rescanAutomationId,
];

describe('Android setup - prompt-choose-device (multiple devices)', () => {
    const multipleDescription = 'prompt-choose-device-multiple';
    const defaultDeviceConfig: MockAdbConfig = commonAdbConfigs['multiple-devices'];

    let app: AppController;
    let dialog: AndroidSetupViewController;

    beforeEach(async () => {
        await setupMockAdb(
            defaultDeviceConfig,
            path.basename(__filename),
            multipleDescription,
            'beforeEach',
        );
        app = await createApplication({ suppressFirstTimeDialog: true });
        dialog = await app.openAndroidSetupView('prompt-choose-device');
    });

    afterEach(async () => {
        if (app != null) {
            await app.stop();
        }
    });

    it('initial component state is correct', async () => {
        expect(await dialog.isEnabled(getAutomationIdSelector(closeId))).toBe(true);
        expect(await dialog.isEnabled(getAutomationIdSelector(nextId))).toBe(true);
        expect(await dialog.isEnabled(getAutomationIdSelector(rescanId))).toBe(true);
        const devices = await dialog.client.$$(
            getAutomationIdSelector(deviceDescriptionAutomationId),
        );
        expect(devices.length).toBe(3);
    });

    it('selecting next goes to detect-service with default selection', async () => {
        await setupMockAdb(
            delayAllCommands(1000, simulateServiceNotInstalled(defaultDeviceConfig)),
            path.basename(__filename),
            multipleDescription,
            'next (default)',
        );
        await dialog.click(getAutomationIdSelector(nextId));
        await dialog.waitForDialogVisible('detect-service');
        await dialog.waitForDialogVisible('prompt-install-service');
        expect(
            await dialog.itemTextIncludesTarget(
                getAutomationIdSelector(deviceDescriptionAutomationId),
                emulatorDeviceName, // Emulators are listed first
            ),
        ).toBe(true);
    });

    it('selecting next goes to detect-service with non-default selection', async () => {
        await setupMockAdb(
            delayAllCommands(1000, simulateServiceNotInstalled(defaultDeviceConfig)),
            path.basename(__filename),
            multipleDescription,
            'next (non-default)',
        );

        // Select the second item in the list
        await dialog.click(getAutomationIdSelector(deviceDescriptionAutomationId));
        await dialog.client.keyboard.press('ArrowDown');
        await dialog.waitForMilliseconds(1000);
        await dialog.click(getAutomationIdSelector(nextId));
        await dialog.waitForDialogVisible('detect-service');
        await dialog.waitForDialogVisible('prompt-install-service');
        expect(
            await dialog.itemTextIncludesTarget(
                getAutomationIdSelector(deviceDescriptionAutomationId),
                physicalDeviceName1,
            ),
        ).toBe(true);
    });

    it('selecting rescan goes to detect-devices', async () => {
        await setupMockAdb(
            delayAllCommands(100, defaultDeviceConfig),
            path.basename(__filename),
            multipleDescription,
            'rescan',
        );
        await dialog.click(getAutomationIdSelector(rescanId));
        await dialog.waitForDialogVisible('detect-devices');
        await dialog.waitForDialogVisible('prompt-choose-device'); // Let mock-adb complete
    });

    it('should pass accessibility validation in all contrast modes', async () => {
        await scanForAccessibilityIssuesInAllModes(app);
    });
});

describe('Android setup - prompt-choose-device (single device)', () => {
    const singleDescription = 'prompt-choose-device-single';
    const defaultDeviceConfig: MockAdbConfig = commonAdbConfigs['single-device'];
    let app: AppController;
    let dialog: AndroidSetupViewController;

    beforeEach(async () => {
        // Getting here requires going past the dialog then pressing
        // the cancel button to circle back
        const cancelId = leftFooterButtonAutomationId;
        await setupMockAdb(
            simulateServiceNotInstalled(defaultDeviceConfig),
            path.basename(__filename),
            singleDescription,
            'beforeEach',
        );
        app = await createApplication({ suppressFirstTimeDialog: true });
        dialog = await app.openAndroidSetupView('prompt-install-service');
        await dialog.click(getAutomationIdSelector(cancelId));
        await dialog.waitForDialogVisible('prompt-choose-device');
    });

    afterEach(async () => {
        if (app != null) {
            await app.stop();
        }
    });

    it('initial component state is correct', async () => {
        expect(await dialog.isEnabled(getAutomationIdSelector(closeId))).toBe(true);
        expect(await dialog.isEnabled(getAutomationIdSelector(nextId))).toBe(true);
        expect(await dialog.isEnabled(getAutomationIdSelector(rescanId))).toBe(true);
        const devices = await dialog.client.$$(
            getAutomationIdSelector(deviceDescriptionAutomationId),
        );
        expect(devices.length).toBe(1);
    });
});
