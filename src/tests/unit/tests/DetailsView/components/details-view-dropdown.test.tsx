// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { ContextualMenu, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import * as React from 'react';
import * as TestUtils from 'react-dom/test-utils';

import { DetailsViewDropDown, DetailsViewDropDownProps } from '../../../../../DetailsView/components/details-view-dropdown';

class TestableDetailsViewDropDown extends DetailsViewDropDown {
    public getOpenDropdown(): (target: React.MouseEvent<HTMLElement>) => void {
        return this.openDropdown;
    }

    public getDismissDropdown(): () => void {
        return this.dismissDropdown;
    }
}

describe('DetailsViewDropDownTest', () => {
    test('render', () => {
        const menuItemsStub: IContextualMenuItem[] = [
            {
                key: 'my-test-item',
                iconProps: {
                    iconName: 'contactCard',
                },
                onClick: null,
                name: 'My test item',
            },
        ];
        const props: DetailsViewDropDownProps = {
            menuItems: menuItemsStub,
        };
        const component = React.createElement(TestableDetailsViewDropDown, props);
        const testObject = TestUtils.renderIntoDocument(component);

        testObject.setState({ target: null, isContextMenuVisible: true });

        const expectedComponent = (
            <div className="details-view-dropdown">
                <Link className={'gear-button'} onClick={testObject.getOpenDropdown()}>
                    <Icon className="gear-options-icon" iconName="Gear" ariaLabel={'Manage Settings'} />
                </Link>
                <ContextualMenu
                    doNotLayer={false}
                    gapSpace={12}
                    shouldFocusOnMount={true}
                    target={null}
                    onDismiss={testObject.getDismissDropdown()}
                    directionalHint={DirectionalHint.bottomRightEdge}
                    directionalHintForRTL={DirectionalHint.bottomLeftEdge}
                    items={menuItemsStub}
                    id="settings-dropdown-menu"
                />
            </div>
        );

        expect(testObject.render()).toEqual(expectedComponent);
    });

    test('verify open/close menu', () => {
        const props: DetailsViewDropDownProps = {
            menuItems: [],
        };
        const target = { currentTarget: {} };
        const expectedMenuOpenState = {
            isContextMenuVisible: true,
            target: target.currentTarget,
        };
        const expectedMenuClosedState = {
            isContextMenuVisible: false,
            target: null,
        };
        const testObject = shallow(<TestableDetailsViewDropDown {...props} />);
        const link = testObject.find(Link);
        link.prop('onClick')(target as React.MouseEvent<HTMLElement>);

        expect(testObject.state()).toEqual(expectedMenuOpenState);

        const contextualMenu = testObject.find(ContextualMenu);
        contextualMenu.prop('onDismiss')();

        expect(testObject.state()).toEqual(expectedMenuClosedState);
    });
});
