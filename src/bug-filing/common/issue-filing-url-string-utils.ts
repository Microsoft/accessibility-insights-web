// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { EnvironmentInfo } from '../../common/environment-info-provider';
import { title } from '../../content/strings/application';
import { CreateIssueDetailsTextData } from './../../common/types/create-issue-details-text-data';

export type StringUtils = {
    footer: (info: EnvironmentInfo) => string;
    collapseConsecutiveSpaces: (input: string) => string;
    markdownEscapeBlock: (input: string) => string;
    getSelectorLastPart: (selector: string) => string;
    standardizeTags: (data: CreateIssueDetailsTextData) => string[];
};

export const IssueFilingUrlStringUtils: StringUtils = {
    footer: (environmentInfo: EnvironmentInfo): string => {
        return (
            `This accessibility issue was found using ${title} ` +
            `${environmentInfo.extensionVersion} (axe-core ${environmentInfo.axeCoreVersion}), ` +
            'a tool that helps find and fix accessibility issues. Get more information & download ' +
            'this tool at http://aka.ms/AccessibilityInsights.'
        );
    },
    collapseConsecutiveSpaces: (input: string): string => input.replace(/\s+/g, ' '),
    markdownEscapeBlock: (input: string): string =>
        input
            .split('\n')
            .map(line => `    ${line}`)
            .join('\n'),
    getSelectorLastPart: (selector: string): string => {
        let selectorLastPart = selector;
        if (selector.lastIndexOf(' > ') > 0) {
            selectorLastPart = selector.substr(selector.lastIndexOf(' > ') + 3);
        }
        return selectorLastPart;
    },
    standardizeTags: (data: CreateIssueDetailsTextData): string[] => data.ruleResult.guidanceLinks.map(tag => tag.text.toUpperCase()),
};
