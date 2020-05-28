// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Header, HeaderDeps } from 'common/components/header';
import {
    withStoreSubscription,
    WithStoreSubscriptionDeps,
} from 'common/components/with-store-subscription';
import { NamedFC } from 'common/react/named-fc';
import {
    CurrentView,
    CurrentViewDeps,
    CurrentViewState,
} from 'debug-tools/components/current-view/current-view';
import {
    DebugToolsNav,
    DebugToolsNavDeps,
    DebugToolsNavState,
} from 'debug-tools/components/debug-tools-nav';
import * as React from 'react';
import * as styles from './debug-tools-view.scss';

export type DebugToolsViewState = DebugToolsNavState & CurrentViewState;

export type DebugToolsViewDeps = WithStoreSubscriptionDeps<DebugToolsViewState> &
    HeaderDeps &
    DebugToolsNavDeps &
    CurrentViewDeps;

export interface DebugToolsViewProps {
    deps: DebugToolsViewDeps;
    storeState: DebugToolsViewState;
}

export const DebugTools = NamedFC<DebugToolsViewProps>('DebugToolsView', ({ deps, storeState }) => {
    return (
        <div className={styles.debugToolsContainer}>
            <Header deps={deps} />
            <DebugToolsNav deps={deps} state={storeState} className={styles.nav} />
            <CurrentView deps={deps} storeState={storeState} />
        </div>
    );
});

export const DebugToolsView = withStoreSubscription<DebugToolsViewProps, DebugToolsViewState>(
    DebugTools,
);
