// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { AssessmentDefaultMessageGenerator } from '../../assessments/assessment-default-message-generator';
import { AssessmentsProvider } from '../../assessments/types/iassessments-provider';
import { AssessmentTestResult } from '../../common/assessment/assessment-test-result';
import { VisualizationConfiguration } from '../../common/configs/visualization-configuration-factory';
import { NamedSFC } from '../../common/react/named-sfc';
import { AssessmentStoreData } from '../../common/types/store-data/assessment-result-data';
import { TabStoreData } from '../../common/types/store-data/tab-store-data';
import { VisualizationStoreData } from '../../common/types/store-data/visualization-store-data';
import { AssessmentInstanceTableHandler } from '../handlers/assessment-instance-table-handler';
import { AssessmentView, AssessmentViewDeps } from './assessment-view';

export type AssessmentTestViewDeps = AssessmentViewDeps & {
    assessmentsProvider: AssessmentsProvider;
    assessmentDefaultMessageGenerator: AssessmentDefaultMessageGenerator;
};

export interface AssessmentTestViewProps {
    deps: AssessmentTestViewDeps;
    tabStoreData: TabStoreData;
    assessmentStoreData: AssessmentStoreData;
    visualizationStoreData: VisualizationStoreData;
    assessmentInstanceTableHandler: AssessmentInstanceTableHandler;
    configuration: VisualizationConfiguration;
}

export const AssessmentTestView = NamedSFC<AssessmentTestViewProps>('AssessmentTestView', ({ deps, ...props }) => {
    const isScanning: boolean = props.visualizationStoreData.scanning !== null;
    const scanData = props.configuration.getStoreData(props.visualizationStoreData.tests);
    const assessmentData = props.configuration.getAssessmentData(props.assessmentStoreData);
    const prevTarget = props.assessmentStoreData.persistedTabInfo;
    const isEnabled = props.configuration.getTestStatus(scanData, props.assessmentStoreData.assessmentNavState.selectedTestStep);
    const currentTarget = {
        id: props.tabStoreData.id,
        url: props.tabStoreData.url,
        title: props.tabStoreData.title,
    };
    const assessmentTestResult = new AssessmentTestResult(
        deps.assessmentsProvider,
        props.assessmentStoreData.assessmentNavState.selectedTestType,
        assessmentData,
    );
    return (
        <AssessmentView
            deps={deps}
            isScanning={isScanning}
            isEnabled={isEnabled}
            assessmentNavState={props.assessmentStoreData.assessmentNavState}
            assessmentInstanceTableHandler={props.assessmentInstanceTableHandler}
            assessmentData={assessmentData}
            currentTarget={currentTarget}
            prevTarget={prevTarget}
            assessmentDefaultMessageGenerator={deps.assessmentDefaultMessageGenerator}
            assessmentTestResult={assessmentTestResult}
        />
    );
});
