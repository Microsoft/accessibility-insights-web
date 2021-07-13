// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { KeyEventCode } from 'electron/platform/android/adb-wrapper';
import { buildKeyboardButtonAutomationId } from 'electron/views/tab-stops/virtual-keyboard-buttons';
import { Page } from 'playwright';
import { getAutomationIdSelector } from 'tests/common/get-automation-id-selector';
import { ViewController } from './view-controller';

export class VirtualKeyboardViewController extends ViewController {
    constructor(client: Page) {
        super(client);
    }

    public async clickVirtualKey(virtualKey: KeyEventCode): Promise<void> {
        const automationId = buildKeyboardButtonAutomationId(KeyEventCode[virtualKey]);
        const selector = getAutomationIdSelector(automationId);

        await this.client.click(selector);
    }
}
