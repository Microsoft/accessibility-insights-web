import { getNotificationMessage } from 'ad-hoc-visualizations/issues/get-notification-message';
import { AdHocTestkeys } from 'common/configs/adhoc-test-keys';
import { TestMode } from 'common/configs/test-mode';
import { VisualizationConfiguration } from 'common/configs/visualization-configuration';
import { Messages } from 'common/messages';
import { TelemetryDataFactory } from 'common/telemetry-data-factory';
import { VisualizationType } from 'common/types/visualization-type';
import { generateUID } from 'common/uid-generator';
import { AdhocIssuesTestView } from 'DetailsView/components/adhoc-issues-test-view';
import { ScannerUtils } from 'injected/scanner-utils';
import { VisualizationInstanceProcessor } from 'injected/visualization-instance-processor';
import * as React from 'react';

export const NeedsReviewAdHocVisualization: VisualizationConfiguration = {
    key: AdHocTestkeys.NeedsReview,
    testMode: TestMode.Adhoc,
    getTestView: props => <AdhocIssuesTestView {...props} />,
    getStoreData: data => data.adhoc.needsReview, //
    enableTest: (data, _) => (data.enabled = true),
    disableTest: data => (data.enabled = false),
    getTestStatus: data => data.enabled,
    displayableData: {
        title: 'Needs Review',
        enableMessage: 'Running needs review checks...',
        toggleLabel: 'Show areas needing review',
        linkToDetailsViewText: 'List view and filtering',
    },
    chromeCommand: '',
    launchPanelDisplayOrder: 6, //
    adhocToolsPanelDisplayOrder: 6,
    getAnalyzer: provider =>
        provider.createRuleAnalyzerUnifiedScanForNeedsReview({
            rules: [
                'aria-input-field-name',
                'color-contrast',
                'td-headers-attr',
                'th-has-data-cells',
            ],
            resultProcessor: (scanner: ScannerUtils) => scanner.getFailingInstances, //
            telemetryProcessor: (
                telemetryFactory: TelemetryDataFactory, //
            ) => telemetryFactory.forIssuesAnalyzerScan,
            key: AdHocTestkeys.NeedsReview,
            testType: VisualizationType.NeedsReview,
            analyzerMessageType: Messages.Visualizations.Common.ScanCompleted,
        }),
    getIdentifier: () => AdHocTestkeys.NeedsReview,
    visualizationInstanceProcessor: () => VisualizationInstanceProcessor.nullProcessor, //
    getNotificationMessage: (
        selectorMap,
        key,
        warnings, //
    ) => getNotificationMessage(selectorMap, warnings),
    getDrawer: provider => provider.createIssuesDrawer(), //
    getSwitchToTargetTabOnScan: () => false,
    getInstanceIdentiferGenerator: () => generateUID, //
};
