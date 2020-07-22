// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    getCheckResolution,
    getFixResolution,
    ResolutionCreatorData,
} from 'injected/adapters/resolution-creator';

describe('ResolutionCreator', () => {
    it('outputs correct fix resolution with no data', () => {
        const resolutionCreatorDataStub: ResolutionCreatorData = {
            id: 'rule id',
            nodeResult: {
                any: [],
                all: [],
                none: [],
                html: 'test html',
                target: ['test target'],
            },
        };

        const expected = {
            'how-to-fix-web': {
                any: [],
                none: [],
                all: [],
            },
        };

        const actual = getFixResolution(resolutionCreatorDataStub);
        expect(actual).toEqual(expected);
    });

    it('outputs correct fix resolution with data', () => {
        const resolutionCreatorDataStub: ResolutionCreatorData = {
            id: 'rule id',
            nodeResult: {
                any: [
                    { id: null, message: 'any 1 message', data: null },
                    { id: null, message: 'any 2 message', data: null },
                ],
                all: [{ id: null, message: 'all 1 message', data: null }],
                none: [{ id: null, message: 'none 1 message', data: null }],
                html: 'test html',
                target: ['test target'],
            },
        };

        const expected = {
            'how-to-fix-web': {
                all: ['all 1 message'],
                any: ['any 1 message', 'any 2 message'],
                none: ['none 1 message'],
            },
        };

        const actual = getFixResolution(resolutionCreatorDataStub);
        expect(actual).toEqual(expected);
    });

    it.each([
        'aria-input-field-name',
        'color-contrast',
        'link-in-text-block',
        'th-has-data-cells',
        'bogus rule id',
    ])('outputs correct check resolution with id=%s', ruleId => {
        const resolutionCreatorDataStub: ResolutionCreatorData = {
            id: ruleId,
            nodeResult: {
                any: [],
                all: [],
                none: [],
                html: 'test html',
                target: ['test target'],
            },
        };

        const expected = {
            'how-to-check-web': ruleId,
        };

        const actual = getCheckResolution(resolutionCreatorDataStub);
        expect(actual).toEqual(expected);
    });
});
