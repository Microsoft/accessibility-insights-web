// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AppInsights } from 'applicationinsights-js';
import axios from 'axios';
import { remote } from 'electron';
import { WindowStateActionCreator } from 'electron/flux/action-creator/window-state-action-creator';
import { WindowStateActions } from 'electron/flux/action/window-state-actions';
import { WindowStateStore } from 'electron/flux/store/window-state-store';
import { createFetchScanResults } from 'electron/platform/android/fetch-scan-results';
import { RootContainerProps, RootContainerState } from 'electron/views/root-container/components/root-container';
import { WindowFrameUpdater } from 'electron/window-frame-updater';
import * as ReactDOM from 'react-dom';

import { UserConfigurationActions } from '../../background/actions/user-configuration-actions';
import { getPersistedData, PersistedData } from '../../background/get-persisted-data';
import { UserConfigurationActionCreator } from '../../background/global-action-creators/user-configuration-action-creator';
import { IndexedDBDataKeys } from '../../background/IndexedDBDataKeys';
import { InstallationData } from '../../background/installation-data';
import { UserConfigurationStore } from '../../background/stores/global/user-configuration-store';
import { getTelemetryClient } from '../../background/telemetry/telemetry-client-provider';
import { TelemetryEventHandler } from '../../background/telemetry/telemetry-event-handler';
import { TelemetryLogger } from '../../background/telemetry/telemetry-logger';
import { TelemetryStateListener } from '../../background/telemetry/telemetry-state-listener';
import { initializeFabricIcons } from '../../common/fabric-icons';
import { getIndexedDBStore } from '../../common/indexedDB/get-indexeddb-store';
import { IndexedDBAPI, IndexedDBUtil } from '../../common/indexedDB/indexedDB';
import { BaseClientStoresHub } from '../../common/stores/base-client-stores-hub';
import { telemetryAppTitle } from '../../content/strings/application';
import { ElectronAppDataAdapter } from '../adapters/electron-app-data-adapter';
import { ElectronStorageAdapter } from '../adapters/electron-storage-adapter';
import { RiggedFeatureFlagChecker } from '../common/rigged-feature-flag-checker';
import { DeviceConnectActionCreator } from '../flux/action-creator/device-connect-action-creator';
import { DeviceActions } from '../flux/action/device-actions';
import { DeviceStore } from '../flux/store/device-store';
import { ElectronLink } from './device-connect-view/components/electron-link';
import { sendAppInitializedTelemetryEvent } from './device-connect-view/send-app-initialized-telemetry';
import { RootContainerRenderer } from './root-container/root-container-renderer';

initializeFabricIcons();

const indexedDBInstance: IndexedDBAPI = new IndexedDBUtil(getIndexedDBStore());
const userConfigActions = new UserConfigurationActions();
const deviceActions = new DeviceActions();
const windowStateActions = new WindowStateActions();
const storageAdapter = new ElectronStorageAdapter(indexedDBInstance);
const appDataAdapter = new ElectronAppDataAdapter();

const indexedDBDataKeysToFetch = [IndexedDBDataKeys.userConfiguration, IndexedDBDataKeys.installation];

// tslint:disable-next-line:no-floating-promises - top-level entry points are intentionally floating promises
getPersistedData(indexedDBInstance, indexedDBDataKeysToFetch).then((persistedData: Partial<PersistedData>) => {
    const installationData: InstallationData = persistedData.installationData;

    const telemetryLogger = new TelemetryLogger();
    telemetryLogger.initialize(new RiggedFeatureFlagChecker());

    const telemetryClient = getTelemetryClient(
        telemetryAppTitle,
        installationData,
        appDataAdapter,
        telemetryLogger,
        AppInsights,
        storageAdapter,
    );
    const telemetryEventHandler = new TelemetryEventHandler(telemetryClient);

    const userConfigurationStore = new UserConfigurationStore(persistedData.userConfigurationData, userConfigActions, indexedDBInstance);
    userConfigurationStore.initialize();

    const deviceStore = new DeviceStore(deviceActions);
    deviceStore.initialize();

    const windowStateStore = new WindowStateStore(windowStateActions);
    windowStateStore.initialize();

    const currentWindow = remote.getCurrentWindow();
    const windowFrameUpdater = new WindowFrameUpdater(windowStateStore, currentWindow);
    windowFrameUpdater.initialize();

    const storeHub = new BaseClientStoresHub<RootContainerState>([userConfigurationStore, deviceStore, windowStateStore]);

    const telemetryStateListener = new TelemetryStateListener(userConfigurationStore, telemetryEventHandler);
    telemetryStateListener.initialize();

    const fetchScanResults = createFetchScanResults(axios.get);

    const userConfigMessageCreator = new UserConfigurationActionCreator(userConfigActions);

    const deviceConnectActionCreator = new DeviceConnectActionCreator(deviceActions, fetchScanResults, telemetryEventHandler);
    const windowStateActionCreator = new WindowStateActionCreator(windowStateActions);

    const props: RootContainerProps = {
        deps: {
            currentWindow,
            userConfigurationStore,
            deviceStore,
            userConfigMessageCreator,
            windowStateActionCreator,
            LinkComponent: ElectronLink,
            fetchScanResults,
            deviceConnectActionCreator,
            storeHub,
        },
    };

    const renderer = new RootContainerRenderer(ReactDOM.render, document, props);
    renderer.render();

    sendAppInitializedTelemetryEvent(telemetryEventHandler);
});
