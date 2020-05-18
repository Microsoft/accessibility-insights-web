// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { GuidanceTags, GuidanceTagsDeps } from 'common/components/guidance-tags';
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';
import { ContentPageComponent, HyperlinkDefinition } from 'views/content/content-page';
import { ContentPanelButton, ContentPanelButtonDeps } from 'views/content/content-panel-button';
import * as styles from './requirement-view-title.scss';

export const requirementViewTitleAutomationId = (requirementName: string): string =>
    `requirement-title-${requirementName}`;

export type RequirementViewTitleDeps = GuidanceTagsDeps & ContentPanelButtonDeps;

export interface RequirementViewTitleProps {
    deps: RequirementViewTitleDeps;
    name: string;
    guidanceLinks: HyperlinkDefinition[];
    infoAndExamples: ContentPageComponent;
}

export const RequirementViewTitle = NamedFC<RequirementViewTitleProps>(
    'RequirementViewTitle',
    props => {
        return (
            <h1
                data-automation-id={requirementViewTitleAutomationId(props.name)}
                className={styles.requirementViewTitle}
            >
                {props.name}
                <GuidanceTags deps={props.deps} links={props.guidanceLinks} />
                <ContentPanelButton
                    deps={props.deps}
                    reference={props.infoAndExamples}
                    iconName="info"
                    contentTitle={props.name}
                />
            </h1>
        );
    },
);
