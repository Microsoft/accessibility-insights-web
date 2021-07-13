// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AndroidSetupStepId } from 'electron/platform/android/setup/android-setup-step-id';
import { ElectronApplication, Page } from 'playwright';
import { AndroidSetupViewController } from 'tests/electron/common/view-controllers/android-setup-view-controller';
import { DeviceConnectionDialogController } from 'tests/electron/common/view-controllers/device-connection-dialog-controller';
import { ResultsViewController } from 'tests/electron/common/view-controllers/results-view-controller';
import { DEFAULT_WAIT_FOR_ELEMENT_TO_BE_VISIBLE_TIMEOUT_MS } from 'tests/electron/setup/timeouts';

declare let window: Window & {
    featureFlagsController;
    insightsUserConfiguration;
};
export class AppController {
    public client: Page;

    constructor(public app: ElectronApplication) {}

    public initialize = async () => {
        this.client = await this.app.firstWindow();
        await this.client.reload();
    };

    public async stop(): Promise<void> {
        if (this.app && !this.client.isClosed()) {
            await this.app.close();
        }
    }

    public async waitForTitle(expectedTitle: string): Promise<void> {
        const timeout = DEFAULT_WAIT_FOR_ELEMENT_TO_BE_VISIBLE_TIMEOUT_MS;
        const title = await this.client.title();
        await this.client.waitForFunction(
            ({ expectedTitle, title }) => {
                return title === expectedTitle;
            },
            { expectedTitle, title },
            {
                timeout,
            },
        );
    }

    public async openDeviceConnectionDialog(): Promise<DeviceConnectionDialogController> {
        const deviceConnectionDialog = new DeviceConnectionDialogController(this.client);
        await deviceConnectionDialog.waitForDialogVisible();

        return deviceConnectionDialog;
    }

    public async openAndroidSetupView(
        step: AndroidSetupStepId,
    ): Promise<AndroidSetupViewController> {
        const androidSetupController = new AndroidSetupViewController(this.client);
        await androidSetupController.waitForDialogVisible(step);
        return androidSetupController;
    }

    public async openResultsView(): Promise<ResultsViewController> {
        const androidSetupViewController = await this.openAndroidSetupView(
            'prompt-connected-start-testing',
        );
        await androidSetupViewController.startTesting();

        return this.waitForResultsView();
    }

    public async waitForResultsView(): Promise<ResultsViewController> {
        const resultsView = new ResultsViewController(this.client);
        await resultsView.waitForViewVisible();

        return resultsView;
    }

    public async waitForHighContrastMode(expectedHighContrastMode: boolean): Promise<void> {
        await this.waitForWindowPropertyInitialized('insightsUserConfiguration');
        await this.client.evaluate(
            `window.insightsUserConfiguration.setHighContrastMode(${expectedHighContrastMode})`,
        );
    }

    public async setHighContrastMode(enableHighContrast: boolean): Promise<void> {
        await this.waitForWindowPropertyInitialized('insightsUserConfiguration');

        await this.client.evaluate(
            `window.insightsUserConfiguration.setHighContrastMode(${enableHighContrast})`,
        );
    }

    public async setTelemetryState(enableTelemetry: boolean): Promise<void> {
        await this.waitForWindowPropertyInitialized('insightsUserConfiguration');

        await this.client.evaluate(
            `window.insightsUserConfiguration.setTelemetryState(${enableTelemetry})`,
        );
    }

    public async setFeatureFlag(flag: string, enabled: boolean): Promise<void> {
        await this.waitForWindowPropertyInitialized('featureFlagsController');
        const action = enabled ? 'enable' : 'disable';
        await this.client.evaluate(`window.featureFlagsController.${action}Feature('${flag}')`);
    }

    private async waitForWindowPropertyInitialized(
        propertyName: 'insightsUserConfiguration' | 'featureFlagsController',
    ): Promise<void> {
        await this.client.waitForFunction(
            prop => {
                const initialized = (window as any)[prop] != null;
                return initialized;
            },
            propertyName,
            { timeout: 6000, polling: 50 },
        );
    }
}
