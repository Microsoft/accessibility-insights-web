// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Enzyme from 'enzyme';
import * as React from 'react';
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { AssessmentsProvider } from '../../../../../assessments/assessments-provider';
import { TestStep } from '../../../../../assessments/types/test-step';
import { CollapsibleComponent } from '../../../../../common/components/collapsible-component';
import { ManualTestStatus } from '../../../../../common/types/manual-test-status';
import { VisualizationType } from '../../../../../common/types/visualization-type';
import { AssessmentInstanceTable } from '../../../../../DetailsView/components/assessment-instance-table';
import { AssessmentVisualizationEnabledToggle } from '../../../../../DetailsView/components/assessment-visualization-enabled-toggle';
import { ManualTestStepView } from '../../../../../DetailsView/components/manual-test-step-view';
import { TestStepView, TestStepViewProps } from '../../../../../DetailsView/components/test-step-view';
import { AssessmentInstanceTableHandler } from '../../../../../DetailsView/handlers/assessment-instance-table-handler';
import { BaseDataBuilder } from '../../../common/base-data-builder';

let getVisualHelperToggleMock: IMock<(provider, props) => {}>;

describe('TestStepViewTest', () => {
    beforeEach(() => {
        getVisualHelperToggleMock = Mock.ofInstance((provider, props) => {
            return null;
        });
    });

    test('constructor, no side effects', () => {
        const testObject = new TestStepView(null);
        expect(testObject).toBeInstanceOf(React.Component);
    });

    test('render, check fixed parts', () => {
        const props = TestStepViewPropsBuilder.default(getVisualHelperToggleMock.object).build();

        const wrapper = Enzyme.shallow(<TestStepView {...props} />);

        const mainDiv = wrapper.find('.test-step-view');

        expect(mainDiv.exists()).toBeTruthy();

        const title = mainDiv.find('h3.test-step-view-title');

        expect(title.exists()).toBeTruthy();
        expect(props.testStep.name).toBe(title.text());

        const testInstructions = wrapper.find(CollapsibleComponent);

        expect(testInstructions.exists()).toBeTruthy();
        expect(props.testStep.howToTest).toEqual(testInstructions.prop('content'));
        expect(testInstructions.prop('contentClassName')).toBe('test-step-instructions');
        expect(testInstructions.prop('header')).toEqual(<h4 className="test-step-instructions-header">How to test</h4>);
    });

    test('render spinner for non-manual tests', () => {
        const props = TestStepViewPropsBuilder.default(getVisualHelperToggleMock.object)
            .withScanning(true)
            .build();

        const wrapper = Enzyme.shallow(<TestStepView {...props} />);
        const spinner = wrapper.find('.details-view-spinner');

        expect(spinner.exists()).toBeTruthy();
    });

    test('render manual test step view even when scanning manual tests', () => {
        const props = TestStepViewPropsBuilder.default(getVisualHelperToggleMock.object)
            .withScanning(true)
            .withIsManual(true)
            .build();

        const wrapper = Enzyme.shallow(<TestStepView {...props} />);
        validateManualTestStepView(wrapper, props);
    });

    test('render, variable part for assisted test', () => {
        const props = TestStepViewPropsBuilder.default(getVisualHelperToggleMock.object)
            .withIsManual(false)
            .build();

        const wrapper = Enzyme.shallow(<TestStepView {...props} />);

        const title = wrapper.find('h3.test-step-instances-header');

        expect(title.exists()).toBeTruthy();
        expect(title.text()).toBe('Instances');

        const instanceTable = wrapper.find(AssessmentInstanceTable);

        expect(instanceTable.exists()).toBeTruthy();
        expect(instanceTable.prop('instancesMap')).toEqual(props.instancesMap);
        expect(instanceTable.prop('assessmentInstanceTableHandler')).toEqual(props.assessmentInstanceTableHandler);
        expect(props.assessmentNavState).toEqual(instanceTable.prop('assessmentNavState'));
    });

    test('render, variable part for manual test', () => {
        const props = TestStepViewPropsBuilder.default(getVisualHelperToggleMock.object)
            .withIsManual(true)
            .build();

        const wrapper = Enzyme.shallow(<TestStepView {...props} />);
        validateManualTestStepView(wrapper, props);
    });

    test('render, with no visual helper toggle', () => {
        const props = TestStepViewPropsBuilder.default(getVisualHelperToggleMock.object)
            .withNoGetToggleConfig()
            .build();

        getVisualHelperToggleMock.setup(g => g(It.isAny(), It.isAny())).verifiable(Times.never());

        const wrapper = Enzyme.shallow(<TestStepView {...props} />);

        const visualHelper = wrapper.find(AssessmentVisualizationEnabledToggle);

        getVisualHelperToggleMock.verifyAll();
        expect(visualHelper.exists()).toBeFalsy();
    });

    test('render, with visual helper toggle', () => {
        const props = TestStepViewPropsBuilder.default(getVisualHelperToggleMock.object)
            .withIsManual(true)
            .build();
        const toggleStub = <div className="toggle-stub">toggle</div>;

        const wrapper = Enzyme.shallow(<TestStepView {...props} />);

        const visualHelper = wrapper.find('.toggle-stub');

        getVisualHelperToggleMock.verifyAll();
    });

    function validateManualTestStepView(wrapper: Enzyme.ShallowWrapper, props: TestStepViewProps): void {
        const view = wrapper.find(ManualTestStepView);
        expect(view.exists()).toBe(true);
        expect(props.assessmentNavState.selectedTestStep).toEqual(view.prop('step'));
        expect(props.assessmentNavState.selectedTestType).toEqual(view.prop('test'));
        expect(props.manualTestStepResultMap).toEqual(view.prop('manualTestStepResultMap'));
        expect(props.assessmentInstanceTableHandler).toEqual(view.prop('assessmentInstanceTableHandler'));
        expect(props.assessmentsProvider).toEqual(view.prop('assessmentsProvider'));
    }
});

