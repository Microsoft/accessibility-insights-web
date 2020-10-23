// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { reporterFactory, SummaryReportParameters } from 'accessibility-insights-report';
import * as path from 'path';
import * as prettier from 'prettier';

import { summaryScanWithIssues } from './examples/summary-scan-with-issues.input';
import { summaryScanWithoutIssues } from './examples/summary-scan-without-issues.input';

describe('fromSummaryResults', () => {
    const examples = {
        'summary-scan-with-issues': summaryScanWithIssues,
        'summary-scan-without-issues': summaryScanWithoutIssues,
    };

    describe.each(Object.keys(examples))('with example input "%s"', (exampleName: string) => {
        const input: SummaryReportParameters = examples[exampleName];

        it('produces pinned HTML file', () => {
            const output = reporterFactory().fromSummaryResults(input).asHTML();
            const formattedOutput = prettier.format(output, { parser: 'html' });

            const snapshotFile = path.join(__dirname, 'examples', `${exampleName}.snap.html`);
            expect(formattedOutput).toMatchFile(snapshotFile);
        });
    });
});
