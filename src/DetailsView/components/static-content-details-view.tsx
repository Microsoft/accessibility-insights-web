// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { VisualizationToggle } from '../../common/components/visualization-toggle';
import { NamedSFC } from '../../common/react/named-sfc';
import { ContentInclude, ContentIncludeDeps } from '../../views/content/content-include';
import { ContentLink } from '../../views/content/content-link';
import { ContentReference } from '../../views/content/content-page';

export type StaticContentDetailsViewDeps = ContentIncludeDeps;

export interface StaticContentDetailsViewProps {
    deps: StaticContentDetailsViewDeps;
    title: string;
    visualizationEnabled: boolean;
    toggleLabel: string;
    content: ContentReference;
    guidance: ContentReference;
    onToggleClick: (event) => void;
}

export const StaticContentDetailsView = NamedSFC<StaticContentDetailsViewProps>('StaticContentDetailsView', props => {
    return (
        <div className="static-content-details-view">
            <h1>
                {props.title} <ContentLink deps={props.deps} reference={props.guidance} iconName="info" />
            </h1>
            <VisualizationToggle
                checked={props.visualizationEnabled}
                onClick={props.onToggleClick}
                label={props.toggleLabel}
                className="details-view-toggle"
                visualizationName={props.title}
            />
            <ContentInclude deps={props.deps} content={props.content} />
        </div>
    );
});
