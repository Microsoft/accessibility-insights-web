// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { find } from 'lodash';
import { It, Mock } from 'typemoq';

import { IAssessmentsProvider } from '../../../../../assessments/types/iassessments-provider';
import { AssessmentTestDefinition } from '../../../../../common/assessment/assessment-test-result';
import { getRequirementsResults, RequirementDefinition } from '../../../../../common/assessment/requirement';
import { RequirementComparer } from '../../../../../common/assessment/requirement-comparer';
import { ManualTestStatus, ManualTestStatusData } from '../../../../../common/types/manual-test-status';
import { VisualizationType } from '../../../../../common/types/visualization-type';

describe('Requirement', () => {
    describe('getRequirementsResults', () => {
        it('merges and sorts data as expected', () => {
            const steps = [
                { key: 'gamma', name: 'at the top' },
                { key: 'alpha', name: 'in the middle' },
                { key: 'beta', name: 'on the bottom' },
            ];
            function getStep(key) {
                return find(steps, s => s.key === key) as RequirementDefinition;
            }

            const stepStatus = {
                alpha: { stepFinalResult: ManualTestStatus.PASS, isStepScanned: true },
                beta: { stepFinalResult: ManualTestStatus.FAIL, isStepScanned: true },
                gamma: { stepFinalResult: ManualTestStatus.PASS, isStepScanned: false },
            } as ManualTestStatusData;

            const test = {
                steps,
                requirementOrder: RequirementComparer.byName,
            } as AssessmentTestDefinition;

            const type = -3 as VisualizationType;

            const providerMock = Mock.ofType<IAssessmentsProvider>();
            providerMock.setup(p => p.forType(type)).returns(() => test);
            providerMock.setup(p => p.getStep(type, It.isAnyString())).returns((_, key) => getStep(key));

            const results = getRequirementsResults(providerMock.object, type, stepStatus);

            expect(results).toEqual([
                {
                    data: stepStatus.gamma,
                    definition: getStep('gamma'),
                },
                {
                    data: stepStatus.alpha,
                    definition: getStep('alpha'),
                },
                {
                    data: stepStatus.beta,
                    definition: getStep('beta'),
                },
            ]);
        });
    });
});
