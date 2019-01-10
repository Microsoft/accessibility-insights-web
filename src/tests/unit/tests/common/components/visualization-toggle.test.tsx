// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Enzyme from 'enzyme';
import { IToggle, IToggleProps, Toggle } from 'office-ui-fabric-react/lib/Toggle';
import * as React from 'react';
import { IMock, Mock, Times } from 'typemoq';

import { IVisualizationToggleProps, VisualizationToggle } from '../../../../../common/components/visualization-toggle';


describe('VisualizationToggleTest', () => {
    test('constructor', () => {
        const testObject = new VisualizationToggle({} as IVisualizationToggleProps);
        expect(testObject).toBeInstanceOf(React.Component);
    });

    test('render no optional props', () => {
        const props: IVisualizationToggleProps = new IVisualizationTogglePropsBuilder().build();

        const wrapper = Enzyme.shallow(<VisualizationToggle {...props} />);

        const toggle = wrapper.find(Toggle);

        expect(toggle).toBeDefined();

        const expectedProps = visualizationTogglePropsToToggleProps(props);
        expect(toggle.props()).toEqual(expectedProps);
    });

    test('render all props', () => {
        const props: IVisualizationToggleProps = new IVisualizationTogglePropsBuilder()
            .setLabel('my test label')
            .setClassName('my test class')
            .setDisabled(true)
            .build();

        const wrapper = Enzyme.shallow(<VisualizationToggle {...props} />);

        const toggle = wrapper.find(Toggle);

        expect(toggle).toBeDefined();

        const expectedProps = visualizationTogglePropsToToggleProps(props);
        expect(toggle.props()).toEqual(expectedProps);
    });

    test('verify onClick being called when toggle clicked', () => {
        const onClickMock = Mock.ofInstance(event => {});
        const clickEventStub = {};
        onClickMock
            .setup(onClick => onClick(clickEventStub))
            .verifiable(Times.once());

        const props: IVisualizationToggleProps = new IVisualizationTogglePropsBuilder()
            .setLabel('my test label')
            .setClassName('my test class')
            .setDisabled(true)
            .setOnClickMock(onClickMock)
            .build();

        const wrapper = Enzyme.shallow(<VisualizationToggle {...props} />);

        const toggle = wrapper.find(Toggle).simulate('click', clickEventStub);

        onClickMock.verifyAll();
    });

    function visualizationTogglePropsToToggleProps(props: IVisualizationToggleProps): IToggleProps {
        const result: IToggleProps = {
            checked: props.checked,
            onClick: props.onClick,
            disabled: props.disabled,
            label: props.label,
            className: props.className,
            onText: 'On',
            offText: 'Off',
            ariaLabel: props.visualizationName,
            componentRef: props.componentRef,
            onFocus: props.onFocus,
            onBlur: props.onBlur,
        };

        return result;
    }
});

class IVisualizationTogglePropsBuilder {
    private checked: boolean = false;
    private onClickMock: IMock<(event) => void> = Mock.ofInstance(event => {});
    private disabled: boolean;
    private label: string;
    private className: string;
    private visualizationName: string = 'visualizationName';
    private componentRefMock: IMock<(component: IToggle) => void> = Mock.ofInstance(component => {});
    private onBlurMock: IMock<(event) => void> = Mock.ofInstance(event => {});
    private onFocusMock: IMock<(event) => void> = Mock.ofInstance(event => {});

    public setClassName(className: string): IVisualizationTogglePropsBuilder {
        this.className = className;
        return this;
    }

    public setLabel(label: string): IVisualizationTogglePropsBuilder {
        this.label = label;
        return this;
    }

    public setDisabled(isDisabled: boolean): IVisualizationTogglePropsBuilder {
        this.disabled = isDisabled;
        return this;
    }

    public setOnClickMock(onClickMock: IMock<(event) => void>): IVisualizationTogglePropsBuilder {
        this.onClickMock = onClickMock;
        return this;
    }

    public build(): IVisualizationToggleProps {
        const props: IVisualizationToggleProps = {
            onText: 'On',
            offText: 'Off',
            checked: this.checked,
            onClick: this.onClickMock.object,
            visualizationName: this.visualizationName,
            componentRef: this.componentRefMock.object,
            onFocus: this.onFocusMock.object,
            onBlur: this.onBlurMock.object,
        };

        if (this.disabled != null) {
            props.disabled = this.disabled;
        }

        if (this.label != null) {
            props.label = this.label;
        }

        if (this.className != null) {
            props.className = this.className;
        }

        return props;
    }
}
