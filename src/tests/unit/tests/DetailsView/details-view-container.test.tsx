// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import { ISelection, Selection } from 'office-ui-fabric-react/lib/DetailsList';
import * as React from 'react';
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { DropdownClickHandler } from '../../../../common/dropdown-click-handler';
import { IStoreActionMessageCreator } from '../../../../common/message-creators/istore-action-message-creator';
import { StoreActionMessageCreator } from '../../../../common/message-creators/store-action-message-creator';
import { BaseClientStoresHub } from '../../../../common/stores/base-client-stores-hub';
import { DetailsViewPivotType } from '../../../../common/types/details-view-pivot-type';
import { ITabStoreData } from '../../../../common/types/store-data/itab-store-data';
import { UserConfigurationStoreData } from '../../../../common/types/store-data/user-configuration-store';
import { VisualizationType } from '../../../../common/types/visualization-type';
import { DetailsViewActionMessageCreator } from '../../../../DetailsView/actions/details-view-action-message-creator';
import { DetailsViewOverlay } from '../../../../DetailsView/components/details-view-overlay';
import {
    DetailsRightPanelConfiguration,
    GetDetailsRightPanelConfiguration,
    GetDetailsRightPanelConfigurationProps,
} from '../../../../DetailsView/components/details-view-right-panel';
import {
    DetailsViewSwitcherNavConfiguration,
    GetDetailsSwitcherNavConfiguration,
    GetDetailsSwitcherNavConfigurationProps,
} from '../../../../DetailsView/components/details-view-switcher-nav';
import { Header } from '../../../../DetailsView/components/header';
import { DetailsViewRightContentPanelType } from '../../../../DetailsView/components/left-nav/details-view-right-content-panel-type';
import { GetSelectedDetailsViewProps } from '../../../../DetailsView/components/left-nav/get-selected-details-view';
import {
    DetailsViewContainer,
    DetailsViewContainerDeps,
    DetailsViewContainerProps,
    DetailsViewContainerState,
} from '../../../../DetailsView/details-view-container';
import { DetailsViewMainContent } from '../../../../DetailsView/details-view-main-content';
import { DetailsViewToggleClickHandlerFactory } from '../../../../DetailsView/handlers/details-view-toggle-click-handler-factory';
import { PreviewFeatureFlagsHandler } from '../../../../DetailsView/handlers/preview-feature-flags-handler';
import { DetailsViewStoreDataBuilder } from '../../common/details-view-store-data-builder';
import { TabStoreDataBuilder } from '../../common/tab-store-data-builder';
import { CreateTestAssessmentProviderWithFeatureFlag } from '../../common/test-assessment-provider';
import { VisualizationStoreDataBuilder } from '../../common/visualization-store-data-builder';
import { DetailsViewContainerPropsBuilder } from './details-view-container-props-builder';
import { StoreMocks } from './store-mocks';

