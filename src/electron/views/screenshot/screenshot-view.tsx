// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import { ScreenshotContainer } from 'electron/views/screenshot/screenshot-container';
import * as React from 'react';
import { ScreenshotViewModel } from './screenshot-view-model';
import * as styles from './screenshot-view.scss';

export type ScreenshotViewProps = { viewModel: ScreenshotViewModel };

export const ScreenshotView = NamedFC<ScreenshotViewProps>('ScreenshotView', (props: ScreenshotViewProps) => {
    /* note the h1 below has a tab index because the screenshot image is scrollable and keyboard users need to be able to
    navigate via tab per https://dequeuniversity.com/rules/axe/3.3/scrollable-region-focusable */
    return (
        <div className={styles.screenshotView}>
            <h1 tabIndex={0}>Target Page Screenshot</h1>
            <ScreenshotContainer
                screenshotData={props.viewModel.screenshotData}
                highlightBoxViewModels={props.viewModel.highlightBoxViewModels}
            />
        </div>
    );
});
