// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BrowserAdapter } from '../common/browser-adapters/browser-adapter';
import { ChromeAdapter } from '../common/browser-adapters/chrome-adapter';

export interface DevToolsChromeAdapter extends BrowserAdapter {
    getInspectedWindowTabId(): number;
}

export class DevToolsChromeAdapterImpl extends ChromeAdapter implements DevToolsChromeAdapter {
    public getInspectedWindowTabId(): number {
        return chrome.devtools.inspectedWindow.tabId;
    }
}
