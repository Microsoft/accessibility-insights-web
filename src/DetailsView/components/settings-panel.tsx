// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';
import * as React from 'react';

import { FeatureFlags } from '../../common/feature-flags';
import { UserConfigMessageCreator } from '../../common/message-creators/user-config-message-creator';
import { FeatureFlagStoreData } from '../../common/types/store-data/feature-flag-store-data';
import { UserConfigurationStoreData } from '../../common/types/store-data/user-configuration-store';
import {
    enableHighContrastSettingsTitle as highContrastSettingsTitle,
    highContrastSettingsDescription,
} from '../../content/settings/high-contrast-mode';
import {
    enableTelemetrySettingDescription,
    enableTelemetrySettingsPanelTitle,
} from '../../content/settings/improve-accessibility-insights';
import { IssueTrackerInput } from '../../content/settings/issue-tracker';
import { DetailsViewActionMessageCreator } from '../actions/details-view-action-message-creator';
import { GenericPanel } from './generic-panel';
import { GenericToggle } from './generic-toggle';
import { FlaggedComponent } from '../../common/components/flagged-component';

export interface SettingsPanelDeps {
    detailsViewActionMessageCreator: DetailsViewActionMessageCreator;
    userConfigMessageCreator: UserConfigMessageCreator;
}

export interface SettingsPanelProps {
    deps: SettingsPanelDeps;
    userConfigStoreState: UserConfigurationStoreData;
    isOpen: boolean;
    featureFlagData: FeatureFlagStoreData;
}
export class SettingsPanel extends React.Component<SettingsPanelProps> {
    public render(): JSX.Element {
        return (
            <GenericPanel
                isOpen={this.props.isOpen}
                className="settings-panel"
                onDismiss={this.props.deps.detailsViewActionMessageCreator.closeSettingsPanel}
                closeButtonAriaLabel="Close settings panel"
                hasCloseButton={true}
                title="Settings"
            >
                <GenericToggle
                    enabled={this.props.userConfigStoreState.enableTelemetry}
                    id="enable-telemetry"
                    name={enableTelemetrySettingsPanelTitle}
                    description={enableTelemetrySettingDescription}
                    onClick={this.onEnableTelemetryToggleClick}
                />
                <FlaggedComponent
                    enableJSXElement={this.getHighContrastToggle()}
                    disableJSXElement={null}
                    featureFlag={FeatureFlags[FeatureFlags.highContrastMode]}
                    featureFlagStoreData={this.props.featureFlagData}
                />
                <FlaggedComponent
                    enableJSXElement={this.getIssueTrackerInput()}
                    disableJSXElement={null}
                    featureFlag={FeatureFlags[FeatureFlags.showBugFiling]}
                    featureFlagStoreData={this.props.featureFlagData}
                />
            </GenericPanel>
        );
    }

    private getHighContrastToggle(): JSX.Element {
        return (
            <GenericToggle
                enabled={this.props.userConfigStoreState.enableHighContrast}
                id="enable-high-contrast-mode"
                name={highContrastSettingsTitle}
                description={highContrastSettingsDescription}
                onClick={this.onHighContrastModeToggleClick}
            />
        );
    }

    private getIssueTrackerInput(): JSX.Element {
        return (
            <IssueTrackerInput onSave={this.onIssueTrackerPathSave} issueTrackerPath={this.props.userConfigStoreState.issueTrackerPath} />
        );
    }

    @autobind
    protected onEnableTelemetryToggleClick(id: string, state: boolean) {
        return this.props.deps.userConfigMessageCreator.setTelemetryState(state);
    }

    @autobind
    protected onHighContrastModeToggleClick(id: string, state: boolean) {
        return this.props.deps.userConfigMessageCreator.setHighContrastMode(state);
    }

    @autobind
    protected onIssueTrackerPathSave(id: string, state: string) {
        return this.props.deps.userConfigMessageCreator.setIssueTrackerPath(state);
    }
}
