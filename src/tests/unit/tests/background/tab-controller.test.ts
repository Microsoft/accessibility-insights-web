// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { BrowserAdapter } from '../../../../background/browser-adapters/browser-adapter';
import { InjectorAdapter } from '../../../../background/browser-adapters/injector-adapter';
import { DetailsViewController } from '../../../../background/details-view-controller';
import { Interpreter } from '../../../../background/interpreter';
import { FeatureFlagStore } from '../../../../background/stores/global/feature-flag-store';
import { TabToContextMap } from '../../../../background/tab-context';
import { TabContextBroadcaster } from '../../../../background/tab-context-broadcaster';
import { TabContextFactory } from '../../../../background/tab-context-factory';
import { TabController } from '../../../../background/tab-controller';
import { TelemetryEventHandler } from '../../../../background/telemetry/telemetry-event-handler';
import { Message } from '../../../../common/message';
import { Messages } from '../../../../common/messages';
import { DictionaryStringTo } from '../../../../types/common-types';
import { Logger } from './../../../../common/logging/logger';

describe('TabControllerTest', () => {
    let testSubject: TabController;

    let broadcasterStrictMock: IMock<TabContextBroadcaster>;
    let browserAdapterMock: IMock<BrowserAdapter>;
    let injectorAdapterMock: IMock<InjectorAdapter>;
    let detailsViewControllerMock: IMock<DetailsViewController>;
    let tabInterpreterMap: TabToContextMap;
    let featureFlagStoreMock: IMock<FeatureFlagStore>;
    let telemetryEventHandlerMock: IMock<TelemetryEventHandler>;
    let tabContextFactoryMock: IMock<TabContextFactory>;
    let onDetailsViewTabRemoved: (tabId: number) => void;
    let logMock: IMock<(msg: string) => void>;
    const LoggerStub: Logger = {
        log: null,
        error: null,
    };

    function setupCreateTabContextMock(broadCastDelegate: () => void, tabContext, tabId: number): void {
        tabContextFactoryMock
            .setup(factory =>
                factory.createTabContext(
                    broadCastDelegate,
                    browserAdapterMock.object,
                    injectorAdapterMock.object,
                    detailsViewControllerMock.object,
                    tabId,
                ),
            )
            .returns(() => tabContext)
            .verifiable(Times.once());
    }

    function createTabControllerWithoutFeatureFlag(tabcContextMap: TabToContextMap): TabController {
        return new TabController(
            tabcContextMap,
            broadcasterStrictMock.object,
            browserAdapterMock.object,
            injectorAdapterMock.object,
            detailsViewControllerMock.object,
            tabContextFactoryMock.object,
            LoggerStub,
        );
    }

    beforeEach(() => {
        logMock = Mock.ofInstance((msg: string) => {});
        LoggerStub.log = logMock.object;
        broadcasterStrictMock = Mock.ofType<TabContextBroadcaster>(undefined, MockBehavior.Strict);
        browserAdapterMock = Mock.ofType<BrowserAdapter>();
        injectorAdapterMock = Mock.ofType<InjectorAdapter>();
        detailsViewControllerMock = Mock.ofType<DetailsViewController>();
        featureFlagStoreMock = Mock.ofType(FeatureFlagStore);
        telemetryEventHandlerMock = Mock.ofType(TelemetryEventHandler);

        tabInterpreterMap = {};
        tabContextFactoryMock = Mock.ofType(TabContextFactory);
        detailsViewControllerMock
            .setup(dvc => dvc.setupDetailsViewTabRemovedHandler(It.isAny()))
            .callback(cb => {
                onDetailsViewTabRemoved = cb;
            })
            .verifiable(Times.once());

        testSubject = new TabController(
            tabInterpreterMap,
            broadcasterStrictMock.object,
            browserAdapterMock.object,
            injectorAdapterMock.object,
            detailsViewControllerMock.object,
            tabContextFactoryMock.object,
            LoggerStub,
        );

        browserAdapterMock.reset();
    });

    afterEach(() => {
        detailsViewControllerMock.verifyAll();
        browserAdapterMock.reset();
        detailsViewControllerMock.reset();
        featureFlagStoreMock.reset();
        telemetryEventHandlerMock.reset();
    });

    test('initialize', () => {
        browserAdapterMock.setup(mca => mca.tabsQuery(It.isValue({}), It.isAny())).verifiable(Times.once());
        browserAdapterMock.setup(mca => mca.addListenerOnConnect(It.isAny())).verifiable(Times.once());
        browserAdapterMock.setup(mca => mca.addListenerToWebNavigationUpdated(It.isAny())).verifiable(Times.once());
        browserAdapterMock.setup(mca => mca.addListenerToTabsOnRemoved(It.isAny())).verifiable(Times.once());
        browserAdapterMock.setup(mca => mca.addListenerToTabsOnUpdated(It.isAny())).verifiable(Times.once());

        testSubject.initialize();

        browserAdapterMock.verifyAll();
    });

    test('register onConnect listener', () => {
        browserAdapterMock
            .setup(mca => mca.addListenerOnConnect(It.isAny()))
            .callback(cb => {})
            .verifiable(Times.once());

        testSubject.initialize();
        browserAdapterMock.verifyAll();
    });

    test('onTabLoad: for main frame', () => {
        let getTabCallback: (tab: chrome.tabs.Tab) => void;
        let rejectCallback: () => void;
        const tabId = 1;
        const getTabCallbackInput = {
            data: 'abc',
        };
        const interpretInput: Message = {
            messageType: Messages.Tab.Update,
            payload: getTabCallbackInput,
            tabId: tabId,
        };

        const broadcastDelegate = () => {};
        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());

        const tabContextMock = {
            interpreter: interpreterMock.object,
        };

        broadcasterStrictMock
            .setup(md => md.getBroadcastMessageDelegate(tabId))
            .returns(() => broadcastDelegate)
            .verifiable(Times.once());

        let tabUpdatedCallback: (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => void = null;

        browserAdapterMock
            .setup(ca => ca.addListenerToWebNavigationUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());

        browserAdapterMock
            .setup(mca => mca.getTab(It.isValue(tabId), It.isAny(), It.isAny()))
            .returns((id, resolve, reject) => {
                getTabCallback = resolve;
                rejectCallback = reject;
            })
            .verifiable(Times.once());
        logMock.setup(log => log(`updated tab with Id ${tabId} not found`)).verifiable(Times.once());

        setupCreateTabContextMock(broadcastDelegate, tabContextMock, tabId);

        testSubject.initialize();

        tabUpdatedCallback({ tabId: tabId, frameId: 0 } as chrome.webNavigation.WebNavigationFramedCallbackDetails);

        getTabCallback(getTabCallbackInput as any);
        rejectCallback();

        interpreterMock.verifyAll();
        broadcasterStrictMock.verifyAll();
        browserAdapterMock.verifyAll();
        tabContextFactoryMock.verifyAll();
        logMock.verifyAll();
        expect(tabInterpreterMap[tabId]).toBe(tabContextMock);
    });

    test('onTabLoad: for child frame', () => {
        let tabUpdatedCallback: (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => void = null;

        broadcasterStrictMock.setup(mca => mca.getBroadcastMessageDelegate(It.isAny())).verifiable(Times.never());

        browserAdapterMock
            .setup(mca => mca.addListenerOnWindowsFocusChanged(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            });

        tabContextFactoryMock
            .setup(factory => factory.createTabContext(It.isAny(), It.isAny(), It.isAny(), It.isAny(), It.isAny()))
            .verifiable(Times.never());

        testSubject.initialize();

        tabUpdatedCallback({ tabId: 1, frameId: 2 } as chrome.webNavigation.WebNavigationFramedCallbackDetails);

        broadcasterStrictMock.verifyAll();
        browserAdapterMock.verifyAll();
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
        const boradcastMessageDelegateMock = Mock.ofInstance(() => {});

        broadcasterStrictMock
            .setup(mca => mca.getBroadcastMessageDelegate(tabId))
            .returns(() => boradcastMessageDelegateMock.object)
            .verifiable(Times.once());

        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());

        const tabContextMock = {
            interpreter: interpreterMock.object,
        };

        browserAdapterMock
            .setup(ca => ca.addListenerToWebNavigationUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());
        browserAdapterMock
            .setup(ca => ca.addListenerToTabsOnRemoved(It.isAny()))
            .callback(cb => {
                tabRemovedCallback = cb;
            });

        setupCreateTabContextMock(boradcastMessageDelegateMock.object, tabContextMock, tabId);
        testSubject.initialize();

        tabUpdatedCallback({ tabId: tabId, frameId: 0 } as chrome.webNavigation.WebNavigationFramedCallbackDetails);
        tabRemovedCallback(tabId);

        interpreterMock.verifyAll();
        broadcasterStrictMock.verifyAll();
        browserAdapterMock.verifyAll();
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
        const boradcastMessageDelegateMock = Mock.ofInstance(() => {});
        broadcasterStrictMock
            .setup(mb => mb.getBroadcastMessageDelegate(tabId))
            .returns(() => boradcastMessageDelegateMock.object)
            .verifiable(Times.once());

        const interpreterMock = Mock.ofType(Interpreter);
        interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());

        const tabContextMock = {
            interpreter: interpreterMock.object,
        };

        browserAdapterMock
            .setup(ca => ca.addListenerToWebNavigationUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());

        setupCreateTabContextMock(boradcastMessageDelegateMock.object, tabContextMock, tabId);
        testSubject.initialize();

        tabUpdatedCallback({ tabId: tabId, frameId: 0 } as chrome.webNavigation.WebNavigationFramedCallbackDetails);
        onDetailsViewTabRemoved(tabId);

        interpreterMock.verifyAll();
        broadcasterStrictMock.verifyAll();
        expect(tabInterpreterMap[tabId]).toBeDefined();
    });

    test('createTabContextAndTriggerTabUpdateForExistingTabs', () => {
        const openTabIds = [1, 5];
        const tabIdToTabContextStub = {};
        const mockInterpreters = [];
        const getTabCallbackMap: DictionaryStringTo<(tab: chrome.tabs.Tab) => void> = {};

        let tabsQueryCallback: (tabs: chrome.tabs.Tab[]) => void = null;
        const tabs: DictionaryStringTo<chrome.tabs.Tab> = {
            1: { id: openTabIds[0] } as chrome.tabs.Tab,
            5: { id: openTabIds[1] } as chrome.tabs.Tab,
        };

        openTabIds.forEach((tabId, index) => {
            const interpretInput: Message = {
                messageType: Messages.Tab.Update,
                payload: tabs[tabId],
                tabId: tabId,
            };

            const interpreterMock = Mock.ofType(Interpreter);
            interpreterMock.setup(im => im.interpret(It.isValue(interpretInput))).verifiable(Times.once());

            const broadCastDelegate = () => {};
            broadcasterStrictMock
                .setup(mb => mb.getBroadcastMessageDelegate(tabId))
                .returns(() => broadCastDelegate)
                .verifiable(Times.once());

            tabIdToTabContextStub[tabId] = {
                interpreter: interpreterMock.object,
            };

            setupCreateTabContextMock(broadCastDelegate, tabIdToTabContextStub[tabId], tabId);

            mockInterpreters.push(interpreterMock);
            browserAdapterMock
                .setup(mca => mca.getTab(It.isValue(tabId), It.isAny(), It.isAny()))
                .returns((id, cb) => {
                    getTabCallbackMap[tabId] = cb;
                })
                .verifiable(Times.once());
        });

        browserAdapterMock
            .setup(mca => mca.tabsQuery(It.isValue({}), It.isAny()))
            .callback((query, callback) => {
                tabsQueryCallback = callback;
            });

        testSubject.initialize();

        tabsQueryCallback(Object.keys(tabs).map(id => tabs[id]));

        openTabIds.forEach(tabId => {
            getTabCallbackMap[tabId](tabs[tabId]);
        });
        broadcasterStrictMock.verifyAll();
        browserAdapterMock.verifyAll();
        expect(Object.keys(tabInterpreterMap).length).toBe(openTabIds.length);
        openTabIds.forEach(tabId => {
            expect(tabInterpreterMap[tabId]).toEqual(tabIdToTabContextStub[tabId]);
        });
        mockInterpreters.forEach(interpreterMock => {
            interpreterMock.verifyAll();
        });
    });

    test('tab change test', () => {
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
            messageType: Messages.Tab.Change,
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

        browserAdapterMock
            .setup(ca => ca.addListenerToWebNavigationUpdated(It.isAny()))
            .callback(cb => {
                tabUpdatedCallback = cb;
            })
            .verifiable(Times.once());

        browserAdapterMock
            .setup(mca => mca.getTab(It.isValue(tabId), It.isAny(), It.isAny()))
            .returns((id, cb, reject) => {
                getTabCallback = cb;
                onReject = reject;
            })
            .verifiable(Times.once());
        logMock.setup(log => log(`changed tab with Id ${tabId} not found`)).verifiable(Times.once());

        testSubject = createTabControllerWithoutFeatureFlag(tabInterpreterMap);
        testSubject.initialize();
        tabUpdatedCallback({ frameId: 0, tabId: tabId } as chrome.webNavigation.WebNavigationFramedCallbackDetails);
        getTabCallback(getTabCallbackInput as any);
        onReject();

        logMock.verifyAll();
        interpreterMock.verifyAll();
        browserAdapterMock.verifyAll();
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

        browserAdapterMock
            .setup(ca => ca.addListenerOnWindowsFocusChanged(It.isAny()))
            .callback(windowFocusChangedCallback => {
                windowFocusChangedCallback(-1);
            })
            .verifiable(Times.once());

        browserAdapterMock
            .setup(ca => ca.getAllWindows(It.isValue(getInfo), It.isAny()))
            .callback((id, getAllWindowsCallback) => {
                getAllWindowsCallback(windowsStub as chrome.windows.Window[]);
            })
            .verifiable(Times.once());

        browserAdapterMock
            .setup(ca => ca.getSelectedTabInWindow(windowStub1.id, It.isAny()))
            .callback((id, getSelectedTabInWindowCallback) => {
                getSelectedTabInWindowCallback(tabStub1 as chrome.tabs.Tab);
            })
            .verifiable(Times.once());

        browserAdapterMock
            .setup(ca => ca.getSelectedTabInWindow(windowStub2.id, It.isAny()))
            .callback((id, getSelectedTabInWindowCallback) => {
                getSelectedTabInWindowCallback(tabStub2 as chrome.tabs.Tab);
            })
            .verifiable(Times.once());

        browserAdapterMock
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
        browserAdapterMock.verifyAll();
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

        browserAdapterMock
            .setup(ca => ca.addListenerOnWindowsFocusChanged(It.isAny()))
            .callback(windowFocusChangedCallback => {
                windowFocusChangedCallback(-1);
            })
            .verifiable(Times.once());

        browserAdapterMock
            .setup(ca => ca.getAllWindows(It.isValue(getInfo), It.isAny()))
            .callback((id, getAllWindowsCallback) => {
                getAllWindowsCallback(windowsStub as chrome.windows.Window[]);
            })
            .verifiable(Times.once());

        browserAdapterMock
            .setup(ca => ca.getSelectedTabInWindow(windowStub1.id, It.isAny()))
            .callback((id, getSelectedTabInWindowCallback) => {
                getSelectedTabInWindowCallback(tabStub1 as chrome.tabs.Tab);
            })
            .verifiable(Times.once());

        browserAdapterMock
            .setup(ca => ca.getSelectedTabInWindow(windowStub2.id, It.isAny()))
            .callback((id, getSelectedTabInWindowCallback) => {
                getSelectedTabInWindowCallback(tabStub2 as chrome.tabs.Tab);
            })
            .verifiable(Times.once());

        browserAdapterMock.setup(ca => ca.getRuntimeLastError()).returns(() => new Error('window closed'));

        browserAdapterMock.setup(ca => ca.getRuntimeLastError()).returns(() => null);

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
        browserAdapterMock.verifyAll();
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

        browserAdapterMock
            .setup(ca => ca.addListenerToTabsOnActivated(It.isAny()))
            .callback(onTabActivatedCallback => {
                onTabActivatedCallback(activeInfo);
            })
            .verifiable(Times.once());

        browserAdapterMock
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
        browserAdapterMock.verifyAll();
    });

    test('onUpdateTab', () => {
        browserAdapterMock.setup(ca => ca.addListenerToTabsOnUpdated(It.isAny())).verifiable(Times.once());

        testSubject.initialize();

        browserAdapterMock.verifyAll();
    });
});
