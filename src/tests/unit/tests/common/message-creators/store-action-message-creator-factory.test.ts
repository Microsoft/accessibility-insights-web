// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Mock } from 'typemoq';
import { ActionMessageDispatcher } from '../../../../../common/message-creators/action-message-dispatcher';
import { StoreActionMessageCreator } from '../../../../../common/message-creators/store-action-message-creator';
import { StoreActionMessageCreatorFactory } from '../../../../../common/message-creators/store-action-message-creator-factory';
import { Messages } from '../../../../../common/messages';

describe('StoreActionMessageCreatorFactoryTest', () => {
    const dispatcherMock = Mock.ofType<ActionMessageDispatcher>();

    beforeEach(() => {
        dispatcherMock.reset();
    });

    it('dispatches message types for forPopup', () => {
        const messages: string[] = [
            Messages.Visualizations.State.GetCurrentVisualizationToggleState,
            Messages.Command.GetCommands,
            Messages.FeatureFlags.GetFeatureFlags,
            Messages.LaunchPanel.Get,
            Messages.UserConfig.GetCurrentState,
        ];

        testWithExpectedMessages(messages, testObject => testObject.forPopup());
    });

    it('dispatches message types for forDetailsView', () => {
        const messages: string[] = [
            Messages.Visualizations.DetailsView.GetState,
            Messages.Visualizations.State.GetCurrentVisualizationResultState,
            Messages.Visualizations.State.GetCurrentVisualizationToggleState,
            Messages.Tab.GetCurrent,
            Messages.FeatureFlags.GetFeatureFlags,
            Messages.Assessment.GetCurrentState,
            Messages.Scoping.GetCurrentState,
            Messages.UserConfig.GetCurrentState,
        ];

        testWithExpectedMessages(messages, testObject => testObject.forDetailsView());
    });

    it('dispatches message types for forInjected', () => {
        const messages: string[] = [
            Messages.Visualizations.State.GetCurrentVisualizationToggleState,
            Messages.Scoping.GetCurrentState,
            Messages.Inspect.GetCurrentState,
            Messages.Visualizations.State.GetCurrentVisualizationResultState,
            Messages.FeatureFlags.GetFeatureFlags,
            Messages.DevTools.Get,
            Messages.Assessment.GetCurrentState,
            Messages.Tab.GetCurrent,
            Messages.UserConfig.GetCurrentState,
        ];

        testWithExpectedMessages(messages, testObject => testObject.forInjected());
    });

    it('dispatches message types for forContent', () => {
        const messages: string[] = [Messages.UserConfig.GetCurrentState];

        testWithExpectedMessages(messages, testObject => testObject.forContent());
    });

    function testWithExpectedMessages(
        messages: string[],
        getter: (testObject: StoreActionMessageCreatorFactory) => StoreActionMessageCreator,
    ): void {
        messages.forEach(message => setupDispatcherMock(message));

        const testObject = new StoreActionMessageCreatorFactory(dispatcherMock.object);

        const creator = getter(testObject);

        creator.getAllStates();

        dispatcherMock.verifyAll();
    }

    function setupDispatcherMock(messageType: string): void {
        dispatcherMock.setup(dispatcher => dispatcher.dispatchType(messageType));
    }
});
