// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as fs from 'fs';
import { Page } from 'playwright';
import { DEFAULT_WAIT_FOR_ELEMENT_TO_BE_VISIBLE_TIMEOUT_MS } from 'tests/electron/setup/timeouts';
import { DEFAULT_PAGE_ELEMENT_WAIT_TIMEOUT_MS } from 'tests/end-to-end/common/timeouts';
import { screenshotOnError } from '../../../end-to-end/common/screenshot-on-error';

export abstract class ViewController {
    constructor(public client: Page) {}

    public async waitForSelector(
        selector: string,
        timeout: number = DEFAULT_WAIT_FOR_ELEMENT_TO_BE_VISIBLE_TIMEOUT_MS,
    ): Promise<void> {
        await this.screenshotOnError(
            async () => await this.client.waitForSelector(selector, { state: 'attached', timeout }),
        );
    }

    public async waitForEnabled(
        selector: string,
        timeout: number = DEFAULT_PAGE_ELEMENT_WAIT_TIMEOUT_MS,
    ) {
        await this.screenshotOnError(
            async () => await this.client.isEnabled(selector, { timeout }),
        );
    }

    public async waitForNumberOfSelectorMatches(
        selector: string,
        expectedNumber: number,
        timeout: number = DEFAULT_WAIT_FOR_ELEMENT_TO_BE_VISIBLE_TIMEOUT_MS,
    ): Promise<void> {
        await this.screenshotOnError(async () => {
            await this.client.waitForSelector(`:nth-match(${selector}, ${expectedNumber})`, {
                timeout,
            });
        });
    }

    public async waitForSelectorToDisappear(
        selector: string,
        timeout: number = DEFAULT_WAIT_FOR_ELEMENT_TO_BE_VISIBLE_TIMEOUT_MS * 2,
    ): Promise<void> {
        await this.screenshotOnError(
            async () =>
                await this.client.waitForSelector(selector, {
                    timeout,
                    state: 'detached',
                }),
        );
    }

    // You should avoid using this in most cases!
    //
    // This should only be used for cases where the product's intended functionality involves a
    // time-based delay (eg, a UI element animates in before becoming active), NOT sprinkled in
    // randomly in the hopes that it improves reliability.
    public async waitForMilliseconds(durationInMilliseconds: number): Promise<void> {
        await this.client.waitForTimeout(durationInMilliseconds);
    }

    public async click(selector: string): Promise<void> {
        await this.screenshotOnError(async () => await this.client.click(selector));
    }

    public async isEnabled(selector: string): Promise<boolean> {
        return await this.screenshotOnError(async () => await this.client.isEnabled(selector));
    }

    public async itemTextIncludesTarget(selector: string, target: string): Promise<boolean> {
        return await this.screenshotOnError(async () => {
            const itemText: string = await this.client.innerText(selector);
            return itemText.includes(target);
        });
    }

    private async screenshotOnError<T>(wrappedFunction: () => Promise<T>): Promise<T> {
        return await screenshotOnError(
            path => this.client.screenshot().then(buffer => fs.writeFileSync(path, buffer)),
            wrappedFunction,
        );
    }
}
