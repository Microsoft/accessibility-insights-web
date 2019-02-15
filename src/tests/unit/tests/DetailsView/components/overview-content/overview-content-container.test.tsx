// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';

import { IAssessmentsProvider } from '../../../../../../assessments/types/iassessments-provider';
import { IAssessmentStoreData, PersistedTabInfo } from '../../../../../../common/types/store-data/iassessment-result-data';
import { ITabStoreData } from '../../../../../../common/types/store-data/itab-store-data';
import { DetailsViewActionMessageCreator } from '../../../../../../DetailsView/actions/details-view-action-message-creator';
import {
    OverviewContainer,
    OverviewContainerDeps,
} from '../../../../../../DetailsView/components/overview-content/overview-content-container';
import { HelpLinkDeps } from '../../../../../../DetailsView/components/overview-content/overview-help-section';
import { Mock, MockBehavior } from 'typemoq';
import { UrlParser } from '../../../../../../common/url-parser';

describe('OverviewContainer', () => {
    const urlParserMock = Mock.ofType(UrlParser, MockBehavior.Strict);
    const openExternalLink = jest.fn();
    const tabStoreDataStub: ITabStoreData = {
        url: 'some url',
        title: 'some title',
        id: -1,
    } as ITabStoreData;
    const helpLinkDeps = {
        actionInitiators: {
            openExternalLink,
        },
    } as HelpLinkDeps;
    const assessmentsProvider: IAssessmentsProvider = {
        all: () => [],
    } as any;
    const detailsViewActionMessageCreatorStub = {} as DetailsViewActionMessageCreator;

    const getAssessmentSummaryModelFromProviderAndStoreData = jest.fn();

    const deps: OverviewContainerDeps = {
        assessmentsProvider: assessmentsProvider,
        actionInitiators: helpLinkDeps.actionInitiators,
        getAssessmentSummaryModelFromProviderAndStoreData: getAssessmentSummaryModelFromProviderAndStoreData,
        detailsViewActionMessageCreator: detailsViewActionMessageCreatorStub,
        urlParser: urlParserMock.object,
    };
    const assessmentStoreData: IAssessmentStoreData = {
        persistedTabInfo: {} as PersistedTabInfo,
    } as IAssessmentStoreData;

    const component = <OverviewContainer deps={deps} assessmentStoreData={assessmentStoreData} tabStoreData={tabStoreDataStub} />;
    const wrapper = shallow(component);

    test('component is defined and matches snapshot', () => {
        expect(component).toBeDefined();
        expect(wrapper.getElement()).toMatchSnapshot();
    });
});
