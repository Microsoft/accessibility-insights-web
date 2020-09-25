// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as axe from 'axe-core';

import { AxeConfigurator } from './axe-configurator';
import { AxeResponseHandler } from './axe-response-handler';
import { AxeRuleOverrides } from './axe-rule-overrides';
import { CheckMessageTransformer } from './check-message-transformer';
import { configuration } from './custom-rule-configurations';
import { DocumentUtils } from './document-utils';
import { getRules } from './get-rules';
import { HelpUrlGetter } from './help-url-getter';
import { ScanResults } from './iruleresults';
import { Launcher } from './launcher';
import { MessageDecorator } from './message-decorator';
import { ResultDecorator } from './result-decorator';
import { ruleToLinkConfiguration } from './rule-to-links-mappings';
import { ScanOptions } from './scan-options';
import { ScanParameterGenerator } from './scan-parameter-generator';
import { ScannerRuleInfo } from './scanner-rule-info';
import { explicitRuleOverrides, getRuleInclusions } from 'scanner/get-rule-inclusions';

export const scan = (
    options: ScanOptions,
    successCallback: (results: ScanResults) => void,
    errorCallback: (results: Error) => void,
) => {
    options = options || {};

    const messageDecorator = new MessageDecorator(configuration, new CheckMessageTransformer());
    const ruleIncludedStatus = getRuleInclusions(
        axe._audit.rules,
        ruleToLinkConfiguration,
        explicitRuleOverrides,
    );
    const scanParameterGenerator = new ScanParameterGenerator(ruleIncludedStatus);
    const documentUtils: DocumentUtils = new DocumentUtils(document);
    const helpUrlGetter = new HelpUrlGetter(configuration);
    const resultDecorator = new ResultDecorator(
        documentUtils,
        messageDecorator,
        (ruleId, axeHelpUrl) => helpUrlGetter.getHelpUrl(ruleId, axeHelpUrl),
        ruleToLinkConfiguration,
    );
    const launcher = new Launcher(axe, scanParameterGenerator, document, options);
    const axeResponseHandler = new AxeResponseHandler(
        successCallback,
        errorCallback,
        resultDecorator,
    );
    launcher.runScan(axeResponseHandler);
};

export const getVersion = (): string => {
    return axe.version;
};

export const getDefaultRules = (): ScannerRuleInfo[] => {
    const helpUrlGetter = new HelpUrlGetter(configuration);
    const ruleIncludedStatus = getRuleInclusions(
        axe._audit.rules,
        ruleToLinkConfiguration,
        explicitRuleOverrides,
    );
    return getRules(
        axe,
        (ruleId, axeHelpUrl) => helpUrlGetter.getHelpUrl(ruleId, axeHelpUrl),
        ruleIncludedStatus,
        ruleToLinkConfiguration,
    );
};

AxeRuleOverrides.override(axe);

new AxeConfigurator().configureAxe(axe, configuration);
