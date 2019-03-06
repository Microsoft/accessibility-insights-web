// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';
import { BrowserAdapter } from '../../../background/browser-adapter';
import { NewTabLink } from '../../../common/components/new-tab-link';
import { withStoreSubscription, WithStoreSubscriptionDeps } from '../../../common/components/with-store-subscription';
import { DisplayableStrings } from '../../../common/constants/displayable-strings';
import { DropdownClickHandler } from '../../../common/dropdown-click-handler';
import { FeatureFlags } from '../../../common/feature-flags';
import { FeatureFlagStoreData } from '../../../common/types/store-data/feature-flag-store-data';
import { ICommandStoreData } from '../../../common/types/store-data/icommand-store-data';
import { ILaunchPanelStoreData } from '../../../common/types/store-data/ilaunch-panel-store-data';
import { IVisualizationStoreData } from '../../../common/types/store-data/ivisualization-store-data';
import { UserConfigurationStoreData } from '../../../common/types/store-data/user-configuration-store';
import { UrlValidator } from '../../../common/url-validator';
import { IPopupHandlers } from '../handlers/ipopup-handlers';
import { PopupViewControllerHandler } from '../handlers/popup-view-controller-handler';
import { LaunchPadRowConfigurationFactory } from '../launch-pad-row-configuration-factory';
import { AdHocToolsPanel } from './ad-hoc-tools-panel';
import { DiagnosticViewToggleFactory } from './diagnostic-view-toggle-factory';
import Header from './header';
import { LaunchPad, LaunchPadDeps, LaunchPadRowConfiguration } from './launch-pad';
import { LaunchPanelHeader, LaunchPanelHeaderDeps } from './launch-panel-header';
import { TelemetryPermissionDialog, TelemetryPermissionDialogDeps } from './telemetry-permission-dialog';

export interface PopupViewProps {
    deps: PopupViewControllerDeps;
    title: string;
    popupHandlers: IPopupHandlers;
    popupWindow: Window;
    browserAdapter: BrowserAdapter;
    targetTabUrl: string;
    hasAccess: boolean;
    launchPadRowConfigurationFactory: LaunchPadRowConfigurationFactory;
    diagnosticViewToggleFactory: DiagnosticViewToggleFactory;
    dropdownClickHandler: DropdownClickHandler;
    storeState?: PopupViewControllerState;
}

export type PopupViewControllerDeps = LaunchPadDeps &
    LaunchPanelHeaderDeps &
    TelemetryPermissionDialogDeps &
    WithStoreSubscriptionDeps<PopupViewControllerState>;

export enum LaunchPanelType {
    AdhocToolsPanel,
    LaunchPad,
}

export interface PopupViewControllerState {
    visualizationStoreData: IVisualizationStoreData;
    commandStoreData: ICommandStoreData;
    featureFlagStoreData: FeatureFlagStoreData;
    launchPanelStateStoreData: ILaunchPanelStoreData;
    userConfigurationStoreData: UserConfigurationStoreData;
}

export class PopupView extends React.Component<PopupViewProps> {
    private handler: PopupViewControllerHandler;
    private openTogglesView: () => void;
    private openAdhocToolsPanel: () => void;
    private versionNumber: string;
    private isInitialRender: boolean = true;

    constructor(props: PopupViewProps) {
        super(props);
        this.handler = props.popupHandlers.popupViewControllerHandler;
        this.versionNumber = props.browserAdapter.getManifest().version;
        this.openTogglesView = () => {
            this.handler.openLaunchPad(this);
        };
        this.openAdhocToolsPanel = () => {
            this.handler.openAdhocToolsPanel(this);
        };
    }

    public render(): JSX.Element {
        if (!this.props.hasAccess) {
            if (UrlValidator.isFileUrl(this.props.targetTabUrl)) {
                return this.renderUnsupportedMsgPanelForFileUrl();
            } else {
                return this.renderUnsupportedMsgPanelForChromeUrl();
            }
        } else if (this.props.deps.storesHub.hasStoreData()) {
            return (
                <React.Fragment>
                    {this.renderLaunchPanel()}
                    <TelemetryPermissionDialog
                        deps={this.props.deps}
                        isFirstTime={this.props.storeState.userConfigurationStoreData.isFirstTime}
                    />
                </React.Fragment>
            );
        }
        return this.renderSpinner();
    }

