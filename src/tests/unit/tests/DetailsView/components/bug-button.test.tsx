// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';
import { It, Mock, Times } from 'typemoq';

import { IssueDetailsTextGenerator } from '../../../../../background/issue-details-text-generator';
import { BugButton } from '../../../../../DetailsView/components/bug-button';

describe('BugButtonTest', () => {
    test('render new bug button', () => {
        const issueDetailsTextGeneratorMock = Mock.ofType(IssueDetailsTextGenerator);
        issueDetailsTextGeneratorMock
            .setup(generator => generator.buildTitle(It.isAny()))
            .returns(() => 'buildTitle')
            .verifiable();
        issueDetailsTextGeneratorMock
            .setup(generator => generator.buildText(It.isAny()))
            .returns(() => 'buildText')
            .verifiable();

        const props = {
            deps: {
                issueDetailsTextGenerator: issueDetailsTextGeneratorMock.object,
            },
            issueTrackerPath: 'https://github.com/example/example/issues',
            pageTitle: 'pageTitle',
            pageUrl: 'http://pageUrl',
            nodeResult: null,
        };
        const wrapper = shallow(<BugButton {...props} />);
        expect(wrapper.getElement()).toMatchSnapshot();
        issueDetailsTextGeneratorMock.verifyAll();
    });
});
