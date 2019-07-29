// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { NamedSFC } from 'common/react/named-sfc';
import { CollapsibleResultSection } from './collapsible-result-section';
import { SectionProps } from './report-section-factory';

export type PassedChecksSectionProps = Pick<SectionProps, 'scanResult' | 'getGuidanceTagsFromGuidanceLinks'>;

export const PassedChecksSection = NamedSFC<PassedChecksSectionProps>(
    'PassedChecksSection',
    ({ scanResult, getGuidanceTagsFromGuidanceLinks }) => {
        const rules = scanResult.passes;
        return (
            <CollapsibleResultSection
                deps={{ getGuidanceTagsFromGuidanceLinks }}
                title="Passed checks"
                rules={rules}
                containerClassName="result-section"
                outcomeType="pass"
                badgeCount={rules.length}
                containerId="passed-checks-section"
            />
        );
    },
);
