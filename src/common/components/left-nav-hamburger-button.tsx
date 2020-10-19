// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import { IconButton, css } from 'office-ui-fabric-react';
import * as React from 'react';

import * as styles from './left-nav-hamburger-button.scss';

export type LeftNavHamburgerButtonProps = {
    ariaLabel: string;
    isSideNavOpen: boolean;
    setSideNavOpen: (isOpen: boolean, event?: React.MouseEvent<any>) => void;
    className?: string;
};

export const LeftNavHamburgerButton = NamedFC<LeftNavHamburgerButtonProps>(
    'LeftNavHamburgerButton',
    props => {
        const onClick = (event: React.MouseEvent<any>) => {
            props.setSideNavOpen(!props.isSideNavOpen, event);
        };

        return (
            <IconButton
                className={css(styles.leftNavHamburgerButton, props.className)}
                iconProps={{ iconName: 'GlobalNavButton' }}
                ariaLabel={props.ariaLabel}
                aria-expanded={props.isSideNavOpen}
                onClick={onClick}
            />
        );
    },
);
