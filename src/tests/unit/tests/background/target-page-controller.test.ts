// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DetailsViewController } from 'background/details-view-controller';
import { Interpreter } from 'background/interpreter';
import { FeatureFlagStore } from 'background/stores/global/feature-flag-store';
import { TabToContextMap } from 'background/tab-context';
import { TabContextBroadcaster } from 'background/tab-context-broadcaster';
import { TabContextFactory } from 'background/tab-context-factory';
import { TargetPageController } from 'background/target-page-controller';
import { TelemetryEventHandler } from 'background/telemetry/telemetry-event-handler';
import { BrowserAdapter } from 'common/browser-adapters/browser-adapter';
import { Logger } from 'common/logging/logger';
import { Message } from 'common/message';
import { Messages } from 'common/messages';
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';
import { DictionaryStringTo } from 'types/common-types';

describe('TargetPageControllerTest', () => {
    let testSubject: TargetPageController;
    let mockBroadcasterStrictMock: IMock<TabContextBroadcaster>;
    let mockChromeAdapter: IMock<BrowserAdapter>;
    let mockDetailsViewController: IMock<DetailsViewController>;
    let tabInterpreterMap: TabToContextMap;
    let featureFlagStoreMock: IMock<FeatureFlagStore>;
    let telemetryEventHandlerMock: IMock<TelemetryEventHandler>;
    let tabContextFactoryMock: IMock<TabContextFactory>;
    let onDetailsViewTabRemoved: (tabId: number) => void;
    let loggerMock: IMock<Logger>;

    function setupCreateTabContextMock(broadCastDelegate: () => void, tabContext, tabId: number): void {
        tabContextFactoryMock
            .setup(factory =>
                factory.createTabContext(broadCastDelegate, mockChromeAdapter.object, mockDetailsViewController.object, tabId),
            )
            .returns(() => tabContext)
            .verifiable(Times.once());
    }

    function createTabControllerWithoutFeatureFlag(tabContextMap: TabToContextMap): TargetPageController {
        return new TargetPageController(
            tabContextMap,
            mockBroadcasterStrictMock.object,
            mockChromeAdapter.object,
            mockDetailsViewController.object,
            tabContextFactoryMock.object,
            loggerMock.object,
        );
    }

    beforeEach(() => {
        loggerMock = Mock.ofType<Logger>();
        mockBroadcasterStrictMock = Mock.ofType<TabContextBroadcaster>(undefined, MockBehavior.Strict);
        mockChromeAdapter = Mock.ofType<BrowserAdapter>();
        mockDetailsViewController = Mock.ofType<DetailsViewController>();
        featureFlagStoreMock = Mock.ofType(FeatureFlagStore);
        telemetryEventHandlerMock = Mock.ofType(TelemetryEventHandler);

        tabInterpreterMap = {};
        tabContextFactoryMock = Mock.ofType(TabContextFactory);
        mockDetailsViewController
            .setup(dvc => dvc.setupDetailsViewTabRemovedHandler(It.isAny()))
            .callback(cb => {
                onDetailsViewTabRemoved = cb;
            })
            .verifiable(Times.once());

        testSubject = new TargetPageController(
            tabInterpreterMap,
            mockBroadcasterStrictMock.object,
            mockChromeAdapter.object,
            mockDetailsViewController.object,
            tabContextFactoryMock.object,
            loggerMock.object,
        );

        mockChromeAdapter.reset();
    });

    afterEach(() => {
        mockDetailsViewController.verifyAll();
        mockChromeAdapter.reset();
        mockDetailsViewController.reset();
        featureFlagStoreMock.reset();
        telemetryEventHandlerMock.reset();
    });

    test('initialize', () => {
        mockChromeAdapter.setup(mca => mca.tabsQuery(It.isValue({}), It.isAny())).verifiable(Times.once());
        mockChromeAdapter.setup(mca => mca.addListenerOnConnect(It.isAny())).verifiable(Times.once());
        mockChromeAdapter.setup(mca => mca.addListenerToWebNavigationUpdated(It.isAny())).verifiable(Times.once());
        mockChromeAdapter.setup(mca => mca.addListenerToTabsOnRemoved(It.isAny())).verifiable(Times.once());
        mockChromeAdapter.setup(mca => mca.addListenerToTabsOnUpdated(It.isAny())).verifiable(Times.once());

        testSubject.initialize();

        mockChromeAdapter.verifyAll();
    });

    test('register onConnect listener', () => {
        mockChromeAdapter
            .setup(mca => mca.addListenerOnConnect(It.isAny()))
            .callback(cb => {})
            .verifiable(Times.once());

        testSubject.initialize();
        mockChromeAdapter.verifyAll();
    });

    test('onTabLoad: for main frame', () => {
        let getTabCallback: (tab: chrome.tabs.Tab) => void;
        let rejectCallback: () => void;
        const tabId = 1;
        const getTabCallbackInput = {
            data: 'abc',
        };
        const interpretInput: Message = {
            messageType: Messages.Tab.NewTabCreated,
            payload: getTabCallbackInput,
            tabId: tabId,
        };

        const broadcastDelegate = () => {};
        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());

        const tabContextMock = {
            interpreter: interpreterMock.object,
        };

        mockBroadcasterStrictMock
            .setup(md => md.getBroadcastMessageDelegate(tabId))
            .returns(() => broadcastDelegate)
            .verifiable(Times.once());

        let tabUpdatedCallback: (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => void = null;

        mockChromeAdapter
            .setup(ca => ca.addListenerToWebNavigationUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(mca => mca.getTab(It.isValue(tabId), It.isAny(), It.isAny()))
            .returns((id, resolve, reject) => {
                getTabCallback = resolve;
                rejectCallback = reject;
            })
            .verifiable(Times.once());
        loggerMock.setup(logger => logger.log(It.is(s => s.endsWith(`tab with Id ${tabId} not found`)))).verifiable(Times.once());

        setupCreateTabContextMock(broadcastDelegate, tabContextMock, tabId);

        testSubject.initialize();

        tabUpdatedCallback({ tabId: tabId, frameId: 0 } as chrome.webNavigation.WebNavigationFramedCallbackDetails);

        getTabCallback(getTabCallbackInput as any);
        rejectCallback();

        interpreterMock.verifyAll();
        mockBroadcasterStrictMock.verifyAll();
        mockChromeAdapter.verifyAll();
        tabContextFactoryMock.verifyAll();
        loggerMock.verifyAll();
        expect(tabInterpreterMap[tabId]).toBe(tabContextMock);
    });

    test('onTabLoad: for child frame', () => {
        let tabUpdatedCallback: (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => void = null;

        mockBroadcasterStrictMock.setup(mca => mca.getBroadcastMessageDelegate(It.isAny())).verifiable(Times.never());

        mockChromeAdapter
            .setup(mca => mca.addListenerOnWindowsFocusChanged(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            });

        tabContextFactoryMock
            .setup(factory => factory.createTabContext(It.isAny(), It.isAny(), It.isAny(), It.isAny()))
            .verifiable(Times.never());

        testSubject.initialize();

        tabUpdatedCallback({ tabId: 1, frameId: 2 } as chrome.webNavigation.WebNavigationFramedCallbackDetails);

        mockBroadcasterStrictMock.verifyAll();
        mockChromeAdapter.verifyAll();
    });

    test('onTabRemoved', () => {
        const tabId = 1;
        let tabUpdatedCallback: (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => void = null;
        let tabRemovedCallback: Function = null;
        const interpretInput: Message = {
            messageType: Messages.Tab.Remove,
            payload: null,
            tabId: tabId,
        };
        const broadcastMessageDelegateMock = Mock.ofInstance(() => {});

        mockBroadcasterStrictMock
            .setup(mca => mca.getBroadcastMessageDelegate(tabId))
            .returns(() => broadcastMessageDelegateMock.object)
            .verifiable(Times.once());

        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());

        const tabContextMock = {
            interpreter: interpreterMock.object,
        };

        mockChromeAdapter
            .setup(ca => ca.addListenerToWebNavigationUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());
        mockChromeAdapter
            .setup(ca => ca.addListenerToTabsOnRemoved(It.isAny()))
            .callback(cb => {
                tabRemovedCallback = cb;
            });

        setupCreateTabContextMock(broadcastMessageDelegateMock.object, tabContextMock, tabId);
        testSubject.initialize();

        tabUpdatedCallback({ tabId: tabId, frameId: 0 } as chrome.webNavigation.WebNavigationFramedCallbackDetails);
        tabRemovedCallback(tabId);

        interpreterMock.verifyAll();
        mockBroadcasterStrictMock.verifyAll();
        mockChromeAdapter.verifyAll();
        expect(tabInterpreterMap[tabId]).toBeUndefined();
    });

    test('onDetailsViewTabRemoved', () => {
        let tabUpdatedCallback: (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => void = null;
        const tabId = 2;
        const interpretInput: Message = {
            messageType: Messages.Visualizations.DetailsView.Close,
            payload: null,
            tabId: tabId,
        };
        const broadcastMessageDelegateMock = Mock.ofInstance(() => {});
        mockBroadcasterStrictMock
            .setup(mb => mb.getBroadcastMessageDelegate(tabId))
            .returns(() => broadcastMessageDelegateMock.object)
            .verifiable(Times.once());

        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());

        const tabContextMock = {
            interpreter: interpreterMock.object,
        };

        mockChromeAdapter
            .setup(ca => ca.addListenerToWebNavigationUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());

        setupCreateTabContextMock(broadcastMessageDelegateMock.object, tabContextMock, tabId);
        testSubject.initialize();

        tabUpdatedCallback({ tabId: tabId, frameId: 0 } as chrome.webNavigation.WebNavigationFramedCallbackDetails);
        onDetailsViewTabRemoved(tabId);

        interpreterMock.verifyAll();
        mockBroadcasterStrictMock.verifyAll();
        expect(tabInterpreterMap[tabId]).toBeDefined();
    });

    test('createTabContextAndTriggerTabUpdateForExistingTabs', () => {
        const openTabIds = [1, 5];
        const tabIdToTabContextStub = {};
        const interpreterMocks = [];
        const getTabCallbackMap: DictionaryStringTo<(tab: chrome.tabs.Tab) => void> = {};

        let tabsQueryCallback: (tabs: chrome.tabs.Tab[]) => void = null;
        const tabs: DictionaryStringTo<chrome.tabs.Tab> = {
            1: { id: openTabIds[0] } as chrome.tabs.Tab,
            5: { id: openTabIds[1] } as chrome.tabs.Tab,
        };

        openTabIds.forEach((tabId, index) => {
            const interpretInput: Message = {
                messageType: Messages.Tab.NewTabCreated,
                payload: tabs[tabId],
                tabId: tabId,
            };

            const interpreterMock = Mock.ofType(Interpreter);
            interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());

            const broadCastDelegate = () => {};
            mockBroadcasterStrictMock
                .setup(mb => mb.getBroadcastMessageDelegate(tabId))
                .returns(() => broadCastDelegate)
                .verifiable(Times.once());

            tabIdToTabContextStub[tabId] = {
                interpreter: interpreterMock.object,
            };

            setupCreateTabContextMock(broadCastDelegate, tabIdToTabContextStub[tabId], tabId);

            interpreterMocks.push(interpreterMock);
            mockChromeAdapter
                .setup(mca => mca.getTab(It.isValue(tabId), It.isAny(), It.isAny()))
                .returns((id, cb) => {
                    getTabCallbackMap[tabId] = cb;
                })
                .verifiable(Times.once());
        });

        mockChromeAdapter
            .setup(mca => mca.tabsQuery(It.isValue({}), It.isAny()))
            .callback((query, callback) => {
                tabsQueryCallback = callback;
            });

        testSubject.initialize();

        tabsQueryCallback(Object.keys(tabs).map(id => tabs[id]));

        openTabIds.forEach(tabId => {
            getTabCallbackMap[tabId](tabs[tabId]);
        });
        mockBroadcasterStrictMock.verifyAll();
        mockChromeAdapter.verifyAll();
        expect(Object.keys(tabInterpreterMap).length).toBe(openTabIds.length);
        openTabIds.forEach(tabId => {
            expect(tabInterpreterMap[tabId]).toEqual(tabIdToTabContextStub[tabId]);
        });
        interpreterMocks.forEach(interpreterMock => {
            interpreterMock.verifyAll();
        });
    });

    test('web navigation updated test', () => {
        let tabUpdatedCallback: (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => void = null;
        let getTabCallback: (tab: chrome.tabs.Tab) => void;
        let onReject;
        const tabId = 1;
        const getTabCallbackInput = {
            title: 'new title',
            url: 'new url',
            id: tabId,
        };

        const interpretInput: Message = {
            messageType: Messages.Tab.ExistingTabUpdated,
            payload: getTabCallbackInput,
            tabId: tabId,
        };
        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());
        tabInterpreterMap = {
            1: {
                interpreter: interpreterMock.object,
                stores: null,
            },
        };

        mockChromeAdapter
            .setup(ca => ca.addListenerToWebNavigationUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(mca => mca.getTab(It.isValue(tabId), It.isAny(), It.isAny()))
            .returns((id, cb, reject) => {
                getTabCallback = cb;
                onReject = reject;
            })
            .verifiable(Times.once());
        loggerMock.setup(logger => logger.log(It.is(s => s.endsWith(`tab with Id ${tabId} not found`)))).verifiable(Times.once());

        testSubject = createTabControllerWithoutFeatureFlag(tabInterpreterMap);
        testSubject.initialize();
        tabUpdatedCallback({ frameId: 0, tabId: tabId } as chrome.webNavigation.WebNavigationFramedCallbackDetails);
        getTabCallback(getTabCallbackInput as any);
        onReject();

        loggerMock.verifyAll();
        interpreterMock.verifyAll();
        mockChromeAdapter.verifyAll();
    });

    test('Windows Focus Change test', () => {
        const tabStub1 = {
            id: 1,
        };
        const tabStub2 = {
            id: 2,
        };
        const windowStub1 = {
            id: 1,
            state: 'normal',
        };
        const windowStub2 = {
            id: 2,
            state: 'minimized',
        };
        const windowsStub = [windowStub1, windowStub2];
        const getInfo: chrome.windows.GetInfo = {
            populate: false,
            windowTypes: ['normal', 'popup'],
        };
        const interpretInput1: Message = {
            messageType: Messages.Tab.VisibilityChange,
            payload: {
                hidden: false,
            },
            tabId: 1,
        };
        const interpretInput2: Message = {
            messageType: Messages.Tab.VisibilityChange,
            payload: {
                hidden: true,
            },
            tabId: 2,
        };

        mockChromeAdapter
            .setup(ca => ca.addListenerOnWindowsFocusChanged(It.isAny()))
            .callback(windowFocusChangedCallback => {
                windowFocusChangedCallback(-1);
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(ca => ca.getAllWindows(It.isValue(getInfo), It.isAny()))
            .callback((id, getAllWindowsCallback) => {
                getAllWindowsCallback(windowsStub as chrome.windows.Window[]);
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(ca => ca.tabsQuery({ windowId: windowStub1.id, active: true }, It.isAny()))
            .callback((id, getSelectedTabInWindowCallback) => {
                getSelectedTabInWindowCallback([tabStub1 as chrome.tabs.Tab]);
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(ca => ca.tabsQuery({ windowId: windowStub2.id, active: true }, It.isAny()))
            .callback((id, getSelectedTabInWindowCallback) => {
                getSelectedTabInWindowCallback([tabStub2 as chrome.tabs.Tab]);
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(ca => ca.getRuntimeLastError())
            .returns(() => null)
            .verifiable(Times.exactly(2));

        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput1))).verifiable(Times.once());

        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput2))).verifiable(Times.once());

        tabInterpreterMap = {
            1: {
                interpreter: interpreterMock.object,
                stores: null,
            },
            2: {
                interpreter: interpreterMock.object,
                stores: null,
            },
        };

        testSubject = createTabControllerWithoutFeatureFlag(tabInterpreterMap);
        testSubject.initialize();

        interpreterMock.verifyAll();
        mockChromeAdapter.verifyAll();
    });

    test('Windows Focus Change - do nothing for window closed', () => {
        const tabStub1 = {
            id: 1,
        };
        const tabStub2 = {
            id: 2,
        };
        const windowStub1 = {
            id: 1,
            state: 'normal',
        };
        const windowStub2 = {
            id: 2,
            state: 'minimized',
        };
        const windowsStub = [windowStub1, windowStub2];
        const getInfo: chrome.windows.GetInfo = {
            populate: false,
            windowTypes: ['normal', 'popup'],
        };
        const interpretInput1: Message = {
            messageType: Messages.Tab.VisibilityChange,
            payload: {
                hidden: false,
            },
            tabId: 1,
        };
        const interpretInput2: Message = {
            messageType: Messages.Tab.VisibilityChange,
            payload: {
                hidden: true,
            },
            tabId: 2,
        };

        mockChromeAdapter
            .setup(ca => ca.addListenerOnWindowsFocusChanged(It.isAny()))
            .callback(windowFocusChangedCallback => {
                windowFocusChangedCallback(-1);
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(ca => ca.getAllWindows(It.isValue(getInfo), It.isAny()))
            .callback((id, getAllWindowsCallback) => {
                getAllWindowsCallback(windowsStub as chrome.windows.Window[]);
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(ca => ca.tabsQuery({ windowId: windowStub1.id, active: true }, It.isAny()))
            .callback((id, getSelectedTabInWindowCallback) => {
                getSelectedTabInWindowCallback([tabStub1 as chrome.tabs.Tab]);
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(ca => ca.tabsQuery({ windowId: windowStub2.id, active: true }, It.isAny()))
            .callback((id, getSelectedTabInWindowCallback) => {
                getSelectedTabInWindowCallback([tabStub2 as chrome.tabs.Tab]);
            })
            .verifiable(Times.once());

        mockChromeAdapter.setup(ca => ca.getRuntimeLastError()).returns(() => new Error('window closed'));

        mockChromeAdapter.setup(ca => ca.getRuntimeLastError()).returns(() => null);

        const interpreterMock = Mock.ofType(Interpreter);

        // do nothing for closed window
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput1))).verifiable(Times.never());

        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput2))).verifiable(Times.once());

        tabInterpreterMap = {
            1: {
                interpreter: interpreterMock.object,
                stores: null,
            },
            2: {
                interpreter: interpreterMock.object,
                stores: null,
            },
        };

        testSubject = createTabControllerWithoutFeatureFlag(tabInterpreterMap);
        testSubject.initialize();

        interpreterMock.verifyAll();
        mockChromeAdapter.verifyAll();
    });

    test('Tab Focus Change test', () => {
        const activeInfo = {
            tabId: 1,
            windowId: 1,
        };
        const query = {
            windowId: activeInfo.windowId,
        };
        const tabStub1 = {
            id: 1,
            active: true,
        };
        const tabStub2 = {
            id: 2,
            active: false,
        };
        const tabs = [tabStub1, tabStub2];
        const interpretInput1: Message = {
            messageType: Messages.Tab.VisibilityChange,
            payload: {
                hidden: false,
            },
            tabId: 1,
        };
        const interpretInput2: Message = {
            messageType: Messages.Tab.VisibilityChange,
            payload: {
                hidden: true,
            },
            tabId: 2,
        };

        mockChromeAdapter
            .setup(ca => ca.addListenerToTabsOnActivated(It.isAny()))
            .callback(onTabActivatedCallback => {
                onTabActivatedCallback(activeInfo);
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(ca => ca.tabsQuery(It.isValue(query), It.isAny()))
            .callback((id, getAllTabsCallback) => {
                getAllTabsCallback(tabs as chrome.tabs.Tab[]);
            })
            .verifiable(Times.once());

        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput1))).verifiable(Times.once());

        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput2))).verifiable(Times.once());

        tabInterpreterMap = {
            1: {
                interpreter: interpreterMock.object,
                stores: null,
            },
            2: {
                interpreter: interpreterMock.object,
                stores: null,
            },
        };

        testSubject = createTabControllerWithoutFeatureFlag(tabInterpreterMap);
        testSubject.initialize();

        interpreterMock.verifyAll();
        mockChromeAdapter.verifyAll();
    });

    test('tab change test: url was changed', () => {
        let tabUpdatedCallback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => void = null;
        let getTabCallback: (tab: chrome.tabs.Tab) => void;
        const tabId = 1;
        const getTabCallbackInput = {
            title: 'new title',
            url: 'new url',
            id: tabId,
        };

        const interpretInput: Message = {
            messageType: Messages.Tab.ExistingTabUpdated,
            payload: getTabCallbackInput,
            tabId: tabId,
        };
        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());
        tabInterpreterMap = {
            1: {
                interpreter: interpreterMock.object,
                stores: null,
            },
        };

        mockChromeAdapter
            .setup(ca => ca.addListenerToTabsOnUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(mca => mca.getTab(It.isValue(tabId), It.isAny(), It.isAny()))
            .returns((id, cb) => {
                getTabCallback = cb;
            })
            .verifiable(Times.once());

        testSubject = createTabControllerWithoutFeatureFlag(tabInterpreterMap);
        testSubject.initialize();
        tabUpdatedCallback(tabId, { url: 'some url' });
        getTabCallback(getTabCallbackInput as any);

        interpreterMock.verifyAll();
        mockChromeAdapter.verifyAll();
    });

    test('tab change test: url was changed but tab was not found', () => {
        let tabUpdatedCallback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => void = null;
        let onReject;
        const tabId = 1;

        mockChromeAdapter
            .setup(ca => ca.addListenerToTabsOnUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());

        mockChromeAdapter
            .setup(mca => mca.getTab(It.isValue(tabId), It.isAny(), It.isAny()))
            .returns((id, cb, reject) => {
                onReject = reject;
            })
            .verifiable(Times.once());
        loggerMock.setup(logger => logger.log(It.is(s => s.endsWith(`tab with Id ${tabId} not found`)))).verifiable(Times.once());

        testSubject = createTabControllerWithoutFeatureFlag({ [tabId]: null });
        testSubject.initialize();
        tabUpdatedCallback(tabId, { url: 'some url' });
        onReject();

        loggerMock.verifyAll();
        mockChromeAdapter.verifyAll();
    });

    test('tab change test: url was not changed', () => {
        let tabUpdatedCallback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => void = null;
        const tabId = 1;
        const interpreterMock = Mock.ofType(Interpreter);

        interpreterMock.setup(im => im.interpret(It.isAny())).verifiable(Times.never());

        mockChromeAdapter
            .setup(ca => ca.addListenerToTabsOnUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());

        mockChromeAdapter.setup(mca => mca.getTab(It.isAny(), It.isAny(), It.isAny())).verifiable(Times.never());

        testSubject = createTabControllerWithoutFeatureFlag(tabInterpreterMap);
        testSubject.initialize();
        tabUpdatedCallback(tabId, {});

        interpreterMock.verifyAll();
        mockChromeAdapter.verifyAll();
    });
});
