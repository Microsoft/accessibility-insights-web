// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Reporter } from 'reports/library/reporter';
import { reporterFactory } from 'reports/library/reporter-factory';
import { scan } from 'tests/unit/tests/reports/library/scans/scan';

describe('ReporterFactory', () => {
    it('returns a valid reporter', () => {
        const reporter = reporterFactory();

        expect(reporter).toBeInstanceOf(Reporter);
    });

    it('works end-to-end with results object', () => {
        const reporter = reporterFactory();
        const options = {
            browserVersion: 'BROWSER_VERSION',
            browserSpec: 'BROWSER_SPEC',
            pageTitle: 'PAGE_TITLE',
            description: 'DESCRIPTION',
        };
        const html = reporter.fromAxeResult(scan, options).asHTML();
        expect(html).toMatchSnapshot();
    });
});
