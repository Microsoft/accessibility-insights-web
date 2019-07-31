// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ElementHandle } from 'puppeteer';
import * as Puppeteer from 'puppeteer';
import { TargetPageInjectedComponentSelectors } from '../element-identifiers/target-page-selectors';
import { formatChildElementForSnapshot } from '../element-snapshot-formatter';
import { getTestResourceUrl } from '../test-resources';
import { Page, PageOptions } from './page';

export const DEFAULT_TARGET_PAGE_URL = getTestResourceUrl('all.html');

export type TargetPageUrlOptions = {
    absoluteUrl?: string;
    testResourcePath?: string;
};

export function targetPageUrl(options?: TargetPageUrlOptions): string {
    if (options != null && options.absoluteUrl != null) {
        return options.absoluteUrl;
    }

    if (options != null && options.testResourcePath != null) {
        return getTestResourceUrl(options.testResourcePath);
    }

    return DEFAULT_TARGET_PAGE_URL;
}

export class TargetPage extends Page {
    constructor(underlyingPage: Puppeteer.Page, public readonly tabId: number, options?: PageOptions) {
        super(underlyingPage, options);
    }

    public async getShadowRoot(): Promise<ElementHandle<Element>> {
        return await this.getShadowRootOfSelector('#insights-shadow-host');
    }

    public async getShadowRootHtmlSnapshot(): Promise<Node> {
        const shadowRoot = await this.getShadowRoot();
        return await formatChildElementForSnapshot(shadowRoot, '#insights-shadow-container');
    }

    public async waitForVisualizationBoxesToDisappear(): Promise<void> {
        if (document.querySelector(TargetPageInjectedComponentSelectors.insightsRootContainer)) {
            const shadowRoot = await this.getShadowRoot();
            await this.waitForDescendentSelectorToDisappear(shadowRoot, TargetPageInjectedComponentSelectors.insightsVisualizationBox);
        }
    }
}
