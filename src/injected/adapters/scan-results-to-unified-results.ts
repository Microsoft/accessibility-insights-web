// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { flatMap } from 'lodash';

import { InstanceResultStatus, UnifiedResult } from '../../common/types/store-data/unified-data-interface';
import { UUIDGeneratorType } from '../../common/uid-generator';
import { IssueFilingUrlStringUtils } from '../../issue-filing/common/issue-filing-url-string-utils';
import { AxeNodeResult, RuleResult, ScanResults } from '../../scanner/iruleresults';

export type ConvertScanResultsToUnifiedResultsDelegate = (scanResults: ScanResults, uuidGenerator: UUIDGeneratorType) => UnifiedResult[];

interface RuleResultData {
    status: InstanceResultStatus;
    ruleID: string;
}

interface CreationData extends RuleResultData {
    cssSelector: string;
    snippet: string;
    howToFix: {
        oneOf: string[];
        none: string[];
        all: string[];
    };
}

export const convertScanResultsToUnifiedResults = (scanResults: ScanResults, uuidGenerator: UUIDGeneratorType): UnifiedResult[] => {
    if (!scanResults) {
        return [];
    }
    return createUnifiedResultsFromScanResults(scanResults, uuidGenerator);
};

const createUnifiedResultsFromScanResults = (scanResults: ScanResults, uuidGenerator: UUIDGeneratorType): UnifiedResult[] => {
    return [
        ...createUnifiedResultsFromRuleResults(scanResults.violations, 'fail', uuidGenerator),
        ...createUnifiedResultsFromRuleResults(scanResults.passes, 'pass', uuidGenerator),
    ];
};

const createUnifiedResultsFromRuleResults = (
    ruleResults: RuleResult[],
    status: InstanceResultStatus,
    uuidGenerator: UUIDGeneratorType,
): UnifiedResult[] => {
    const unifiedResultFromRuleResults = (ruleResults || []).map(result =>
        createUnifiedResultsFromRuleResult(result, status, uuidGenerator),
    );

    return flatMap(unifiedResultFromRuleResults);
};

const createUnifiedResultsFromRuleResult = (
    ruleResult: RuleResult,
    status: InstanceResultStatus,
    uuidGenerator: UUIDGeneratorType,
): UnifiedResult[] => {
    return ruleResult.nodes.map(node => {
        const data: RuleResultData = {
            status: status,
            ruleID: ruleResult.id,
        };

        return createUnifiedResultFromNode(node, data, uuidGenerator);
    });
};

const createUnifiedResultFromNode = (
    nodeResult: AxeNodeResult,
    ruleResultData: RuleResultData,
    uuidGenerator: UUIDGeneratorType,
): UnifiedResult => {
    return createUnifiedResult(
        {
            ...ruleResultData,
            cssSelector: nodeResult.target.join(';'),
            snippet: nodeResult.snippet || nodeResult.html,
            howToFix: {
                oneOf: nodeResult.any.map(checkResult => checkResult.message),
                none: nodeResult.none.map(checkResult => checkResult.message),
                all: nodeResult.all.map(checkResult => checkResult.message),
            },
        },
        uuidGenerator,
    );
};

const createUnifiedResult = (data: CreationData, uuidGenerator: UUIDGeneratorType): UnifiedResult => {
    return {
        uid: uuidGenerator(),
        status: data.status,
        ruleId: data.ruleID,
        identifiers: {
            'css-selector': data.cssSelector,
            shortName: IssueFilingUrlStringUtils.getSelectorLastPart(data.cssSelector),
        },
        descriptors: {
            snippet: data.snippet,
        },
        resolution: {
            'how-to-fix-web': {
                any: data.howToFix.oneOf,
                none: data.howToFix.none,
                all: data.howToFix.all,
            },
        },
    } as UnifiedResult;
};
