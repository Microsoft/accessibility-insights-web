// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { LeftNavItemKey } from 'electron/types/left-nav-item-key';
import { Page } from 'playwright';
import { ResultsViewSelectors } from 'tests/electron/common/element-identifiers/results-view-selectors';
import { ScreenshotViewSelectors } from 'tests/electron/common/element-identifiers/screenshot-view-selectors';
import { CardsViewController } from 'tests/electron/common/view-controllers/cards-view-controller';
import { settingsPanelSelectors } from 'tests/end-to-end/common/element-identifiers/details-view-selectors';
import { ViewController } from './view-controller';

export class ResultsViewController extends ViewController {
    constructor(client: Page) {
        super(client);
    }

    public async waitForViewVisible(): Promise<void> {
        await this.waitForSelector(ResultsViewSelectors.mainContainer);
    }

    public async waitForScreenshotViewVisible(): Promise<void> {
        await this.waitForSelector(ScreenshotViewSelectors.screenshotView);
    }

    public async openSettingsPanel(): Promise<void> {
        await this.click(ResultsViewSelectors.settingsButton);
        await this.waitForSelector(settingsPanelSelectors.settingsPanel);
        await this.waitForMilliseconds(750); // Allow for fabric's panel animation to settle
    }

    public async clickLeftNavItem(key: LeftNavItemKey): Promise<void> {
        const selector = this.getSelectorForLeftNavItemLink(key);
        await this.click(selector);
    }

    private getSelectorForLeftNavItemLink(key: LeftNavItemKey): string {
        return `${ResultsViewSelectors.leftNav} a[data-automation-id="${key}"]`;
    }

    public createCardsViewController(): CardsViewController {
        return new CardsViewController(this.client);
    }

    public async setToggleState(toggleSelector: string, newState: boolean): Promise<void> {
        await this.waitForSelector(toggleSelector);
        const oldState = await this.client.getAttribute(toggleSelector, 'aria-checked');

        const oldStateBool = oldState.toLowerCase() === 'true';
        if (oldStateBool !== newState) {
            await this.click(toggleSelector);
            await this.expectToggleState(toggleSelector, newState);
        }
    }

    public async expectToggleState(toggleSelector: string, expectedState: boolean): Promise<void> {
        const toggleInStateSelector = expectedState
            ? settingsPanelSelectors.enabledToggle(toggleSelector)
            : settingsPanelSelectors.disabledToggle(toggleSelector);

        await this.waitForSelector(toggleInStateSelector);
    }

    public async clickStartOver(): Promise<void> {
        return await this.click(ResultsViewSelectors.startOverButton);
    }
}
