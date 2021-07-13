// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NewTabLink } from 'common/components/new-tab-link';
import { RuleAnalyzerConfiguration } from 'injected/analyzers/analyzer';
import * as React from 'react';
import { AdHocTestkeys } from '../../common/configs/adhoc-test-keys';
import { TestMode } from '../../common/configs/test-mode';
import { VisualizationConfiguration } from '../../common/configs/visualization-configuration';
import { Messages } from '../../common/messages';
import { TelemetryDataFactory } from '../../common/telemetry-data-factory';
import { VisualizationType } from '../../common/types/visualization-type';
import { generateUID } from '../../common/uid-generator';
import { ScannerUtils } from '../../injected/scanner-utils';
import { VisualizationInstanceProcessor } from '../../injected/visualization-instance-processor';

const needsReviewTestKey = AdHocTestkeys.NeedsReview;
const issuesTestKey = AdHocTestkeys.Issues;

const needsReviewRuleAnalyzerConfiguration: RuleAnalyzerConfiguration = {
    rules: [
        'aria-input-field-name',
        'color-contrast',
        'th-has-data-cells',
        'link-in-text-block',
        'label-content-name-mismatch',
    ],
    resultProcessor: (scanner: ScannerUtils) => scanner.getFailingInstances,
    telemetryProcessor: (telemetryFactory: TelemetryDataFactory) =>
        telemetryFactory.forNeedsReviewAnalyzerScan,
    key: needsReviewTestKey,
    testType: VisualizationType.NeedsReview,
    analyzerMessageType: Messages.Visualizations.Common.ScanCompleted,
};

export const NeedsReviewAdHocVisualization: VisualizationConfiguration = {
    key: needsReviewTestKey,
    testMode: TestMode.Adhoc,
    testViewType: 'AdhocNeedsReview',
    getStoreData: data => data.adhoc[needsReviewTestKey],
    enableTest: data => {
        data.adhoc[needsReviewTestKey].enabled = true;
        data.adhoc[issuesTestKey].enabled = false;
    },
    disableTest: data => (data.enabled = false),
    getTestStatus: data => data.enabled,
    shouldShowExportReport: () => false,
    displayableData: {
        title: 'Needs review',
        subtitle: (
            <>
                Sometimes automated checks identify <i>possible</i> accessibility problems that need
                to be reviewed and verified by a human. Because most accessibility problems can only
                be discovered through manual testing, we recommend an{' '}
                <NewTabLink href="https://accessibilityinsights.io/docs/en/web/getstarted/assessment">
                    assessment
                </NewTabLink>
                .
            </>
        ),
        enableMessage: 'Running needs review checks...',
        toggleLabel: 'Show elements needing review',
        linkToDetailsViewText: 'List view and filtering',
    },
    launchPanelDisplayOrder: 6,
    adhocToolsPanelDisplayOrder: 6,
    getAnalyzer: provider =>
        provider.createRuleAnalyzerUnifiedScanForNeedsReview(needsReviewRuleAnalyzerConfiguration),
    getIdentifier: () => needsReviewTestKey,
    visualizationInstanceProcessor: () => VisualizationInstanceProcessor.nullProcessor,
    getNotificationMessage: (selectorMap, key, warnings) => null,
    getDrawer: provider => provider.createHighlightBoxDrawer(),
    getSwitchToTargetTabOnScan: () => false,
    getInstanceIdentiferGenerator: () => generateUID,
};
