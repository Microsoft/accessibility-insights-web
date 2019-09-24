// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';

import { CollapsibleComponentCardsProps } from '../../../DetailsView/components/cards/collapsible-component-cards';
import { ResultSectionTitle } from '../../../DetailsView/components/cards/result-section-title';
import { ResultSectionProps } from './result-section';
import { RulesOnly, RulesOnlyDeps, RulesOnlyProps } from './rules-only';

export type CollapsibleResultSectionDeps = {
    collapsibleControl: (props: CollapsibleComponentCardsProps) => JSX.Element;
} & RulesOnlyDeps;

export type CollapsibleResultSectionProps = RulesOnlyProps &
    ResultSectionProps & {
        deps: CollapsibleResultSectionDeps;
        containerId: string;
    };

export const CollapsibleResultSection = NamedFC<CollapsibleResultSectionProps>('CollapsibleResultSection', props => {
    const { containerClassName, containerId, deps } = props;
    const CollapsibleContent = deps.collapsibleControl({
        id: containerId,
        header: <ResultSectionTitle {...props} />,
        content: <RulesOnly {...props} />,
        headingLevel: 2,
    });

    return <div className={containerClassName}>{CollapsibleContent}</div>;
});
