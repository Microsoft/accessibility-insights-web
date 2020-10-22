// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';
import { OutcomeChip } from 'reports/components/outcome-chip';
import { OutcomeSummaryBar } from 'reports/components/outcome-summary-bar';
import { allUrlOutcomeTypes, UrlOutcomeType } from 'reports/components/url-outcome-type';
import * as styles from './urls-summary-section.scss';

export type UrlsSummarySectionProps = {
    urlsPassedCount: number,
    urlsFailedCount: number,
    urlsNotScannedCount: number,
    failureInstancesCount: number,
};

export const UrlsSummarySection = NamedFC<UrlsSummarySectionProps>(
    'UrlsSummarySection',
    props => {
        const {urlsPassedCount, urlsFailedCount, urlsNotScannedCount, failureInstancesCount} = props;

        const getTotalUrls = () => {
            const totalUrls = urlsPassedCount + urlsFailedCount + urlsNotScannedCount;

            return (
                <>
                    <h2>URLs</h2>
                    {totalUrls} total URLs discovered
                </>
            );
        };

        const getSummaryBar = () => {
            const countSummary: { [type in UrlOutcomeType]: number } = {
                fail: urlsFailedCount,
                unscannable: urlsNotScannedCount,
                pass: urlsPassedCount,
            };

            return (
                <OutcomeSummaryBar
                    outcomeStats={countSummary}
                    iconStyleInverted={true}
                    allOutcomeTypes={allUrlOutcomeTypes}
                    textLabel={true}
                />
            );
        };

        const getFailedInstances = () => {
            return (
                <div className={styles.failureInstances}>
                    <h2>Failure Instances</h2>
                    <OutcomeChip count={failureInstancesCount} outcomeType={'fail'} /> Failure instances
                    were detected
                </div>
            );
        };

        return <div className={styles.urlsSummarySection}>
            {getTotalUrls()}
            {getSummaryBar()}
            {getFailedInstances()}
        </div>;
    }
);
