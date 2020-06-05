// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { LeftNavHamburgerButton } from 'common/components/left-nav-hamburger-button';
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';

export type ExpandCollpaseLeftNavButtonProps = {
    isSideNavOpen: boolean;
    setSideNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AssessmentLeftNavHamburgerButton = NamedFC<ExpandCollpaseLeftNavButtonProps>(
    'AssessmentLeftNavHamburgerButton',
    props => {
        const ariaLabel: string = 'Assessment - all tests and requirements list';
        return (
            <LeftNavHamburgerButton
                ariaLabel={ariaLabel}
                isSideNavOpen={props.isSideNavOpen}
                setSideNavOpen={props.setSideNavOpen}
            />
        );
    },
);

export const FastPassLeftNavHamburgerButton = NamedFC<ExpandCollpaseLeftNavButtonProps>(
    'FastPassLeftNavHamburgerButton',
    props => {
        const ariaLabel: string = 'FastPass - all tests list';
        return (
            <LeftNavHamburgerButton
                ariaLabel={ariaLabel}
                isSideNavOpen={props.isSideNavOpen}
                setSideNavOpen={props.setSideNavOpen}
            />
        );
    },
);
