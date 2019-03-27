// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as _ from 'lodash/index';

import { AssessmentDefaultMessageGenerator, DefaultMessageInterface } from '../../assessments/assessment-default-message-generator';
import { Assessment } from '../../assessments/types/iassessment';
import { AssessmentsProvider } from '../../assessments/types/iassessments-provider';
import { ManualTestStatus } from '../../common/types/manual-test-status';
import { IAssessmentData, IAssessmentStoreData, TestStepInstance } from '../../common/types/store-data/iassessment-result-data';
import { ITabStoreData } from '../../common/types/store-data/itab-store-data';
import { assessmentReportExtensionPoint } from '../extensions/assessment-report-extension-point';
import {
    AssessmentDetailsReportModel,
    InstancePairReportModel,
    InstanceReportModel,
    ReportModel,
    RequirementReportModel,
} from './assessment-report-model';
import { getAssessmentSummaryModelFromResults } from './get-assessment-summary-model';

type AssessmentResult = Assessment & { storeData: IAssessmentData };

export class AssessmentReportModelBuilder {
    constructor(
        private readonly assessmentsProvider: AssessmentsProvider,
        private readonly assessmentStoreData: IAssessmentStoreData,
        private readonly tabStoreData: ITabStoreData,
        private readonly reportDate: Date,
        private assessmentDefaultMessageGenerator: AssessmentDefaultMessageGenerator,
    ) {}

    public getReportModelData(): ReportModel {
        const assessmentDefaultMessageGeneratorInstance = this.assessmentDefaultMessageGenerator;
        const assessments: AssessmentResult[] = this.assessmentsProvider.all().map(a => ({
            ...a,
            storeData: this.assessmentStoreData.assessments[a.key],
        }));

        const scanDetails = {
            targetPage: this.tabStoreData.title,
            url: this.tabStoreData.url,
            reportDate: this.reportDate,
        };

        return {
            summary: getAssessmentSummaryModelFromResults(assessments),
            scanDetails: scanDetails,
            passedDetailsData: getDetails(ManualTestStatus.PASS),
            failedDetailsData: getDetails(ManualTestStatus.FAIL),
            incompleteDetailsData: getDetails(ManualTestStatus.UNKNOWN),
        } as ReportModel;

        function getDefaultMessageComponent(getDefaultMessage, instancesMap, selectedStep): DefaultMessageInterface {
            const defaultMessageGenerator = getDefaultMessage(assessmentDefaultMessageGeneratorInstance);
            const defaultMessageComponent = defaultMessageGenerator(instancesMap, selectedStep);
            return defaultMessageComponent;
        }

        function getDetails(status: ManualTestStatus): AssessmentDetailsReportModel[] {
            return assessments
                .map(assessment => {
                    return {
                        key: assessment.key,
                        displayName: assessment.title,
                        steps: assessment.steps
                            .filter(step => {
                                return assessment.storeData.testStepStatus[step.key].stepFinalResult === status;
                            })
                            .map(step => {
                                const generatedInstancesMap = assessment.storeData.generatedAssessmentInstancesMap;
                                const model: RequirementReportModel = {
                                    key: step.key,
                                    header: {
                                        displayName: step.name,
                                        description: step.renderReportDescription(),
                                        guidanceLinks: step.guidanceLinks,
                                        requirementType: step.isManual ? 'manual' : 'assisted',
                                    },
                                    instances: getInstances(assessment, step.key),
                                    defaultMessageComponent: getDefaultMessageComponent(
                                        step.getDefaultMessage,
                                        generatedInstancesMap,
                                        step.key,
                                    ),
                                    showPassingInstances: true,
                                };

                                assessmentReportExtensionPoint.apply(assessment.extensions).alterRequirementReportModel(model);

                                return model;
                            }),
                    } as AssessmentDetailsReportModel;
                })
                .filter(assessmentDetails => {
                    return assessmentDetails.steps.length > 0;
                }) as AssessmentDetailsReportModel[];
        }

        function getInstances(assessment: AssessmentResult, stepKey: string): InstanceReportModel[] {
            const { storeData } = assessment;
            const { reportInstanceFields } = _.find(assessment.steps, s => s.key === stepKey);

            function getInstanceReportModel(instance: Partial<TestStepInstance>): InstanceReportModel {
                const props = reportInstanceFields.map(
                    ({ label, getValue }) => ({ key: label, value: getValue(instance) } as InstancePairReportModel),
                );
                return { props };
            }

            function getManualData(): InstanceReportModel[] {
                return storeData.manualTestStepResultMap[stepKey].instances.map(instance => getInstanceReportModel(instance));
            }

            function getAssistedData(): InstanceReportModel[] {
                if (storeData.generatedAssessmentInstancesMap == undefined) {
                    return [];
                }

                return _.keys(storeData.generatedAssessmentInstancesMap)
                    .filter(key => {
                        const testStepResult = storeData.generatedAssessmentInstancesMap[key].testStepResults[stepKey];
                        return testStepResult != undefined && testStepResult.status === storeData.testStepStatus[stepKey].stepFinalResult;
                    })
                    .map(key => getInstanceReportModel(storeData.generatedAssessmentInstancesMap[key]));
            }

            if (
                storeData.testStepStatus[stepKey].stepFinalResult === ManualTestStatus.FAIL &&
                !(
                    storeData.manualTestStepResultMap[stepKey] === undefined ||
                    storeData.manualTestStepResultMap[stepKey].instances.length === 0
                )
            ) {
                return getManualData();
            }

            return getAssistedData();
        }
    }
}
