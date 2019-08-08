// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Messages } from '../messages';
import { ActionMessageDispatcher } from './action-message-dispatcher';

export class PathSnippetActionMessageCreator {
    constructor(private readonly dispatcher: ActionMessageDispatcher) {}

    public addCorrespondingSnippet = (showError: boolean, snippet?: string): void => {
        const messageType = Messages.PathSnippet.AddCorrespondingSnippet;
        const payload = { showError, snippet };
        this.dispatcher.dispatchMessage({
            messageType,
            payload,
        });
    };
}
