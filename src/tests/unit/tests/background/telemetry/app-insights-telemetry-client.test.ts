// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as _ from 'lodash';
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { AppInsightsTelemetryClient, ExtendedEnvelop } from '../../../../../background/telemetry/app-insights-telemetry-client';
import { ApplicationTelemetryDataFactory } from '../../../../../background/telemetry/application-telemetry-data-factory';
import { TelemetryLogger } from '../../../../../background/telemetry/telemetry-logger';
import { configMutator } from '../../../../../common/configuration';

type TrackEventType = (name: string, properties?: Object) => void;

describe('AppInsights telemetry client tests', () => {
    const applicationBuildStub: string = 'application build id';
    const installationId: string = 'some id';

    let addTelemetryInitializerStrictMock: IMock<(callback) => void>;
    let appInsightsStrictMock: IMock<Microsoft.ApplicationInsights.IAppInsights>;
    let coreTelemetryDataFactoryMock: IMock<ApplicationTelemetryDataFactory>;

    let loggerMock: IMock<TelemetryLogger>;
    let testSubject: AppInsightsTelemetryClient;
    const aiKey: string = 'ai key';
    let queue: Array<() => void>;
    let addTelemetryInitializerCallback: (envelope: ExtendedEnvelop) => boolean;
    let aiConfig: Microsoft.ApplicationInsights.IConfig;
    const coreTelemetryData = {
        coreProp1: 'some value',
        coreProp2: 2,
    };

    afterEach(() => {
        configMutator.reset();
    });

    beforeEach(() => {
        queue = [];
        aiConfig = {};
        configMutator.setOption('appInsightsInstrumentationKey', aiKey);
        addTelemetryInitializerStrictMock = Mock.ofInstance(callback => { }, MockBehavior.Strict);

        loggerMock = Mock.ofType<TelemetryLogger>();
        loggerMock
            .setup(l => l.log(It.isAny()));


        appInsightsStrictMock = Mock.ofType<Microsoft.ApplicationInsights.IAppInsights>(null, MockBehavior.Strict);
        coreTelemetryDataFactoryMock = Mock.ofType<ApplicationTelemetryDataFactory>();

        coreTelemetryDataFactoryMock
            .setup(c => c.getData())
            .returns(() => _.cloneDeep(coreTelemetryData as any));

        testSubject = new AppInsightsTelemetryClient(
            appInsightsStrictMock.object,
            coreTelemetryDataFactoryMock.object,
            loggerMock.object,
        );
    });

    describe('enableTelemetry', () => {
        test('verify download & setup', () => {
            invokeFirstEnableTelemetryCall();

            appInsightsStrictMock.verifyAll();
        });

        test('verify telemetryInitializer on callback', () => {
            invokeFirstEnableTelemetryCallWithCallbacks();

            addTelemetryInitializerStrictMock.verifyAll();

            const extendedEnvelopStub = getEnvelopStub();

            const returnVal = addTelemetryInitializerCallback(extendedEnvelopStub as any);

            expect(returnVal).toBe(true);
            verifyBaseDataProperties(extendedEnvelopStub);
        });

        test('verify disableTelemetry config on callback', () => {
            aiConfig.disableTelemetry = true;

            invokeFirstEnableTelemetryCall();
            expect(aiConfig).toEqual({ disableTelemetry: true } as Microsoft.ApplicationInsights.IConfig);

            invokeCallbacksForFirstEnableTelemetryCall();

            expect(aiConfig).toEqual({ disableTelemetry: false } as Microsoft.ApplicationInsights.IConfig);
        });

        test('2nd call after initialization - queue null', () => {
            invokeFirstEnableTelemetryCallWithCallbacks();

            testSubject.disableTelemetry();
            invokeAllFunctionsInQueue();
            queue = null;

            expect(aiConfig).toEqual({ disableTelemetry: true } as Microsoft.ApplicationInsights.IConfig);

            testSubject.enableTelemetry();

            expect(aiConfig).toEqual({ disableTelemetry: false } as Microsoft.ApplicationInsights.IConfig);
        });

        test('2nd call before initialization completed - queue not null', () => {
            invokeFirstEnableTelemetryCallWithCallbacks();
            testSubject.disableTelemetry();
            invokeAllFunctionsInQueue();
            queue = [];

            testSubject.enableTelemetry();
            expect(aiConfig).toEqual({ disableTelemetry: true } as Microsoft.ApplicationInsights.IConfig);

            invokeAllFunctionsInQueue();

            expect(aiConfig).toEqual({ disableTelemetry: false } as Microsoft.ApplicationInsights.IConfig);
        });


        test('do nothing if already enabled', () => {
            appInsightsStrictMock.setup(ai => ai.config).returns(() => aiConfig);
            invokeFirstEnableTelemetryCall();

            appInsightsStrictMock.reset();
            addTelemetryInitializerStrictMock.reset();
            queue = [];

            testSubject.enableTelemetry();
            expect(queue.length).toBe(0);
        });
    });

    describe('disableTelemetry', () => {
        test('do nothing if already disabled', () => {
            testSubject.disableTelemetry();

            expect(queue.length).toBe(0);
        });

        test('when initialization in progress (queue not null)', () => {
            const aiConfig = { disableTelemetry: false } as Microsoft.ApplicationInsights.IConfig;
            invokeFirstEnableTelemetryCall();
            queue = [];

            appInsightsStrictMock.setup(ai => ai.config).returns(() => aiConfig);

            testSubject.disableTelemetry();

            expect(aiConfig.disableTelemetry).toBe(false);
            expect(queue.length).toBe(1);
            invokeAllFunctionsInQueue();

            expect(aiConfig.disableTelemetry).toBe(true);
        });


        test('when initialization has completed (queue is null)', () => {
            invokeFirstEnableTelemetryCallWithCallbacks();

            queue = null;

            setupAppInsightsConfig();
            setupAppInsightsQueue();

            testSubject.disableTelemetry();

            expect(aiConfig.disableTelemetry).toBe(true);
        });
    });

    describe('trackEvent', () => {
        test('calls appInsights trackEvent', () => {
            invokeFirstEnableTelemetryCallWithCallbacks();

            const eventName: string = 'testEvent';
            const eventObject = {
                test: 'a',
            };

            appInsightsStrictMock
                .setup(ai => ai.trackEvent(eventName, eventObject))
                .verifiable(Times.once());

            testSubject.trackEvent(eventName, eventObject);

            appInsightsStrictMock.verifyAll();
        });

        test('do nothing if not initialized', () => {
            const eventName: string = 'testEvent';
            const eventObject = {
                test: 'a',
            };

            testSubject.trackEvent(eventName, eventObject);
        });
    });

    function verifyBaseDataProperties(extendedEnvelop: ExtendedEnvelop) {
        expect(extendedEnvelop.data.baseData.properties)
            .toMatchObject(coreTelemetryData);

        expect(extendedEnvelop.data.baseData)
            .toMatchObject(getEnvelopStub().data.baseData);
    }

    function setupAddTelemetryInitializerCall() {
        addTelemetryInitializerStrictMock
            .setup(x =>
                x(
                    It.is(param => {
                        return typeof param === 'function';
                    }),
                ),
            )
            .returns(callback => {
                addTelemetryInitializerCallback = callback;
            }).verifiable(Times.once());
    }


    function getEnvelopStub(): ExtendedEnvelop {
        return {
            data: {
                baseData: {
                    properties: {
                        someProp1: '',
                    } as any,
                },
            },
        } as ExtendedEnvelop;
    }

    function setupAppInsightsContext() {
        appInsightsStrictMock
            .setup(ai => ai.context)
            .returns(() => getAppInsightsContext() as any);
    }

    function getAppInsightsContext() {
        return {
            addTelemetryInitializer: addTelemetryInitializerStrictMock.object,
            user: {
                id: null,
            },
        };
    }

    function setupAppInsightsDownloadAndSetupCall() {
        appInsightsStrictMock
            .setup(ai =>
                ai.downloadAndSetup(
                    It.isValue({
                        instrumentationKey: aiKey,
                        disableTelemetry: true,
                        disableAjaxTracking: true,
                    } as Microsoft.ApplicationInsights.IConfig)))
            .verifiable(Times.once());
    }

    function invokeFirstEnableTelemetryCall() {
        setupAppInsightsQueue();
        setupAppInsightsDownloadAndSetupCall();

        testSubject.enableTelemetry();
    }

    function invokeFirstEnableTelemetryCallWithCallbacks() {
        invokeFirstEnableTelemetryCall();
        invokeCallbacksForFirstEnableTelemetryCall();
    }

    function invokeCallbacksForFirstEnableTelemetryCall() {
        setupAppInsightsContext();
        setupAddTelemetryInitializerCall();
        setupAppInsightsConfig();

        expect(queue.length).toBe(2);
        invokeAllFunctionsInQueue();
    }

    function invokeAllFunctionsInQueue() {
        queue.forEach(q => q());
        queue = [];
    }

    function setupAppInsightsQueue() {
        appInsightsStrictMock
            .setup(ai => ai.queue)
            .returns(() => queue)
            .verifiable(Times.atLeast(1));
    }

    function setupAppInsightsConfig() {
        appInsightsStrictMock.setup(ai => ai.config).returns(() => aiConfig);
    }
});

