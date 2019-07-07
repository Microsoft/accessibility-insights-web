// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';
import { NamedSFC } from '../../../../common/react/named-sfc';
import { FixInstructionProcessor } from '../../../../injected/fix-instruction-processor';
import { RuleResult } from '../../../../scanner/iruleresults';
import { InstanceOutcomeType } from '../instance-outcome-type';
import { outcomeTypeSemantics } from '../outcome-type';
import { CollapsibleContainer } from './collapsible-container';
import { FullRuleDetailDeps } from './full-rule-detail';
import { MinimalRuleHeader } from './minimal-rule-detail';
import { RuleContent, RuleContentDeps } from './rule-content';

export type RulesWithInstancesDeps = FullRuleDetailDeps & RuleContentDeps;

export type RulesWithInstancesProps = {
    deps: RulesWithInstancesDeps;
    fixInstructionProcessor: FixInstructionProcessor;
    rules: RuleResult[];
    outcomeType: InstanceOutcomeType;
};

export const RulesWithInstances = NamedSFC<RulesWithInstancesProps>(
    'RulesWithInstances',
    ({ rules, outcomeType, fixInstructionProcessor, deps }) => {
        return (
            <div className="rule-details-group">
                {rules.map((rule, idx) => {
                    const { pastTense } = outcomeTypeSemantics[outcomeType];
                    const buttonAriaLabel = `${rule.id} ${rule.nodes.length} ${pastTense} ${rule.description}`;
                    return (
                        <CollapsibleContainer
                            key={`summary-details-${idx + 1}`}
                            id={rule.id}
                            visibleHeadingContent={<MinimalRuleHeader key={rule.id} rule={rule} outcomeType={outcomeType} />}
                            collapsibleContent={
                                <RuleContent
                                    key={`${rule.id}-rule-group`}
                                    deps={deps}
                                    rule={rule}
                                    fixInstructionProcessor={fixInstructionProcessor}
                                />
                            }
                            containerClassName="collapsible-rule-details-group"
                            titleHeadingLevel={3}
                            buttonAriaLabel={buttonAriaLabel}
                        />
                    );
                })}
            </div>
        );
    },
);
