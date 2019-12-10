// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { SETTINGS_PANEL_CLOSE, SETTINGS_PANEL_OPEN } from 'common/extension-telemetry-events';
import { createDefaultLogger } from 'common/logging/default-logger';
import { Logger } from 'common/logging/logger';
import { getStoreStateMessage, Messages } from 'common/messages';
import { StoreNames } from 'common/stores/store-names';
import { DetailsViewRightContentPanelType } from 'DetailsView/components/left-nav/details-view-right-content-panel-type';
import { DetailsViewController } from '../details-view-controller';
import { Interpreter } from '../interpreter';
import { TelemetryEventHandler } from '../telemetry/telemetry-event-handler';
import { BaseActionPayload } from './action-payloads';
import { DetailsViewActions } from './details-view-actions';

export class DetailsViewActionCreator {
    constructor(
        private readonly interpreter: Interpreter,
        private readonly detailsViewActions: DetailsViewActions,
        private readonly detailsViewController: DetailsViewController,
        private readonly telemetryEventHandler: TelemetryEventHandler,
        private readonly logger: Logger = createDefaultLogger(),
    ) {}

    public registerCallback(): void {
        this.interpreter.registerTypeToPayloadCallback(
            Messages.SettingsPanel.OpenPanel,
            this.onOpenSettingsPanel,
        );
        this.interpreter.registerTypeToPayloadCallback(
            Messages.SettingsPanel.ClosePanel,
            this.onCloseSettingsPanel,
        );
        this.interpreter.registerTypeToPayloadCallback(
            getStoreStateMessage(StoreNames.DetailsViewStore),
            this.onGetDetailsViewCurrentState,
        );
        this.interpreter.registerTypeToPayloadCallback(
            Messages.Visualizations.DetailsView.SetDetailsViewRightContentPanel,
            this.onSetDetailsViewRightContentPanel,
        );
    }

    private onOpenSettingsPanel = async (
        payload: BaseActionPayload,
        tabId: number,
    ): Promise<void> => {
        this.detailsViewActions.openSettingsPanel.invoke(null);
        await this.detailsViewController.showDetailsView(tabId).catch(this.logger.error);
        this.telemetryEventHandler.publishTelemetry(SETTINGS_PANEL_OPEN, payload);
    };

    private onCloseSettingsPanel = (payload: BaseActionPayload): void => {
        this.detailsViewActions.closeSettingsPanel.invoke(null);
        this.telemetryEventHandler.publishTelemetry(SETTINGS_PANEL_CLOSE, payload);
    };

    private onSetDetailsViewRightContentPanel = (
        payload: DetailsViewRightContentPanelType,
    ): void => {
        this.detailsViewActions.setSelectedDetailsViewRightContentPanel.invoke(payload);
    };

    private onGetDetailsViewCurrentState = (): void => {
        this.detailsViewActions.getCurrentState.invoke(null);
    };
}
