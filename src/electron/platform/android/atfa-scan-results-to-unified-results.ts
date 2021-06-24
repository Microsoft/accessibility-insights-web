// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { UnifiedResult } from 'common/types/store-data/unified-data-interface';
import { UUIDGenerator } from 'common/uid-generator';
import {
    AndroidScanResults,
    BoundingRectangle,
    RuleResultsData,
} from 'electron/platform/android/android-scan-results';
import {
    AccessibilityHierarchyCheckResult,
    AtfaBoundingRectangle,
    ViewHierarchyElement,
} from 'electron/platform/android/atfa-data-types';
import { RuleInformation } from 'electron/platform/android/rule-information';
import { RuleInformationProviderType } from 'electron/platform/android/rule-information-provider-type';

const includedResults = ['ERROR', 'WARNING'];

export function convertAtfaScanResultsToUnifiedResults(
    scanResults: AndroidScanResults,
    ruleInformationProvider: RuleInformationProviderType,
    uuidGenerator: UUIDGenerator,
): UnifiedResult[] {
    if (!scanResults || !scanResults.ruleResults) {
        return [];
    }

    const unifiedResults: UnifiedResult[] = [];

    for (const atfaResult of scanResults.atfaResults) {
        if (includeBasedOnResult(atfaResult)) {
            const viewElement: ViewHierarchyElement =
                atfaResult['AccessibilityHierarchyCheckResult.element'];
            if (viewElement) {
                const ruleInformation: RuleInformation = ruleInformationProvider.getRuleInformation(
                    atfaResult['AccessibilityHierarchyCheckResult.checkClass'],
                );

                if (ruleInformation) {
                    unifiedResults.push(
                        createUnifiedResult(
                            ruleInformation,
                            atfaResult,
                            viewElement,
                            uuidGenerator,
                        ),
                    );
                }
            }
        }
    }

    return unifiedResults;
}

function createUnifiedResult(
    ruleInformation: RuleInformation,
    atfaResult: AccessibilityHierarchyCheckResult,
    viewElement: ViewHierarchyElement,
    uuidGenerator: UUIDGenerator,
): UnifiedResult {
    const ruleResult: RuleResultsData = {
        axeViewId: `atfa-${viewElement['ViewHierarchyElement.id']}`,
        ruleId: ruleInformation.ruleId,
        status: atfaResult['AccessibilityHierarchyCheckResult.type'],
        props: atfaResult['AccessibilityHierarchyCheckResult.metadata'],
    };
    return {
        uid: uuidGenerator(),
        ruleId: ruleInformation.ruleId,
        status: ruleInformation.getResultStatus(ruleResult),
        descriptors: {
            className: viewElement?.['ViewHierarchyElement.className'],
            boundingRectangle: convertBoundingRectangle(
                viewElement?.['ViewHierarchyElement.boundsInScreen'],
            ),
            contentDescription:
                viewElement?.['ViewHierarchyElement.contentDescription'][
                    'SpannableString.rawString'
                ],
            text: viewElement?.['ViewHierarchyElement.text']['SpannableString.rawString'],
        },
        identifiers: {
            identifier: viewElement?.['ViewHierarchyElement.accessibilityClassName'],
            conciseName: viewElement?.['ViewHierarchyElement.className'],
        },
        resolution: ruleInformation.getUnifiedResolution(ruleResult),
    };
}

function includeBasedOnResult(atfaResult: AccessibilityHierarchyCheckResult): boolean {
    const resultType: string | null = atfaResult['AccessibilityHierarchyCheckResult.type'] ?? null;

    return includedResults.includes(resultType);
}

function convertBoundingRectangle(boundingRectangle: AtfaBoundingRectangle): BoundingRectangle {
    if (!boundingRectangle) {
        return null;
    }

    return {
        bottom: boundingRectangle['Rect.bottom'],
        left: boundingRectangle['Rect.left'],
        right: boundingRectangle['Rect.right'],
        top: boundingRectangle['Rect.top'],
    };
}
