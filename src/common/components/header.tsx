// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { HeaderIcon, HeaderIconDeps } from 'common/components/header-icon';
import { NamedFC } from 'common/react/named-fc';
import { title } from 'content/strings/application';
import * as styles from './header.scss';

export type HeaderProps = { deps: HeaderDeps };
export type HeaderDeps = HeaderIconDeps;

export const Header = NamedFC<HeaderProps>('Header', props => {
    return (
        <header className={styles.headerBar}>
            <HeaderIcon deps={props.deps} />
            <span className={styles.headerText}>{title}</span>
            {props.children}
        </header>
    );
});
