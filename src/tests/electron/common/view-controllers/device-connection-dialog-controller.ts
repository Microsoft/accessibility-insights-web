// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Page } from 'playwright';
import { CommonSelectors } from '../element-identifiers/common-selectors';
import { ViewController } from './view-controller';

export class DeviceConnectionDialogController extends ViewController {
    constructor(client: Page) {
        super(client);
    }

    public async waitForDialogVisible(): Promise<void> {
        await this.waitForSelector(CommonSelectors.rootContainer);
    }
}
