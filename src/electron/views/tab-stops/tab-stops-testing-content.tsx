// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { NamedFC } from 'common/react/named-fc';
import { TabStopsActionCreator } from 'electron/flux/action/tab-stops-action-creator';
import { Toggle } from 'office-ui-fabric-react';
import * as React from 'react';
import * as styles from './tab-stops-testing-content.scss';

export type TabStopsTestingContentDeps = {
    tabStopsActionCreator: TabStopsActionCreator;
};

export type TabStopsTestingContentProps = {
    deps: TabStopsTestingContentDeps;
    tabStopsEnabled: boolean;
};

const ariaLevelForHowToTestHeading: number = 3;

export const TabStopsTestingContent = NamedFC<TabStopsTestingContentProps>(
    'TabStopsTestingContent',
    props => {
        const tabStopsActionCreator = props.deps.tabStopsActionCreator;
        const onToggle = () => {
            if (props.tabStopsEnabled) {
                tabStopsActionCreator.disableTabStops();
            } else {
                tabStopsActionCreator.enableTabStops();
            }
        };

        return (
            <>
                <Toggle
                    label={'Show tab stops'}
                    checked={props.tabStopsEnabled}
                    offText="Off"
                    onText="On"
                    className={styles.toggle}
                    onClick={onToggle}
                />
                <span role="heading" aria-level={ariaLevelForHowToTestHeading}>
                    <strong>How to test:</strong>
                </span>
                <ol className={styles.howToTestList}>
                    <li>In your target app, navigate to the screen you want to test.</li>
                    <li>
                        Turn on the <strong>Show tab stops</strong> toggle. An empty circle will
                        highlight the element in the target app that currently has input focus.
                    </li>
                    <li>
                        If you're testing on a virtual device, switch to the emulator app by
                        clicking it or by pressing <strong>Alt+Tab</strong> (Windows or Linux) or{' '}
                        <strong>Command+Tab</strong> (Mac).
                    </li>
                    <li>
                        Use the virtual keyboard to the right (or a physical keyboard) to:
                        <ul>
                            <li>
                                Navigate to each interactive element and then use the arrow keys to
                                navigate away in each direction (up/down/left/right).
                            </li>
                        </ul>
                    </li>
                    <li>
                        As you navigate to each element, look for these{' '}
                        <strong>accessibility problems</strong>:
                        <ul>
                            <li>
                                An interactive element can't be reached using the Tab and arrow
                                keys.
                            </li>
                            <li>
                                An interactive element "traps" input focus and prevents navigating
                                away.
                            </li>
                            <li>
                                An interactive element doesn't give a visible indication when it has
                                input focus.
                            </li>
                            <li>
                                The navigation order is inconsistent with the logical order that's
                                communicated visually.
                            </li>
                            <li>Input focus moves unexpectedly without the user initiating it.</li>
                        </ul>
                    </li>
                </ol>
            </>
        );
    },
);
