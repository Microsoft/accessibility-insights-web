// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IsResultHighlightUnavailable } from 'common/is-result-highlight-unavailable';
import { BaseClientStoresHub } from 'common/stores/base-client-stores-hub';
import { DetailsViewPivotType } from 'common/types/details-view-pivot-type';
import { TargetAppData, ToolData } from 'common/types/store-data/unified-data-interface';
import { DetailsViewActionMessageCreator } from 'DetailsView/actions/details-view-action-message-creator';
import {
    DetailsViewContainer,
    DetailsViewContainerDeps,
    DetailsViewContainerProps,
} from 'DetailsView/details-view-container';
import { shallow } from 'enzyme';
import * as React from 'react';
import { IMock, Mock, Times } from 'typemoq';

describe('DetailsViewContainer', () => {
    const pageTitle = 'DetailsViewContainerTest title';
    const pageUrl = 'http://detailsViewContainerTest/url/';
    let detailsViewActionMessageCreator: IMock<DetailsViewActionMessageCreator>;
    let deps: DetailsViewContainerDeps;
    let targetAppInfo: TargetAppData;
    let isResultHighlightUnavailableStub: IsResultHighlightUnavailable;
    let timestamp: string;
    let toolData: ToolData;

    beforeEach(() => {
        detailsViewActionMessageCreator = Mock.ofType(DetailsViewActionMessageCreator);
        isResultHighlightUnavailableStub = () => null;
        timestamp = 'timestamp';
        targetAppInfo = {
            name: pageTitle,
            url: pageUrl,
        };
        toolData = {
            applicationProperties: { name: 'some app' },
        } as ToolData;
        deps = {
            detailsViewActionMessageCreator: detailsViewActionMessageCreator.object,
            isResultHighlightUnavailable: isResultHighlightUnavailableStub,
        } as DetailsViewContainerDeps;
    });

    describe('render', () => {
        it('renders spinner when stores not ready', () => {
            const storesHubMock = Mock.ofType(BaseClientStoresHub);

            const props: DetailsViewContainerProps = {
                storeState: null,
                deps: {
                    storesHub: storesHubMock.object,
                },
            } as DetailsViewContainerProps;

            storesHubMock.setup(mock => mock.hasStores()).returns(() => true);
            storesHubMock.setup(mock => mock.hasStoreData()).returns(() => false);

            const rendered = shallow(<DetailsViewContainer {...props} />);
            expect(rendered.getElement()).toMatchSnapshot();
        });
    });

    describe('renderContent', () => {
        it('show NoContentAvailable when stores are not loaded', () => {
            const storesHubMock = Mock.ofType(BaseClientStoresHub);

            const props: DetailsViewContainerProps = {
                storeState: null,
                deps: {
                    storesHub: storesHubMock.object,
                },
            } as DetailsViewContainerProps;

            storesHubMock.setup(mock => mock.hasStores()).returns(() => false);

            const rendered = shallow(<DetailsViewContainer {...props} />);
            expect(rendered.getElement()).toMatchSnapshot();
        });

        it('show NoContentAvailable when target tab is closed', () => {
            const storesHubMock = Mock.ofType(BaseClientStoresHub);

            const props: DetailsViewContainerProps = {
                storeState: {
                    tabStoreData: {
                        isClosed: true,
                    },
                },
                deps: {
                    storesHub: storesHubMock.object,
                },
            } as DetailsViewContainerProps;

            storesHubMock.setup(mock => mock.hasStores()).returns(() => true);
            storesHubMock.setup(mock => mock.hasStoreData()).returns(() => true);

            const rendered = shallow(<DetailsViewContainer {...props} />);
            expect(rendered.getElement()).toMatchSnapshot();
        });

        it('shows NoContentAvailable when target page is changed and no permissions granted', () => {
            const storesHubMock = Mock.ofType(BaseClientStoresHub);

            const props: DetailsViewContainerProps = {
                storeState: {
                    tabStoreData: {
                        isClosed: false,
                        isOriginChanged: true,
                    },
                    permissionsStateStoreData: {
                        hasAllUrlAndFilePermissions: false,
                    },
                },
                deps: {
                    storesHub: storesHubMock.object,
                },
            } as DetailsViewContainerProps;

            storesHubMock.setup(mock => mock.hasStores()).returns(() => true);
            storesHubMock.setup(mock => mock.hasStoreData()).returns(() => true);

            const rendered = shallow(<DetailsViewContainer {...props} />);
            expect(rendered.getElement()).toMatchSnapshot();
        });

        it('render once; should call details view opened', () => {
            const storesHubMock = Mock.ofType(BaseClientStoresHub);
            const selectedDetailsViewPivotStub: DetailsViewPivotType = -1;
            const props: DetailsViewContainerProps = {
                storeState: {
                    tabStoreData: {
                        isClosed: false,
                        isOriginChanged: false,
                    },
                    visualizationStoreData: {
                        selectedDetailsViewPivot: selectedDetailsViewPivotStub,
                    },
                },
                deps: {
                    storesHub: storesHubMock.object,
                    detailsViewActionMessageCreator: detailsViewActionMessageCreator.object,
                },
            } as DetailsViewContainerProps;

            storesHubMock.setup(mock => mock.hasStores()).returns(() => true);
            storesHubMock.setup(mock => mock.hasStoreData()).returns(() => true);

            detailsViewActionMessageCreator
                .setup(mock => mock.detailsViewOpened(selectedDetailsViewPivotStub))
                .verifiable();

            const rendered = shallow(<DetailsViewContainer {...props} />);
            expect(rendered.getElement()).toMatchSnapshot();
            detailsViewActionMessageCreator.verifyAll();
        });

        it('render twice; should not call details view opened on second render', () => {
            const storesHubMock = Mock.ofType(BaseClientStoresHub);
            const selectedDetailsViewPivotStub: DetailsViewPivotType = -1;
            const props: DetailsViewContainerProps = {
                storeState: {
                    tabStoreData: {
                        isClosed: false,
                        isOriginChanged: false,
                    },
                    visualizationStoreData: {
                        selectedDetailsViewPivot: selectedDetailsViewPivotStub,
                    },
                },
                deps: {
                    storesHub: storesHubMock.object,
                    detailsViewActionMessageCreator: detailsViewActionMessageCreator.object,
                },
            } as DetailsViewContainerProps;

            storesHubMock.setup(mock => mock.hasStores()).returns(() => true);
            storesHubMock.setup(mock => mock.hasStoreData()).returns(() => true);

            const testObject = new DetailsViewContainer(props);

            setupActionMessageCreatorMock(
                detailsViewActionMessageCreator,
                selectedDetailsViewPivotStub,
                1,
            );
            testObject.render();
            detailsViewActionMessageCreator.verifyAll();
            detailsViewActionMessageCreator.reset();
            setupActionMessageCreatorMock(
                detailsViewActionMessageCreator,
                selectedDetailsViewPivotStub,
                0,
            );

            testObject.render();
            detailsViewActionMessageCreator.verifyAll();
        });
    });

    function setupActionMessageCreatorMock(
        mock: IMock<DetailsViewActionMessageCreator>,
        pivot: DetailsViewPivotType,
        timesCalled: number,
    ): void {
        mock.setup(acm => acm.detailsViewOpened(pivot)).verifiable(Times.exactly(timesCalled));
    }
});
