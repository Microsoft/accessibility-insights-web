// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IRuleConfiguration } from 'scanner/iruleresults';
import { DictionaryStringTo } from 'types/common-types';

export type RuleIncluded =
    | { status: 'included'; reason?: string }
    | { status: 'excluded'; reason: string };

export const explicitRuleOverrides: DictionaryStringTo<RuleIncluded> = {
    'audio-caption': {
        status: 'included',
        reason: 'for parity with video-caption, which axe-core includes by default',
    },
    'empty-table-header': {
        status: 'excluded',
        reason: "only reports needs-review results, but we haven't implemented needs-review content for it yet",
    },
    'form-field-multiple-labels': {
        status: 'excluded',
        reason: "only reports needs-review results, but we haven't implemented needs-review content for it yet",
    },
    'duplicate-id': {
        status: 'excluded',
        reason: 'Based on feedback from users we tested to check the user impact of duplicate ID failures on static elements. We found no user impact on the experience with any of the ATs including Narrator, JAWS, NVDA, Dragon, and Windows Speech Recognition. After further discussions with the Tooling Advisory Board, we decided to make this a best practice rule. See #4102.',
    },
    'label-content-name-mismatch': {
        status: 'included',
        reason: 'to include in Needs Review since its an experimental rule',
    },
};

export const getRuleInclusions = (
    ruleset: IRuleConfiguration[],
    ruleOverrides: DictionaryStringTo<RuleIncluded>,
): DictionaryStringTo<RuleIncluded> => {
    return Object.assign(
        {},
        ...ruleset.map(r => ({
            [r.id]: getRuleIncludedConfig(r, ruleOverrides),
        })),
    );
};

function getRuleIncludedConfig(
    rule: IRuleConfiguration,
    ruleOverrides: DictionaryStringTo<RuleIncluded>,
): RuleIncluded {
    if (ruleOverrides.hasOwnProperty(rule.id)) {
        return ruleOverrides[rule.id];
    }

    if (!rule.enabled) {
        return {
            status: 'excluded',
            reason: 'disabled in axe config',
        };
    }

    if (rule.tags == null) {
        return {
            status: 'excluded',
            reason: 'rule does not define a tags property',
        };
    }

    if (rule.tags.includes('experimental')) {
        return {
            status: 'excluded',
            reason: 'rule is tagged experimental',
        };
    }

    if (rule.tags.includes('best-practice')) {
        return {
            status: 'excluded',
            reason: 'rule is tagged best-practice',
        };
    }

    return {
        status: 'included',
    };
}
