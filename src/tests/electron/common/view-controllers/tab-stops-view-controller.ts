// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Page } from 'playwright';
import { TabStopsViewSelectors } from 'tests/electron/common/element-identifiers/tab-stops-view-selectors';
import { DEFAULT_WAIT_FOR_ELEMENT_TO_BE_VISIBLE_TIMEOUT_MS } from 'tests/electron/setup/timeouts';
import { ViewController } from './view-controller';

export class TabStopsViewController extends ViewController {
    constructor(client: Page) {
        super(client);
    }

    public async clickToggleTabStops(): Promise<void> {
        await this.client.click(TabStopsViewSelectors.tabStopsToggle, {
            timeout: DEFAULT_WAIT_FOR_ELEMENT_TO_BE_VISIBLE_TIMEOUT_MS,
        });
    }
}
