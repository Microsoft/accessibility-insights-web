// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { EnvironmentInfoProvider } from '../common/environment-info-provider';
import { CreateIssueDetailsTextData } from '../common/types/create-issue-details-text-data';
import { IssueDetailsBuilder } from '../issue-filing/common/issue-details-builder';
import { IssueUrlCreationUtils } from '../issue-filing/common/issue-filing-url-string-utils';

export class IssueDetailsTextGenerator {
    constructor(
        private issueFilingUrlStringUtils: IssueUrlCreationUtils,
        private environmentInfoProvider: EnvironmentInfoProvider,
        private issueDetailsBuilder: IssueDetailsBuilder,
    ) {}

    public buildText(data: CreateIssueDetailsTextData): string {
        const standardTags = this.issueFilingUrlStringUtils.standardizeTags(
            data,
        );

        const text = [
            `Title: ${this.issueFilingUrlStringUtils.getTitle(data)}`,
            `Tags: ${this.buildTags(data, standardTags)}`,
            ``,
            this.issueDetailsBuilder(
                this.environmentInfoProvider.getEnvironmentInfo(),
                data,
            ),
        ].join('\n');

        return text;
    }

    public buildTags(
        createIssueData: CreateIssueDetailsTextData,
        standardTags: string[],
    ): string {
        const tags = [
            'Accessibility',
            ...standardTags,
            createIssueData.rule.id,
        ];
        return tags.join(', ');
    }
}
