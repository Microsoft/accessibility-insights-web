// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { MainWindowContext } from '../../../../injected/main-window-context';

describe('MainWindowContextTest', () => {
    const devToolStore: any = { name: 'devToolStore' };
    const userConfigStore: any = { name: 'userConfigStore' };
    const devToolActionMessageCreator: any = { name: 'devToolActionMessageCreator' };
    const targetPageActionMessageCreator: any = { name: 'targetPageActionMessageCreator' };
    const bugActionMessageCreator: any = { name: 'targetPageActionMessageCreator' };
    const environmentInfoProvider: any = { name: 'environmentInfoProvider' };
    const bugFilingServiceProvider: any = { name: 'bugFilingServiceProvider' };
    const userConfigMessageCreator: any = { name: 'userConfigMessageCreator' };

    test('save and retrieve from instance', () => {
        const testSubject = new MainWindowContext(
            devToolStore,
            userConfigStore,
            devToolActionMessageCreator,
            targetPageActionMessageCreator,
            bugActionMessageCreator,
            userConfigMessageCreator,
            environmentInfoProvider,
            bugFilingServiceProvider,
        );

        expect(testSubject.getDevToolStore()).toEqual(devToolStore);
        expect(testSubject.getUserConfigStore()).toEqual(userConfigStore);
        expect(testSubject.getDevToolActionMessageCreator()).toEqual(devToolActionMessageCreator);
        expect(testSubject.getTargetPageActionMessageCreator()).toEqual(targetPageActionMessageCreator);
    });

    test('save and retrieve from window', () => {
        MainWindowContext.initialize(
            devToolStore,
            userConfigStore,
            devToolActionMessageCreator,
            targetPageActionMessageCreator,
            bugActionMessageCreator,
            userConfigMessageCreator,
            environmentInfoProvider,
            bugFilingServiceProvider,
        );

        expect(MainWindowContext.getMainWindowContext().getDevToolStore()).toEqual(devToolStore);
        expect(MainWindowContext.getMainWindowContext().getUserConfigStore()).toEqual(userConfigStore);
        expect(MainWindowContext.getMainWindowContext().getDevToolActionMessageCreator()).toEqual(devToolActionMessageCreator);
        expect(MainWindowContext.getMainWindowContext().getTargetPageActionMessageCreator()).toEqual(targetPageActionMessageCreator);
        expect(MainWindowContext.getMainWindowContext().getUserConfigMessageCreator()).toEqual(userConfigMessageCreator);
        expect(MainWindowContext.getMainWindowContext().getEnvironmentInfoProvider()).toEqual(environmentInfoProvider);
        expect(MainWindowContext.getMainWindowContext().getBugFilingServiceProvider()).toEqual(bugFilingServiceProvider);
    });

    test('getIfNotGiven', () => {
        MainWindowContext.initialize(
            devToolStore,
            userConfigStore,
            devToolActionMessageCreator,
            targetPageActionMessageCreator,
            bugActionMessageCreator,
            userConfigMessageCreator,
            environmentInfoProvider,
            bugFilingServiceProvider,
        );

        const devToolStoreLocal: any = { name: 'devToolStoreLocal' };
        const userConfigStoreLocal: any = { name: 'userConfigStoreLocal' };
        const devToolActionMessageCreatorLocal: any = { name: 'devToolActionMessageCreatorLocal' };
        const environmentInfoProviderLocal: any = { name: 'environmentInfoProviderLocal' };
        const bugFilingServiceProviderLocal: any = { name: 'bugFilingServiceProviderLocal' };
        const userConfigMessageCreatorLocal: any = { name: 'userConfigMessageCreatorLocal' };

        const mainWindowContextLocal = new MainWindowContext(
            devToolStoreLocal,
            userConfigStoreLocal,
            devToolActionMessageCreatorLocal,
            targetPageActionMessageCreator,
            bugActionMessageCreator,
            userConfigMessageCreatorLocal,
            environmentInfoProviderLocal,
            bugFilingServiceProviderLocal,
        );

        const mainWindowContextGiven = MainWindowContext.getIfNotGiven(mainWindowContextLocal);
        expect(mainWindowContextGiven.getDevToolStore()).toEqual(devToolStoreLocal);
        expect(mainWindowContextGiven.getUserConfigStore()).toEqual(userConfigStoreLocal);
        expect(mainWindowContextGiven.getDevToolActionMessageCreator()).toEqual(devToolActionMessageCreatorLocal);
        expect(mainWindowContextGiven.getTargetPageActionMessageCreator()).toEqual(targetPageActionMessageCreator);
        expect(mainWindowContextGiven.getUserConfigMessageCreator()).toEqual(userConfigMessageCreatorLocal);
        expect(mainWindowContextGiven.getEnvironmentInfoProvider()).toEqual(environmentInfoProviderLocal);
        expect(mainWindowContextGiven.getBugFilingServiceProvider()).toEqual(bugFilingServiceProviderLocal);

        const mainWindowContextNotGiven = MainWindowContext.getIfNotGiven(null);
        expect(mainWindowContextNotGiven.getDevToolStore()).toEqual(devToolStore);
        expect(mainWindowContextNotGiven.getUserConfigStore()).toEqual(userConfigStore);
        expect(mainWindowContextNotGiven.getDevToolActionMessageCreator()).toEqual(devToolActionMessageCreator);
        expect(mainWindowContextNotGiven.getTargetPageActionMessageCreator()).toEqual(targetPageActionMessageCreator);
        expect(mainWindowContextNotGiven.getUserConfigMessageCreator()).toEqual(userConfigMessageCreator);
        expect(mainWindowContextNotGiven.getEnvironmentInfoProvider()).toEqual(environmentInfoProvider);
        expect(mainWindowContextNotGiven.getBugFilingServiceProvider()).toEqual(bugFilingServiceProvider);
    });
});
