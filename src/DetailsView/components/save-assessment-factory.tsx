// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';
import { FileURLProvider } from '../../common/file-url-provider';
import { SaveAssessmentButton } from 'DetailsView/components/save-assessment-button';
import { AssessmentDataFormatter } from 'common/assessment-data-formatter';
import { AssessmentStoreData } from 'common/types/store-data/assessment-result-data';
import { FileNameBuilder } from 'common/filename-builder'

export type SaveAssessmentFactoryDeps = {
    fileURLProvider: FileURLProvider;
    fileNameBuilder: FileNameBuilder;
    assessmentDataFormatter: AssessmentDataFormatter;
};

export type SaveAssessmentFactoryProps = {
    deps: SaveAssessmentFactoryDeps;
    assessmentStoreData: AssessmentStoreData;
};

export function getSaveButtonForAssessment(props: SaveAssessmentFactoryProps): JSX.Element {
    const assessmentData = props.deps.assessmentDataFormatter.formatAssessmentData(
        props.assessmentStoreData.assessments,
    );

    const currentDate = new Date();
    const fileDate = props.deps.fileNameBuilder.getDateSegment(currentDate)
    const targetPageTitle = props.assessmentStoreData.persistedTabInfo.title;
    const fileTitle = props.deps.fileNameBuilder.getTitleSegment(targetPageTitle);
    const fileName = `SavedAssessment_<${fileDate}>_${fileTitle}.allyextension`;
    const fileURL = props.deps.fileURLProvider.provideURL([assessmentData], 'application/json');

    return <SaveAssessmentButton download={fileName} href={fileURL} />;
}

export function getSaveButtonForFastPass(props: SaveAssessmentFactoryProps): JSX.Element | null {
    return null;
}
