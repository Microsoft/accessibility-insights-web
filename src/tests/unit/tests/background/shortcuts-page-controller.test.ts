// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ShortcutsPageController } from 'background/shortcuts-page-controller';
import { BrowserAdapter } from 'common/browser-adapters/browser-adapter';
import { IMock, Mock } from 'typemoq';
import { Tabs } from 'webextension-polyfill-ts';

describe('ShortcutsPageController', () => {
    let browserAdapterMock: IMock<BrowserAdapter>;
    let testSubject: ShortcutsPageController;

    beforeEach(() => {
        browserAdapterMock = Mock.ofType<BrowserAdapter>();

        testSubject = new ShortcutsPageController(browserAdapterMock.object);
    });

    it('opens the shortcuts tab', async () => {
        browserAdapterMock
            .setup(adapter => adapter.createActiveTab(ShortcutsPageController.configureCommandTabUrl))
            .returns(() => Promise.resolve({} as Tabs.Tab));

        await expect(testSubject.openShortcutsTab()).resolves.toBe(undefined);
    });

    it('surface error', async () => {
        const errorMessage = 'dummy error';

        browserAdapterMock
            .setup(adapter => adapter.createActiveTab(ShortcutsPageController.configureCommandTabUrl))
            .returns(() => Promise.reject(errorMessage));

        await expect(testSubject.openShortcutsTab()).rejects.toEqual(errorMessage);
    });
});
