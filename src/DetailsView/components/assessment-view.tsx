// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { AssessmentDefaultMessageGenerator } from '../../assessments/assessment-default-message-generator';
import { IAssessmentsProvider } from '../../assessments/types/iassessments-provider';
import { AssessmentTestResult } from '../../common/assessment/assessment-test-result';
import { CollapsibleComponent } from '../../common/components/collapsible-component';
import { reactExtensionPoint } from '../../common/extensibility/react-extension-point';
import { ITab } from '../../common/itab';
import { AssessmentNavState, IAssessmentData, PersistedTabInfo } from '../../common/types/store-data/iassessment-result-data';
import { VisualizationType } from '../../common/types/visualization-type';
import { ContentLink, ContentLinkDeps } from '../../views/content/content-link';
import { ContentPageComponent } from '../../views/content/content-page';
import { DetailsViewActionMessageCreator } from '../actions/details-view-action-message-creator';
import { detailsViewExtensionPoint } from '../extensions/details-view-extension-point';
import { AssessmentInstanceTableHandler } from '../handlers/assessment-instance-table-handler';
import { TargetChangeDialog, TargetChangeDialogDeps } from './target-change-dialog';
import { TestStepView, TestStepViewDeps } from './test-step-view';
import { TestStepNavDeps, TestStepsNav } from './test-steps-nav';

export type WithAssessmentTestResult = { assessmentTestResult: AssessmentTestResult };
export const AssessmentViewMainContentExtensionPoint = reactExtensionPoint<WithAssessmentTestResult>(
    'AssessmentViewMainContentExtensionPoint',
);

export type AssessmentViewDeps = ContentLinkDeps &
    TestStepViewDeps &
    TestStepNavDeps &
    TargetChangeDialogDeps & {
        detailsViewActionMessageCreator: DetailsViewActionMessageCreator;
        assessmentsProvider: IAssessmentsProvider;
    };

export interface AssessmentViewProps {
    deps: AssessmentViewDeps;
    isScanning: boolean;
    isEnabled: boolean;
    assessmentNavState: AssessmentNavState;
    assessmentInstanceTableHandler: AssessmentInstanceTableHandler;
    assessmentData: IAssessmentData;
    currentTarget: ITab;
    prevTarget: PersistedTabInfo;
    assessmentDefaultMessageGenerator: AssessmentDefaultMessageGenerator;
    assessmentTestResult: AssessmentTestResult;
}

export class AssessmentView extends React.Component<AssessmentViewProps> {
    public static readonly requirementsTitle: string = 'Requirements';

    private deps: AssessmentViewDeps;

    constructor(props: AssessmentViewProps) {
        super(props);
        this.deps = props.deps;
        this.state = {
            isStartOverDialogOpen: false,
        };
    }

    public render(): JSX.Element {
        const { assessmentTestResult } = this.props;
        const { extensions } = assessmentTestResult.definition;
        const extPointProps = { extensions, assessmentTestResult };

        return (
            <div className="assessment-content">
                {this.renderTargetChangeDialog()}
                {this.renderTitle(assessmentTestResult.definition.title, assessmentTestResult.definition.guidance)}
                {this.renderGettingStarted(assessmentTestResult.definition.gettingStarted)}
                <AssessmentViewMainContentExtensionPoint.component {...extPointProps}>
                    {this.renderRequirements()}
                    {this.renderMainContent(assessmentTestResult)}
                </AssessmentViewMainContentExtensionPoint.component>
            </div>
        );
    }

    public componentDidMount(): void {
        this.enableSelectedStepVisualHelper();
    }

    public componentDidUpdate(prevProps: AssessmentViewProps): void {
        if (this.isStepSwitched(prevProps)) {
            this.disableVisualHelpersForTest(prevProps.assessmentNavState.selectedTestType);
            this.enableSelectedStepVisualHelper();
        } else {
            // Cases where visualization doesn't reappear(Navigate back, refresh). No telemetry sent.
            this.enableSelectedStepVisualHelper(false);
        }

        const { assessmentTestResult } = this.props;
        detailsViewExtensionPoint.apply(assessmentTestResult.definition.extensions).onAssessmentViewUpdate(prevProps, this.props);
    }

