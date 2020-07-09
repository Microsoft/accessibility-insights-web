// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Requirement } from 'assessments/types/requirement';
import { DetailsViewActionMessageCreator } from 'DetailsView/actions/details-view-action-message-creator';
import {
    GettingStartedView,
    GettingStartedViewDeps,
    GettingStartedViewProps,
} from 'DetailsView/components/getting-started-view';
import { shallow } from 'enzyme';
import { DefaultButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { IMock, Mock } from 'typemoq';
import { ContentPageComponent } from 'views/content/content-page';

describe('GettingStartedViewTest', () => {
    let messageCreatorMock: IMock<DetailsViewActionMessageCreator>;
    let eventStub: React.MouseEvent<HTMLElement>;
    let props: GettingStartedViewProps;

    beforeEach(() => {
        messageCreatorMock = Mock.ofType(DetailsViewActionMessageCreator);
        eventStub = {} as React.MouseEvent<HTMLElement>;
        props = {
            deps: {
                detailsViewActionMessageCreator: messageCreatorMock.object,
            } as GettingStartedViewDeps,
            gettingStartedContent: <div>test-getting-started-content</div>,
            title: 'some title',
            guidance: { pageTitle: 'some page title' } as ContentPageComponent,
            nextRequirement: {
                key: 'some requirement key',
            } as Requirement,
            currentTest: -1,
        };
    });

    it('renders with content from props', () => {
        const rendered = shallow(<GettingStartedView {...props} />);
        expect(rendered.getElement()).toMatchSnapshot();
    });

    it('validate next requirement button', () => {
        messageCreatorMock
            .setup(mock =>
                mock.selectRequirement(eventStub, props.nextRequirement.key, props.currentTest),
            )
            .verifiable();

        const rendered = shallow(<GettingStartedView {...props} />);
        rendered.find(DefaultButton).prop('onClick')(eventStub);
        messageCreatorMock.verifyAll();
    });
});
