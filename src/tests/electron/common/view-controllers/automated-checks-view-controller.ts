// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as WebDriverIO from 'webdriverio';
import { AutomatedChecksViewSelectors, ScreenshotViewSelectors } from '../element-identifiers/automated-checks-view-selectors';
import { ViewController } from './view-controller';

export class AutomatedChecksViewController extends ViewController {
    constructor(client: WebDriverIO.Client<void>) {
        super(client);
    }

    public async queryRuleGroups(): Promise<any[]> {
        return this.client.$$(AutomatedChecksViewSelectors.ruleGroup);
    }

    public async queryRuleGroupContents(): Promise<any[]> {
        return this.client.$$(AutomatedChecksViewSelectors.ruleContent);
    }

    public async toggleRuleGroupAtPosition(position: number): Promise<void> {
        await this.waitForSelectorVisible(AutomatedChecksViewSelectors.nthRuleGroupCollapseExpandButton(position));
        await this.client.click(AutomatedChecksViewSelectors.nthRuleGroupCollapseExpandButton(position));
    }

    public async waitForVisible(): Promise<void> {
        await this.waitForSelectorVisible(AutomatedChecksViewSelectors.mainContainer);
    }

    public async waitForScreenshotViewVisible(): Promise<void> {
        await this.waitForSelectorVisible(ScreenshotViewSelectors.screenshotView);
    }
}
