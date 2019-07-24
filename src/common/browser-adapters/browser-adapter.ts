// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export interface BrowserAdapter {
    getAllWindows(getInfo: chrome.windows.GetInfo, callback: (chromeWindows: chrome.windows.Window[]) => void): void;
    getSelectedTabInWindow(windowId: number, callback: (activeTab: chrome.tabs.Tab) => void): void;
    addListenerToTabsOnActivated(callback: (activeInfo: chrome.tabs.TabActiveInfo) => void): void;
    addListenerToTabsOnUpdated(callback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void): void;
    addListenerToTabsOnRemoved(callback: (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => void): void;
    addListenerToWebNavigationUpdated(callback: (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => void): void;
    addListenerOnWindowsFocusChanged(callback: (windowId: number) => void): void;
    tabsQuery(query: chrome.tabs.QueryInfo, callback: (result: chrome.tabs.Tab[]) => void): void;
    createTab(url: string, callback?: (tab: chrome.tabs.Tab) => void): void;
    createTabInNewWindow(url: string, callback?: (tab: chrome.tabs.Tab) => void): void;
    createInactiveTab(url: string, callback: (tab: chrome.tabs.Tab) => void): void;
    closeTab(tabId: number): void;
    switchToTab(tabId: number): void;
    getTab(tabId: number, onResolve: (tab: chrome.tabs.Tab) => void, onReject?: () => void): void;
    sendMessageToTab(tabId: number, message: any): void;
    sendMessageToFrames(message: any): void;
    sendMessageToAllFramesAndTabs(message: any): void;
    injectJs(tabId, file: string, callback: Function): void;
    injectCss(tabId, file: string, callback: Function): void;
    getRunTimeId(): string;
    createNotification(options: chrome.notifications.NotificationOptions): void;
    getRuntimeLastError(): chrome.runtime.LastError;
    isAllowedFileSchemeAccess(callback: Function): void;
    addListenerToLocalStorage(callback: (changes: object) => void): void;
    getManageExtensionUrl(): string;
    addListenerOnConnect(callback: (port: chrome.runtime.Port) => void): void;
    addListenerOnMessage(
        callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void,
    ): void;

    removeListenerOnMessage(
        callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void,
    ): void;
    connect(connectionInfo?: chrome.runtime.ConnectInfo): chrome.runtime.Port;
    getManifest(): chrome.runtime.Manifest;
    extensionVersion: string;

    getUrl(urlPart: string): string;
}