class TestStepViewPropsBuilder extends BaseDataBuilder<TestStepViewProps> {
    public static default(getVisualHelperToggle: (provider, props) => {}): TestStepViewPropsBuilder {
        const assessmentsProviderMock = Mock.ofType(AssessmentsProvider, MockBehavior.Strict);
        assessmentsProviderMock
            .setup(p => p.getStep(It.isAny(), It.isAny()))
            .returns((test, step) => {
                return { getVisualHelperToggle: getVisualHelperToggle } as TestStep;
            });
        return new TestStepViewPropsBuilder()
            .with('instancesMap', {
                target1: {
                    target: ['target1'],
                    html: '<h1>test</h1>',
                    testStepResults: {
                        headingFunction: {
                            id: 'testId',
                            status: ManualTestStatus.PASS,
                            isCapturedByUser: false,
                            failureSummary: '',
                            isVisualizationEnabled: true,
                        },
                        headingLevel: {
                            id: 'testId',
                            status: ManualTestStatus.PASS,
                            isCapturedByUser: false,
                            failureSummary: '',
                            isVisualizationEnabled: true,
                        },
                        missingHeadings: {
                            id: 'testId',
                            status: ManualTestStatus.PASS,
                            isCapturedByUser: false,
                            failureSummary: '',
                            isVisualizationEnabled: true,
                        },
                    },
                    propertyBag: {
                        headingLevel: '1',
                        headingText: 'testaaaaa',
                    },
                },
            })
            .with('assessmentInstanceTableHandler', Mock.ofType(AssessmentInstanceTableHandler).object)
            .with('manualTestStepResultMap', {
                headingFunction: {
                    status: ManualTestStatus.PASS,
                    id: '1',
                    instances: [],
                },
            })
            .with('assessmentNavState', {
                selectedTestStep: 'headingFunction',
                selectedTestType: VisualizationType.HeadingsAssessment,
            })
            .with('assessmentsProvider', assessmentsProviderMock.object)
            .with('renderStaticContent', () => <div />)
            .with('testStep', {
                key: null,
                description: <p>description</p>,
                name: 'Test Step Test Name',
                howToTest: <p>Instructions</p>,
                isManual: false,
                guidanceLinks: [],
            });
    }

    public withNoGetToggleConfig(): TestStepViewPropsBuilder {
        const providerMock = Mock.ofType(AssessmentsProvider);
        providerMock
            .setup(p => p.getStep(It.isAny(), It.isAny()))
            .returns((test, step) => {
                return { getVisualHelperToggle: null } as TestStep;
            });

        this.data.assessmentsProvider = providerMock.object;
        return this;
    }

    public withIsManual(value: boolean): TestStepViewPropsBuilder {
        this.data.testStep.isManual = value;
        return this;
    }

    public withScanning(isScanning: boolean): TestStepViewPropsBuilder {
        this.data.isScanning = isScanning;
        return this;
    }

    public withoutInstanceMap(): TestStepViewPropsBuilder {
        this.data.instancesMap = {};
        return this;
    }
}
