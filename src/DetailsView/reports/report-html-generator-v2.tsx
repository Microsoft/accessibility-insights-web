// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { EnvironmentInfo } from '../../common/environment-info-provider';
import { ScanResults } from '../../scanner/iruleresults';
import { ReportHeadV2 } from './components/report-head-v2';
import { CollapsibleScriptProvider } from './components/report-sections/collapsible-script-provider';
import { ReportBody, ReportBodyProps } from './components/report-sections/report-body';
import { ReportSectionFactory, SectionProps } from './components/report-sections/report-section-factory';
import { ReactStaticRenderer } from './react-static-renderer';
import { ReportHtmlGenerator } from './report-html-generator';

export class ReportHtmlGeneratorV2 implements ReportHtmlGenerator {
    constructor(
        private readonly sectionFactory: ReportSectionFactory,
        private readonly reactStaticRenderer: ReactStaticRenderer,
        private readonly environmentInfo: EnvironmentInfo,
        private readonly collapsibleScriptProvider: CollapsibleScriptProvider;
        private readonly utcDateConverter: (scanDate: Date) => string,
    ) {}

    public generateHtml(scanResult: ScanResults, scanDate: Date, pageTitle: string, pageUrl: string, description: string): string {
        const headElement: JSX.Element = <ReportHeadV2 />;
        const headMarkup: string = this.reactStaticRenderer.renderToStaticMarkup(headElement);

        const detailsProps: SectionProps = {
            pageTitle,
            pageUrl,
            description,
            scanDate,
            scanResult,
            environmentInfo: this.environmentInfo,
            toUtcString: this.utcDateConverter,
            collapsibleScriptProvider: this.collapsibleScriptProvider,
        };

        const props: ReportBodyProps = {
            sectionFactory: this.sectionFactory,
            ...detailsProps,
        };

        const bodyElement: JSX.Element = <ReportBody {...props} />;
        const bodyMarkup: string = this.reactStaticRenderer.renderToStaticMarkup(bodyElement);

        return '<html lang="en">' + headMarkup + bodyMarkup + '</html>';
    }
}
