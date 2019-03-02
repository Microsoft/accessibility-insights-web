// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { VisualizationActionMessageCreator } from '../../common/message-creators/visualization-action-message-creator';
import { TelemetryDataFactory } from '../../common/telemetry-data-factory';
import { TelemetryEventSource } from '../../common/telemetry-events';
import { VisualizationType } from '../../common/types/visualization-type';

export class DetailsViewToggleClickHandlerFactory {
    private actionCreator: VisualizationActionMessageCreator;
    private telemetryFactory: TelemetryDataFactory;

    constructor(actionCreator: VisualizationActionMessageCreator, telemetryFactory: TelemetryDataFactory) {
        this.actionCreator = actionCreator;
        this.telemetryFactory = telemetryFactory;
    }

    public createClickHandler(type: VisualizationType, newValue: boolean): (event) => void {
        return this.toggleVisualization.bind(this, type, newValue);
    }

    private toggleVisualization(type: VisualizationType, newValue: boolean, event: React.MouseEvent<HTMLElement>): void {
        const source = TelemetryEventSource.DetailsView;
        const telementryInfo = this.telemetryFactory.forToggle(event, newValue, source);
        this.actionCreator.setVisualizationState(type, newValue, telementryInfo);
    }
}
