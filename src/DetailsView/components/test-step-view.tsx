// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';

import { AssessmentDefaultMessageGenerator } from '../../assessments/assessment-default-message-generator';
import { IAssessmentsProvider } from '../../assessments/types/iassessments-provider';
import { TestStep, VisualHelperToggleConfig } from '../../assessments/types/test-step';
import { CollapsibleComponent } from '../../common/components/collapsible-component';
import {
    AssessmentNavState,
    IGeneratedAssessmentInstance,
    IManualTestStepResult,
} from '../../common/types/store-data/iassessment-result-data';
import { ContentPanelButton, ContentPanelButtonDeps } from '../../views/content/content-panel-button';
import { DetailsViewActionMessageCreator } from '../actions/details-view-action-message-creator';
import { AssessmentInstanceTableHandler } from '../handlers/assessment-instance-table-handler';
import { AssessmentInstanceTable } from './assessment-instance-table';
import { ManualTestStepView } from './manual-test-step-view';

export type TestStepViewDeps = ContentPanelButtonDeps;

export interface TestStepViewProps {
    deps: TestStepViewDeps;
    isStepEnabled: boolean;
    isStepScanned: boolean;
    isScanning: boolean;
    testStep: TestStep;
    renderStaticContent: () => JSX.Element;
    instancesMap: IDictionaryStringTo<IGeneratedAssessmentInstance>;
    assessmentNavState: AssessmentNavState;
    assessmentInstanceTableHandler: AssessmentInstanceTableHandler;
    manualTestStepResultMap: IDictionaryStringTo<IManualTestStepResult>;
    actionMessageCreator: DetailsViewActionMessageCreator;
    assessmentsProvider: IAssessmentsProvider;
    assessmentDefaultMessageGenerator: AssessmentDefaultMessageGenerator;
}

export class TestStepView extends React.Component<TestStepViewProps> {
    public render(): JSX.Element {
        return (
            <div className="test-step-view">
                <div className="test-step-title-container">
                    <h3 className="test-step-view-title">{this.props.testStep.name}</h3>
                    <ContentPanelButton deps={this.props.deps} reference={this.props.testStep.infoAndExamples} iconName="info">
                        Info &amp; examples
                    </ContentPanelButton>
                </div>
                {this.renderVisualHelperToggle()}
                <CollapsibleComponent
                    header={<h4 className="test-step-instructions-header">How to test</h4>}
                    content={this.props.testStep.howToTest}
                    contentClassName={'test-step-instructions'}
                />
                {this.renderTable()}
            </div>
        );
    }

    private renderTable(): JSX.Element {
        if (this.props.testStep.isManual) {
            return (
                <ManualTestStepView
                    test={this.props.assessmentNavState.selectedTestType}
                    step={this.props.assessmentNavState.selectedTestStep}
                    manualTestStepResultMap={this.props.manualTestStepResultMap}
                    assessmentInstanceTableHandler={this.props.assessmentInstanceTableHandler}
                    assessmentsProvider={this.props.assessmentsProvider}
                />
            );
        }

        if (this.props.isScanning) {
            return <Spinner className="details-view-spinner" size={SpinnerSize.large} label={'Scanning'} />;
        }

        return (
            <React.Fragment>
                <h3 className="test-step-instances-header">Instances</h3>
                <AssessmentInstanceTable
                    instancesMap={this.props.instancesMap}
                    assessmentInstanceTableHandler={this.props.assessmentInstanceTableHandler}
                    assessmentNavState={this.props.assessmentNavState}
                    renderInstanceTableHeader={this.props.testStep.renderInstanceTableHeader}
                    getDefaultMessage={this.props.testStep.getDefaultMessage}
                    assessmentDefaultMessageGenerator={this.props.assessmentDefaultMessageGenerator}
                    hasVisualHelper={this.doesSelectedStepHaveVisualHelper()}
                />
            </React.Fragment>
        );
    }

    private getSelectedStep(): Readonly<TestStep> {
        return this.props.assessmentsProvider.getStep(
            this.props.assessmentNavState.selectedTestType,
            this.props.assessmentNavState.selectedTestStep,
        );
    }

    private doesSelectedStepHaveVisualHelper(): boolean {
        return this.getSelectedStep().getVisualHelperToggle != null;
    }

    private renderVisualHelperToggle(): JSX.Element {
        if (!this.doesSelectedStepHaveVisualHelper()) {
            return null;
        }

        const visualHelperToggleConfig: VisualHelperToggleConfig = {
            assessmentNavState: this.props.assessmentNavState,
            instancesMap: this.props.instancesMap,
            actionMessageCreator: this.props.actionMessageCreator,
            isStepEnabled: this.props.isStepEnabled,
            isStepScanned: this.props.isStepScanned,
        };

        return this.getSelectedStep().getVisualHelperToggle(visualHelperToggleConfig);
    }
}