    private enableSelectedStepVisualHelper(sendTelemetry = true): void {
        const test = this.props.assessmentNavState.selectedTestType;
        const step = this.props.assessmentNavState.selectedTestStep;
        if (this.visualHelperDisabledByDefault(test, step) || this.isTargetChanged()) {
            return;
        }

        const isStepNotScanned = !this.props.assessmentData.testStepStatus[step].isStepScanned;
        if (this.props.isEnabled === false || isStepNotScanned) {
            this.props.deps.detailsViewActionMessageCreator.enableVisualHelper(test, step, isStepNotScanned, sendTelemetry);
        }
    }

    private isTargetChanged(): boolean {
        return this.props.prevTarget != null && this.props.prevTarget.id !== this.props.currentTarget.id;
    }

    private isStepSwitched(prevProps: AssessmentViewProps): boolean {
        return prevProps.assessmentNavState.selectedTestStep !== this.props.assessmentNavState.selectedTestStep;
    }

    private visualHelperDisabledByDefault(test: VisualizationType, step: string): boolean {
        return this.props.deps.assessmentsProvider.getStep(test, step).doNotScanByDefault === true;
    }

    public componentWillUnmount(): void {
        this.disableVisualHelpersForTest(this.props.assessmentNavState.selectedTestType);
    }

    private renderTargetChangeDialog(): JSX.Element {
        return (
            <TargetChangeDialog
                deps={this.props.deps}
                prevTab={this.props.prevTarget}
                newTab={this.props.currentTarget}
                actionMessageCreator={this.props.deps.detailsViewActionMessageCreator}
            />
        );
    }

    private disableVisualHelpersForTest(test: VisualizationType): void {
        this.props.deps.detailsViewActionMessageCreator.disableVisualHelpersForTest(test);
    }

    private renderTitle(title: string, content?: ContentPageComponent): JSX.Element {
        return (
            <div className="assessment-title">
                <h1 className="assessment-header">
                    {title} <ContentLink deps={this.deps} reference={content} iconName="info" />
                </h1>
            </div>
        );
    }

    private renderGettingStarted(gettingStarted: JSX.Element): JSX.Element {
        return (
            <CollapsibleComponent
                header={<h2 className="assessment-getting-started-title">Getting Started</h2>}
                content={gettingStarted}
                contentClassName={'assessment-getting-started'}
                containerClassName={'assessment-getting-started-container'}
            />
        );
    }

    private renderRequirements(): JSX.Element {
        return (
            <div className="assessment-requirements-title">
                <h2 className="assessment-requirements">{AssessmentView.requirementsTitle}</h2>
            </div>
        );
    }

    private renderMainContent(assessmentTestResult: AssessmentTestResult): JSX.Element {
        const selectedRequirement = assessmentTestResult.getRequirementResult(this.props.assessmentNavState.selectedTestStep);
        const isStepScanned = selectedRequirement.data.isStepScanned;

        return (
            <div className="details-view-assessment-content">
                <div className="test-steps-nav-container">
                    <TestStepsNav
                        deps={this.props.deps}
                        ariaLabel={AssessmentView.requirementsTitle}
                        selectedTest={assessmentTestResult.type}
                        selectedTestStep={selectedRequirement.definition.key}
                        stepStatus={this.props.assessmentData.testStepStatus}
                    />
                </div>
                <div className="test-step-view-container">
                    <TestStepView
                        deps={this.deps}
                        isScanning={this.props.isScanning}
                        testStep={selectedRequirement.definition}
                        renderStaticContent={selectedRequirement.definition.renderStaticContent}
                        instancesMap={this.props.assessmentData.generatedAssessmentInstancesMap}
                        assessmentNavState={this.props.assessmentNavState}
                        assessmentInstanceTableHandler={this.props.assessmentInstanceTableHandler}
                        manualTestStepResultMap={this.props.assessmentData.manualTestStepResultMap}
                        actionMessageCreator={this.props.deps.detailsViewActionMessageCreator}
                        assessmentsProvider={this.props.deps.assessmentsProvider}
                        isStepEnabled={this.props.isEnabled}
                        isStepScanned={isStepScanned}
                        assessmentDefaultMessageGenerator={this.props.assessmentDefaultMessageGenerator}
                    />
                </div>
            </div>
        );
    }
}
