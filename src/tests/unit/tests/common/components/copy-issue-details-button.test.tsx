// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Enzyme from 'enzyme';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import { IMock, It, Mock, Times } from 'typemoq';

import { IssueDetailsTextGenerator } from 'background/issue-details-text-generator';
import { Toast } from 'common/components/toast';
import { NavigatorUtils } from 'common/navigator-utils';
import { WindowUtils } from 'common/window-utils';
import { CopyIssueDetailsButton, CopyIssueDetailsButtonProps } from '../../../../../common/components/copy-issue-details-button';
import { CreateIssueDetailsTextData } from '../../../../../common/types/create-issue-details-text-data';

describe('CopyIssueDetailsButtonTest', () => {
    let props: CopyIssueDetailsButtonProps;
    let onClickMock: IMock<(event: React.MouseEvent<any>) => void>;
    let windowUtilsMock: IMock<WindowUtils>;
    let navigatorUtilsMock: IMock<NavigatorUtils>;
    const issueDetailsText = 'placeholder text';
    beforeEach(() => {
        onClickMock = Mock.ofInstance(e => {});
        windowUtilsMock = Mock.ofType<WindowUtils>();
        navigatorUtilsMock = Mock.ofType<NavigatorUtils>();
        props = {
            deps: {
                windowUtils: windowUtilsMock.object,
                navigatorUtils: navigatorUtilsMock.object,
                issueDetailsTextGenerator: {
                    buildText: _ => issueDetailsText,
                } as IssueDetailsTextGenerator,
            },
            issueDetailsData: {} as CreateIssueDetailsTextData,
            onClick: onClickMock.object,
        };
    });

    test('render', () => {
        const result = Enzyme.shallow(<CopyIssueDetailsButton {...props} />);
        expect(result.debug()).toMatchSnapshot();
    });

    test('render after click shows toast', async () => {
        navigatorUtilsMock
            .setup(navigatorUtils => navigatorUtils.copyToClipboard(issueDetailsText))
            .returns(() => {
                return Promise.resolve();
            })
            .verifiable(Times.once());

        const result = Enzyme.mount(<CopyIssueDetailsButton {...props} />);
        const button = result.find(DefaultButton);
        onClickMock.setup(m => m(It.isAny())).verifiable(Times.once());
        // tslint:disable-next-line: await-promise
        await button.simulate('click');

        const toast = result.find(Toast);

        expect(toast.state().toastVisible).toBe(true);
        expect(toast.state().content).toBe('Failure details copied.');
        expect(result.debug()).toMatchSnapshot();

        verifyMocks();
    });

    function verifyMocks(): void {
        onClickMock.verifyAll();
        windowUtilsMock.verifyAll();
        navigatorUtilsMock.verifyAll();
    }
});
