// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { VisualHelperToggleConfig } from '../../../assessments/types/requirement';
import { ManualTestStatus } from '../../../common/types/manual-test-status';
import {
    IAssessmentResultType,
    IGeneratedAssessmentInstance,
    ITestStepResult,
} from '../../../common/types/store-data/iassessment-result-data';
import { VisualizationType } from '../../../common/types/visualization-type';
import { DetailsViewActionMessageCreator } from '../../../DetailsView/actions/details-view-action-message-creator';
import { DictionaryStringTo } from '../../../types/common-types';
import { BaseDataBuilder } from './base-data-builder';

export class VisualHelperToggleConfigBuilder extends BaseDataBuilder<VisualHelperToggleConfig> {
    private stepKey = 'assessment-1-step-1';
    private otherKey = 'assessment-1-step-2';
    constructor() {
        super();
        this.data = {
            assessmentNavState: {
                selectedTestStep: this.stepKey,
                selectedTestType: -1 as VisualizationType,
            },
            actionMessageCreator: null,
            instancesMap: {
                'assessment-1-step-1': {
                    html: 'html',
                    propertyBag: {},
                    target: ['element2'],
                } as IGeneratedAssessmentInstance,
            } as DictionaryStringTo<IGeneratedAssessmentInstance>,
            isRequirementEnabled: true,
            isRequirementScanned: false,
        };
    }
    public withActionMessageCreator(actionMessageCreator: DetailsViewActionMessageCreator): VisualHelperToggleConfigBuilder {
        this.data.actionMessageCreator = actionMessageCreator;
        return this;
    }
    public withToggleStepEnabled(stepEnabled: boolean): VisualHelperToggleConfigBuilder {
        this.data.isRequirementEnabled = stepEnabled;
        return this;
    }
    public withToggleStepScanned(stepScanned: boolean): VisualHelperToggleConfigBuilder {
        this.data.isRequirementScanned = stepScanned;
        return this;
    }
    public withNonEmptyFilteredMap(isVisualizationEnabled: boolean = false): VisualHelperToggleConfigBuilder {
        this.data.instancesMap = {
            'selector-1': {
                testStepResults: {
                    [this.stepKey]: {
                        id: 'id1',
                        status: ManualTestStatus.UNKNOWN,
                        isVisualizationEnabled: isVisualizationEnabled,
                    } as ITestStepResult,
                } as IAssessmentResultType<any>,
            } as IGeneratedAssessmentInstance,
            'selector-2': {
                testStepResults: {
                    [this.stepKey]: {
                        id: 'id1',
                        status: ManualTestStatus.FAIL,
                        isVisualizationEnabled: isVisualizationEnabled,
                    } as ITestStepResult,
                } as IAssessmentResultType<any>,
            } as IGeneratedAssessmentInstance,
        };
        return this;
    }
    public withEmptyFilteredMap(): VisualHelperToggleConfigBuilder {
        this.data.instancesMap = {
            'selector-1': {
                testStepResults: {
                    [this.otherKey]: {
                        id: 'id2',
                        status: ManualTestStatus.UNKNOWN,
                    } as ITestStepResult,
                } as IAssessmentResultType<any>,
            } as IGeneratedAssessmentInstance,
        };
        return this;
    }
    public withPassingFilteredMap(): VisualHelperToggleConfigBuilder {
        this.data.instancesMap = {
            'selector-1': {
                testStepResults: {
                    [this.stepKey]: {
                        id: 'id2',
                        status: ManualTestStatus.PASS,
                    } as ITestStepResult,
                } as IAssessmentResultType<any>,
            } as IGeneratedAssessmentInstance,
            'selector-2': null,
        };
        return this;
    }
}
