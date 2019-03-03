// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { NewTabLink } from '../../../common/components/new-tab-link';
import { toolName } from '../../../content/strings/application';
import { ScanResults } from '../../../scanner/iruleresults';
import { ReportCheckList } from './report-check-list';
import { ReportHeader } from './report-header';
import { ReportScanDetails } from './report-scan-details';

export interface ReportBodyProps {
    scanResult: ScanResults;
    scanDate: Date;
    pageTitle: string;
    pageUrl: string;
    description: string;
    browserSpec: string;
    extensionVersion: string;
    axeVersion: string;
}

export class ReportBody extends React.Component<ReportBodyProps> {
    public render(): JSX.Element {
        return (
            <body>
                <ReportHeader scanResult={this.props.scanResult} />
                <div className="report-body" role="main">
                    <h3>Assessment details</h3>
                    <ReportScanDetails
                        pageTitle={this.props.pageTitle}
                        pageUrl={this.props.pageUrl}
                        description={this.props.description}
                        scanDate={this.props.scanDate}
                        browserSpec={this.props.browserSpec}
                        extensionVersion={this.props.extensionVersion}
                        axeVersion={this.props.axeVersion}
                    />
                    <div role="region" aria-labelledby="failed">
                        <h3 id="failed">Failed checks</h3>
                        <ReportCheckList
                            results={this.props.scanResult.violations}
                            idPrefix="f"
                            showInstanceCount={true}
                            showInstances={true}
                            congratulateIfEmpty={true}
                        />
                    </div>
                    <div role="region" aria-labelledby="passed">
                        <h3 id="passed">Passed checks</h3>
                        <ReportCheckList
                            results={this.props.scanResult.passes}
                            idPrefix="p"
                            showInstanceCount={true}
                            showInstances={false}
                            congratulateIfEmpty={false}
                        />
                    </div>
                    <div role="region" aria-labelledby="notapplicable">
                        <h3 id="notapplicable">Not applicable checks</h3>
                        <ReportCheckList
                            results={this.props.scanResult.inapplicable}
                            idPrefix="n"
                            showInstanceCount={false}
                            showInstances={false}
                            congratulateIfEmpty={false}
                        />
                    </div>
                </div>
                {this.renderFooter()}
            </body>
        );
    }

    private renderFooter(): JSX.Element {
        return (
            <div className="report-footer" role="contentinfo">
                This automated checks result was generated using <b id="tool-name">{toolName}</b>, a tool that helps debug and find
                accessibility issues earlier. Get more information & download this tool at{' '}
                <NewTabLink
                    href="http://aka.ms/AccessibilityInsights"
                    aria-labelledby="tool-name"
                    title={`Get more information and download ${toolName}`}
                >
                    http://aka.ms/AccessibilityInsights
                </NewTabLink>
                .
            </div>
        );
    }
}
