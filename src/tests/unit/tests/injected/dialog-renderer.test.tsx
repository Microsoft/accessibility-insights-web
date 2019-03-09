// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { getRTL } from '@uifabric/utilities';
import * as ReactDOM from 'react-dom';
import { GlobalMock, GlobalScope, IGlobalMock, IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { DevToolStore } from '../../../../background/stores/dev-tools-store';
import { UserConfigurationStore } from '../../../../background/stores/global/user-configuration-store';
import { ClientBrowserAdapter } from '../../../../common/client-browser-adapter';
import { FeatureFlags, getDefaultFeatureFlagValues } from '../../../../common/feature-flags';
import { HTMLElementUtils } from '../../../../common/html-element-utils';
import { BugActionMessageCreator } from '../../../../common/message-creators/bug-action-message-creator';
import { DevToolActionMessageCreator } from '../../../../common/message-creators/dev-tool-action-message-creator';
import { FeatureFlagStoreData } from '../../../../common/types/store-data/feature-flag-store-data';
import { WindowUtils } from '../../../../common/window-utils';
import { rootContainerId } from '../../../../injected/constants';
import { DetailsDialogWindowMessage, DialogRenderer } from '../../../../injected/dialog-renderer';
import { FrameCommunicator, IMessageRequest } from '../../../../injected/frameCommunicators/frame-communicator';
import { FrameMessageResponseCallback } from '../../../../injected/frameCommunicators/window-message-handler';
import { IErrorMessageContent } from '../../../../injected/frameCommunicators/window-message-marshaller';
import { LayeredDetailsDialogComponent } from '../../../../injected/layered-details-dialog-component';
import { MainWindowContext } from '../../../../injected/main-window-context';
import { DecoratedAxeNodeResult, IHtmlElementAxeResults } from '../../../../injected/scanner-utils';
import { ShadowUtils } from '../../../../injected/shadow-utils';
import { TargetPageActionMessageCreator } from '../../../../injected/target-page-action-message-creator';

describe('DialogRendererTests', () => {
    let htmlElementUtilsMock: IMock<HTMLElementUtils>;
    let windowUtilsMock: IMock<WindowUtils>;
    let frameCommunicator: IMock<FrameCommunicator>;
    let mainWindowContext: MainWindowContext;
    let shadowUtilMock: IMock<ShadowUtils>;
    let clientBrowserAdapter: IMock<ClientBrowserAdapter>;
    let shadowContainerMock: IMock<HTMLElement>;
    let domMock: IMock<Document>;
    let shadowRootMock: IMock<Element>;
    let getRTLMock: IMock<typeof getRTL>;
    let shadowRoot: Element;
    let renderMock: IMock<typeof ReactDOM.render>;
    let subscribeCallback: (
        message: DetailsDialogWindowMessage,
        error: IErrorMessageContent,
        responder?: FrameMessageResponseCallback,
    ) => void;
    let getMainWindoContextMock: IGlobalMock<() => MainWindowContext>;
    let rootContainerMock: IMock<HTMLElement>;

    beforeEach(() => {
        htmlElementUtilsMock = Mock.ofType(HTMLElementUtils);
        windowUtilsMock = Mock.ofType(WindowUtils);
        shadowUtilMock = Mock.ofType(ShadowUtils);
        clientBrowserAdapter = Mock.ofType<ClientBrowserAdapter>();

        getMainWindoContextMock = GlobalMock.ofInstance(MainWindowContext.get, 'get', MainWindowContext);
        frameCommunicator = Mock.ofType(FrameCommunicator);
        domMock = Mock.ofInstance({
            createElement: selector => null,
            body: {
                appendChild: selector => null,
            },
            querySelector: selector => null,
            querySelectorAll: selector => null,
            appendChild: node => {},
        } as any);

        shadowContainerMock = Mock.ofInstance({
            querySelector: selector => {},
            appendChild: node => {},
        } as any);
        shadowRootMock = Mock.ofInstance({
            querySelector: selector => null,
        } as any);
        shadowRoot = {
            shadowRoot: shadowRootMock.object,
        } as any;
        renderMock = Mock.ofInstance(() => null);
        getRTLMock = Mock.ofInstance(() => null);
        rootContainerMock = Mock.ofType<HTMLElement>();

        const devToolStoreStrictMock = Mock.ofType<DevToolStore>(null, MockBehavior.Strict);
        const userConfigStoreStrictMock = Mock.ofType<UserConfigurationStore>(null, MockBehavior.Strict);
        const devToolActionMessageCreatorMock = Mock.ofType(DevToolActionMessageCreator);
        const targetActionPageMessageCreatorMock = Mock.ofType(TargetPageActionMessageCreator);
        const bugActionMessageCreatorMock = Mock.ofType(BugActionMessageCreator);

        mainWindowContext = new MainWindowContext(
            devToolStoreStrictMock.object,
            userConfigStoreStrictMock.object,
            devToolActionMessageCreatorMock.object,
            targetActionPageMessageCreatorMock.object,
            bugActionMessageCreatorMock.object,
        );
    });

    test('test render if dialog already exists: shadow FF on', () => {
        const ruleId = 'ruleId';
        const nodeResult: DecoratedAxeNodeResult = {
            any: [],
            all: [],
            none: [],
            status: false,
            ruleId: ruleId,
            selector: 'selector',
            html: 'html',
            failureSummary: 'failureSummary',
            help: 'help',
            id: 'id1',
            guidanceLinks: [],
            helpUrl: 'help',
            fingerprint: 'fp1',
            snippet: 'html',
        };
        const expectedFailedRules: IDictionaryStringTo<DecoratedAxeNodeResult> = {};
        expectedFailedRules[ruleId] = nodeResult;
        const testData: IHtmlElementAxeResults = {
            ruleResults: expectedFailedRules,
            target: [ruleId],
            isVisible: true,
        };

        setupDomMockForMainWindow(true);
        setUpGetMainWindowContextCalledOnce();
        attachShadowToDom();
        setupWindowUtilsMockAndFrameCommunicatorInMainWindow();
        setupRenderMockForVerifiable();

        const testObject = createDialogRenderer();

        GlobalScope.using(getMainWindoContextMock).with(() => {
            expect(testObject.render(testData, getDefaultFeatureFlagValuesWithShadowOn())).toBeUndefined();
        });

        attachShadowToDomVerify();
        setupWindowUtilsMockAndFrameCommunicatorVerify();
        setupRenderMockVerify();
        getMainWindoContextMock.verifyAll();
    });

    test('test render if dialog already exists: shadow FF off', () => {
        const ruleId = 'ruleId';
        const nodeResult: DecoratedAxeNodeResult = {
            any: [],
            all: [],
            none: [],
            status: false,
            ruleId: ruleId,
            selector: 'selector',
            html: 'html',
            failureSummary: 'failureSummary',
            help: 'help',
            id: 'id',
            guidanceLinks: [],
            helpUrl: 'help',
            fingerprint: 'fp1',
            snippet: 'html',
        };
        const expectedFailedRules: IDictionaryStringTo<DecoratedAxeNodeResult> = {};
        expectedFailedRules[ruleId] = nodeResult;
        const testData: IHtmlElementAxeResults = {
            ruleResults: expectedFailedRules,
            target: [ruleId],
            isVisible: true,
        };

        setupDomMockForMainWindow(false);
        setupWindowUtilsMockAndFrameCommunicatorInMainWindow();
        setupRenderMockForVerifiable();
        setUpGetMainWindowContextCalledOnce();
        const testObject = createDialogRenderer();

        GlobalScope.using(getMainWindoContextMock).with(() => {
            expect(testObject.render(testData, getDefaultFeatureFlagValues())).toBeUndefined();
        });

        setupDomMockVerify();
        setupWindowUtilsMockAndFrameCommunicatorVerify();
        setupRenderMockVerify();
        getMainWindoContextMock.verifyAll();
    });

    test('test render in main window: shadow FF on', () => {
        const ruleId = 'ruleId';
        const nodeResult: DecoratedAxeNodeResult = {
            any: [],
            all: [],
            none: [],
            status: false,
            ruleId: ruleId,
            selector: 'selector',
            html: 'html',
            failureSummary: 'failureSummary',
            help: 'help',
            id: 'id',
            guidanceLinks: [],
            helpUrl: 'help',
            fingerprint: 'fp',
            snippet: 'html',
        };
        const expectedFailedRules: IDictionaryStringTo<DecoratedAxeNodeResult> = {};
        expectedFailedRules[ruleId] = nodeResult;
        const testData: IHtmlElementAxeResults = {
            ruleResults: expectedFailedRules,
            target: [ruleId],
            isVisible: true,
        };

        attachShadowToDom(true);
        setupDomMockForMainWindow(true);
        setupWindowUtilsMockAndFrameCommunicatorInMainWindow();
        setupRenderMockForVerifiable();
        setUpGetMainWindowContextCalledOnce();
        const testObject = createDialogRenderer();

        GlobalScope.using(getMainWindoContextMock).with(() => {
            testObject.render(testData, getDefaultFeatureFlagValuesWithShadowOn());
        });

        attachShadowToDomVerify(true);
        setupDomMockVerify();
        setupWindowUtilsMockAndFrameCommunicatorVerify();
        setupRenderMockVerify();
        getMainWindoContextMock.verifyAll();
    });

    test('test render in main window: shadow FF off', () => {
        const ruleId = 'ruleId';
        const nodeResult: DecoratedAxeNodeResult = {
            any: [],
            all: [],
            none: [],
            status: false,
            ruleId: ruleId,
            selector: 'selector',
            html: 'html',
            failureSummary: 'failureSummary',
            help: 'help',
            id: 'id1',
            guidanceLinks: [],
            helpUrl: 'help',
            fingerprint: 'fp1',
            snippet: 'html',
        };
        const expectedFailedRules: IDictionaryStringTo<DecoratedAxeNodeResult> = {};
        expectedFailedRules[ruleId] = nodeResult;
        const testData: IHtmlElementAxeResults = {
            ruleResults: expectedFailedRules,
            target: [ruleId],
            isVisible: true,
        };

        setupDomMockForMainWindow(false);
        setupWindowUtilsMockAndFrameCommunicatorInMainWindow();
        setupRenderMockForVerifiable();
        setUpGetMainWindowContextCalledOnce();

        const testObject = createDialogRenderer();

        GlobalScope.using(getMainWindoContextMock).with(() => {
            testObject.render(testData, getDefaultFeatureFlagValues());
        });

        setupDomMockVerify();
        setupWindowUtilsMockAndFrameCommunicatorVerify();
        setupRenderMockVerify();
        getMainWindoContextMock.verifyAll();
    });

    test('test render in iframe: shadow FF on', () => {
        const testData: IHtmlElementAxeResults = {
            ruleResults: null,
            target: [],
            isVisible: true,
        };
        const windowMessageRequest: IMessageRequest<DetailsDialogWindowMessage> = {
            win: 'this is main window' as any,
            command: 'insights.detailsDialog',
            message: { data: testData, featureFlagStoreData: getDefaultFeatureFlagValuesWithShadowOn() },
        };

        attachShadowToDom(false);
        setupWindowUtilsMockAndFrameCommunicatorInIframe(windowMessageRequest);
        setupRenderMockForNeverVisited();

        const testObject = createDialogRenderer();

        GlobalScope.using(getMainWindoContextMock).with(() => {
            testObject.render(testData, getDefaultFeatureFlagValuesWithShadowOn());
        });

        attachShadowToDomVerify(false, false);
        setupWindowUtilsMockAndFrameCommunicatorVerify();
        setupRenderMockVerify();
        getMainWindoContextMock.verifyAll();
    });

    test('test render in iframe: shadow FF off', () => {
        const testData: IHtmlElementAxeResults = {
            ruleResults: null,
            target: [],
            isVisible: true,
        };
        const windowMessageRequest: IMessageRequest<DetailsDialogWindowMessage> = {
            win: 'this is main window' as any,
            command: 'insights.detailsDialog',
            message: { data: testData, featureFlagStoreData: getDefaultFeatureFlagValues() },
        };

        setupWindowUtilsMockAndFrameCommunicatorInIframe(windowMessageRequest);
        setupRenderMockForNeverVisited();

        const testObject = createDialogRenderer();

        GlobalScope.using(getMainWindoContextMock).with(() => {
            testObject.render(testData, getDefaultFeatureFlagValues());
        });

        setupDomMockVerify();
        setupWindowUtilsMockAndFrameCommunicatorVerify();
        setupRenderMockVerify();
        getMainWindoContextMock.verifyAll();
    });

    test('test main window subsribe and processRequest: shadow FF on', () => {
        const testData: IHtmlElementAxeResults = {
            ruleResults: null,
            target: ['test string'],
            isVisible: true,
        };
        const message: DetailsDialogWindowMessage = { data: testData, featureFlagStoreData: getDefaultFeatureFlagValuesWithShadowOn() };

        setupDomMockForMainWindow(true);
        setupWindowUtilsMockAndFrameCommunicatorInMainWindow();
        attachShadowToDom(true);
        setupRenderMockForVerifiable();
        setUpGetMainWindowContextCalledOnce();

        createDialogRenderer();

        GlobalScope.using(getMainWindoContextMock).with(() => {
            subscribeCallback(message, undefined, undefined);
        });

        setupDomMockVerify();
        setupWindowUtilsMockAndFrameCommunicatorVerify();
        attachShadowToDomVerify(true);
        setupRenderMockVerify();
        getMainWindoContextMock.verifyAll();
    });

    test('test main window subsribe and processRequest: shadowDom FF off', () => {
        const testData: IHtmlElementAxeResults = {
            ruleResults: null,
            target: ['test string'],
            isVisible: true,
        };
        const message: DetailsDialogWindowMessage = { data: testData, featureFlagStoreData: getDefaultFeatureFlagValues() };

        setupDomMockForMainWindow(false);
        setupWindowUtilsMockAndFrameCommunicatorInMainWindow();
        setupRenderMockForVerifiable();
        setUpGetMainWindowContextCalledOnce();

        createDialogRenderer();

        GlobalScope.using(getMainWindoContextMock).with(() => {
            subscribeCallback(message, undefined, undefined);
        });

        setupDomMockVerify();
        setupWindowUtilsMockAndFrameCommunicatorVerify();
        setupRenderMockVerify();
        getMainWindoContextMock.verifyAll();
    });

    test('test for getInstanceSelector', () => {
        const testData = {
            target: ['test string 1', 'test string 2'],
        };

        setupWindowUtilsMockAndFrameCommunicatorInMainWindow();

        const testObject = createDialogRenderer();
        const result = (testObject as any).getElementSelector(testData);

        expect(result).toBe(testData.target.join(';'));
        setupWindowUtilsMockAndFrameCommunicatorVerify();
    });

    function setUpGetMainWindowContextCalledOnce() {
        getMainWindoContextMock
            .setup(get => get())
            .returns(() => mainWindowContext)
            .verifiable(Times.once());
    }
    function setUpGetMainWindowContexNeverCalled() {
        getMainWindoContextMock
            .setup(get => get())
            .returns(() => mainWindowContext)
            .verifiable(Times.never());
    }

    function setupRenderMockForVerifiable() {
        renderMock
            .setup(render =>
                render(
                    It.is(detailsDialog => {
                        return (detailsDialog.type as any) === LayeredDetailsDialogComponent;
                    }),
                    It.is((container: any) => container != null),
                ),
            )
            .verifiable(Times.once());
    }

    function setupRenderMockForNeverVisited() {
        renderMock
            .setup(it => it(It.is((detailsDialog: any) => detailsDialog != null), It.is((container: any) => container != null)))
            .verifiable(Times.never());
    }

    function setupRenderMockVerify(): void {
        renderMock.verifyAll();
    }

    function setupWindowUtilsMockAndFrameCommunicatorInMainWindow() {
        const win = 'this is main window';
        windowUtilsMock
            .setup(wum => wum.getTopWindow())
            .returns(() => {
                return win as any;
            })
            .verifiable(Times.atLeastOnce());
        windowUtilsMock
            .setup(wum => wum.getWindow())
            .returns(() => {
                return win as any;
            })
            .verifiable(Times.atLeastOnce());
        windowUtilsMock.setup(wum => wum.getPlatform()).returns(() => 'Win32');
        frameCommunicator
            .setup(fcm =>
                fcm.subscribe(
                    It.isValue('insights.detailsDialog'),
                    It.is(
                        (
                            param: (
                                message: DetailsDialogWindowMessage,
                                error: IErrorMessageContent,
                                sourceWin: Window,
                                responder?: FrameMessageResponseCallback,
                            ) => void,
                        ) => {
                            return param instanceof Function;
                        },
                    ),
                ),
            )
            .callback((command, cb) => {
                subscribeCallback = cb;
            })
            .verifiable(Times.once());
        frameCommunicator.setup(fcm => fcm.sendMessage(It.isAny())).verifiable(Times.never());
    }

    function setupWindowUtilsMockAndFrameCommunicatorVerify(): void {
        windowUtilsMock.verifyAll();
        frameCommunicator.verifyAll();
    }

    function setupWindowUtilsMockAndFrameCommunicatorInIframe(windowMessageRequest: IMessageRequest<DetailsDialogWindowMessage>) {
        windowUtilsMock
            .setup(wum => wum.getTopWindow())
            .returns(() => {
                return 'this is main window' as any;
            })
            .verifiable(Times.atLeastOnce());
        windowUtilsMock
            .setup(wum => wum.getWindow())
            .returns(() => {
                return 'this is iframe' as any;
            })
            .verifiable(Times.atLeastOnce());

        frameCommunicator.setup(fcm => fcm.subscribe(It.isAny(), It.isAny())).verifiable(Times.never());
        frameCommunicator.setup(fcm => fcm.sendMessage(It.isValue(windowMessageRequest))).verifiable(Times.once());
    }

    function getDefaultFeatureFlagValuesWithShadowOn(): FeatureFlagStoreData {
        return {
            [FeatureFlags.shadowDialog]: true,
        };
    }

    function attachShadowToDom(inMainWindow: boolean = true): void {
        if (inMainWindow) {
            shadowUtilMock
                .setup(shadowUtil => shadowUtil.getShadowContainer())
                .returns(() => shadowContainerMock.object)
                .verifiable(Times.once());
        }
    }

    function attachShadowToDomVerify(needAppendChild: boolean = false, inMainWindow: boolean = true): void {
        if (inMainWindow) {
            shadowUtilMock.verifyAll();
        }

        domMock.verifyAll();
        shadowRootMock.verifyAll();

        if (needAppendChild) {
            shadowContainerMock.verifyAll();
        }
    }

    function setupDomMockForMainWindow(underShadowDom: boolean = true): void {
        if (!underShadowDom) {
            htmlElementUtilsMock.setup(h => h.deleteAllElements('.insights-dialog-container')).verifiable(Times.once());

            domMock
                .setup(dom => dom.querySelector(`#${rootContainerId}`))
                .returns(() => rootContainerMock.object)
                .verifiable(Times.once());

            rootContainerMock.setup(r => r.appendChild(It.isAny())).verifiable(Times.once());
        } else {
            shadowContainerMock.setup(it => it.appendChild(It.isAny())).verifiable(Times.once());
        }

        domMock
            .setup(dom => dom.createElement('div'))
            .returns(selector => document.createElement(selector))
            .verifiable(Times.once());
    }

    function setupDomMockVerify(): void {
        domMock.verifyAll();
        rootContainerMock.verifyAll();
    }

    function createDialogRenderer(): DialogRenderer {
        return new DialogRenderer(
            domMock.object,
            renderMock.object,
            frameCommunicator.object,
            htmlElementUtilsMock.object,
            windowUtilsMock.object,
            shadowUtilMock.object,
            clientBrowserAdapter.object,
            getRTLMock.object,
        );
    }
});
