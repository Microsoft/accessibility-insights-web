// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Page } from 'playwright';
import { ScreenshotViewSelectors } from 'tests/electron/common/element-identifiers/screenshot-view-selectors';
import { AutomatedChecksViewSelectors } from '../element-identifiers/automated-checks-view-selectors';
import { ViewController } from './view-controller';

export class CardsViewController extends ViewController {
    constructor(client: Page) {
        super(client);
    }

    public async waitForRuleGroupCount(count: number): Promise<void> {
        await this.waitForNumberOfSelectorMatches(AutomatedChecksViewSelectors.ruleGroup, count);
    }

    public async waitForHighlightBoxCount(count: number): Promise<void> {
        await this.waitForNumberOfSelectorMatches(ScreenshotViewSelectors.highlightBox, count);
    }

    public async queryRuleGroupContents(): Promise<any[]> {
        return this.client.$$(AutomatedChecksViewSelectors.ruleContent);
    }

    public async toggleRuleGroupAtPosition(position: number): Promise<void> {
        const selector = AutomatedChecksViewSelectors.nthRuleGroupCollapseExpandButton(position);
        await this.client.click(selector);
    }

    public async assertExpandedRuleGroup(
        position: number,
        expectedTitle: string,
        expectedFailures: number,
    ): Promise<void> {
        const title = await this.client.innerText(
            AutomatedChecksViewSelectors.nthRuleGroupTitle(position),
        );

        expect(title).toEqual(expectedTitle);

        const failures = await this.client.$$(
            AutomatedChecksViewSelectors.nthRuleGroupInstances(position),
        );

        expect(failures).toHaveLength(expectedFailures);
    }

    public async assertCollapsedRuleGroup(position: number, expectedTitle: string): Promise<void> {
        const title = await this.client.innerText(
            AutomatedChecksViewSelectors.nthRuleGroupTitle(position),
        );

        expect(title).toEqual(expectedTitle);

        const failures = await this.client.$$(
            AutomatedChecksViewSelectors.nthRuleGroupInstances(position),
        );

        expect(failures).toHaveLength(0);
    }
}
