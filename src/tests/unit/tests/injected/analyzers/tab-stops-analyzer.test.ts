// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { VisualizationType } from '../../../../../common/types/visualization-type';
import { WindowUtils } from '../../../../../common/window-utils';
import { IFocusAnalyzerConfiguration, IScanBasePayload } from '../../../../../injected/analyzers/ianalyzer';
import { TabStopsAnalyzer } from '../../../../../injected/analyzers/tab-stops-analyzer';
import { ITabStopEvent, TabStopsListener } from '../../../../../injected/tab-stops-listener';

describe('TabStopsAnalyzerTests', () => {
    let windowUtilsMock: IMock<WindowUtils>;
    let sendMessageMock: IMock<(message) => void>;
    let configStub: IFocusAnalyzerConfiguration;
    let typeStub: VisualizationType;
    let testSubject: TabStopsAnalyzer;
    let tabStopsListenerMock: IMock<TabStopsListener>;
    let tabEventHandler: (tabEvent: ITabStopEvent) => void;
    let setTimeOutCallBack: () => void;

    beforeEach(() => {
        windowUtilsMock = Mock.ofType(WindowUtils);
        sendMessageMock = Mock.ofInstance(message => {}, MockBehavior.Strict);
        configStub = {
            analyzerProgressMessageType: 'sample progress message type',
            analyzerTerminatedMessageType: 'fun terminated message',
            analyzerMessageType: 'sample message type',
            key: 'sample key',
            testType: -1,
        };
        tabEventHandler = null;
        setTimeOutCallBack = null;
        tabStopsListenerMock = Mock.ofType(TabStopsListener);
        testSubject = new TabStopsAnalyzer(configStub, tabStopsListenerMock.object, windowUtilsMock.object, sendMessageMock.object);
        typeStub = -1 as VisualizationType;
    });

    test('analyze', async (completeSignal: () => void) => {
        const tabEventStub: ITabStopEvent = {
            target: ['selector'],
            html: 'test',
            timestamp: 1,
        };
        const resultsStub = {};
        const expectedBaseMessage = {
            type: configStub.analyzerMessageType,
            payload: {
                key: configStub.key,
                selectorMap: resultsStub,
                scanResult: null,
                testType: typeStub,
            },
        };
        const expectedOnProgressMessage = {
            type: configStub.analyzerProgressMessageType,
            payload: {
                key: configStub.key,
                testType: configStub.testType,
                tabbedElements: [tabEventStub],
                results: [tabEventStub],
            },
        };

        setupTabStopsListenerForStartTabStops();
        setupWindowUtils();
        setupSendMessageMock(expectedBaseMessage);
        setupSendMessageMock(expectedOnProgressMessage, () => {
            verifyAll();
            expect((testSubject as any)._onTabbedTimeoutId).toBeNull();
            completeSignal();
        });

        testSubject.analyze();

        tabEventHandler(tabEventStub);
        setTimeOutCallBack();
    });

    test('analyze: multiple events together (simulate timeoutId already created)', (completeSignal: () => void) => {
        const tabEventStub1: ITabStopEvent = {
            target: ['selector'],
            html: 'test',
            timestamp: 1,
        };
        const tabEventStub2: ITabStopEvent = {
            target: ['selector2'],
            html: 'test',
            timestamp: 2,
        };
        const onTabbedTimoutIdStub = -1;
        const resultsStub = {};
        const expectedBaseMessage = {
            type: configStub.analyzerMessageType,
            payload: {
                key: configStub.key,
                selectorMap: resultsStub,
                scanResult: null,
                testType: typeStub,
            },
        };
        const expectedOnProgressMessage = {
            type: configStub.analyzerProgressMessageType,
            payload: {
                key: configStub.key,
                testType: configStub.testType,
                tabbedElements: [tabEventStub1, tabEventStub2],
                results: [tabEventStub1, tabEventStub2],
            },
        };

        (testSubject as any)._onTabbedTimeoutId = onTabbedTimoutIdStub;
        (testSubject as any)._pendingTabbedElements = [tabEventStub1];

        setupTabStopsListenerForStartTabStops();
        setupWindowUtils();
        setupSendMessageMock(expectedBaseMessage);
        setupSendMessageMock(expectedOnProgressMessage, () => {
            verifyAll();
            expect((testSubject as any)._onTabbedTimeoutId).toBeNull();
            completeSignal();
        });

        testSubject.analyze();

        tabEventHandler(tabEventStub2);
        setTimeOutCallBack();
    });

    test('teardown', () => {
        tabStopsListenerMock.setup(tslm => tslm.stopListenToTabStops()).verifiable(Times.once());

        const payload: IScanBasePayload = {
            key: configStub.key,
            testType: configStub.testType,
        };

        setupSendMessageMock({
            type: configStub.analyzerTerminatedMessageType,
            payload,
        });

        testSubject.teardown();

        verifyAll();
    });

    function verifyAll(): void {
        tabStopsListenerMock.verifyAll();
        windowUtilsMock.verifyAll();
        sendMessageMock.verifyAll();
    }

    function setupTabStopsListenerForStartTabStops(): void {
        tabStopsListenerMock
            .setup(tslm => tslm.setTabEventListenerOnMainWindow(It.isAny()))
            .callback((callback: (tabEvent: ITabStopEvent) => void) => {
                tabEventHandler = callback;
            })
            .verifiable(Times.once());

        tabStopsListenerMock.setup(t => t.startListenToTabStops()).verifiable(Times.once());
    }

    function setupWindowUtils(): void {
        windowUtilsMock
            .setup(w => w.setTimeout(It.isAny(), 50))
            .callback((callback, timeout) => {
                setTimeOutCallBack = callback;
            })
            .verifiable(Times.once());
    }

    function setupSendMessageMock(message, callback?): void {
        sendMessageMock
            .setup(smm => smm(It.isValue(message)))
            .callback(callback)
            .verifiable();
    }
});
