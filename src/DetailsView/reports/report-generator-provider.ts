// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BaseStore } from '../../common/base-store';
import { FeatureFlagStoreData } from '../../common/types/store-data/feature-flag-store-data';
import { AssessmentReportHtmlGenerator } from './assessment-report-html-generator';
import { ReportGenerator } from './report-generator';
import { ReportGeneratorV1 } from './report-generator-v1';
import { ReportHtmlGenerator } from './report-html-generator';
import { ReportNameGenerator } from './report-name-generator';

export type ReportGeneratorProvider = {
    getGenerator(): ReportGenerator;
};

export const createReportGeneratorProvider = (
    reportNameGenerator: ReportNameGenerator,
    reportHtmlGenerator: ReportHtmlGenerator,
    assessmentReportHtmlGenerator: AssessmentReportHtmlGenerator,
    featureFlagStore: BaseStore<FeatureFlagStoreData>,
): ReportGeneratorProvider => {
    const getGenerator = () => {
        return new ReportGeneratorV1(reportNameGenerator, reportHtmlGenerator, assessmentReportHtmlGenerator);
    };

    return {
        getGenerator,
    };
};
