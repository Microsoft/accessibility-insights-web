// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AssessmentsProviderImpl } from 'assessments/assessments-provider';
import { AssessmentsProvider } from 'assessments/types/assessments-provider';
import { Assessment } from 'assessments/types/iassessment';
import { Requirement, VisualHelperToggleConfig } from 'assessments/types/requirement';
import { TestStepData } from 'common/types/manual-test-status';
import {
    AssessmentData,
    AssessmentNavState,
    GeneratedAssessmentInstance,
    ManualTestStepResult,
    RequirementIdToResultMap,
} from 'common/types/store-data/assessment-result-data';
import { FeatureFlagStoreData } from 'common/types/store-data/feature-flag-store-data';
import { PathSnippetStoreData } from 'common/types/store-data/path-snippet-store-data';
import { VisualizationType } from 'common/types/visualization-type';
import {
    AssessmentViewUpdateHandler,
    AssessmentViewUpdateHandlerProps,
} from 'DetailsView/components/assessment-view-update-handler';
import {
    RequirementView,
    RequirementViewDeps,
    RequirementViewProps,
} from 'DetailsView/components/requirement-view';
import { AssessmentInstanceTableHandler } from 'DetailsView/handlers/assessment-instance-table-handler';
import { shallow } from 'enzyme';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { IMock, It, Mock, Times } from 'typemoq';
import { DictionaryStringTo } from 'types/common-types';

describe('RequirementViewTest', () => {
    let assessmentStub: Assessment;
    let requirementStub: Requirement;
    let nextRequirementStub: Requirement;
    let assessmentNavState: AssessmentNavState;
    let assessmentsProviderMock: IMock<AssessmentsProvider>;
    let props: RequirementViewProps;
    let assessmentDataStub: AssessmentData;
    let assessmentInstanceTableHandlerStub: AssessmentInstanceTableHandler;
    let featureFlagStoreDataStub: FeatureFlagStoreData;
    let pathSnippetStoreDataStub: PathSnippetStoreData;
    let updateHandlerMock: IMock<AssessmentViewUpdateHandler>;

    beforeEach(() => {
        requirementStub = {
            key: 'test-requirement-key',
            name: 'test-requirement-name',
            description: <div>test-description</div>,
            howToTest: <p>how-to-test-stub</p>,
            getVisualHelperToggle: (props: VisualHelperToggleConfig) => (
                <div>test-visual-helper-toggle</div>
            ),
            order: 1,
        } as Requirement;
        nextRequirementStub = {
            key: 'next-requirement-key',
            order: 2,
        } as Requirement;
        assessmentStub = {
            requirements: [requirementStub, nextRequirementStub],
        } as Assessment;
        assessmentNavState = {
            selectedTestType: VisualizationType.Headings,
            selectedTestSubview: 'test-requirement-name',
        };

        assessmentsProviderMock = Mock.ofType(AssessmentsProviderImpl);
        assessmentsProviderMock
            .setup(ap => ap.forType(assessmentNavState.selectedTestType))
            .returns(() => assessmentStub);
        assessmentsProviderMock
            .setup(ap =>
                ap.getStep(
                    assessmentNavState.selectedTestType,
                    assessmentNavState.selectedTestSubview,
                ),
            )
            .returns(() => requirementStub);
        assessmentInstanceTableHandlerStub = {
            changeRequirementStatus: null,
        } as AssessmentInstanceTableHandler;

        assessmentDataStub = {
            generatedAssessmentInstancesMap: {} as DictionaryStringTo<GeneratedAssessmentInstance>,
            manualTestStepResultMap: {
                'some manual test step result id': null,
            } as RequirementIdToResultMap,
            testStepStatus: {
                [requirementStub.key]: { isStepScanned: true } as TestStepData,
            },
        } as AssessmentData;

        featureFlagStoreDataStub = {
            'some feature flag': true,
        };
        pathSnippetStoreDataStub = {
            path: null,
        } as PathSnippetStoreData;
        updateHandlerMock = Mock.ofType(AssessmentViewUpdateHandler);

        props = {
            deps: {
                assessmentViewUpdateHandler: updateHandlerMock.object,
                assessmentsProvider: assessmentsProviderMock.object,
            } as RequirementViewDeps,
            assessmentNavState: assessmentNavState,
            isRequirementEnabled: true,
            assessmentInstanceTableHandler: assessmentInstanceTableHandlerStub,
            featureFlagStoreData: featureFlagStoreDataStub,
            pathSnippetStoreData: pathSnippetStoreDataStub,
            prevTarget: { id: 4 },
            currentTarget: { id: 5 },
            assessmentData: assessmentDataStub,
        } as RequirementViewProps;
    });

    it('renders with content from props', () => {
        const rendered = shallow(<RequirementView {...props} />);

        expect(rendered.getElement()).toMatchSnapshot();
    });

    test('componentDidUpdate', () => {
        const newProps = cloneDeep(props);
        newProps.deps.assessmentViewUpdateHandler = updateHandlerMock.object;
        const prevProps = props;
        prevProps.assessmentNavState.selectedTestSubview = 'prevTestStep';

        updateHandlerMock
            .setup(u =>
                u.update(
                    It.isValue(getUpdateHandlerProps(prevProps)),
                    It.isValue(getUpdateHandlerProps(newProps)),
                ),
            )
            .verifiable(Times.once());

        const testObject = new RequirementView(newProps);

        testObject.componentDidUpdate(prevProps);

        updateHandlerMock.verifyAll();
    });

    test('componentDidMount', () => {
        updateHandlerMock
            .setup(u => u.onMount(getUpdateHandlerProps(props)))
            .verifiable(Times.once());

        const testObject = new RequirementView(props);

        testObject.componentDidMount();

        updateHandlerMock.verifyAll();
    });

    test('componentWillUnmount', () => {
        updateHandlerMock
            .setup(u => u.onUnmount(getUpdateHandlerProps(props)))
            .verifiable(Times.once());

        const testObject = new RequirementView(props);

        testObject.componentWillUnmount();

        updateHandlerMock.verifyAll();
    });

    function getUpdateHandlerProps(
        givenProps: RequirementViewProps,
    ): AssessmentViewUpdateHandlerProps {
        return {
            deps: givenProps.deps,
            selectedRequirementIsEnabled: givenProps.isRequirementEnabled,
            assessmentNavState: givenProps.assessmentNavState,
            assessmentData: givenProps.assessmentData,
            prevTarget: givenProps.prevTarget,
            currentTarget: givenProps.currentTarget,
        };
    }
});
