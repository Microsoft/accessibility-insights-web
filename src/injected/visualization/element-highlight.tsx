// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { CSSProperties } from 'react';
import * as React from 'react';

import { NamedSFC } from '../../common/react/named-sfc';
import { FeatureFlagStoreData } from '../../common/types/store-data/feature-flag-store-data';
import { ClientUtils } from '../client-utils';
import { RenderDialog } from '../dialog-renderer';
import { HtmlElementAxeResults } from '../scanner-utils';
import { DrawerUtils } from './drawer-utils';
import { DrawerConfiguration, GetBoundingRect } from './formatter';
import { HightlightBox, HightlightBoxDeps } from './highlight-box';

export type ElementHighlightDeps = {
    drawerUtils: DrawerUtils;
    clientUtils: ClientUtils;
} & HightlightBoxDeps;

export interface ElementHighlightProps {
    deps: ElementHighlightDeps;
    element: Element;
    elementResult: HtmlElementAxeResults;
    bodyStyle: CSSStyleDeclaration;
    docStyle: CSSStyleDeclaration;
    drawerConfig: DrawerConfiguration;
    featureFlagStoreData: FeatureFlagStoreData;
    dialogRender: RenderDialog;
    getBoundingRect: GetBoundingRect;
}

export const ElementHighlight = NamedSFC<ElementHighlightProps>('HighlightBox', props => {
    const { deps, drawerConfig, featureFlagStoreData, dialogRender, element, elementResult, bodyStyle, docStyle, getBoundingRect } = props;
    const { clientUtils, drawerUtils } = deps;

    if (!drawerConfig.showVisualization) {
        return null;
    }

    const currentDom = drawerUtils.getDocumentElement();
    const elementBoundingClientRect = getBoundingRect(element);

    if (drawerUtils.isOutsideOfDocument(elementBoundingClientRect, currentDom, bodyStyle, docStyle)) {
        return null;
    }

    const onClickFailureBoxHandler = () => {
        dialogRender(elementResult, featureFlagStoreData);
    };

    const offset = clientUtils.getOffset(element);
    const styles: CSSProperties = {
        outlineStyle: drawerConfig.outlineStyle,
        outlineColor: drawerConfig.borderColor,
        top: drawerUtils.getContainerTopOffset(offset),
        left: drawerUtils.getContainerLeftOffset(offset),
        minWidth: drawerUtils.getContainerWidth(offset, currentDom, elementBoundingClientRect.width, bodyStyle, docStyle),
        minHeight: drawerUtils.getContainerHeight(offset, currentDom, elementBoundingClientRect.height, bodyStyle, docStyle),
    };

    return (
        <div title={drawerConfig.toolTip} className={'insights-highlight-box'} style={styles}>
            <HightlightBox deps={deps} drawerConfig={drawerConfig} boxConfig={drawerConfig.textBoxConfig} className={'text-label'} />
            <HightlightBox
                deps={deps}
                drawerConfig={drawerConfig}
                boxConfig={drawerConfig.failureBoxConfig}
                className={'failure-label'}
                onClickHandler={onClickFailureBoxHandler}
            />
        </div>
    );
});
