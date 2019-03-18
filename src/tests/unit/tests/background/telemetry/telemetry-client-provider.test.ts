// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Mock } from 'typemoq';

import { BrowserAdapter } from '../../../../../background/browser-adapter';
import { ILocalStorageData } from '../../../../../background/storage-data';
import { AppInsightsTelemetryClient } from '../../../../../background/telemetry/app-insights-telemetry-client';
import { NullTelemetryClient } from '../../../../../background/telemetry/null-telemetry-client';
import { getTelemetryClient } from '../../../../../background/telemetry/telemetry-client-provider';
import { TelemetryLogger } from '../../../../../background/telemetry/telemetry-logger';
import { configMutator } from '../../../../../common/configuration';

describe('TelemetryClientProvider', () => {
    beforeEach(configMutator.reset);
    afterAll(configMutator.reset);

    test('with instrumentation key', () => {
        configMutator.setOption('appInsightsInstrumentationKey', 'test-key');

        const browserAdapterMock = Mock.ofType<BrowserAdapter>();

        const manifestStub = {
            version: 'test',
        } as chrome.runtime.Manifest;

        browserAdapterMock.setup(adapter => adapter.getManifest()).returns(() => manifestStub);

        const result = getTelemetryClient(
            {} as ILocalStorageData,
            browserAdapterMock.object,
            Mock.ofType<TelemetryLogger>().object,
            Mock.ofType<Microsoft.ApplicationInsights.IAppInsights>().object,
        );

        expect(result).toBeInstanceOf(AppInsightsTelemetryClient);
    });

    test('without instrumentation key', () => {
        configMutator.setOption('appInsightsInstrumentationKey', null);

        const result = getTelemetryClient(
            {} as ILocalStorageData,
            Mock.ofType<BrowserAdapter>().object,
            Mock.ofType<TelemetryLogger>().object,
            Mock.ofType<Microsoft.ApplicationInsights.IAppInsights>().object,
        );

        expect(result).toBeInstanceOf(NullTelemetryClient);
    });
});
