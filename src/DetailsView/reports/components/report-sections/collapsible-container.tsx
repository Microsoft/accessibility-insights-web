// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { css } from '@uifabric/utilities';
import * as React from 'react';

import { NamedSFC } from '../../../../common/react/named-sfc';

export type CollapsibleContainerProps = {
    id: string;
    accessibleHeadingContent: JSX.Element;
    visibleHeadingContent: JSX.Element;
    collapsibleContent: JSX.Element;
    buttonAriaLabel: string;
    titleHeadingLevel?: number;
    containerClassName?: string;
};

export const CollapsibleContainer = NamedSFC<CollapsibleContainerProps>('CollapsibleContainer', props => {
    const {
        id,
        visibleHeadingContent,
        titleHeadingLevel,
        collapsibleContent,
        buttonAriaLabel,
        containerClassName,
        accessibleHeadingContent,
    } = props;

    const contentId = `content-container-${id}`;

    const outerDivClassName = css('collapsible-container', containerClassName);

    const titleContainerProps = titleHeadingLevel ? { role: 'heading', 'aria-level': titleHeadingLevel } : undefined;

    return (
        <div className={outerDivClassName}>
            <div className="title-container" {...titleContainerProps}>
                {accessibleHeadingContent}
                <button className="collapsible-control" aria-expanded="false" aria-controls={contentId} aria-label={buttonAriaLabel} />
                <div>{visibleHeadingContent}</div>
            </div>
            <div id={contentId} className="collapsible-content" aria-hidden="true">
                {collapsibleContent}
            </div>
        </div>
    );
});
