// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';
import { outcomeChipContainer } from 'reports/components/report-sections/minimal-rule-header.scss';

import { InstanceOutcomeType } from '../instance-outcome-type';
import { OutcomeChip } from '../outcome-chip';

export const ruleIdAutomationId = 'cards-rule-id';

export type MinimalRuleHeaderProps = {
    rule: {
        id: string;
        description: string;
        nodes: any[];
    };
    outcomeType: InstanceOutcomeType;
};

export const MinimalRuleHeader = NamedFC<MinimalRuleHeaderProps>('MinimalRuleHeader', props => {
    const { outcomeType, rule } = props;

    const renderCountBadge = () => {
        if (outcomeType !== 'fail') {
            return null;
        }

        return (
            <span aria-hidden="true">
                <OutcomeChip count={rule.nodes.length} outcomeType={outcomeType} />
            </span>
        );
    };

    const renderRuleName = () => (
        <span data-automation-id={ruleIdAutomationId} className="rule-details-id">
            {rule.id}
        </span>
    );

    const renderDescription = () => <span className="rule-details-description">{rule.description}</span>;

    return (
        <span className="rule-detail">
            <span className={outcomeChipContainer}>{renderCountBadge()}</span>
            <span>
                {renderRuleName()}: {renderDescription()}
            </span>
        </span>
    );
});
