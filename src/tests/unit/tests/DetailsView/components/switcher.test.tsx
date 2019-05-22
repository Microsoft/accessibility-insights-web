// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { mount, shallow } from 'enzyme';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import * as React from 'react';
import { IMock, Mock, Times } from 'typemoq';

import { DetailsViewPivotType } from '../../../../../common/types/details-view-pivot-type';
import { DetailsViewActionMessageCreator } from '../../../../../DetailsView/actions/details-view-action-message-creator';
import { Switcher, SwitcherProps } from '../../../../../DetailsView/components/switcher';

describe('Switcher', () => {
    let defaultProps: SwitcherProps;
    let actionCreatorMock: IMock<DetailsViewActionMessageCreator>;

    beforeEach(() => {
        actionCreatorMock = Mock.ofType<DetailsViewActionMessageCreator>();
        defaultProps = {
            pivotKey: DetailsViewPivotType.fastPass,
            deps: {
                detailsViewActionMessageCreator: actionCreatorMock.object,
            },
        };
    });

    test('render', () => {
        const renderer = shallow(<Switcher {...defaultProps} />);

        expect(renderer.debug()).toMatchSnapshot();
    });

    test('render options', () => {
        const renderer = shallow(<Switcher {...defaultProps} />);
        renderer.find(Dropdown).simulate('click');

        expect(renderer.debug()).toMatchSnapshot();
    });

    test('onOptionChange', () => {
        actionCreatorMock
            .setup(creator => creator.sendPivotItemClicked(DetailsViewPivotType[DetailsViewPivotType.assessment]))
            .verifiable(Times.once());
        const wrapper = mount(<Switcher {...defaultProps} />);
        const dropdown = wrapper.find(Dropdown);

        expect(wrapper.state().selectedKey).toBe(DetailsViewPivotType.fastPass);

        dropdown.props().onChange(null, {
            key: DetailsViewPivotType.assessment,
        } as IDropdownOption);

        expect(wrapper.state().selectedKey).toBe(DetailsViewPivotType.assessment);
        actionCreatorMock.verifyAll();
    });

    test('componentDidUpdate: props have changed', () => {
        const newProps = {
            ...defaultProps,
            pivotKey: DetailsViewPivotType.assessment,
        };
        const component = shallow(<Switcher {...newProps} />).instance() as Switcher;
        component.componentDidUpdate(defaultProps);
        expect(component.state).toMatchObject({ selectedKey: DetailsViewPivotType.assessment });
    });

    test('componentDidUpdate: props have not changed', () => {
        const component = shallow(<Switcher {...defaultProps} />).instance() as Switcher;
        component.componentDidUpdate(defaultProps);
        expect(component.state).toMatchObject({ selectedKey: DetailsViewPivotType.fastPass });
    });
});
