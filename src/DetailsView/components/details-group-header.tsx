// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';
import { GroupHeader } from 'office-ui-fabric-react/lib/components/GroupedList/GroupHeader';
import { IGroupDividerProps } from 'office-ui-fabric-react/lib/DetailsList';
import * as React from 'react';

import { NewTabLink } from '../../common/components/new-tab-link';
import { GuidanceLinks } from './guidance-links';
import { DetailsGroup } from './issues-table-handler';

export interface DetailsGroupHeaderProps extends IGroupDividerProps {
    group: DetailsGroup;
    countIcon: JSX.Element;
}

export class DetailsGroupHeader extends React.Component<DetailsGroupHeaderProps> {
    public render(): JSX.Element {
        const selectAllButtonProps = {
            'aria-label': `${this.props.group.key} rule`,
        };
        return <GroupHeader onRenderTitle={this.onRenderTitle} selectAllButtonProps={selectAllButtonProps} {...this.props} />;
    }

    @autobind
    private onRenderTitle(): JSX.Element {
        return (
            <div className="details-group-header-title">
                {this.renderRuleLink(this.props.group)}
                {': '}
                {this.renderRuleDescription(this.props.group)} {this.renderCount(this.props)} {this.renderGuidanceLinks(this.props.group)}
            </div>
        );
    }

    private renderRuleDescription(group: DetailsGroup): JSX.Element {
        return <span id={`${group.key}-rule-description`}>{group.name}</span>;
    }

    private renderRuleLink(group: DetailsGroup): JSX.Element {
        return (
            <NewTabLink
                href={group.ruleUrl}
                onClick={this.onRuleLinkClick}
                aria-label={`rule ${group.key}`}
                aria-describedby={`${group.key}-rule-description`}
            >
                {group.key}
            </NewTabLink>
        );
    }

    private renderCount(props: DetailsGroupHeaderProps): JSX.Element {
        return (
            <>
                ({this.props.countIcon}
                {this.props.group.count})
            </>
        );
    }

    private renderGuidanceLinks(group: DetailsGroup): JSX.Element {
        return <GuidanceLinks links={group.guidanceLinks} />;
    }

    @autobind
    private onRuleLinkClick(event: React.MouseEvent<HTMLElement>): void {
        event.stopPropagation();
    }
}
