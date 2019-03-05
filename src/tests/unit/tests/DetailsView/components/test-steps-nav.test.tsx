// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';
import * as TestUtils from 'react-dom/test-utils';
import { Mock, Times } from 'typemoq';

import { IAssessmentsProvider } from '../../../../../assessments/types/iassessments-provider';
import { TestStep } from '../../../../../assessments/types/test-step';
import { getInnerTextFromJsxElement } from '../../../../../common/get-inner-text-from-jsx-element';
import { ManualTestStatus } from '../../../../../common/types/manual-test-status';
import { DetailsViewActionMessageCreator } from '../../../../../DetailsView/actions/details-view-action-message-creator';
import { TestStepNavProps, TestStepsNav } from '../../../../../DetailsView/components/test-steps-nav';
import { OutcomeTypeSemantic, outcomeTypeSemanticsFromTestStatus } from '../../../../../DetailsView/reports/components/outcome-type';
import { EventStubFactory } from '../../../common/event-stub-factory';
import { CreateTestAssessmentProvider, CreateTestAssessmentProviderAutomated } from '../../../common/test-assessment-provider';

class TestableTestStepsNav extends TestStepsNav {
    public getOnTestStepSelected() {
        return this.onTestStepSelected;
    }

    public getRenderNavLink() {
        return this.renderNavLink;
    }
}

describe('TestStepsNav', () => {
    it('renders assisted tests', () => {
        runTest(CreateTestAssessmentProvider());
    });

    it('renders automated tests', () => {
        runTest(CreateTestAssessmentProviderAutomated());
    });

    function runTest(assessmentProvider: IAssessmentsProvider) {
        const eventFactory = new EventStubFactory();
        const actionMessageCreatorMock = Mock.ofType(DetailsViewActionMessageCreator);
        const eventStub = eventFactory.createKeypressEvent() as any;

        const all = assessmentProvider.all();
        const assessment = all[0];
        const firstStep = assessment.steps[0];

        const item = {
            key: firstStep.key,
            name: firstStep.name,
            description: firstStep.description,
            url: '',
            index: 1,
            forceAnchor: true,
            renderRequirementDescription: firstStep.renderRequirementDescription,
        };

        const props: TestStepNavProps = {
            deps: {
                detailsViewActionMessageCreator: actionMessageCreatorMock.object,
                assessmentsProvider: assessmentProvider,
                getInnerTextFromJsxElement: getInnerTextFromJsxElementStub(),
                outcomeTypeSemanticsFromTestStatus: createOutcomeTypeSemanticsFromTestStatusStub(),
            },
            selectedTest: assessment.type,
            selectedTestStep: firstStep.key,
            stepStatus: {},
            assessmentsProvider: assessmentProvider,
            ariaLabel: 'test',
        };

        generateStepStatus(assessment.steps, props);

        actionMessageCreatorMock.setup(a => a.selectTestStep(eventStub, item.key, props.selectedTest)).verifiable(Times.once());

        const component = React.createElement(TestableTestStepsNav, props);
        const testObject = TestUtils.renderIntoDocument(component);
        const rendered = testObject.render();
        rendered.props.onLinkClick(eventStub, item);

        expect(rendered).toMatchSnapshot('render');
        expect(testObject.getRenderNavLink()(item)).toMatchSnapshot('getRenderNavLink');
        actionMessageCreatorMock.verifyAll();
    }

    function generateStepStatus(testSteps: TestStep[], props: TestStepNavProps): void {
        testSteps.forEach((step, index) => {
            props.stepStatus[step.key] = {
                stepFinalResult: index % 2 === 0 ? ManualTestStatus.UNKNOWN : ManualTestStatus.PASS,
                isStepScanned: false,
                name: step.name,
            };
        });
    }
    function createOutcomeTypeSemanticsFromTestStatusStub(): typeof outcomeTypeSemanticsFromTestStatus {
        const outcomeTypeSemanticsFromTestStatusMock = Mock.ofInstance(outcomeTypeSemanticsFromTestStatus);

        outcomeTypeSemanticsFromTestStatusMock
            .setup(f => f(ManualTestStatus.PASS))
            .returns(() => {
                return { pastTense: 'passed' } as OutcomeTypeSemantic;
            });
        outcomeTypeSemanticsFromTestStatusMock
            .setup(f => f(ManualTestStatus.UNKNOWN))
            .returns(() => {
                return { pastTense: 'unknown' } as OutcomeTypeSemantic;
            });

        return outcomeTypeSemanticsFromTestStatusMock.object;
    }

    function getInnerTextFromJsxElementStub(): typeof getInnerTextFromJsxElement {
        return status => {
            return 'some test step description';
        };
    }
});
