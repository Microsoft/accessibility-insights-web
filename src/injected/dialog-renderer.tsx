// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind, getRTL } from '@uifabric/utilities';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { IssueDetailsTextGenerator } from '../background/issue-details-text-generator';
import { AxeInfo } from '../common/axe-info';
import { ClientBrowserAdapter } from '../common/client-browser-adapter';
import { FeatureFlags } from '../common/feature-flags';
import { HTMLElementUtils } from '../common/html-element-utils';
import { NavigatorUtils } from '../common/navigator-utils';
import { getPlatform } from '../common/platform';
import { FeatureFlagStoreData } from '../common/types/store-data/feature-flag-store-data';
import { WindowUtils } from '../common/window-utils';
import { rootContainerId } from './constants';
import { DetailsDialogHandler } from './details-dialog-handler';
import { FrameCommunicator, IMessageRequest } from './frameCommunicators/frame-communicator';
import { FrameMessageResponseCallback } from './frameCommunicators/window-message-handler';
import { IErrorMessageContent } from './frameCommunicators/window-message-marshaller';
import { LayeredDetailsDialogComponent, LayeredDetailsDialogDeps } from './layered-details-dialog-component';
import { MainWindowContext } from './main-window-context';
import { DecoratedAxeNodeResult, IHtmlElementAxeResults } from './scanner-utils';
import { ShadowUtils } from './shadow-utils';

export interface DetailsDialogWindowMessage {
    data: IHtmlElementAxeResults;
    featureFlagStoreData: FeatureFlagStoreData;
}

export class DialogRenderer {
    private static readonly renderDetailsDialogCommand = 'insights.detailsDialog';

    constructor(
        private readonly dom: Document,
        private readonly renderer: typeof ReactDOM.render,
        private readonly frameCommunicator: FrameCommunicator,
        private readonly htmlElementUtils: HTMLElementUtils,
        private readonly windowUtils: WindowUtils,
        private readonly shadowUtils: ShadowUtils,
        private readonly clientBrowserAdapter: ClientBrowserAdapter,
        private readonly getRTLFunc: typeof getRTL,
    ) {
        if (this.isInMainWindow()) {
            this.frameCommunicator.subscribe(DialogRenderer.renderDetailsDialogCommand, this.processRequest);
        }
    }

    public render(data: IHtmlElementAxeResults, featureFlagStoreData: FeatureFlagStoreData): void {
        if (this.isInMainWindow()) {
            const mainWindowContext = MainWindowContext.get();
            mainWindowContext.getTargetPageActionMessageCreator().openIssuesDialog();

            const elementSelector: string = this.getElementSelector(data);
            const failedRules: IDictionaryStringTo<DecoratedAxeNodeResult> = this.getFailedRules(data);
            const target: string[] = this.getTarget(data);
            const dialogContainer: HTMLDivElement = featureFlagStoreData[FeatureFlags.shadowDialog]
                ? this.initializeDialogContainerInShadowDom()
                : this.appendDialogContainer();

            const browserSpec = new NavigatorUtils(window.navigator).getBrowserSpec();
            const issueDetailsTextGenerator = new IssueDetailsTextGenerator(
                this.clientBrowserAdapter.extensionVersion,
                browserSpec,
                AxeInfo.Default.version,
            );

            const deps: LayeredDetailsDialogDeps = {
                issueDetailsTextGenerator,
                windowUtils: this.windowUtils,
                targetPageActionMessageCreator: mainWindowContext.getTargetPageActionMessageCreator(),
                bugActionMessageCreator: mainWindowContext.getBugActionMessageCreator(),
                clientBrowserAdapter: this.clientBrowserAdapter,
                getRTL: this.getRTLFunc,
            };

            this.renderer(
                <LayeredDetailsDialogComponent
                    deps={deps}
                    failedRules={failedRules}
                    elementSelector={elementSelector}
                    target={target}
                    dialogHandler={new DetailsDialogHandler(this.htmlElementUtils)}
                    devToolStore={mainWindowContext.getDevToolStore()}
                    userConfigStore={mainWindowContext.getUserConfigStore()}
                    devToolsShortcut={getPlatform(this.windowUtils).devToolsShortcut}
                    devToolActionMessageCreator={mainWindowContext.getDevToolActionMessageCreator()}
                    featureFlagStoreData={featureFlagStoreData}
                />,
                dialogContainer,
            );
        } else {
            const windowMessageRequest: IMessageRequest<DetailsDialogWindowMessage> = {
                win: this.windowUtils.getTopWindow(),
                command: DialogRenderer.renderDetailsDialogCommand,
                message: { data: data, featureFlagStoreData: featureFlagStoreData },
            };
            this.frameCommunicator.sendMessage(windowMessageRequest);
        }
    }

    @autobind
    private processRequest(
        message: DetailsDialogWindowMessage,
        error: IErrorMessageContent,
        sourceWin: Window,
        responder?: FrameMessageResponseCallback,
    ): void {
        this.render(message.data, message.featureFlagStoreData);
    }

    private initializeDialogContainerInShadowDom(): HTMLDivElement {
        const shadowContainer = this.shadowUtils.getShadowContainer();

        const dialogContainer = this.dom.createElement('div');
        dialogContainer.className = 'insights-shadow-dialog-container';
        shadowContainer.appendChild(dialogContainer);
        return dialogContainer;
    }

    private appendDialogContainer(): HTMLDivElement {
        this.htmlElementUtils.deleteAllElements('.insights-dialog-container');

        const dialogContainer = this.dom.createElement('div');
        dialogContainer.setAttribute('class', 'insights-dialog-container');
        this.dom.querySelector(`#${rootContainerId}`).appendChild(dialogContainer);
        return dialogContainer;
    }

    private getFailedRules(data: IHtmlElementAxeResults): IDictionaryStringTo<DecoratedAxeNodeResult> {
        return data.ruleResults;
    }

    private getTarget(data: IHtmlElementAxeResults): string[] {
        return data.target;
    }

    private getElementSelector(data: IHtmlElementAxeResults): string {
        return data.target.join(';');
    }

    private isInMainWindow(): boolean {
        return this.windowUtils.getTopWindow() === this.windowUtils.getWindow();
    }
}
