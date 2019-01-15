// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AppInsights } from 'applicationinsights-js';

import { Assessments } from '../assessments/assessments';
import { VisualizationConfigurationFactory } from '../common/configs/visualization-configuration-factory';
import { DateProvider } from '../common/date-provider';
import { IndexedDBAPI, IndexedDBUtil } from '../common/indexedDB/indexedDB';
import { NotificationCreator } from '../common/notification-creator';
import { TelemetryDataFactory } from '../common/telemetry-data-factory';
import { generateUID } from '../common/uid-generator';
import { UrlValidator } from '../common/url-validator';
import { WindowUtils } from '../common/window-utils';
import { Window } from '../Scripts/Window';
import { ApplicationBuildGenerator } from './application-build-generator';
import { ChromeAdapter } from './browser-adapter';
import { ChromeCommandHandler } from './chrome-command-handler';
import { DetailsViewController } from './details-view-controller';
import { DevToolsListener } from './dev-tools-listener';
import { getPersistedData, PersistedData } from './get-persisted-data';
import { GlobalContextFactory } from './global-context-factory';
import { InstallDataGenerator } from './install-data-generator';
import { deprecatedStorageDataKeys, storageDataKeys } from './local-storage-data-keys';
import { MessageDistributor } from './message-distributor';
import { ILocalStorageData } from './storage-data';
import { TabToContextMap } from './tab-context';
import { TabContextBroadcaster } from './tab-context-broadcaster';
import { TabContextFactory } from './tab-context-factory';
import { TabController } from './tab-controller';
import { TargetTabController } from './target-tab-controller';
import { AppInsightsTelemetryClient } from './telemetry/app-insights-telemetry-client';
import { ApplicationTelemetryDataFactory } from './telemetry/application-telemetry-data-factory';
import { TelemetryEventHandler } from './telemetry/telemetry-event-handler';
import { TelemetryLogger } from './telemetry/telemetry-logger';
import { TelemetryStateListener } from './telemetry/telemetry-state-listener';
import { UserStoredDataCleaner } from './user-stored-data-cleaner';

declare var window: Window;
const browserAdapter = new ChromeAdapter();
const urlValidator = new UrlValidator();
const backgroundInitCleaner = new UserStoredDataCleaner(browserAdapter);

const indexedDBInstance: IndexedDBAPI = new IndexedDBUtil();

backgroundInitCleaner.cleanUserData(deprecatedStorageDataKeys);

// tslint:disable-next-line:no-floating-promises - the initialization entry point is intentionally a floating promise
getPersistedData(indexedDBInstance).then((persistedData: PersistedData) => {
    browserAdapter.getUserData(storageDataKeys, (userData: ILocalStorageData) => {
        const assessmentsProvider = Assessments;
        const applicationBuildGenerator = new ApplicationBuildGenerator();
        const windowUtils = new WindowUtils();
        const telemetryDataFactory = new TelemetryDataFactory();
        const installDataGenerator = new InstallDataGenerator(userData.installationData, generateUID, DateProvider.getDate, browserAdapter);
        const telemetryLogger = new TelemetryLogger();

        const coreTelemetryDataFactory = new ApplicationTelemetryDataFactory(
            browserAdapter,
            applicationBuildGenerator,
            installDataGenerator,
        );

        const appInsightsTelemetry = new AppInsightsTelemetryClient(
            AppInsights,
            coreTelemetryDataFactory,
            telemetryLogger,
        );

        const telemetryEventHandler = new TelemetryEventHandler(
            browserAdapter,
            appInsightsTelemetry,
        );
        const globalContext = GlobalContextFactory.createContext(
            browserAdapter,
            telemetryEventHandler,
            userData,
            assessmentsProvider,
            telemetryDataFactory,
            indexedDBInstance,
            persistedData,
        );
        telemetryLogger.initialize(globalContext.featureFlagsController);

        const telemetryStateListener = new TelemetryStateListener(
            globalContext.stores.userConfigurationStore,
            telemetryEventHandler,
        );
        telemetryStateListener.initialize();

        const broadcaster = new TabContextBroadcaster(browserAdapter.sendMessageToFramesAndTab);
        const detailsViewController = new DetailsViewController(browserAdapter);

        const tabToContextMap: TabToContextMap = {};

        const visualizationConfigurationFactory = new VisualizationConfigurationFactory();
        const notificationCreator = new NotificationCreator(browserAdapter, visualizationConfigurationFactory);

        const chromeCommandHandler = new ChromeCommandHandler(
            tabToContextMap,
            browserAdapter,
            urlValidator,
            notificationCreator,
            visualizationConfigurationFactory,
            telemetryDataFactory,
        );
        chromeCommandHandler.initialize();

        const messageDistributor = new MessageDistributor(globalContext, tabToContextMap, browserAdapter);
        messageDistributor.initialize();

        const targetTabController = new TargetTabController(browserAdapter, visualizationConfigurationFactory);

        const tabContextFactory = new TabContextFactory(
            visualizationConfigurationFactory,
            telemetryEventHandler,
            globalContext.stores.featureFlagStore,
            windowUtils,
            targetTabController,
            globalContext.stores.assessmentStore,
            assessmentsProvider,
        );

        const clientHandler = new TabController(
            tabToContextMap,
            broadcaster,
            browserAdapter,
            detailsViewController,
            tabContextFactory,
        );

        clientHandler.initialize();

        const devToolsBackgroundListener = new DevToolsListener(tabToContextMap, browserAdapter);
        devToolsBackgroundListener.initialize();

        window.insightsFeatureFlags = globalContext.featureFlagsController;
    });
});
