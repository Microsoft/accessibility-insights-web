// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BaseActionPayload, FileIssuePayload } from '../../background/actions/action-payloads';
import { Message } from '../message';
import { Messages } from '../messages';
import { TelemetryDataFactory } from '../telemetry-data-factory';
import { FILE_ISSUE_CLICK, FileIssueClickService, TelemetryEventSource } from '../telemetry-events';
import { CreateIssueDetailsTextData } from '../types/create-issue-details-text-data';
import { ActionMessageDispatcher } from './action-message-dispatcher';

type SupportedMouseEvent = React.MouseEvent<HTMLElement> | React.SyntheticEvent<Element, Event>;

export class BugActionMessageCreator {
    constructor(
        private readonly dispatcher: ActionMessageDispatcher,
        private readonly telemetryFactory: TelemetryDataFactory,
        private readonly source: TelemetryEventSource,
    ) {}

    public openSettingsPanel(event: React.MouseEvent<HTMLElement>): void {
        const messageType = Messages.SettingsPanel.OpenPanel;
        const telemetry = this.telemetryFactory.forSettingsPanelOpen(event, this.source, 'fileIssueSettingsPrompt');
        const payload: BaseActionPayload = {
            telemetry,
        };
        this.dispatcher.dispatchMessage({
            messageType: messageType,
            payload,
        });
    }

    public trackFileIssueClick(event: React.MouseEvent<HTMLElement>, service: FileIssueClickService): void {
        const telemetry = this.telemetryFactory.forFileIssueClick(event, this.source, service);
        this.dispatcher.sendTelemetry(FILE_ISSUE_CLICK, telemetry);
    }

    public fileIssue(event: SupportedMouseEvent, service: FileIssueClickService, issueData: CreateIssueDetailsTextData): void {
        const messageType = Messages.IssueFiling.FileIssue;
        const telemetry = this.telemetryFactory.forFileIssueClick(event, this.source, service);
        const payload: FileIssuePayload = {
            telemetry,
            issueData,
            service,
        };
        const message: Message = {
            messageType,
            payload,
        };
        this.dispatcher.dispatchMessage(message);
    }
}
