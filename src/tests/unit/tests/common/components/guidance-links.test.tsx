// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ElectronExternalLink } from 'electron/views/device-connect-view/components/electron-external-link';
import { shallow } from 'enzyme';
import * as React from 'react';

import { forOwn } from 'lodash';
import { HyperlinkDefinition } from 'views/content/content-page';
import { GuidanceLinks, GuidanceLinksProps } from '../../../../../common/components/guidance-links';
import { NewTabLink } from '../../../../../common/components/new-tab-link';

describe('GuidanceLinksTest', () => {
    const testLink1 = {
        text: 'text1',
        href: 'https://url1',
    } as HyperlinkDefinition;
    const testLink2 = {
        text: 'text2',
        href: 'https://url2',
    } as HyperlinkDefinition;
    const bestPracticeLink = {
        text: 'Best Practice',
        href: '',
    } as HyperlinkDefinition;

    test('links is null', () => {
        const props: GuidanceLinksProps = {
            links: null,
            classNameForDiv: null,
            LinkComponent: NewTabLink,
        };

        const rendered = shallow(<GuidanceLinks {...props} />);
        expect(rendered.debug()).toMatchSnapshot();
    });

    test('links is empty', () => {
        const props: GuidanceLinksProps = {
            links: [],
            classNameForDiv: null,
            LinkComponent: NewTabLink,
        };

        const rendered = shallow(<GuidanceLinks {...props} />);
        expect(rendered.debug()).toMatchSnapshot();
    });

    const testCases = {
        'one regular link': [testLink1],
        'two regular links': [testLink1, testLink2],
        'one best practice link': [bestPracticeLink],
        'best practice and regular links (excludes BEST PRACTICE)': [
            bestPracticeLink,
            testLink1,
            testLink2,
        ],
    };
    forOwn(testCases, (testCase, testName) => {
        test('links is not null and correct with ' + testName, () => {
            const props: GuidanceLinksProps = {
                links: testCase,
                classNameForDiv: 'className',
                LinkComponent: ElectronExternalLink,
            };

            const rendered = shallow(<GuidanceLinks {...props} />);
            expect(rendered.debug()).toMatchSnapshot();
        });
    });

    test('linkComponentType is defined as ElectronExternalLink', () => {
        const props: GuidanceLinksProps = {
            links: [testLink1],
            LinkComponent: ElectronExternalLink,
        };

        const rendered = shallow(<GuidanceLinks {...props} />);
        expect(rendered.debug()).toMatchSnapshot();
    });

    test('link click -> event propagation stoped', () => {
        const props: GuidanceLinksProps = {
            links: [testLink1],
            classNameForDiv: 'className',
            LinkComponent: NewTabLink,
        };

        const rendered = shallow(<GuidanceLinks {...props} />);

        const event = {
            stopPropagation: jest.fn(),
        };

        rendered.find(NewTabLink).simulate('click', event);

        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    });
});
