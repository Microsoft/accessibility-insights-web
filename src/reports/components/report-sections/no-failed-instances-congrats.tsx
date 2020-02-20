// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';
import { InlineImage, InlineImageType } from 'reports/components/inline-image';
import * as styles from './no-failed-instances-congrats.scss';

export type NoFailedInstancesCongratsDeps = {
    customCongratsMessage: String;
};

export type NoFailedInstancesCongratsProps = {
    deps: NoFailedInstancesCongratsDeps;
};

export const NoFailedInstancesCongrats = NamedFC<NoFailedInstancesCongratsProps>(
    'NoFailedInstancesCongrats',
    props => {
        const message = props.deps.customCongratsMessage
            ? props.deps.customCongratsMessage
            : "No failed automated checks were found. Continue investigating your website's accessibility compliance through manual testing using Tab stops and Assessment in Accessibility Insights for Web.";
        return (
            <div className={styles.reportCongratsMessage}>
                <div className={styles.reportCongratsHead}>Congratulations!</div>
                <div className={styles.reportCongratsInfo}>{message}</div>
                <InlineImage
                    className={styles.sleepingAda}
                    imageType={InlineImageType.SleepingAda}
                    alt=""
                />
            </div>
        );
    },
);
