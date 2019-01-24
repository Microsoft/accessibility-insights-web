// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as AxeUtils from './axe-utils';

import { isImage } from './image-rule';
import { RuleConfiguration } from './iruleresults';

export const textAlternativeConfiguration: RuleConfiguration = {
    checks: [
        {
            id: 'text-alternative-data-collector',
            evaluate: evaluateTextAlternative,
        },
    ],
    rule: {
        id: 'accessible-image',
        selector: '*',
        any: ['text-alternative-data-collector'],
        all: [],
        matches: matches,
        enabled: false,
    },
};

function matches(node: HTMLElement): boolean {
    return isImage(node, null) && AxeUtils.getImageCodedAs(node) === 'Meaningful';
}

function evaluateTextAlternative(node: HTMLElement): boolean {
    const accessibleName: string = AxeUtils.getAccessibleText(node, false);
    const accessibleDescription: string = AxeUtils.getAccessibleDescription(node);
    const imageType: string = AxeUtils.getImageType(node);

    // tslint:disable-next-line:no-invalid-this
    this.data({
        imageType,
        accessibleName,
        accessibleDescription,
    });

    return true;
}
