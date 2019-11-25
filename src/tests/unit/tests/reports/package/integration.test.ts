// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { reporterFactory } from 'reports/package/reporter-factory';
import { scanIssues } from 'tests/unit/tests/reports/package/scans/scan-issues';
import { scanNoIssues } from 'tests/unit/tests/reports/package/scans/scan-no-issues';

describe('ReporterFactory', () => {
    const options = {
        browserVersion: 'BROWSER_VERSION',
        browserSpec: 'BROWSER_SPEC',
        pageTitle: 'PAGE_TITLE',
        description: 'DESCRIPTION',
    };

    it('works end-to-end with no issues scan', () => {
        const reporter = reporterFactory();
        const html = reporter.fromAxeResult(scanNoIssues, options).asHTML();
        expect(html).toMatchSnapshot();
    });

    it('works end-to-end with issues scan', () => {
        const reporter = reporterFactory();
        const html = reporter.fromAxeResult(scanIssues, options).asHTML();
        expect(html).toMatchSnapshot();
    });
});
