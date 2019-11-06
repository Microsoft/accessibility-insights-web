// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { FeatureFlags } from 'common/feature-flags';
import { NamedFC } from 'common/react/named-fc';
import { ReportExportComponentProps } from 'DetailsView/components/report-export-component';
import { getReportExportComponentPropsForAutomatedChecks } from 'DetailsView/components/report-export-component-props-factory';
import { CommandBarProps, ReportExportComponentPropertyConverter } from './details-view-command-bar';
import { DetailsViewCommandBar } from './details-view-command-bar';

export const AutomatedChecksCommandBar = NamedFC<CommandBarProps>('AutomatedChecksCommandBar', props => {
    let converter: ReportExportComponentPropertyConverter = props.reportExportComponentPropertyFactory;
    if (converter === null) {
        converter = getReportExportComponentPropsForAutomatedChecks;
    }
    const reportExportComponentProps: ReportExportComponentProps = converter(props);

    return (
        <DetailsViewCommandBar
            reportExportComponentProps={reportExportComponentProps}
            renderStartOver={props.featureFlagStoreData[FeatureFlags.universalCardsUI]}
            {...props}
        />
    );
});
