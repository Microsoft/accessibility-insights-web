// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Puppeteer from 'puppeteer';
import { DEFAULT_TARGET_PAGE_SCAN_TIMEOUT_MS } from 'tests/end-to-end/common/timeouts';
import { CommonSelectors } from '../element-identifiers/common-selectors';
import {
    detailsViewSelectors,
    settingsPanelSelectors,
} from '../element-identifiers/details-view-selectors';
import { Page, PageOptions } from './page';

export class DetailsViewPage extends Page {
    constructor(underlyingPage: Puppeteer.Page, options?: PageOptions) {
        super(underlyingPage, options);
    }

    public async ensureNoModals(): Promise<void> {
        await this.waitForSelectorToDisappear(CommonSelectors.anyModalDialog);
    }

    public async switchToFastPass(): Promise<void> {
        await this.ensureNoModals();

        await this.clickSelector('*[aria-label="select activity"]');
        await this.clickSelector('button[title="FastPass"]');
    }

    public async switchToAssessment(): Promise<void> {
        await this.ensureNoModals();

        await this.clickSelector('*[aria-label="select activity"]');
        await this.clickSelector('button[title="Assessment"]');
    }

    public async navigateToTest(testName: string): Promise<void> {
        await this.clickSelector(detailsViewSelectors.testNavLink(testName));
        await this.waitForSelectorXPath(`//h1[text()="${testName}"]`);
    }

    public async navigateToRequirement(requirementName: string): Promise<void> {
        await this.clickSelector(detailsViewSelectors.requirementNavLink(requirementName));
        await this.waitForSelectorXPath(`//h3[text()="${requirementName}"]`);
    }

    public async waitForRequirementStatus(
        requirementName: string,
        status: 'Passed' | 'Failed' | 'Incomplete',
    ): Promise<void> {
        await this.waitForSelector(
            detailsViewSelectors.requirementWithStatus(requirementName, status),
            { timeout: DEFAULT_TARGET_PAGE_SCAN_TIMEOUT_MS },
        );
    }

    public async openSettingsPanel(): Promise<void> {
        await this.ensureNoModals();

        await this.clickSelector(CommonSelectors.settingsGearButton);
        await this.clickSelector(detailsViewSelectors.settingsButton);
        await this.waitForSelector(settingsPanelSelectors.settingsPanel);
    }

    public async closeSettingsPanel(): Promise<void> {
        await this.waitForSelector(settingsPanelSelectors.settingsPanel);

        await this.clickSelector(settingsPanelSelectors.closeButton);
        await this.waitForSelectorToDisappear(settingsPanelSelectors.settingsPanel);
    }

    public async setToggleState(toggleSelector: string, newState: boolean): Promise<void> {
        const toggle = await this.waitForSelector(toggleSelector);
        const oldState = (await (await toggle.getProperty('checked')).jsonValue()) as boolean;
        if (oldState !== newState) {
            await this.clickSelector(toggleSelector);
            await this.expectToggleState(toggleSelector, newState);
        }
    }

    public async expectToggleState(toggleSelector: string, expectedState: boolean): Promise<void> {
        const toggleInStateSelector = expectedState
            ? settingsPanelSelectors.enabledToggle(toggleSelector)
            : settingsPanelSelectors.disabledToggle(toggleSelector);

        await this.waitForSelector(toggleInStateSelector);
    }
}

export function detailsViewRelativeUrl(targetTabId: number): string {
    return `DetailsView/detailsView.html?tabId=${targetTabId}`;
}
