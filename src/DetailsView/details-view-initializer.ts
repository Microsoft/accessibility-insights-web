// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { loadTheme } from 'office-ui-fabric-react';
import * as ReactDOM from 'react-dom';

import { AssessmentDefaultMessageGenerator } from '../assessments/assessment-default-message-generator';
import { Assessments } from '../assessments/assessments';
import { assessmentsProviderWithFeaturesEnabled } from '../assessments/assessments-feature-flag-filter';
import { ChromeAdapter } from '../background/browser-adapter';
import { IssueDetailsTextGenerator } from '../background/issue-details-text-generator';
import { A11YSelfValidator } from '../common/a11y-self-validator';
import { AxeInfo } from '../common/axe-info';
import { BugClickHandler } from '../common/bug-click-handler';
import { VisualizationConfigurationFactory } from '../common/configs/visualization-configuration-factory';
import { DateProvider } from '../common/date-provider';
import { DocumentManipulator } from '../common/document-manipulator';
import { DropdownClickHandler } from '../common/dropdown-click-handler';
import { initializeFabricIcons } from '../common/fabric-icons';
import { getAllFeatureFlagDetails } from '../common/feature-flags';
import { getInnerTextFromJsxElement } from '../common/get-inner-text-from-jsx-element';
import { HTMLElementUtils } from '../common/html-element-utils';
import { ITab } from '../common/itab';
import { BugActionMessageCreator } from '../common/message-creators/bug-action-message-creator';
import { ContentActionMessageCreator } from '../common/message-creators/content-action-message-creator';
import { DropdownActionMessageCreator } from '../common/message-creators/dropdown-action-message-creator';
import { InspectActionMessageCreator } from '../common/message-creators/inspect-action-message-creator';
import { ScopingActionMessageCreator } from '../common/message-creators/scoping-action-message-creator';
import { StoreActionMessageCreatorFactory } from '../common/message-creators/store-action-message-creator-factory';
import { UserConfigMessageCreator } from '../common/message-creators/user-config-message-creator';
import { VisualizationActionMessageCreator } from '../common/message-creators/visualization-action-message-creator';
import { NavigatorUtils } from '../common/navigator-utils';
import { AutoChecker } from '../common/self-validator';
import { StoreProxy } from '../common/store-proxy';
import { BaseClientStoresHub } from '../common/stores/base-client-stores-hub';
import { StoreNames } from '../common/stores/store-names';
import { TelemetryDataFactory } from '../common/telemetry-data-factory';
import { TelemetryEventSource } from '../common/telemetry-events';
import { IAssessmentStoreData } from '../common/types/store-data/iassessment-result-data';
import { IDetailsViewData } from '../common/types/store-data/idetails-view-data';
import { IInspectStoreData } from '../common/types/store-data/inspect-store-data';
import { ITabStoreData } from '../common/types/store-data/itab-store-data';
import { IVisualizationScanResultData } from '../common/types/store-data/ivisualization-scan-result-data';
import { IVisualizationStoreData } from '../common/types/store-data/ivisualization-store-data';
import { IScopingStoreData } from '../common/types/store-data/scoping-store-data';
import { UserConfigurationStoreData } from '../common/types/store-data/user-configuration-store';
import { UrlParser } from '../common/url-parser';
import { WindowUtils } from '../common/window-utils';
import { contentPages } from '../content';
import { DetailsDialogHandler } from '../injected/details-dialog-handler';
import { ScannerUtils } from '../injected/scanner-utils';
import { getVersion, scan } from '../scanner/exposed-apis';
import { DetailsViewActionMessageCreator } from './actions/details-view-action-message-creator';
import { IssuesSelectionFactory } from './actions/issues-selection-factory';
import { AssessmentTableColumnConfigHandler } from './components/assessment-table-column-config-handler';
import { GetDetailsRightPanelConfiguration } from './components/details-view-right-panel';
import { GetDetailsSwitcherNavConfiguration } from './components/details-view-switcher-nav';
import { IssuesTableHandler } from './components/issues-table-handler';
import { getStatusForTest } from './components/left-nav/get-status-for-test';
import { LeftNavLinkBuilder } from './components/left-nav/left-nav-link-builder';
import { NavLinkHandler } from './components/left-nav/nav-link-handler';
import { DetailsViewContainerDeps, DetailsViewContainerState } from './details-view-container';
import { DetailsViewRenderer } from './details-view-renderer';
import { DocumentTitleUpdater } from './document-title-updater';
import { AssessmentInstanceTableHandler } from './handlers/assessment-instance-table-handler';
import { DetailsViewToggleClickHandlerFactory } from './handlers/details-view-toggle-click-handler-factory';
import { MasterCheckBoxConfigProvider } from './handlers/master-checkbox-config-provider';
import { PreviewFeatureFlagsHandler } from './handlers/preview-feature-flags-handler';
import { AssessmentReportHtmlGenerator } from './reports/assessment-report-html-generator';
import { AssessmentReportModelBuilderFactory } from './reports/assessment-report-model-builder-factory';
import {
    outcomeStatsFromManualTestStatus,
    outcomeTypeFromTestStatus,
    outcomeTypeSemanticsFromTestStatus,
} from './reports/components/outcome-type';
import {
    getAssessmentSummaryModelFromProviderAndStatusData,
    getAssessmentSummaryModelFromProviderAndStoreData,
} from './reports/get-assessment-summary-model';
import { ReactStaticRenderer } from './reports/react-static-renderer';
import { ReportGenerator } from './reports/report-generator';
import { ReportHtmlGenerator } from './reports/report-html-generator';
import { ReportNameGenerator } from './reports/report-name-generator';

