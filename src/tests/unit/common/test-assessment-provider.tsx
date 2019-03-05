// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import * as React from 'react';

import { AssessmentsProvider } from '../../../assessments/assessments-provider';
import { Assessment } from '../../../assessments/types/iassessment';
import { RequirementComparer } from '../../../common/assessment/requirement-comparer';
import { IAssesssmentVisualizationConfiguration } from '../../../common/configs/visualization-configuration-factory';
import { FeatureFlags } from '../../../common/feature-flags';
import { ManualTestStatus } from '../../../common/types/manual-test-status';
import { VisualizationType } from '../../../common/types/visualization-type';
import { TestStepLink } from '../../../DetailsView/components/test-step-link';
import { ContentPage } from '../../../views/content/content-page';

const content = {
    assessment1: {
        guidance: ContentPage.create(() => 'GUIDANCE' as any),
    },
};

export const contentProvider = ContentPage.provider(content);

const assessmentWithColumns: Assessment = {
    key: 'assessment-1',
    type: -1 as VisualizationType,
    title: 'assessment 1',
    gettingStarted: null,
    guidance: content.assessment1.guidance,
    steps: [
        {
            key: 'assessment-1-step-1',
            description: <div> assessment-1-step-1 description</div>,
            name: 'assessment-1-step-1-name',
            howToTest: null,
            isManual: null,
            guidanceLinks: [],
            columnsConfig: [
                {
                    key: 'col-key-1',
                    name: 'col-name-1',
                    onRender: () => null,
                },
                {
                    key: 'col-key-2',
                    name: 'col-name-2',
                    onRender: () => null,
                },
            ],
            getInstanceStatusColumns: getInstanceStatusColumns,
            renderRequirementDescription: renderRequirementDescription,
        },
        {
            key: 'assessment-1-step-2',
            description: <div> assessment-1-step-2 description</div>,
            name: 'assessment-1-step-2-name',
            howToTest: null,
            isManual: true,
            guidanceLinks: [],
            doNotScanByDefault: true,
            getInstanceStatusColumns: getInstanceStatusColumns,
            renderRequirementDescription: renderRequirementDescription,
        },
        {
            key: 'assessment-1-step-3',
            description: <div> assessment-1-step-3 description</div>,
            name: 'assessment-1-step-3-name',
            howToTest: null,
            isManual: null,
            guidanceLinks: [],
            getInstanceStatusColumns: getInstanceStatusColumns,
            renderRequirementDescription: renderRequirementDescription,
        },
    ],
    getVisualizationConfiguration: () => {
        return {
            getAssessmentData: data => data.assessments['assessment-1'],
        } as IAssesssmentVisualizationConfiguration;
    },
    requirementOrder: RequirementComparer.byOrdinal,
};

const simpleAssessment = {
    key: 'assessment-2',
    type: -2 as VisualizationType,
    title: 'assessment 2',
    gettingStarted: null,
    steps: [
        {
            key: 'assessment-2-step-1',
            description: null,
            name: 'assessment-2-step-1-name',
            howToTest: null,
            isManual: null,
            guidanceLinks: [],
            getInstanceStatusColumns: getInstanceStatusColumns,
            renderRequirementDescription: renderRequirementDescription,
        },
        {
            key: 'assessment-2-step-2',
            description: null,
            name: 'assessment-2-step-2-name',
            howToTest: null,
            isManual: null,
            guidanceLinks: [],
            getInstanceStatusColumns: getInstanceStatusColumns,
            renderRequirementDescription: renderRequirementDescription,
        },
    ],
    getVisualizationConfiguration: () => {
        return {
            getAssessmentData: data => data.assessments['assessment-2'],
        } as IAssesssmentVisualizationConfiguration;
    },
    requirementOrder: RequirementComparer.byOrdinal,
};

const automatedAssessment = {
    key: 'assessment-3',
    type: -3 as VisualizationType,
    title: 'assessment 3',
    gettingStarted: null,
    steps: [
        {
            key: 'assessment-3-step-2',
            description: null,
            name: 'assessment-3-step-2-name',
            howToTest: null,
            isManual: null,
            guidanceLinks: [],
            columnsConfig: [],
            defaultInstanceStatus: ManualTestStatus.FAIL,
            renderInstanceTableHeader: () => null,
            getInstanceStatusColumns: () => [],
            renderRequirementDescription: renderRequirementDescription,
        },
        {
            key: 'assessment-3-step-1',
            description: null,
            name: 'assessment-3-step-1-name',
            howToTest: null,
            isManual: null,
            guidanceLinks: [],
            columnsConfig: [],
            defaultInstanceStatus: ManualTestStatus.FAIL,
            renderInstanceTableHeader: () => null,
            getInstanceStatusColumns: () => [],
            renderRequirementDescription: renderRequirementDescription,
        },
    ],
    getVisualizationConfiguration: () => {
        return {
            getAssessmentData: data => data.assessments['assessment-3'],
        } as IAssesssmentVisualizationConfiguration;
    },
    requirementOrder: RequirementComparer.byOutcomeAndName,
};

function getInstanceStatusColumns(): Readonly<IColumn>[] {
    return [TestStatusChoiceColumn];
}

function renderRequirementDescription(testStepLink: TestStepLink): JSX.Element {
    return null;
}

const simpleAssessmentWithFeatureFlag = {
    ...simpleAssessment,
    featureFlag: { required: [FeatureFlags.showAllAssessments] },
};

export const CreateTestAssessmentProvider = () => AssessmentsProvider.Create([assessmentWithColumns, simpleAssessment]);

export const CreateTestAssessmentProviderWithFeatureFlag = () =>
    AssessmentsProvider.Create([assessmentWithColumns, simpleAssessmentWithFeatureFlag]);

export const CreateTestAssessmentProviderAutomated = () => AssessmentsProvider.Create([automatedAssessment]);

export const TestStatusChoiceColumn: Readonly<IColumn> = {
    key: 'test - statusChoiceGroup',
    name: 'Pass / Fail',
    ariaLabel: 'Pass',
    fieldName: 'statusChoiceGroup',
    minWidth: 100,
    maxWidth: 100,
    isResizable: false,
};
