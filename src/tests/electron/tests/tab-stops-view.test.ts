// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as path from 'path';
import { getNarrowModeThresholdsForUnified } from 'electron/common/narrow-mode-thresholds';
import { UnifiedFeatureFlags } from 'electron/common/unified-feature-flags';
import { KeyEventCode } from 'electron/platform/android/adb-wrapper';
import { createApplication } from 'tests/electron/common/create-application';
import { ResultsViewSelectors } from 'tests/electron/common/element-identifiers/results-view-selectors';
import { scanForAccessibilityIssuesInAllModes } from 'tests/electron/common/scan-for-accessibility-issues';
import { AppController } from 'tests/electron/common/view-controllers/app-controller';
import { LogController } from 'tests/electron/common/view-controllers/log-controller';
import { ResultsViewController } from 'tests/electron/common/view-controllers/results-view-controller';
import { TabStopsViewController } from 'tests/electron/common/view-controllers/tab-stops-view-controller';
import { VirtualKeyboardViewController } from 'tests/electron/common/view-controllers/virtual-keyboard-view-controller';
import {
    commonAdbConfigs,
    mockAdbFolder,
    setupMockAdb,
} from 'tests/miscellaneous/mock-adb/setup-mock-adb';

describe('TabStopsView', () => {
    let app: AppController;
    let resultsViewController: ResultsViewController;
    let virtualKeyboardViewController: VirtualKeyboardViewController;
    let logController: LogController;
    let tabStopsViewController: TabStopsViewController;
    const mockAdbLogsBase = path.basename(__filename);
    const mockAdbLogsFolder = 'tabStopsLogs';
    const width = getNarrowModeThresholdsForUnified().collapseHeaderAndNavThreshold + 5;
    const height = 1000;
    const logsContext = path.join(mockAdbLogsBase, mockAdbLogsFolder);

    beforeEach(async () => {
        await setupMockAdb(commonAdbConfigs['single-device'], mockAdbLogsBase, mockAdbLogsFolder);

        app = await createApplication({ suppressFirstTimeDialog: true });
        app.setFeatureFlag(UnifiedFeatureFlags.tabStops, true);
        app.client.setViewportSize({ width, height });
        logController = new LogController(logsContext, mockAdbFolder);
        tabStopsViewController = new TabStopsViewController(app.client);
        virtualKeyboardViewController = new VirtualKeyboardViewController(app.client);
        resultsViewController = await app.openResultsView();
        await resultsViewController.clickLeftNavItem('tab-stops');
    });

    afterEach(async () => {
        if (app != null && !app.client.isClosed()) {
            await app.stop();
        }
    });

    it('should use the expected window title', async () => {
        await app.waitForTitle('Accessibility Insights for Android - Tab stops');
    });

    it.each([
        KeyEventCode.Up,
        KeyEventCode.Down,
        KeyEventCode.Left,
        KeyEventCode.Right,
        KeyEventCode.Tab,
        KeyEventCode.Enter,
    ])('virtual keyboard sends keyevent %s', async (keyCode: KeyEventCode) => {
        logController.resetAdbLog();

        await virtualKeyboardViewController.clickVirtualKey(keyCode);
        await logController.waitForAdbLogToContain(keyCode.toString());

        const adbLog = await logController.getAdbLog();
        expect(adbLog).toMatchSnapshot();
    });

    it('toggling show tab stops sends corresponding service commands', async () => {
        logController.resetServerLog();

        await tabStopsViewController.clickToggleTabStops();
        await tabStopsViewController.clickToggleTabStops();
        await logController.waitForServerLogToContain('Disable');

        const serverLog = await logController.getServerLog();
        expect(serverLog).toMatchSnapshot();
    });

    it('clicking start over sends corresponding service command', async () => {
        logController.resetServerLog();

        await resultsViewController.clickStartOver();
        await logController.waitForServerLogToContain('Reset');

        const serverLog = await logController.getServerLog();
        expect(serverLog).toMatchSnapshot();
    });

    it('leaving tab stops sends reset service command', async () => {
        logController.resetServerLog();

        await resultsViewController.clickLeftNavItem('automated-checks');
        await logController.waitForServerLogToContain('Reset');

        const serverLog = await logController.getServerLog();
        expect(serverLog).toMatchSnapshot();
    });

    it('exiting while tab stops are active sends reset service command', async () => {
        logController.resetServerLog();
        await tabStopsViewController.clickToggleTabStops();
        await logController.waitForServerLogToContain('Enable');
        logController.resetServerLog();

        if (app != null) {
            await app.stop();
        }

        await logController.waitForServerLogToContain('Reset');
        const serverLog = await logController.getServerLog();
        expect(serverLog).toMatchSnapshot();
    });

    it('should pass accessibility validation in all contrast modes', async () => {
        await scanForAccessibilityIssuesInAllModes(app);
    });

    it('export report button does not exist', async () => {
        await resultsViewController.waitForSelectorToDisappear(
            ResultsViewSelectors.exportReportButton,
        );
    });
});
