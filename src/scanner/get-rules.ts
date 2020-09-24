// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Axe from 'axe-core';
import { RuleIncluded } from 'scanner/get-rule-inclusions';

import { DictionaryStringTo } from 'types/common-types';
import { HyperlinkDefinition } from 'views/content/content-page';
import { ScannerRuleInfo } from './scanner-rule-info';

interface ExpectedGetRuleObject {
    help: string | Function;
    ruleId: string;
    helpUrl: string;
}

export function getRules(
    axe: typeof Axe,
    urlGenerator: (ruleId: string, axeHelpUrl: string) => string,
    ruleIncludedStatus: DictionaryStringTo<RuleIncluded>,
    ruleToLinkConfiguration: DictionaryStringTo<HyperlinkDefinition[]>,
): ScannerRuleInfo[] {
    const allRules = axe.getRules() as ExpectedGetRuleObject[];

    return allRules
        .filter(rule => ruleIncludedStatus[rule.ruleId].status === 'included')
        .map(rule => ({
            id: rule.ruleId,
            url: urlGenerator(rule.ruleId, rule.helpUrl),
            help: resolveHelp(rule.help),
            a11yCriteria: ruleToLinkConfiguration[rule.ruleId],
        }));
}

function resolveHelp(help: string | Function): string {
    if (typeof help === 'function') {
        return help();
    }

    return help;
}