    private renderLaunchPanel(): JSX.Element {
        const { popupActionMessageCreator } = this.props.deps;

        if (this.isInitialRender) {
            this.isInitialRender = false;
            popupActionMessageCreator.openLaunchPad(this.props.storeState.launchPanelStateStoreData.launchPanelType);
        }
        switch (this.props.storeState.launchPanelStateStoreData.launchPanelType) {
            case LaunchPanelType.LaunchPad:
                return this.renderLaunchPad();
            case LaunchPanelType.AdhocToolsPanel:
                return this.renderAdHocToolsPanel();
            default:
                return null;
        }
    }

    private renderAdHocToolsPanel(): JSX.Element {
        return (
            <div className="ms-Fabric ad-hoc-tools-panel">
                <LaunchPanelHeader
                    deps={this.props.deps}
                    title={this.props.title}
                    supportLinkHandler={this.props.popupHandlers.supportLinkHandler}
                    popupWindow={this.props.popupWindow}
                    openAdhocToolsPanel={this.openAdhocToolsPanel}
                    featureFlags={this.props.storeState.featureFlagStoreData}
                />
                <AdHocToolsPanel
                    backLinkHandler={this.openTogglesView}
                    diagnosticViewToggleFactory={this.props.diagnosticViewToggleFactory}
                />
            </div>
        );
    }

    private renderLaunchPad(): JSX.Element {
        const { popupActionMessageCreator } = this.props.deps;

        const rowConfigs: LaunchPadRowConfiguration[] = this.props.launchPadRowConfigurationFactory.createRowConfigs(
            this,
            popupActionMessageCreator,
            this.props.popupHandlers.popupViewControllerHandler,
            this.props.storeState.featureFlagStoreData[FeatureFlags.newAssessmentExperience],
        );

        const onClickTutorialLink = event => popupActionMessageCreator.openTutorial(event);

        return (
            <div className="ms-Fabric launch-panel" id="new-launch-pad">
                <LaunchPanelHeader
                    deps={this.props.deps}
                    title={this.props.title}
                    subtitle={
                        <>
                            <NewTabLink
                                href={LaunchPad.demoLink}
                                aria-label="demo video"
                                title="watch the 3 minute video introduction"
                                onClick={onClickTutorialLink}
                            >
                                Watch 3-minute video introduction
                            </NewTabLink>{' '}
                        </>
                    }
                    supportLinkHandler={this.props.popupHandlers.supportLinkHandler}
                    popupWindow={this.props.popupWindow}
                    openAdhocToolsPanel={this.openAdhocToolsPanel}
                    featureFlags={this.props.storeState.featureFlagStoreData}
                />
                <LaunchPad deps={this.props.deps} productName={this.props.title} rowConfigs={rowConfigs} version={this.versionNumber} />
            </div>
        );
    }

    private renderSpinner(): JSX.Element {
        return <Spinner size={SpinnerSize.large} label="Loading..." className="insights-spinner" />;
    }

    private renderUnsupportedMsgPanelForChromeUrl(): JSX.Element {
        return (
            <div className="ms-Fabric unsupported-url-info-panel">
                {this.renderDefaultHeader()}
                <div className="ms-Grid main-section">
                    <div
                        className="launch-panel-general-container"
                        dangerouslySetInnerHTML={{ __html: DisplayableStrings.urlNotScannable.join('</br>') }}
                    />
                </div>
            </div>
        );
    }

    private renderUnsupportedMsgPanelForFileUrl(): JSX.Element {
        return (
            <div className="ms-Fabric unsupported-url-info-panel">
                {this.renderDefaultHeader()}
                <div className="ms-Grid main-section">
                    <div className="launch-panel-general-container">{DisplayableStrings.fileUrlDoesNotHaveAccess}</div>
                    <div>
                        <div>To allow this extension to run on file URLs:</div>
                        <div>
                            {'1. Open '}
                            <NewTabLink
                                onClick={this.props.browserAdapter.openManageExtensionPage}
                                aria-label={`open ${this.props.title} extension page`}
                            >
                                {`${this.props.title} extension page`}
                            </NewTabLink>
                            {'.'}
                        </div>
                        <div>
                            {'2. Enable '}
                            <span className="ms-fontWeight-semibold">Allow Access to file URLs</span>.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private renderDefaultHeader(): JSX.Element {
        return <Header title={this.props.title} />;
    }

    @autobind
    public setlaunchPanelType(launchPanelType: LaunchPanelType): void {
        const { popupActionMessageCreator } = this.props.deps;
        popupActionMessageCreator.setLaunchPanelType(launchPanelType);
    }
}

export const PopupViewWithStoreSubscription = withStoreSubscription<PopupViewProps, PopupViewControllerState>(PopupView);
