// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { ReportBody, ReportBodyProps } from '../../../../../../DetailsView/reports/components/report-body';
import { shallowRender } from '../../../../common/shallow-render';

describe('ReportBodyTest', () => {
    it('renders', () => {
        const results: any[] = [
            {
                id: 'one',
            },
        ];
        const props: ReportBodyProps = {
            scanResult: {
                violations: results,
                passes: results,
                inapplicable: results,
                incomplete: [],
                timestamp: '',
                targetPageTitle: '',
                targetPageUrl: '',
            },
            scanDate: new Date(Date.UTC(2018, 3, 9, 9, 3)),
            pageTitle: 'page-title',
            pageUrl: 'http://page-url/',
            description: 'description-text',
            browserSpec: 'environment-version',
            extensionVersion: 'extension-version',
            axeVersion: 'axe-version',
        };

        expect(shallowRender(<ReportBody {...props} />)).toMatchSnapshot();
    });
});
