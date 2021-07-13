// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as path from 'path';
import {
    leftFooterButtonAutomationId,
    rightFooterButtonAutomationId,
} from 'electron/views/device-connect-view/components/automation-ids';
import { getAutomationIdSelector } from 'tests/common/get-automation-id-selector';
import { createApplication } from 'tests/electron/common/create-application';
import { scanForAccessibilityIssuesInAllModes } from 'tests/electron/common/scan-for-accessibility-issues';
import { AndroidSetupViewController } from 'tests/electron/common/view-controllers/android-setup-view-controller';
import { AppController } from 'tests/electron/common/view-controllers/app-controller';
import {
    commonAdbConfigs,
    setupMockAdb,
    simulateNoDevicesConnected,
} from '../../miscellaneous/mock-adb/setup-mock-adb';

const [closeId, nextId] = [leftFooterButtonAutomationId, rightFooterButtonAutomationId];

describe('Android setup - locate adb', () => {
    let app: AppController;
    let dialog: AndroidSetupViewController;

    beforeEach(async () => {
        app = await createApplication({
            suppressFirstTimeDialog: true,
            env: {
                ANDROID_HOME: `FAKE-TO-FORCE-PROMPT`,
            },
        });
        dialog = await app.openAndroidSetupView('prompt-locate-adb');
    });

    afterEach(async () => {
        if (app != null) {
            await app.stop();
        }
    });

    it('respects user-provided adb location, detect-adb passes a11y check', async () => {
        expect(await dialog.isEnabled(getAutomationIdSelector(closeId))).toBe(true);
        expect(await dialog.isEnabled(getAutomationIdSelector(nextId))).toBe(false);

        await setupMockAdb(
            simulateNoDevicesConnected(commonAdbConfigs['slow-single-device']),
            path.basename(__filename),
            'respects user-provided location',
        );
        await dialog.click('input[type="text"]');
        await dialog.client.keyboard.type(`${(global as any).rootDir}/drop/mock-adb`);

        expect(await dialog.isEnabled(getAutomationIdSelector(nextId))).toBe(true);
        await dialog.click(getAutomationIdSelector(nextId));
        await dialog.waitForDialogVisible('detect-adb');
        await scanForAccessibilityIssuesInAllModes(app);
        await dialog.waitForDialogVisible('prompt-connect-to-device');
    });

    it('should pass accessibility validation in all contrast modes', async () => {
        await scanForAccessibilityIssuesInAllModes(app);
    });
});
