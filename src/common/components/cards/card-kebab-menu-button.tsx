// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DirectionalHint, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import * as React from 'react';

import { MoreActionsMenuIcon } from 'common/icons/more-actions-menu-icon';
import { IssueDetailsTextGenerator } from '../../../background/issue-details-text-generator';
import { DetailsViewActionMessageCreator } from '../../../DetailsView/actions/details-view-action-message-creator';
import { IssueFilingDialog } from '../../../DetailsView/components/issue-filing-dialog';
import { IssueFilingService } from '../../../issue-filing/types/issue-filing-service';
import { NavigatorUtils } from '../../navigator-utils';
import { CreateIssueDetailsTextData } from '../../types/create-issue-details-text-data';
import { IssueFilingNeedsSettingsContentProps } from '../../types/issue-filing-needs-setting-content';
import { IssueFilingServiceProperties, UserConfigurationStoreData } from '../../types/store-data/user-configuration-store';
import { WindowUtils } from '../../window-utils';
import { IssueFilingButtonDeps } from '../issue-filing-button';
import { Toast } from '../toast';
import { CardInteractionSupport } from './card-interaction-support';
import { kebabMenu, kebabMenuButton, kebabMenuCallout } from './card-kebab-menu-button.scss';

export type CardKebabMenuButtonDeps = {
    windowUtils: WindowUtils;
    issueDetailsTextGenerator: IssueDetailsTextGenerator;
    detailsViewActionMessageCreator: DetailsViewActionMessageCreator;
    navigatorUtils: NavigatorUtils;
    cardInteractionSupport: CardInteractionSupport;
} & IssueFilingButtonDeps;

export interface CardKebabMenuButtonState {
    showNeedsSettingsContent: boolean;
    showingCopyToast: boolean;
    toastText: string;
}

export interface CardKebabMenuButtonProps {
    deps: CardKebabMenuButtonDeps;
    userConfigurationStoreData: UserConfigurationStoreData;
    issueDetailsData: CreateIssueDetailsTextData;
}

export class CardKebabMenuButton extends React.Component<CardKebabMenuButtonProps, CardKebabMenuButtonState> {
    constructor(props: CardKebabMenuButtonProps) {
        super(props);

        this.state = {
            showNeedsSettingsContent: false,
            showingCopyToast: false,
            toastText: '',
        };
    }

    public render(): JSX.Element {
        const menuItems = this.getMenuItems();
        if (menuItems.length === 0) {
            return null;
        }

        return (
            <>
                <ActionButton
                    className={kebabMenuButton}
                    ariaLabel="More actions"
                    onRenderMenuIcon={MoreActionsMenuIcon}
                    menuProps={{
                        className: kebabMenu,
                        directionalHint: DirectionalHint.bottomRightEdge,
                        shouldFocusOnMount: true,
                        items: this.getMenuItems(),
                        calloutProps: {
                            className: kebabMenuCallout,
                        },
                    }}
                />
                {this.renderIssueFilingSettingContent()}
                {this.renderCopyFailureDetailsToast()}
            </>
        );
    }

    public renderCopyFailureDetailsToast(): JSX.Element {
        const { cardInteractionSupport } = this.props.deps;

        if (!cardInteractionSupport.supportsCopyFailureDetails) {
            return null;
        }

        return (
            <>
                {this.state.showingCopyToast ? (
                    <Toast onTimeout={() => this.hideToast()} deps={this.props.deps}>
                        {this.state.toastText}
                    </Toast>
                ) : null}
            </>
        );
    }

    private getMenuItems(): IContextualMenuItem[] {
        const { cardInteractionSupport } = this.props.deps;
        const items = [];

        if (cardInteractionSupport.supportsIssueFiling) {
            items.push({
                key: 'fileissue',
                name: 'File issue',
                iconProps: {
                    iconName: 'ladybugSolid',
                },
                onClick: this.fileIssue,
            });
        }

        if (cardInteractionSupport.supportsCopyFailureDetails) {
            items.push({
                key: 'copyfailuredetails',
                name: `Copy failure details`,
                iconProps: {
                    iconName: 'copy',
                },
                onClick: this.copyFailureDetails,
            });
        }

        return items;
    }

    private fileIssue = (event: React.MouseEvent<any>): void => {
        const { issueDetailsData, userConfigurationStoreData, deps } = this.props;
        const { issueFilingServiceProvider, issueFilingActionMessageCreator } = deps;

        const selectedBugFilingService = issueFilingServiceProvider.forKey(userConfigurationStoreData.bugService);
        const selectedBugFilingServiceData = selectedBugFilingService.getSettingsFromStoreData(
            userConfigurationStoreData.bugServicePropertiesMap,
        );
        const isSettingValid = selectedBugFilingService.isSettingsValid(selectedBugFilingServiceData);

        if (isSettingValid) {
            issueFilingActionMessageCreator.fileIssue(event, userConfigurationStoreData.bugService, issueDetailsData);
            this.closeNeedsSettingsContent();
        } else {
            this.openNeedsSettingsContent();
        }
    };

    private copyFailureDetails = async (event: React.MouseEvent<any>): Promise<void> => {
        const text = this.props.deps.issueDetailsTextGenerator.buildText(this.props.issueDetailsData);
        this.props.deps.detailsViewActionMessageCreator.copyIssueDetailsClicked(event);

        try {
            await this.props.deps.navigatorUtils.copyToClipboard(text);
        } catch (error) {
            this.showToastWithFailureMessage();
            return;
        }

        this.showToastWithSuccessMessage();
    };

    public renderIssueFilingSettingContent(): JSX.Element {
        const { deps, userConfigurationStoreData, issueDetailsData } = this.props;
        const { issueFilingServiceProvider, cardInteractionSupport } = deps;

        if (!cardInteractionSupport.supportsIssueFiling) {
            return null;
        }

        const selectedIssueFilingService: IssueFilingService = issueFilingServiceProvider.forKey(userConfigurationStoreData.bugService);
        const selectedIssueFilingServiceData: IssueFilingServiceProperties = selectedIssueFilingService.getSettingsFromStoreData(
            userConfigurationStoreData.bugServicePropertiesMap,
        );
        const needsSettingsContentProps: IssueFilingNeedsSettingsContentProps = {
            deps,
            isOpen: this.state.showNeedsSettingsContent,
            selectedIssueFilingService,
            selectedIssueData: issueDetailsData,
            selectedIssueFilingServiceData,
            onClose: this.closeNeedsSettingsContent,
            issueFilingServicePropertiesMap: userConfigurationStoreData.bugServicePropertiesMap,
        };

        return <IssueFilingDialog {...needsSettingsContentProps} />;
    }

    private closeNeedsSettingsContent = (): void => {
        this.setState({ showNeedsSettingsContent: false });
    };

    private openNeedsSettingsContent(): void {
        this.setState({ showNeedsSettingsContent: true });
    }

    private showToastWithSuccessMessage(): void {
        this.setState({ showingCopyToast: true, toastText: 'Failure details copied.' });
    }

    private hideToast(): void {
        this.setState({ showingCopyToast: false, toastText: '' });
    }

    private showToastWithFailureMessage(): void {
        this.setState({ showingCopyToast: true, toastText: 'Failed to copy failure details. Please try again.' });
    }
}
