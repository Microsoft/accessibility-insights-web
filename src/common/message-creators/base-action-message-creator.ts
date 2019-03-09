// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { PayloadWithEventName } from '../../background/actions/action-payloads';
import { Messages } from '../messages';
import { TelemetryData } from '../telemetry-events';

export abstract class BaseActionMessageCreator {
    private postMessageDelegate: (message: IMessage) => void;
    protected _tabId: number;

    constructor(postMessage: (message: IMessage) => void, tabId: number) {
        this.postMessageDelegate = postMessage;
        this._tabId = tabId;
    }

    protected dispatchMessage(message: IMessage): void {
        this.postMessageDelegate(message);
    }

    protected dispatchType(messageType: string): void {
        this.dispatchMessage({
            type: messageType,
            tabId: this._tabId,
        });
    }

    protected sendTelemetry(eventName: string, eventData: TelemetryData): void {
        const payload: PayloadWithEventName = {
            eventName: eventName,
            telemetry: eventData,
        };
        const message: IMessage = {
            type: Messages.Telemetry.Send,
            payload,
        };

        if (this._tabId) {
            message.tabId = this._tabId;
        }

        this.dispatchMessage(message);
    }
}
