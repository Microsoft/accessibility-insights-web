// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ISelection } from 'office-ui-fabric-react/lib/DetailsList';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';

import { IAssessmentsProvider } from '../assessments/types/iassessments-provider';
import { withStoreSubscription } from '../common/components/with-store-subscription';
import { VisualizationConfigurationFactory } from '../common/configs/visualization-configuration-factory';
import { DropdownClickHandler } from '../common/dropdown-click-handler';
import { InspectActionMessageCreator } from '../common/message-creators/inspect-action-message-creator';
import { IStoreActionMessageCreator } from '../common/message-creators/istore-action-message-creator';
import { ScopingActionMessageCreator } from '../common/message-creators/scoping-action-message-creator';
import { IClientStoresHub } from '../common/stores/iclient-stores-hub';
import { FeatureFlagStoreData } from '../common/types/store-data/feature-flag-store-data';
import { IAssessmentStoreData } from '../common/types/store-data/iassessment-result-data';
import { IDetailsViewData } from '../common/types/store-data/idetails-view-data';
import { ITabStoreData } from '../common/types/store-data/itab-store-data';
import { IVisualizationScanResultData } from '../common/types/store-data/ivisualization-scan-result-data';
import { IVisualizationStoreData } from '../common/types/store-data/ivisualization-store-data';
import { IScopingStoreData } from '../common/types/store-data/scoping-store-data';
import { UserConfigurationStoreData } from '../common/types/store-data/user-configuration-store';
import { VisualizationType } from '../common/types/visualization-type';
import { DetailsViewCommandBarDeps } from './components/details-view-command-bar';
import { DetailsViewOverlay, DetailsViewOverlayDeps } from './components/details-view-overlay';
import { DetailsRightPanelConfiguration, GetDetailsRightPanelConfiguration } from './components/details-view-right-panel';
import { GetDetailsSwitcherNavConfiguration } from './components/details-view-switcher-nav';
import { Header, HeaderDeps } from './components/header';
import { IssuesTableHandler } from './components/issues-table-handler';
import { TargetPageClosedView } from './components/target-page-closed-view';
import { DetailsViewMainContent, DetailsViewMainContentDeps } from './details-view-main-content';
import { AssessmentInstanceTableHandler } from './handlers/assessment-instance-table-handler';
import { DetailsViewToggleClickHandlerFactory } from './handlers/details-view-toggle-click-handler-factory';
import { PreviewFeatureFlagsHandler } from './handlers/preview-feature-flags-handler';
import { ReportGenerator } from './reports/report-generator';
import { withThemedBody } from '../common/components/theme-switcher';

export type DetailsViewContainerDeps = {
    getDetailsRightPanelConfiguration: GetDetailsRightPanelConfiguration;
    getDetailsSwitcherNavConfiguration: GetDetailsSwitcherNavConfiguration;
} & DetailsViewMainContentDeps &
    DetailsViewOverlayDeps &
    DetailsViewCommandBarDeps &
    HeaderDeps;

export interface IDetailsViewContainerProps {
    deps: DetailsViewContainerDeps;
    document: Document;
    issuesSelection: ISelection;
    clickHandlerFactory: DetailsViewToggleClickHandlerFactory;
    storeActionCreator: IStoreActionMessageCreator;
    scopingActionMessageCreator: ScopingActionMessageCreator;
    inspectActionMessageCreator: InspectActionMessageCreator;
    visualizationConfigurationFactory: VisualizationConfigurationFactory;
    storesHub: IClientStoresHub<IDetailsViewContainerState>;
    issuesTableHandler: IssuesTableHandler;
    assessmentInstanceTableHandler: AssessmentInstanceTableHandler;
    reportGenerator: ReportGenerator;
    previewFeatureFlagsHandler: PreviewFeatureFlagsHandler;
    scopingFlagsHandler: PreviewFeatureFlagsHandler;
    dropdownClickHandler: DropdownClickHandler;
    assessmentsProvider: IAssessmentsProvider;
    storeState: IDetailsViewContainerState;
}

export interface IDetailsViewContainerState {
    visualizationStoreData: IVisualizationStoreData;
    tabStoreData: ITabStoreData;
    visualizationScanResultStoreData: IVisualizationScanResultData;
    featureFlagStoreData: FeatureFlagStoreData;
    detailsViewStoreData: IDetailsViewData;
    assessmentStoreData: IAssessmentStoreData;
    scopingPanelStateStoreData: IScopingStoreData;
    userConfigurationStoreData: UserConfigurationStoreData;
    selectedDetailsView: VisualizationType;
    selectedDetailsRightPanelConfiguration: DetailsRightPanelConfiguration;
}

export class DetailsViewContainer extends React.Component<IDetailsViewContainerProps> {
    private initialRender: boolean = true;

