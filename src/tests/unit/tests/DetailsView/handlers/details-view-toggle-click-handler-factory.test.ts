// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { It, Mock, Times } from 'typemoq';

import { VisualizationActionMessageCreator } from '../../../../../common/message-creators/visualization-action-message-creator';
import { TelemetryDataFactory } from '../../../../../common/telemetry-data-factory';
import { TelemetryEventSource, ToggleTelemetryData } from '../../../../../common/telemetry-events';
import { VisualizationType } from '../../../../../common/types/visualization-type';
import { DetailsViewToggleClickHandlerFactory } from '../../../../../DetailsView/handlers/details-view-toggle-click-handler-factory';
import { EventStubFactory } from '../../../common/event-stub-factory';

describe('DetailsViewToggleClickHandlerFactoryTest', () => {
    const eventStubFactory = new EventStubFactory();

    test('create toggle click handler', () => {
        const type = VisualizationType.Color;
        const toEnabled = true;
        const source = TelemetryEventSource.DetailsView;

        const telemetryInfo: ToggleTelemetryData = {
            triggeredBy: 'keypress',
            enabled: toEnabled,
            source,
        };

        const actionCreatorMock = Mock.ofType(VisualizationActionMessageCreator);

        actionCreatorMock.setup(ac => ac.setVisualizationState(type, toEnabled, It.isValue(telemetryInfo))).verifiable();

        const event = eventStubFactory.createKeypressEvent() as any;

        const telemetryFactoryMock = Mock.ofType(TelemetryDataFactory);
        telemetryFactoryMock
            .setup(tf => tf.forToggle(event, toEnabled, source))
            .returns(() => telemetryInfo)
            .verifiable(Times.once());

        const factory = new DetailsViewToggleClickHandlerFactory(actionCreatorMock.object, telemetryFactoryMock.object);
        const testObject = factory.createClickHandler(type, toEnabled);

        testObject(event);

        actionCreatorMock.verifyAll();
    });
});
