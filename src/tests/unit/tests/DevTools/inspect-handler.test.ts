// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ConnectionNames } from 'common/constants/connection-names';
import { DevToolStoreData } from 'common/types/store-data/dev-tool-store-data';
import { InspectHandler } from 'Devtools/inspect-handler';
import { TargetPageInspector } from 'Devtools/target-page-inspector';
import { IMock, It, Mock, Times } from 'typemoq';
import { DevToolsChromeAdapterMock } from '../../mock-helpers/dev-tools-chrome-adapter-mock';
import { StoreMock } from '../../mock-helpers/store-mock';
import { PortStub } from '../../stubs/port-stub';

describe('InspectHandler', () => {
    let testSubject: InspectHandler;
    let devToolsChromeAdapterMock: DevToolsChromeAdapterMock;
    let devtoolsStoreProxyMock: StoreMock<DevToolStoreData>;
    let backgrountConnectionMock: IMock<chrome.runtime.Port>;
    let targetPageInspectorMock: IMock<TargetPageInspector>;
    const inspectedWindowId = 12;

    beforeEach(() => {
        devToolsChromeAdapterMock = new DevToolsChromeAdapterMock();
        devtoolsStoreProxyMock = new StoreMock<DevToolStoreData>();
        targetPageInspectorMock = Mock.ofType<TargetPageInspector>();
        backgrountConnectionMock = Mock.ofType(PortStub);
        testSubject = new InspectHandler(
            devtoolsStoreProxyMock.getObject(),
            devToolsChromeAdapterMock.getObject(),
            targetPageInspectorMock.object,
        );

        devToolsChromeAdapterMock.setUpConnect(
            ConnectionNames.devTools,
            backgrountConnectionMock.object,
        );
    });

    test('initialize - send about dev tools open message to background ', () => {
        devtoolsStoreProxyMock.setupAddChangedListener();
        backgrountConnectionMock
            .setup(x => x.postMessage(It.isObjectWith({ tabId: inspectedWindowId })))
            .verifiable();
        devToolsChromeAdapterMock.setupGetInspectedWindowTabId(inspectedWindowId);

        testSubject.initialize();

        devtoolsStoreProxyMock.verifyAll();
        devToolsChromeAdapterMock.verifyAll();
        backgrountConnectionMock.verifyAll();
    });

    test('initialize - do not throw when state is null', () => {
        devtoolsStoreProxyMock.setupAddChangedListener();
        devtoolsStoreProxyMock.setupGetState(null);
        devToolsChromeAdapterMock.setupGetInspectedWindowTabId(inspectedWindowId);
        testSubject.initialize();

        devtoolsStoreProxyMock.invokeChangeListener();

        devtoolsStoreProxyMock.verifyAll();
        devToolsChromeAdapterMock.verifyAll();
    });

    test('initialize - do not throw when inspectElement is not set', () => {
        const state = {
            inspectElement: null,
        } as DevToolStoreData;

        devtoolsStoreProxyMock.setupAddChangedListener();
        devtoolsStoreProxyMock.setupGetState(state);
        devToolsChromeAdapterMock.setupGetInspectedWindowTabId(inspectedWindowId);
        testSubject.initialize();

        devtoolsStoreProxyMock.invokeChangeListener();

        devtoolsStoreProxyMock.verifyAll();
        devToolsChromeAdapterMock.verifyAll();
    });

    test('initialize - inspect on state change: target at parent level', () => {
        const state = {
            inspectElement: ['#testElement'],
            frameUrl: null,
        } as DevToolStoreData;
        devtoolsStoreProxyMock.setupAddChangedListener();
        devtoolsStoreProxyMock.setupGetState(state);
        devToolsChromeAdapterMock.setupGetInspectedWindowTabId(inspectedWindowId);

        targetPageInspectorMock
            .setup(inspector => inspector.inspectElement('#testElement', null))
            .verifiable(Times.once());

        testSubject.initialize();

        devtoolsStoreProxyMock.invokeChangeListener();

        devtoolsStoreProxyMock.verifyAll();
        targetPageInspectorMock.verifyAll();
    });

    test('initialize - inspect on state change: target not at parent level with frame url provided', () => {
        const state = {
            inspectElement: ['#testElement', 'test'],
            frameUrl: 'testUrl',
        } as DevToolStoreData;
        devtoolsStoreProxyMock.setupAddChangedListener();
        devtoolsStoreProxyMock.setupGetState(state);
        devToolsChromeAdapterMock.setupGetInspectedWindowTabId(inspectedWindowId);

        targetPageInspectorMock
            .setup(inspector => inspector.inspectElement('test', 'testUrl'))
            .verifiable(Times.once());

        testSubject.initialize();

        devtoolsStoreProxyMock.invokeChangeListener();

        devtoolsStoreProxyMock.verifyAll();
        targetPageInspectorMock.verifyAll();
    });

    test("initialize - don't inspect if inspect element length > 1 and frame Url not set", () => {
        const state = {
            inspectElement: ['#testElement', 'test'],
            frameUrl: null,
        } as DevToolStoreData;
        devtoolsStoreProxyMock.setupAddChangedListener();
        devtoolsStoreProxyMock.setupGetState(state);
        devToolsChromeAdapterMock.setupGetInspectedWindowTabId(inspectedWindowId);

        testSubject.initialize();
        devtoolsStoreProxyMock.invokeChangeListener();

        devtoolsStoreProxyMock.verifyAll();
        devToolsChromeAdapterMock.verifyAll();
    });
});
