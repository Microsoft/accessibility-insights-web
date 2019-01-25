// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';
import { NamedSFC } from '../react/named-sfc';
import { AnyExtension } from './extension-point';

export type Extension<C> = {
    type: 'Extension';
    extensionPointKey: string;
    extensionType: string;
    component: C;
};

type ExtensionPoint<C> = {
    type: 'ExtensionPoint';
    extensionPointKey: string;
    extensionType: string;
    apply: (component: C) => Extension<C>;
};

type ReactExtension<P> = Extension<React.SFC<P>> & {
    extensionType: 'reactComponent';
};

type ReactExtensionPoint<P extends {}> = ExtensionPoint<React.SFC<P>> & {
    extensionType: 'reactComponent';
    create: (component: React.SFC<P>) => ReactExtension<P>;
    component: React.SFC<P & { extensions: AnyExtension[] }>;
};

function isReactExtension(extension: Extension<any>): extension is ReactExtension<any> {
    return (extension as AnyExtension).extensionType === 'reactComponent';
}

export function reactExtensionPoint<P extends {}>(extensionPointKey: string): ReactExtensionPoint<P> {
    const component = NamedSFC<P & { extensions: Extension<any>[] }>(extensionPointKey, props => {
        const { children, extensions } = props;

        let result = <>{children}</>;

        if (extensions) {
            extensions
                .filter(isReactExtension)
                .filter(e => e.extensionPointKey === extensionPointKey)
                .forEach(e => {
                    const Outside = e.component;
                    result = <Outside {...props}>{result}</Outside>;
                });
        }

        return result;
    });

    function create(extensionComponent: React.SFC<P>): ReactExtension<P> {
        const Wrap = extensionComponent;
        const wrapComponent = NamedSFC<P>(extensionPointKey, props => <Wrap {...props} />);
        wrapComponent.displayName = extensionPointKey;

        return {
            type: 'Extension',
            extensionPointKey: extensionPointKey,
            extensionType: 'reactComponent',
            component: extensionComponent,
        };
    }

    return { component, extensionPointKey, create } as ReactExtensionPoint<P>;
}