    public render(): JSX.Element {
        if (this.isTargetPageClosed()) {
            return (
                <div className="table column-layout main-wrapper">
                    {this.renderHeader()}
                    <div className="table column-layout details-view-body">
                        <div className="table row-layout details-view-main-content">
                            <div className="details-content table column-layout">
                                <div className="view" role="main">
                                    <TargetPageClosedView />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (!this.props.storesHub.hasStoreData()) {
            return this.renderSpinner();
        }

        if (this.initialRender) {
            this.props.deps.detailsViewActionMessageCreator.detailsViewOpened(
                this.props.storeState.visualizationStoreData.selectedDetailsViewPivot,
            );
            this.initialRender = false;
        }

        return this.renderContent();
    }

    private isTargetPageClosed() {
        return !this.hasStores() || (this.props.storesHub.hasStoreData() && this.props.storeState.tabStoreData.isClosed);
    }

    private renderSpinner(): JSX.Element {
        return <Spinner className="details-view-spinner" size={SpinnerSize.large} label="Loading..." />;
    }

    private renderContent(): JSX.Element {
        return (
            <div className="table column-layout main-wrapper">
                {this.renderHeader()}
                <div className="table column-layout details-view-body">{this.renderDetailsView()}</div>
                {this.renderOverlay()}
            </div>
        );
    }

    private renderHeader(): JSX.Element {
        const storeState = this.props.storeState;
        const visualizationStoreData = storeState ? storeState.visualizationStoreData : null;
        return (
            <Header
                deps={this.props.deps}
                selectedPivot={visualizationStoreData ? visualizationStoreData.selectedDetailsViewPivot : null}
                featureFlagStoreData={this.hasStores() ? storeState.featureFlagStoreData : null}
                dropdownClickHandler={this.props.dropdownClickHandler}
                tabClosed={this.hasStores() ? this.props.storeState.tabStoreData.isClosed : true}
            />
        );
    }

    private renderOverlay(): JSX.Element {
        const { deps, storeState } = this.props;
        return (
            <DetailsViewOverlay
                deps={deps}
                actionMessageCreator={this.props.deps.detailsViewActionMessageCreator}
                previewFeatureFlagsHandler={this.props.previewFeatureFlagsHandler}
                scopingActionMessageCreator={this.props.scopingActionMessageCreator}
                inspectActionMessageCreator={this.props.inspectActionMessageCreator}
                detailsViewStoreData={storeState.detailsViewStoreData}
                scopingStoreData={storeState.scopingPanelStateStoreData}
                featureFlagStoreData={storeState.featureFlagStoreData}
                userConfigurationStoreData={storeState.userConfigurationStoreData}
            />
        );
    }

    private renderDetailsView(): JSX.Element {
        const { deps, storeState } = this.props;
        const selectedDetailsRightPanelConfiguration = this.props.deps.getDetailsRightPanelConfiguration({
            selectedDetailsViewPivot: storeState.visualizationStoreData.selectedDetailsViewPivot,
            detailsViewRightContentPanel: storeState.detailsViewStoreData.detailsViewRightContentPanel,
        });
        const selectedDetailsViewSwitcherNavConfiguration = this.props.deps.getDetailsSwitcherNavConfiguration({
            selectedDetailsViewPivot: storeState.visualizationStoreData.selectedDetailsViewPivot,
        });
        const selectedTest = selectedDetailsViewSwitcherNavConfiguration.getSelectedDetailsView(storeState);
        return (
            <DetailsViewMainContent
                deps={deps}
                tabStoreData={storeState.tabStoreData}
                assessmentStoreData={storeState.assessmentStoreData}
                featureFlagStoreData={storeState.featureFlagStoreData}
                selectedTest={selectedTest}
                detailsViewStoreData={storeState.detailsViewStoreData}
                visualizationStoreData={storeState.visualizationStoreData}
                visualizationScanResultData={storeState.visualizationScanResultStoreData}
                visualizationConfigurationFactory={this.props.visualizationConfigurationFactory}
                assessmentsProvider={this.props.assessmentsProvider}
                dropdownClickHandler={this.props.dropdownClickHandler}
                clickHandlerFactory={this.props.clickHandlerFactory}
                assessmentInstanceTableHandler={this.props.assessmentInstanceTableHandler}
                issuesSelection={this.props.issuesSelection}
                reportGenerator={this.props.reportGenerator}
                issuesTableHandler={this.props.issuesTableHandler}
                rightPanelConfiguration={selectedDetailsRightPanelConfiguration}
                switcherNavConfiguration={selectedDetailsViewSwitcherNavConfiguration}
            />
        );
    }

    private hasStores(): boolean {
        return this.props.storesHub != null && this.props.storesHub.hasStores();
    }
}

const ThemedDetailsView = withThemedBody<IDetailsViewContainerProps>(DetailsViewContainer, (props: IDetailsViewContainerProps) => {
    const userConfig = props.storeState.userConfigurationStoreData;
    return userConfig && userConfig.enableTelemetry!;
});

export const DetailsView = withStoreSubscription<IDetailsViewContainerProps, IDetailsViewContainerState>(ThemedDetailsView);
