// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

export type ReactFCWithDisplayName<P = {}> = React.FC<P> & { displayName: string };

export function NamedSFC<P = {}>(displayName: string, component: React.FC<P>): ReactFCWithDisplayName<P> {
    component.displayName = displayName;

    return component as ReactFCWithDisplayName<P>;
}
