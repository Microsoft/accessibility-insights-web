// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IssueDetailsTextGenerator } from 'background/issue-details-text-generator';
import { IMock, Mock, MockBehavior } from 'typemoq';
import { CreateIssueDetailsTextData } from '../../../../common/types/create-issue-details-text-data';
import { IssueUrlCreationUtils } from '../../../../issue-filing/common/issue-filing-url-string-utils';

describe('Issue details text builder', () => {
    let testSubject: IssueDetailsTextGenerator;
    let sampleIssueDetailsData: CreateIssueDetailsTextData;
    let issueUrlCreationUtilsMock: IMock<IssueUrlCreationUtils>;

    const title = 'WCAG-1.4.1,WCAG-2.8.2: RR-help (RR-selector<x>)';
    const selector = 'RR-selector<x>';

    beforeEach(() => {
        sampleIssueDetailsData = {
            pageTitle: 'pageTitle<x>',
            pageUrl: 'pageUrl',
            ruleResult: {
                failureSummary: 'RR-failureSummary',
                guidanceLinks: [{ text: 'WCAG-1.4.1' }, { text: 'wcag-2.8.2' }],
                help: 'RR-help',
                html: 'RR-html',
                ruleId: 'RR-rule-id',
                helpUrl: 'RR-help-url',
                selector: selector,
                snippet: 'RR-snippet   space',
            } as any,
        };

        issueUrlCreationUtilsMock = Mock.ofType<IssueUrlCreationUtils>(undefined, MockBehavior.Strict);
        issueUrlCreationUtilsMock.setup(utils => utils.getSelectorLastPart(selector)).returns(() => selector);
        issueUrlCreationUtilsMock.setup(utils => utils.getTitle(sampleIssueDetailsData)).returns(() => title);

        testSubject = new IssueDetailsTextGenerator('MY.EXT.VER', 'browser spec', 'AXE.CORE.VER', issueUrlCreationUtilsMock.object);
    });

    test('buildText', () => {
        const actual = testSubject.buildText(sampleIssueDetailsData);
        const expected = [
            `Title: ${title}`,
            `Tags: Accessibility, WCAG-1.4.1, WCAG-2.8.2, RR-rule-id`,
            ``,
            `Issue: RR-help (RR-rule-id: RR-help-url)`,
            ``,
            `Target application title: pageTitle<x>`,
            `Target application url: pageUrl`,
            ``,
            `Element path: ${selector}`,
            ``,
            `Snippet: RR-snippet space`,
            ``,
            `How to fix:`,
            `RR-failureSummary`,
            ``,
            `Environment:`,
            `browser spec`,
            ``,
            `====`,
            ``,
            'This accessibility issue was found using Accessibility Insights for Web MY.EXT.VER (axe-core AXE.CORE.VER), ' +
                'a tool that helps find and fix accessibility issues. Get more information & download ' +
                'this tool at http://aka.ms/AccessibilityInsights.',
        ].join('\n');
        expect(actual).toEqual(expected);
    });

    const noStandardTags = [];
    const oneStandardTag = ['WCAG-1.4.1'];
    const manyStandardTags = ['WCAG-1.4.1', 'WCAG-2.8.2', 'WCAG-4.1.4'];

    describe('buildTags', () => {
        test('no standard tags', () => {
            const expected = 'Accessibility, RR-rule-id';
            const actual = testSubject.buildTags(sampleIssueDetailsData, noStandardTags);

            expect(actual).toEqual(expected);
        });

        test('one standard tag', () => {
            const expected = 'Accessibility, WCAG-1.4.1, RR-rule-id';
            const actual = testSubject.buildTags(sampleIssueDetailsData, oneStandardTag);

            expect(actual).toEqual(expected);
        });

        test('many standard tags', () => {
            const expected = 'Accessibility, WCAG-1.4.1, WCAG-2.8.2, WCAG-4.1.4, RR-rule-id';
            const actual = testSubject.buildTags(sampleIssueDetailsData, manyStandardTags);

            expect(actual).toEqual(expected);
        });
    });
});
