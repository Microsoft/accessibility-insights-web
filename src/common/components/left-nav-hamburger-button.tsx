// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { NamedFC } from 'common/react/named-fc';
import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import * as styles from './left-nav-hamburger-button.scss';

export type LeftNavHamburgerButtonProps = {
    ariaLabel: string;
};

export const LeftNavHamburgerButton = NamedFC<LeftNavHamburgerButtonProps>(
    'LeftNavHamburgerButton',
    props => {
        return (
            <IconButton
                className={styles.leftNavHamburgerButton}
                iconProps={{ iconName: 'GlobalNavButton' }}
                ariaLabel={props.ariaLabel}
            />
        );
    },
);