declare const window: AutoChecker & Window;

const chromeAdapter = new ChromeAdapter();
const urlParser = new UrlParser();
const tabId = urlParser.getIntParam(window.location.href, 'tabId');
const dom = document;
const documentElementSetter = new DocumentManipulator(dom);

initializeFabricIcons();

if (isNaN(tabId) === false) {
    chromeAdapter.getTab(
        tabId,
        (tab: ITab): void => {
            if (chromeAdapter.getRuntimeLastError()) {
                const renderer = createNullifiedRenderer(document, ReactDOM.render);
                renderer.render();
            }
            {
                const telemetryFactory = new TelemetryDataFactory();

                const visualizationStore = new StoreProxy<IVisualizationStoreData>(
                    StoreNames[StoreNames.VisualizationStore],
                    chromeAdapter,
                );
                const tabStore = new StoreProxy<ITabStoreData>(StoreNames[StoreNames.TabStore], chromeAdapter);
                const visualizationScanResultStore = new StoreProxy<IVisualizationScanResultData>(
                    StoreNames[StoreNames.VisualizationScanResultStore],
                    chromeAdapter,
                );
                const detailsViewStore = new StoreProxy<IDetailsViewData>(StoreNames[StoreNames.DetailsViewStore], chromeAdapter);
                const assessmentStore = new StoreProxy<IAssessmentStoreData>(StoreNames[StoreNames.AssessmentStore], chromeAdapter);
                const featureFlagStore = new StoreProxy<IDictionaryStringTo<boolean>>(
                    StoreNames[StoreNames.FeatureFlagStore],
                    chromeAdapter,
                );
                const scopingStore = new StoreProxy<IScopingStoreData>(StoreNames[StoreNames.ScopingPanelStateStore], chromeAdapter);
                const inspectStore = new StoreProxy<IInspectStoreData>(StoreNames[StoreNames.InspectStore], chromeAdapter);
                const userConfigStore = new StoreProxy<UserConfigurationStoreData>(
                    StoreNames[StoreNames.UserConfigurationStore],
                    chromeAdapter,
                );
                const storesHub = new BaseClientStoresHub<DetailsViewContainerState>([
                    detailsViewStore,
                    featureFlagStore,
                    tabStore,
                    visualizationScanResultStore,
                    visualizationStore,
                    assessmentStore,
                    scopingStore,
                    userConfigStore,
                ]);

                const actionMessageCreator = new DetailsViewActionMessageCreator(
                    chromeAdapter.sendMessageToFrames,
                    tab.id,
                    telemetryFactory,
                    new WindowUtils(),
                );
                const scopingActionMessageCreator = new ScopingActionMessageCreator(
                    chromeAdapter.sendMessageToFrames,
                    tab.id,
                    telemetryFactory,
                    TelemetryEventSource.DetailsView,
                );
                const inspectActionMessageCreator = new InspectActionMessageCreator(
                    chromeAdapter.sendMessageToFrames,
                    tab.id,
                    telemetryFactory,
                    TelemetryEventSource.DetailsView,
                );
                const dropdownActionMessageCreator = new DropdownActionMessageCreator(
                    chromeAdapter.sendMessageToFrames,
                    tab.id,
                    telemetryFactory,
                );
                const bugActionMessageCreator = new BugActionMessageCreator(chromeAdapter.sendMessageToFrames, tab.id, telemetryFactory);

                const storeActionMessageCreatorFactory = new StoreActionMessageCreatorFactory(chromeAdapter.sendMessageToFrames, tab.id);

                const contentActionMessageCreator = new ContentActionMessageCreator(
                    chromeAdapter.sendMessageToFrames,
                    tab.id,
                    telemetryFactory,
                    TelemetryEventSource.DetailsView,
                );

                const userConfigMessageCreator = new UserConfigMessageCreator(chromeAdapter.sendMessageToFrames, tab.id);
                const storeActionMessageCreator = storeActionMessageCreatorFactory.forDetailsView();

                const visualizationActionCreator = new VisualizationActionMessageCreator(chromeAdapter.sendMessageToFrames, tab.id);
                const issuesSelection = new IssuesSelectionFactory().createSelection(actionMessageCreator);
                const clickHandlerFactory = new DetailsViewToggleClickHandlerFactory(visualizationActionCreator, telemetryFactory);
                const visualizationConfigurationFactory = new VisualizationConfigurationFactory();
                const assessmentDefaultMessageGenerator = new AssessmentDefaultMessageGenerator();
                const dialogHandler = new DetailsDialogHandler(new HTMLElementUtils());
                const assessmentInstanceTableHandler = new AssessmentInstanceTableHandler(
                    actionMessageCreator,
                    new AssessmentTableColumnConfigHandler(new MasterCheckBoxConfigProvider(actionMessageCreator), Assessments),
                    Assessments,
                );
                const issuesTableHandler = new IssuesTableHandler();
                const previewFeatureFlagsHandler = new PreviewFeatureFlagsHandler(getAllFeatureFlagDetails());
                const scopingFlagsHandler = new PreviewFeatureFlagsHandler(getAllFeatureFlagDetails());
                const dropdownClickHandler = new DropdownClickHandler(dropdownActionMessageCreator, TelemetryEventSource.DetailsView);
                const bugClickHandler = new BugClickHandler(bugActionMessageCreator, TelemetryEventSource.DetailsView);

                const extensionVersion = chromeAdapter.getManifest().version;
                const axeVersion = getVersion();
                const reactStaticRenderer = new ReactStaticRenderer();
                const reportNameGenerator = new ReportNameGenerator();
                const reportHtmlGenerator = new ReportHtmlGenerator(
                    reactStaticRenderer,
                    new NavigatorUtils(window.navigator).getBrowserSpec(),
                    extensionVersion,
                    axeVersion,
                );
                const assessmentReportHtmlGenerator = new AssessmentReportHtmlGenerator(
                    reactStaticRenderer,
                    new AssessmentReportModelBuilderFactory(),
                    DateProvider.getDate,
                    extensionVersion,
                    axeVersion,
                    new NavigatorUtils(window.navigator).getBrowserSpec(),
                    assessmentDefaultMessageGenerator,
                );
                const reportGenerator = new ReportGenerator(reportNameGenerator, reportHtmlGenerator, assessmentReportHtmlGenerator);

                visualizationStore.setTabId(tab.id);
                tabStore.setTabId(tab.id);
                visualizationScanResultStore.setTabId(tab.id);
                detailsViewStore.setTabId(tab.id);
                assessmentStore.setTabId(tab.id);
                scopingStore.setTabId(tab.id);
                inspectStore.setTabId(tab.id);

                const actionInitiators = {
                    ...contentActionMessageCreator.initiators,
                };

                const documentTitleUpdater = new DocumentTitleUpdater(
                    tabStore,
                    detailsViewStore,
                    visualizationStore,
                    assessmentStore,
                    GetDetailsRightPanelConfiguration,
                    GetDetailsSwitcherNavConfiguration,
                    visualizationConfigurationFactory,
                    dom,
                );
                documentTitleUpdater.initialize();

                const browserSpec = new NavigatorUtils(window.navigator).getBrowserSpec();
                const issueDetailsTextGenerator = new IssueDetailsTextGenerator(
                    chromeAdapter.extensionVersion,
                    browserSpec,
                    AxeInfo.Default.version,
                );

                const deps: DetailsViewContainerDeps = {
                    dropdownClickHandler,
                    bugClickHandler,
                    contentProvider: contentPages,
                    contentActionMessageCreator,
                    detailsViewActionMessageCreator: actionMessageCreator,
                    assessmentsProvider: Assessments,
                    actionInitiators,
                    assessmentDefaultMessageGenerator: assessmentDefaultMessageGenerator,
                    issueDetailsTextGenerator,
                    windowUtils: new WindowUtils(),
                    getAssessmentSummaryModelFromProviderAndStoreData: getAssessmentSummaryModelFromProviderAndStoreData,
                    getAssessmentSummaryModelFromProviderAndStatusData: getAssessmentSummaryModelFromProviderAndStatusData,
                    visualizationConfigurationFactory,
                    getDetailsRightPanelConfiguration: GetDetailsRightPanelConfiguration,
                    navLinkHandler: new NavLinkHandler(actionMessageCreator),
                    getDetailsSwitcherNavConfiguration: GetDetailsSwitcherNavConfiguration,
                    userConfigMessageCreator,
                    leftNavLinkBuilder: new LeftNavLinkBuilder(),
                    getStatusForTest,
                    outcomeTypeFromTestStatus,
                    outcomeStatsFromManualTestStatus,
                    assessmentsProviderWithFeaturesEnabled,
                    outcomeTypeSemanticsFromTestStatus,
                    getInnerTextFromJsxElement,
                    storeActionMessageCreator,
                    storesHub,
                    loadTheme,
                    urlParser,
                };

                const renderer = new DetailsViewRenderer(
                    deps,
                    dom,
                    ReactDOM.render,
                    scopingActionMessageCreator,
                    inspectActionMessageCreator,
                    issuesSelection,
                    clickHandlerFactory,
                    visualizationConfigurationFactory,
                    issuesTableHandler,
                    assessmentInstanceTableHandler,
                    reportGenerator,
                    previewFeatureFlagsHandler,
                    scopingFlagsHandler,
                    dropdownClickHandler,
                    Assessments,
                    documentElementSetter,
                );
                renderer.render();

                const a11ySelfValidator = new A11YSelfValidator(new ScannerUtils(scan), new HTMLElementUtils());
                window.A11YSelfValidator = a11ySelfValidator;
            }
        },
    );
}

function createNullifiedRenderer(doc, render): DetailsViewRenderer {
    return new DetailsViewRenderer(
        null,
        doc,
        render,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        documentElementSetter,
    );
}