describe('DetailsViewContainer', () => {
    let detailsViewActionMessageCreator: IMock<DetailsViewActionMessageCreator>;
    let deps: DetailsViewContainerDeps;
    let getDetailsRightPanelConfiguration: IMock<GetDetailsRightPanelConfiguration>;
    let getDetailsSwitcherNavConfiguration: IMock<GetDetailsSwitcherNavConfiguration>;

    beforeEach(() => {
        detailsViewActionMessageCreator = Mock.ofType<DetailsViewActionMessageCreator>();
        getDetailsRightPanelConfiguration = Mock.ofInstance((props: GetDetailsRightPanelConfigurationProps) => null, MockBehavior.Strict);
        getDetailsSwitcherNavConfiguration = Mock.ofInstance((props: GetDetailsSwitcherNavConfigurationProps) => null, MockBehavior.Strict);
        deps = {
            detailsViewActionMessageCreator: detailsViewActionMessageCreator.object,
            getDetailsRightPanelConfiguration: getDetailsRightPanelConfiguration.object,
            getDetailsSwitcherNavConfiguration: getDetailsSwitcherNavConfiguration.object,
        } as DetailsViewContainerDeps;
    });

    const assessmentProviderMock = Mock.ofInstance(CreateTestAssessmentProviderWithFeatureFlag());

    describe('render', () => {
        it('renders spinner when stores not ready', () => {
            const detailsViewStoreActionMessageCreatorMock = Mock.ofType(StoreActionMessageCreator, MockBehavior.Strict);
            detailsViewStoreActionMessageCreatorMock.setup(amc => amc.getAllStates()).verifiable(Times.once());

            const storeMocks = new StoreMocks()
                .setDetailsViewStoreData(null)
                .setVisualizationStoreData(null)
                .setUserConfigurationStoreData({ enableTelemetry: true } as UserConfigurationStoreData);

            const props = new DetailsViewContainerPropsBuilder(deps)
                .setStoreMocks(storeMocks)
                .setStoresHubMock(createStoresHubMock(storeMocks, true, false).object)
                .setDetailsViewStoreActionMessageCreator(detailsViewStoreActionMessageCreatorMock.object)
                .build();

            const testObject = shallow(<DetailsViewContainer {...props} />);

            expect(testObject.getElement()).toMatchSnapshot();
        });
    });

    describe('renderContent', () => {
        it('renders normally', () => {
            const viewType = -1;
            testRenderStaticContent(viewType, false);
        });

        it('renders TargetPageClosedView when target page closed', () => {
            const props = new DetailsViewContainerPropsBuilder(null).build();
            const rendered = shallow(<DetailsViewContainer {...props} />);
            expect(rendered.debug()).toMatchSnapshot();
        });

        it('shows target tab was closed when stores are not loaded', () => {
            const storeActionCreator = Mock.ofType(StoreActionMessageCreator, MockBehavior.Strict);

            const visualizationStoreData = new VisualizationStoreDataBuilder()
                .with('selectedAdhocDetailsView', VisualizationType.Issues)
                .build();

            setupActionMessageCreatorMock(detailsViewActionMessageCreator, visualizationStoreData.selectedDetailsViewPivot, 1);

            const tabStoreData: ITabStoreData = {
                title: 'DetailsViewContainerTest title',
                url: 'http://detailsViewContainerTest/url/',
                id: 1,
                isClosed: true,
                isChanged: false,
                isPageHidden: false,
            };

            const storeMocks = new StoreMocks().setVisualizationStoreData(visualizationStoreData).setTabStoreData(tabStoreData);

            const detailsViewStoreActionCreatorMock = Mock.ofType<IStoreActionMessageCreator>();

            const props = new DetailsViewContainerPropsBuilder(deps)
                .setStoreMocks(storeMocks)
                .setStoreActionMessageCreator(storeActionCreator.object)
                .setDetailsViewStoreActionMessageCreator(detailsViewStoreActionCreatorMock.object)
                .setStoresHubMock(createStoresHubMock(storeMocks, false).object)
                .build();

            const rendered = shallow(<DetailsViewContainer {...props} />);
            expect(rendered.debug()).toMatchSnapshot();
        });

        it('render twice; should not call details view opened on 2nd render', () => {
            const storeActionCreator = Mock.ofType(StoreActionMessageCreator, MockBehavior.Strict);
            const clickHandlerFactoryMock = Mock.ofType(DetailsViewToggleClickHandlerFactory);
            const getSelectedDetailsViewMock = Mock.ofInstance((theProps: GetSelectedDetailsViewProps) => null, MockBehavior.Strict);
            const rightContentPanelType = 'TestView';
            const viewType = VisualizationType.Headings;
            const switcherNavConfig = {
                getSelectedDetailsView: getSelectedDetailsViewMock.object,
            } as DetailsViewSwitcherNavConfiguration;

            const visualizationStoreData = new VisualizationStoreDataBuilder().build();
            const detailsViewState = new DetailsViewStoreDataBuilder().withDetailsViewRightContentPanel(rightContentPanelType).build();
            const tabStoreData = new TabStoreDataBuilder().with('isClosed', false).build();

            setupGetDetailsRightPanelConfiguration(rightContentPanelType, visualizationStoreData.selectedDetailsViewPivot, null);
            setupGetSwitcherNavConfiguration(visualizationStoreData.selectedDetailsViewPivot, switcherNavConfig);
            setupActionMessageCreatorMock(detailsViewActionMessageCreator, visualizationStoreData.selectedDetailsViewPivot, 1);

            const storeMocks = new StoreMocks()
                .setVisualizationStoreData(visualizationStoreData)
                .setTabStoreData(tabStoreData)
                .setDetailsViewStoreData(detailsViewState);

            const props = new DetailsViewContainerPropsBuilder(deps)
                .setStoreMocks(storeMocks)
                .setStoreActionMessageCreator(storeActionCreator.object)
                .setClickHandlerFactory(clickHandlerFactoryMock.object)
                .setStoresHubMock(createStoresHubMock(storeMocks).object)
                .build();

            const testObject = new DetailsViewContainer(props);
            const state = getState(storeMocks, -1, null);
            testObject.state = getState(storeMocks, -1, null);

            getSelectedDetailsViewMock
                .setup(gsdvm =>
                    gsdvm(
                        It.isObjectWith({
                            assessmentStoreData: state.assessmentStoreData,
                            visualizationStoreData: state.visualizationStoreData,
                        }),
                    ),
                )
                .returns(() => viewType);

            testObject.render();

            detailsViewActionMessageCreator.verifyAll();
            detailsViewActionMessageCreator.reset();
            setupActionMessageCreatorMock(detailsViewActionMessageCreator, visualizationStoreData.selectedDetailsViewPivot, 0);

            testObject.render();
            detailsViewActionMessageCreator.verifyAll();
        });

        it('shows target tab for nonsupported type', () => {
            const unsupportedType = null;

            const toggleClickHandlerMock = Mock.ofInstance(event => {});
            const clickHandlerFactoryMock = Mock.ofType(DetailsViewToggleClickHandlerFactory);
            const storeActionCreator = Mock.ofType(StoreActionMessageCreator, MockBehavior.Strict);

            const visualizationStoreData = new VisualizationStoreDataBuilder().with('selectedAdhocDetailsView', unsupportedType).build();

            const storeMocks = new StoreMocks().setDetailsViewStoreData(null).setVisualizationStoreData(visualizationStoreData);

            const props = new DetailsViewContainerPropsBuilder(deps)
                .setStoreMocks(storeMocks)
                .setClickHandlerFactory(clickHandlerFactoryMock.object)
                .setStoreActionMessageCreator(storeActionCreator.object)
                .setStoresHubMock(createStoresHubMock(storeMocks, false).object)
                .build();

            clickHandlerFactoryMock
                .setup(factory => factory.createClickHandler(It.isAny(), It.isAny()))
                .returns(() => toggleClickHandlerMock.object)
                .verifiable(Times.never());

            const testObject = new DetailsViewContainer(props);
            expect(testObject.render).toThrow();
            clickHandlerFactoryMock.verifyAll();
        });
    });

    function createStoresHubMock(storeMocks: StoreMocks, hasStores = true, hasStoreData = true): IMock<BaseClientStoresHub<any>> {
        const storesHubMock = Mock.ofType(BaseClientStoresHub);
        storesHubMock.setup(s => s.hasStores()).returns(() => hasStores);
        storesHubMock.setup(s => s.hasStoreData()).returns(() => hasStoreData);
        storesHubMock.setup(s => s.addChangedListenerToAllStores(It.isAny())).verifiable();
        storesHubMock.setup(s => s.removeChangedListenerFromAllStores(It.isAny())).verifiable();

        storesHubMock
            .setup(s => s.getAllStoreData())
            .returns(() => {
                return (
                    storeMocks && {
                        visualizationStoreData: storeMocks.visualizationStoreData,
                        tabStoreData: storeMocks.tabStoreData,
                        visualizationScanResultStoreData: storeMocks.visualizationScanResultsStoreData,
                        featureFlagStoreData: storeMocks.featureFlagStoreData,
                        detailsViewStoreData: storeMocks.detailsViewStoreData,
                        assessmentStoreData: storeMocks.assessmentStoreData,
                        scopingPanelStateStoreData: storeMocks.scopingStoreData,
                        userConfigurationStoreData: storeMocks.userConfigurationStoreData,
                    }
                );
            });
        return storesHubMock;
    }

    function buildDetailsViewMainContent(
        storeMocks: StoreMocks,
        props: DetailsViewContainerProps,
        selectedDetailsView: VisualizationType,
        rightPanelConfiguration: DetailsRightPanelConfiguration,
        switcherNavConfiguration: DetailsViewSwitcherNavConfiguration,
    ): JSX.Element {
        const issueTrackerPath = storeMocks.userConfigurationStoreData.bugServicePropertiesMap.gitHub.repository;
        return (
            <DetailsViewMainContent
                deps={deps}
                tabStoreData={storeMocks.tabStoreData}
                assessmentStoreData={storeMocks.assessmentStoreData}
                featureFlagStoreData={storeMocks.featureFlagStoreData}
                selectedTest={selectedDetailsView}
                detailsViewStoreData={storeMocks.detailsViewStoreData}
                visualizationStoreData={storeMocks.visualizationStoreData}
                visualizationScanResultData={storeMocks.visualizationScanResultsStoreData}
                visualizationConfigurationFactory={props.visualizationConfigurationFactory}
                assessmentsProvider={props.assessmentsProvider}
                dropdownClickHandler={props.dropdownClickHandler}
                clickHandlerFactory={props.clickHandlerFactory}
                assessmentInstanceTableHandler={props.assessmentInstanceTableHandler}
                issuesSelection={props.issuesSelection}
                reportGenerator={props.reportGenerator}
                issuesTableHandler={props.issuesTableHandler}
                issueTrackerPath={issueTrackerPath}
                rightPanelConfiguration={rightPanelConfiguration}
                switcherNavConfiguration={switcherNavConfiguration}
            />
        );
    }

    function setupGetDetailsRightPanelConfiguration(
        type: DetailsViewRightContentPanelType,
        selectedPivot: DetailsViewPivotType,
        returnConfiguration: DetailsRightPanelConfiguration,
    ): void {
        const expected: GetDetailsRightPanelConfigurationProps = {
            selectedDetailsViewPivot: selectedPivot,
            detailsViewRightContentPanel: type,
        };
        getDetailsRightPanelConfiguration.setup(gtrpc => gtrpc(It.isValue(expected))).returns(() => returnConfiguration);
    }

    function setupGetSwitcherNavConfiguration(
        selectedPivot: DetailsViewPivotType,
        returnConfiguration: DetailsViewSwitcherNavConfiguration,
    ): void {
        const expected: GetDetailsSwitcherNavConfigurationProps = {
            selectedDetailsViewPivot: selectedPivot,
        };
        getDetailsSwitcherNavConfiguration.setup(gtrpc => gtrpc(It.isValue(expected))).returns(() => returnConfiguration);
    }

    function buildOverlay(storeMocks: StoreMocks, props: DetailsViewContainerProps): JSX.Element {
        return (
            <DetailsViewOverlay
                deps={props.deps}
                actionMessageCreator={props.deps.detailsViewActionMessageCreator}
                previewFeatureFlagsHandler={props.previewFeatureFlagsHandler}
                scopingActionMessageCreator={props.scopingActionMessageCreator}
                inspectActionMessageCreator={props.inspectActionMessageCreator}
                detailsViewStoreData={storeMocks.detailsViewStoreData}
                scopingStoreData={storeMocks.scopingStoreData}
                featureFlagStoreData={storeMocks.featureFlagStoreData}
                userConfigurationStoreData={storeMocks.userConfigurationStoreData}
            />
        );
    }

    function setupActionMessageCreatorMock(
        mock: IMock<DetailsViewActionMessageCreator>,
        pivot: DetailsViewPivotType,
        timesCalled: number,
    ): void {
        mock.setup(acm => acm.detailsViewOpened(pivot)).verifiable(Times.exactly(timesCalled));
    }

    function getState(
        storeMocks: StoreMocks,
        viewType: VisualizationType,
        rightPanel: DetailsRightPanelConfiguration,
    ): DetailsViewContainerState {
        return {
            visualizationStoreData: storeMocks.visualizationStoreData,
            tabStoreData: storeMocks.tabStoreData,
            featureFlagStoreData: storeMocks.featureFlagStoreData,
            detailsViewStoreData: storeMocks.detailsViewStoreData,
            assessmentStoreData: storeMocks.assessmentStoreData,
            userConfigurationStoreData: storeMocks.userConfigurationStoreData,
            visualizationScanResultStoreData: storeMocks.visualizationScanResultsStoreData,
            scopingPanelStateStoreData: storeMocks.scopingSelectorsData,
            selectedDetailsView: viewType,
            selectedDetailsRightPanelConfiguration: rightPanel,
        };
    }

    function testRenderStaticContent(viewType: VisualizationType, isPreviewFeaturesOpen: boolean): void {
        const selectionMock = Mock.ofType<ISelection>(Selection);
        const clickHandlerFactoryMock = Mock.ofType(DetailsViewToggleClickHandlerFactory);
        const previewFeatureFlagsHandlerMock = Mock.ofType(PreviewFeatureFlagsHandler);
        const dropdownClickHandler = Mock.ofType(DropdownClickHandler);
        const getSelectedDetailsViewMock = Mock.ofInstance((theProps: GetSelectedDetailsViewProps) => null, MockBehavior.Strict);
        const rightContentPanelType = 'TestView';
        const rightContentPanelConfig = {} as DetailsRightPanelConfiguration;
        const switcherNavConfig = {
            getSelectedDetailsView: getSelectedDetailsViewMock.object,
        } as DetailsViewSwitcherNavConfiguration;

        const visualizationStoreData = new VisualizationStoreDataBuilder()
            .withSelectedDetailsViewPivot(DetailsViewPivotType.fastPass)
            .with('selectedAdhocDetailsView', viewType)
            .build();

        setupActionMessageCreatorMock(detailsViewActionMessageCreator, visualizationStoreData.selectedDetailsViewPivot, 1);

        setupGetDetailsRightPanelConfiguration(
            rightContentPanelType,
            visualizationStoreData.selectedDetailsViewPivot,
            rightContentPanelConfig,
        );

        setupGetSwitcherNavConfiguration(visualizationStoreData.selectedDetailsViewPivot, switcherNavConfig);

        const detailsViewState = new DetailsViewStoreDataBuilder()
            .withPreviewFeaturesOpen(isPreviewFeaturesOpen)
            .withDetailsViewRightContentPanel(rightContentPanelType)
            .build();

        const userConfigurationStoreData: UserConfigurationStoreData = {
            isFirstTime: false,
            enableTelemetry: true,
            enableHighContrast: false,
            bugService: 'gitHub',
            bugServicePropertiesMap: { gitHub: { repository: 'gitHub-repository' } },
        };

        const storeMocks = new StoreMocks()
            .setVisualizationStoreData(visualizationStoreData)
            .setDetailsViewStoreData(detailsViewState)
            .setUserConfigurationStoreData(userConfigurationStoreData);

        const storesHubMock = createStoresHubMock(storeMocks);

        const props = new DetailsViewContainerPropsBuilder(deps)
            .setStoreMocks(storeMocks)
            .setDropdownClickHandler(dropdownClickHandler.object)
            .setIssuesSelection(selectionMock.object)
            .setClickHandlerFactory(clickHandlerFactoryMock.object)
            .setPreviewFeatureFlagsHandler(previewFeatureFlagsHandlerMock.object)
            .setAssessmentProvider(assessmentProviderMock.object)
            .setStoresHubMock(storesHubMock.object)
            .build();

        const testObject = new DetailsViewContainer(props);
        const state = getState(storeMocks, viewType, rightContentPanelConfig);
        testObject.state = state;

        getSelectedDetailsViewMock
            .setup(gsdvm =>
                gsdvm(
                    It.isObjectWith({
                        assessmentStoreData: state.assessmentStoreData,
                        visualizationStoreData: state.visualizationStoreData,
                    }),
                ),
            )
            .returns(() => viewType);

        const expected: JSX.Element = (
            <div className="table column-layout main-wrapper">
                <Header
                    deps={props.deps}
                    selectedPivot={DetailsViewPivotType.fastPass}
                    featureFlagStoreData={storeMocks.featureFlagStoreData}
                    dropdownClickHandler={dropdownClickHandler.object}
                    tabClosed={storeMocks.tabStoreData.isClosed}
                />
                <div className="table column-layout details-view-body">
                    {buildDetailsViewMainContent(storeMocks, props, viewType, rightContentPanelConfig, switcherNavConfig)}
                </div>
                {buildOverlay(storeMocks, props)}
            </div>
        );

        expect(testObject.render()).toEqual(expected);

        clickHandlerFactoryMock.verifyAll();
    }
});
