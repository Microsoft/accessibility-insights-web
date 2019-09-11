// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';
import { It, Mock, MockBehavior } from 'typemoq';

import { AssessmentsProvider } from 'assessments/types/assessments-provider';
import { NamedSFC, ReactFCWithDisplayName } from '../../../../../../common/react/named-sfc';
import { AssessmentData, AssessmentStoreData } from '../../../../../../common/types/store-data/assessment-result-data';
import { FeatureFlagStoreData } from '../../../../../../common/types/store-data/feature-flag-store-data';
import { VisualizationType } from '../../../../../../common/types/visualization-type';
import { DetailsRightPanelConfiguration } from '../../../../../../DetailsView/components/details-view-right-panel';
import { DetailsViewSwitcherNavConfiguration } from '../../../../../../DetailsView/components/details-view-switcher-nav';
import {
    DetailsViewLeftNav,
    DetailsViewLeftNavDeps,
    DetailsViewLeftNavProps,
} from '../../../../../../DetailsView/components/left-nav/details-view-left-nav';
import { GetLeftNavSelectedKeyProps } from '../../../../../../DetailsView/components/left-nav/get-left-nav-selected-key';

describe('DetailsViewLeftNav', () => {
    it('should render from switcher nav', () => {
        const selectedTestStub: VisualizationType = -1;
        const selectedKeyStub: string = 'some key';
        const featureFlagDataStub: FeatureFlagStoreData = {};
        const assessmentsProviderWithFeaturesEnabledMock = Mock.ofInstance((provider, featureFlagData) => null, MockBehavior.Strict);
        const assessmentProviderStub = {} as AssessmentsProvider;
        const filteredProviderStub = {} as AssessmentsProvider;
        const GetLeftNavSelectedKeyMock = Mock.ofInstance((theProps: GetLeftNavSelectedKeyProps) => null, MockBehavior.Strict);
        const LeftNavStub: Readonly<ReactFCWithDisplayName<DetailsViewLeftNavProps>> = NamedSFC<DetailsViewLeftNavProps>(
            'test',
            _ => null,
        );
        const assessmentDataStub: { [key: string]: AssessmentData } = { x: { testStepStatus: {} } as AssessmentData };
        const assessmentStoreDataStub = {
            assessments: assessmentDataStub,
        } as AssessmentStoreData;

        const rightPanelConfig: DetailsRightPanelConfiguration = {
            GetLeftNavSelectedKey: GetLeftNavSelectedKeyMock.object,
        } as DetailsRightPanelConfiguration;

        const switcherNavConfig: DetailsViewSwitcherNavConfiguration = {
            LeftNav: LeftNavStub,
        } as DetailsViewSwitcherNavConfiguration;

        const deps = {
            assessmentsProvider: assessmentProviderStub,
            assessmentsProviderWithFeaturesEnabled: assessmentsProviderWithFeaturesEnabledMock.object,
        } as DetailsViewLeftNavDeps;

        const props = {
            deps,
            featureFlagStoreData: featureFlagDataStub,
            selectedTest: selectedTestStub,
            switcherNavConfiguration: switcherNavConfig,
            rightPanelConfiguration: rightPanelConfig,
            assessmentStoreData: assessmentStoreDataStub,
        } as DetailsViewLeftNavProps;

        GetLeftNavSelectedKeyMock.setup(glnsm => glnsm(It.isValue({ visualizationType: selectedTestStub }))).returns(() => selectedKeyStub);

        assessmentsProviderWithFeaturesEnabledMock
            .setup(ap => ap(assessmentProviderStub, featureFlagDataStub))
            .returns(() => filteredProviderStub);

        const actual = shallow(<DetailsViewLeftNav {...props} />);
        expect(actual.getElement()).toMatchSnapshot();
    });
});
