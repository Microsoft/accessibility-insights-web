// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Mock, Times } from 'typemoq';
import { Message } from '../../../../../common/message';
import { ActionMessageDispatcher } from '../../../../../common/message-creators/action-message-dispatcher';
import { PathSnippetActionMessageCreator } from '../../../../../common/message-creators/path-snippet-action-message-creator';
import { Messages } from '../../../../../common/messages';

describe('PathSnippetActionMessageCreatorTest', () => {
    const dispatcherMock = Mock.ofType<ActionMessageDispatcher>();
    let testSubject: PathSnippetActionMessageCreator;

    beforeEach(() => {
        dispatcherMock.reset();
        testSubject = new PathSnippetActionMessageCreator(dispatcherMock.object);
    });

    it('dispatches message for addCorrespondingSnippet', () => {
        const snippet = 'test snippet';
        const showError = false;
        const associatedPath = 'test path';

        const expectedMessage: Message = {
            messageType: Messages.PathSnippet.AddCorrespondingSnippet,
            payload: { associatedPath, showError, snippet },
        };

        testSubject.addCorrespondingSnippet(associatedPath, showError, snippet);
        dispatcherMock.verify(dispatcher => dispatcher.dispatchMessage(expectedMessage), Times.once());
    });
});
