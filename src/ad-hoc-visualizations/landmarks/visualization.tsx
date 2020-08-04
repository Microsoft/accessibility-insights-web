// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AdHocTestkeys } from 'common/configs/adhoc-test-keys';
import { TestMode } from 'common/configs/test-mode';
import { VisualizationConfiguration } from 'common/configs/visualization-configuration';
import { Messages } from 'common/messages';
import { TelemetryDataFactory } from 'common/telemetry-data-factory';
import { VisualizationType } from 'common/types/visualization-type';
import { generateUID } from 'common/uid-generator';
import { adhoc as content } from 'content/adhoc';
import { AdhocStaticTestView } from 'DetailsView/components/adhoc-static-test-view';
import { RuleAnalyzerConfiguration } from 'injected/analyzers/analyzer';
import { ScannerUtils } from 'injected/scanner-utils';
import { VisualizationInstanceProcessor } from 'injected/visualization-instance-processor';
import { isEmpty } from 'lodash';
import * as React from 'react';

const { guidance } = content.landmarks;

const landmarkRuleAnalyzerConfiguration: RuleAnalyzerConfiguration = {
    rules: ['unique-landmark'],
    resultProcessor: (scanner: ScannerUtils) => scanner.getAllCompletedInstances,
    telemetryProcessor: (telemetryFactory: TelemetryDataFactory) => telemetryFactory.forTestScan,
    key: AdHocTestkeys.Landmarks,
    testType: VisualizationType.Landmarks,
    analyzerMessageType: Messages.Visualizations.Common.ScanCompleted,
};

export const LandmarksAdHocVisualization: VisualizationConfiguration = {
    getTestView: props => <AdhocStaticTestView {...props} />,
    key: AdHocTestkeys.Landmarks,
    testMode: TestMode.Adhoc,
    getStoreData: data => data.adhoc.landmarks,
    enableTest: (data, _) => (data.enabled = true),
    disableTest: data => (data.enabled = false),
    getTestStatus: data => data.enabled,
    shouldShowExportReport: () => false,
    displayableData: {
        title: 'Landmarks',
        enableMessage: 'Finding landmarks...',
        toggleLabel: 'Show landmarks',
        linkToDetailsViewText: 'How to test landmarks',
    },
    chromeCommand: '02_toggle-landmarks',
    launchPanelDisplayOrder: 2,
    adhocToolsPanelDisplayOrder: 4,
    getAnalyzer: provider => provider.createRuleAnalyzer(landmarkRuleAnalyzerConfiguration),
    getIdentifier: () => AdHocTestkeys.Landmarks,
    visualizationInstanceProcessor: () => VisualizationInstanceProcessor.nullProcessor,
    getNotificationMessage: selectorMap => (isEmpty(selectorMap) ? 'No landmarks found' : null),
    getDrawer: provider => provider.createLandmarksDrawer(),
    getSwitchToTargetTabOnScan: () => false,
    getInstanceIdentiferGenerator: () => generateUID,
    guidance,
};
