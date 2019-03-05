// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { ReportHeader, ReportHeaderProps } from '../../../../../../DetailsView/reports/components/report-header';
import { shallowRender } from '../../../../common/shallow-render';

describe('ReportHeaderTest', () => {
    it('renders with failures, without inapplicable', () => {
        const props: ReportHeaderProps = {
            scanResult: {
                violations: [
                    {
                        nodes: [{}],
                    },
                    {
                        nodes: [{}, {}],
                    },
                ] as any,
                passes: [{}] as any,
                inapplicable: [],
                incomplete: [],
                timestamp: '',
                targetPageTitle: '',
                targetPageUrl: '',
            },
        };

        expect(shallowRender(<ReportHeader {...props} />)).toMatchSnapshot();
    });

    it('renders without failures, with inapplicable', () => {
        const props: ReportHeaderProps = {
            scanResult: {
                violations: [],
                passes: [],
                inapplicable: [{} as any],
                incomplete: [],
                timestamp: '',
                targetPageTitle: '',
                targetPageUrl: '',
            },
        };

        expect(shallowRender(<ReportHeader {...props} />)).toMatchSnapshot();
    });
});
