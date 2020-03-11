// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { UnifiedResolution } from 'common/types/store-data/unified-data-interface';
import { RuleInformation } from 'electron/platform/android/rule-information';
import {
    DeviceInfo,
    RuleResultsData,
    ScanResults,
    ViewElementData,
} from 'electron/platform/android/scan-results';

export function buildScanResultsObject(
    deviceName: string = null,
    appIdentifier: string = null,
    resultsArray: RuleResultsData[] = null,
    axeView: ViewElementData = null,
    axeVersion: string = null,
    screenshotData: string = null,
    deviceInfo: DeviceInfo = null,
): ScanResults {
    const scanResults = {};
    const axeContext = {};
    let addContext = false;

    if (deviceInfo) {
        axeContext['axeDevice'] = deviceInfo;
        addContext = true;
    }

    if (deviceName) {
        deviceInfo = { ...deviceInfo, name: deviceName };
        axeContext['axeDevice'] = deviceInfo;
        addContext = true;
    }

    if (appIdentifier) {
        const axeMetaData = {};
        axeMetaData['appIdentifier'] = appIdentifier;
        axeContext['axeMetaData'] = axeMetaData;
        addContext = true;
    }

    if (axeView) {
        axeContext['axeView'] = axeView;
        addContext = true;
    }

    if (axeVersion) {
        if (axeContext['axeMetaData'] == null) {
            axeContext['axeMetaData'] = {};
        }

        axeContext['axeMetaData']['axeVersion'] = axeVersion;
        addContext = true;
    }

    if (screenshotData) {
        axeContext['screenshot'] = screenshotData;
        addContext = true;
    }

    if (resultsArray) {
        scanResults['axeRuleResults'] = resultsArray;
    }

    if (addContext) {
        scanResults['axeContext'] = axeContext;
    }

    return new ScanResults(scanResults);
}

export function buildRuleResultObject(
    ruleId: string,
    status: string,
    axeViewId: string = null,
    props: any = null,
): RuleResultsData {
    const result = {};
    result['ruleId'] = ruleId;
    result['status'] = status;
    if (axeViewId) {
        result['axeViewId'] = axeViewId;
    }
    if (props) {
        result['props'] = props;
    }

    return result as RuleResultsData;
}

export function buildViewElement(
    axeViewId: string,
    boundsInScreen: any,
    className: string,
    contentDescription: string,
    text: string,
    children: ViewElementData[],
): ViewElementData {
    const viewElement = {
        axeViewId: axeViewId,
        boundsInScreen: boundsInScreen,
        className: className,
        contentDescription: contentDescription,
        text: text,
        children: children,
    };

    return viewElement as ViewElementData;
}

export function buildRuleInformation(
    ruleId: string,
    includeResults: boolean = true,
): RuleInformation {
    return {
        ruleId: ruleId,
        ruleDescription: 'This describes ' + ruleId,
        getUnifiedFormattableResolutionDelegate: r => {
            expect('getUnifiedResolution').toBe('This code should never execute');
            return null;
        },
        getUnifiedFormattableResolution: r => {
            const summary: string = 'How to fix ' + ruleId;
            return ({ howtoFixSummary: summary } as unknown) as UnifiedResolution;
        },
        includeThisResultDelegate: r => {
            expect('includeThisResultDelegate').toBe('This code should never execute');
            return null;
        },
        includeThisResult: r => {
            return includeResults;
        },
    } as RuleInformation;
}
