// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Action } from '../../common/flux/action';
import { ScanBasePayload, ScanCompletedPayload, ScanUpdatePayload } from '../../injected/analyzers/analyzer';
import {
    AddFailureInstancePayload,
    AssessmentActionInstancePayload,
    ChangeRequirementStatusPayload,
    ChangeInstanceSelectionPayload,
    ChangeInstanceStatusPayload,
    EditFailureInstancePayload,
    RemoveFailureInstancePayload,
    SelectRequirementPayload,
    ToggleActionPayload,
    UpdateSelectedDetailsViewPayload,
    UpdateVisibilityPayload,
} from './action-payloads';

export class AssessmentActions {
    public readonly selectRequirement = new Action<SelectRequirementPayload>();
    public readonly changeInstanceStatus = new Action<ChangeInstanceStatusPayload>();
    public readonly changeRequirementStatus = new Action<ChangeRequirementStatusPayload>();
    public readonly addFailureInstance = new Action<AddFailureInstancePayload>();
    public readonly removeFailureInstance = new Action<RemoveFailureInstancePayload>();
    public readonly editFailureInstance = new Action<EditFailureInstancePayload>();
    public readonly passUnmarkedInstance = new Action<ToggleActionPayload>();
    public readonly changeAssessmentVisualizationState = new Action<ChangeInstanceSelectionPayload>();
    public readonly changeAssessmentVisualizationStateForAll = new Action<ChangeInstanceSelectionPayload>();
    public readonly updateInstanceVisibility = new Action<UpdateVisibilityPayload>();
    public readonly undoInstanceStatusChange = new Action<AssessmentActionInstancePayload>();
    public readonly undoRequirementStatusChange = new Action<ChangeRequirementStatusPayload>();
    public readonly getCurrentState = new Action<void>();
    public readonly scanCompleted = new Action<ScanCompletedPayload<null>>();
    public readonly resetData = new Action<ToggleActionPayload>();
    public readonly resetAllAssessmentsData = new Action<number>();
    public readonly scanUpdate = new Action<ScanUpdatePayload>();
    public readonly trackingCompleted = new Action<ScanBasePayload>();
    public readonly updateSelectedPivotChild = new Action<UpdateSelectedDetailsViewPayload>();
    public readonly updateTargetTabId = new Action<number>();
    public readonly continuePreviousAssessment = new Action<number>();
}
