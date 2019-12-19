// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { UnifiedScanCompletedPayload } from 'background/actions/action-payloads';
import { EnvironmentInfoProvider } from 'common/environment-info-provider';
import { Message } from 'common/message';
import { Messages } from 'common/messages';
import { ToolData, UnifiedResult, UnifiedRule } from 'common/types/store-data/unified-data-interface';
import { ConvertScanResultsToUnifiedResultsDelegate } from 'injected/adapters/scan-results-to-unified-results';
import { ConvertScanResultsToUnifiedRulesDelegate } from 'injected/adapters/scan-results-to-unified-rules';
import { MessageDelegate } from 'injected/analyzers/rule-analyzer';
import { UnifiedResultSender } from 'injected/analyzers/unified-result-sender';
import { ScanIncompleteWarningDetector } from 'injected/scan-incomplete-warning-detector';
import { IMock, Mock, Times } from 'typemoq';

describe('sendConvertedResults', () => {
    const axeInputResults = {
        targetPageTitle: 'title',
        targetPageUrl: 'url',
    } as any;
    const unifiedResults: UnifiedResult[] = [];
    const unifiedRules: UnifiedRule[] = [];
    const toolInfo = {} as ToolData;

    const uuidGeneratorStub = () => null;
    const testScanIncompleteWarningId = 'test-scan-incomplete-warning';

    let sendDelegate: IMock<MessageDelegate>;
    let convertToUnifiedMock: IMock<ConvertScanResultsToUnifiedResultsDelegate>;
    let convertToUnifiedRulesMock: IMock<ConvertScanResultsToUnifiedRulesDelegate>;
    let environmentInfoProviderMock: IMock<EnvironmentInfoProvider>;
    let scanIncompleteWarningDetectorMock: IMock<ScanIncompleteWarningDetector>;

    beforeEach(() => {
        sendDelegate = Mock.ofType<MessageDelegate>();
        convertToUnifiedMock = Mock.ofType<ConvertScanResultsToUnifiedResultsDelegate>();
        convertToUnifiedRulesMock = Mock.ofType<ConvertScanResultsToUnifiedRulesDelegate>();
        environmentInfoProviderMock = Mock.ofType<EnvironmentInfoProvider>();
        scanIncompleteWarningDetectorMock = Mock.ofType<ScanIncompleteWarningDetector>();
    });

    it.each`
        warnings                         | telemetry
        ${[testScanIncompleteWarningId]} | ${{ scanIncompleteWarnings: [testScanIncompleteWarningId] }}
        ${[]}                            | ${null}
    `('it send results with warnings: $warnings and telemetry: $telemetry', ({ warnings, telemetry }) => {
        convertToUnifiedMock.setup(m => m(axeInputResults, uuidGeneratorStub)).returns(val => unifiedResults);
        convertToUnifiedRulesMock.setup(m => m(axeInputResults)).returns(val => unifiedRules);
        environmentInfoProviderMock.setup(provider => provider.getToolData()).returns(() => toolInfo);
        scanIncompleteWarningDetectorMock.setup(m => m.detectScanIncompleteWarnings()).returns(() => warnings);

        const testSubject = new UnifiedResultSender(
            sendDelegate.object,
            convertToUnifiedMock.object,
            convertToUnifiedRulesMock.object,
            environmentInfoProviderMock.object,
            uuidGeneratorStub,
            scanIncompleteWarningDetectorMock.object,
        );

        testSubject.sendResults({
            results: null,
            originalResult: axeInputResults,
        });

        convertToUnifiedMock.verifyAll();
        convertToUnifiedRulesMock.verifyAll();
        environmentInfoProviderMock.verifyAll();

        const expectedPayload: UnifiedScanCompletedPayload = {
            scanResult: unifiedResults,
            rules: unifiedRules,
            toolInfo: toolInfo,
            targetAppInfo: {
                name: 'title',
                url: 'url',
            },
            scanIncompleteWarnings: warnings,
            telemetry,
        };

        const expectedMessage: Message = {
            messageType: Messages.UnifiedScan.ScanCompleted,
            payload: expectedPayload,
        };

        sendDelegate.verify(m => m(expectedMessage), Times.once());
    });
});
