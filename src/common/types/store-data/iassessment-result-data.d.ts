// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { VisualizationType } from '../visualization-type';
import { ManualTestStatusData, ManualTestStatus } from '../manual-test-status';
import { ITab } from '../../itab';

export type TestStepInstance = IUserCapturedInstance & IGeneratedAssessmentInstance;

export type PersistedTabInfo = ITab & {
    appRefreshed: boolean;
};
// tslint:disable-next-line:interface-name
export interface IAssessmentStoreData {
    persistedTabInfo: PersistedTabInfo;
    assessments: {
        [key: string]: IAssessmentData;
    };
    assessmentNavState: AssessmentNavState;
}

export type InstanceIdToInstanceDataMap = IDictionaryStringTo<IGeneratedAssessmentInstance>;
export type RequirementIdToResultMap = IDictionaryStringTo<IManualTestStepResult>;

// tslint:disable-next-line:interface-name
export interface IAssessmentData {
    fullAxeResultsMap;
    generatedAssessmentInstancesMap?: InstanceIdToInstanceDataMap;
    manualTestStepResultMap?: RequirementIdToResultMap;
    testStepStatus: ManualTestStatusData;
}

// tslint:disable-next-line:interface-name
export interface IManualTestStepResult {
    status: ManualTestStatus;
    id: string;
    instances: IUserCapturedInstance[];
}

// tslint:disable-next-line:interface-name
export interface IUserCapturedInstance {
    id: string;
    description: string;
    html?: string;
    selector?: string;
}

// tslint:disable-next-line:interface-name
export interface IGeneratedAssessmentInstance<T = {}, K = {}> {
    target: string[];
    html: string;
    testStepResults: IAssessmentResultType<K>;
    propertyBag?: T;
}

// tslint:disable-next-line:interface-name
export interface ITestStepResult {
    id: string;
    status: ManualTestStatus;
    isCapturedByUser: boolean;
    failureSummary: string;
    isVisualizationEnabled: boolean;
    isVisible: boolean;
    originalStatus?: ManualTestStatus;
}

export interface AssessmentNavState {
    selectedTestStep: string;
    selectedTestType: VisualizationType;
}

// tslint:disable-next-line:interface-name
export interface IHeadingsAssessmentProperties {
    headingLevel: string;
    headingText: string;
}

// tslint:disable-next-line:interface-name
export interface IFrameAssessmentProperties {
    frameType: string;
    frameTitle?: string;
}

// tslint:disable-next-line:interface-name
export interface ILandmarksAssessmentProperties {
    role: string;
    label: string;
}

// tslint:disable-next-line:interface-name
export type IAssessmentInstancesMap<T = {}, K = {}> = IDictionaryStringTo<IGeneratedAssessmentInstance<T, K>>;
// tslint:disable-next-line:interface-name
export type IAssessmentResultType<K> = { [testStepName in keyof K]: ITestStepResult };
