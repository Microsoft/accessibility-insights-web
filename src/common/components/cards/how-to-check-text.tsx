// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { NewTabLink } from 'common/components/new-tab-link';
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';
import * as styles from './how-to-check-text.scss';
import * as Markup from '../../../assessments/markup';

export interface HowToCheckTextProps {
    id: string;
}

export const HowToCheckText = NamedFC<HowToCheckTextProps>('HowToCheckText', props => {
    let checkText;
    switch (props.id) {
        case 'aria-input-field-name': {
            checkText = (
                <div>
                    Inspect the element using the{' '}
                    <NewTabLink href="https://developers.google.com/web/updates/2018/01/devtools">
                        Accessibility pane in the browser Developer Tools
                    </NewTabLink>{' '}
                    to verify that the field's accessible name is complete without its associated{' '}
                    <b>
                        {'<'}label{'>'}
                    </b>
                    .
                </div>
            );
            break;
        }
        case 'color-contrast': {
            checkText = (
                <div className={styles.combinationLists}>
                    <ul className={styles.multiLineTextYesBullet}>
                        <li list-style-type="disc">
                            If the instance is an icon or other non-text content, ignore it. This
                            rule applies only to text.
                        </li>
                        <li list-style-type="disc">
                            If the instance is text, use{' '}
                            <NewTabLink href="https://go.microsoft.com/fwlink/?linkid=2075365">
                                Accessibility Insights for Windows
                            </NewTabLink>{' '}
                            (or the{' '}
                            <NewTabLink href="https://developer.paciellogroup.com/resources/contrastanalyser/">
                                Colour Contrast Analyser
                            </NewTabLink>{' '}
                            if you're testing on a Mac) to manually verify that it has sufficient
                            contrast compared to the background. If the background is an image or
                            gradient, test an area where contrast appears to be lowest.
                        </li>
                    </ul>
                    <ul className={styles.multiLineTextNoBullet}>
                        <li>
                            For detailed test instructions, see{' '}
                            <Markup.Term>
                                Assessment {'>'} Adaptable content {'>'} Contrast
                            </Markup.Term>
                            .
                        </li>
                    </ul>
                </div>
            );
            break;
        }
        case 'link-in-text-block': {
            checkText = (
                <ul className={styles.multiLineTextNoBullet}>
                    <li>
                        Manually verify that the link text EITHER has a contrast ratio of at least
                        3:1 compared to surrounding text OR has a distinct visual style (such as
                        underlined, bolded, or italicized).
                    </li>
                    <li>
                        To measure contrast, use{' '}
                        <NewTabLink href="https://go.microsoft.com/fwlink/?linkid=2075365">
                            Accessibility Insights for Windows
                        </NewTabLink>{' '}
                        (or the{' '}
                        <NewTabLink href="https://developer.paciellogroup.com/resources/contrastanalyser/">
                            Colour Contrast Analyser
                        </NewTabLink>{' '}
                        if you're testing on a Mac).
                    </li>
                </ul>
            );
            break;
        }
        case 'th-has-data-cells': {
            checkText = (
                <div>
                    Examine the header cell in the context of the table to verify that it has no
                    data cells.
                </div>
            );
            break;
        }
        default: {
            break;
        }
    }
    return checkText;
});
