// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { mount, ReactWrapper, shallow } from 'enzyme';
import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import * as React from 'react';
import { It, Mock, Times } from 'typemoq';

import { FeatureFlags } from '../../../../../../common/feature-flags';
import { TelemetryEventSource } from '../../../../../../common/telemetry-events';
import { DetailsViewPivotType } from '../../../../../../common/types/details-view-pivot-type';
import { VisualizationType } from '../../../../../../common/types/visualization-type';
import { PopupActionMessageCreator } from '../../../../../../popup/scripts/actions/popup-action-message-creator';
import { HeaderContextualMenu, HeaderContextualMenuProps } from '../../../../../../popup/scripts/components/header-contextual-menu';
import { LaunchPanelHeader } from '../../../../../../popup/scripts/components/launch-panel-header';
import { LaunchPanelHeaderClickHandler } from '../../../../../../popup/scripts/handlers/launch-panel-header-click-handler';
import { EventStubFactory } from '../../../../common/event-stub-factory';

describe('HeaderContextualMenu', () => {
    describe('render', () => {
        it('with newAssessmentExperience on', () => {
            const props: HeaderContextualMenuProps = {
                deps: {
                    popupActionMessageCreator: null,
                    launchPanelHeaderClickHandler: null,
                },
                header: null,
                popupWindow: null,
                featureFlags: {
                    [FeatureFlags.newAssessmentExperience]: true,
                },
            };
            const wrapped = shallow(<HeaderContextualMenu {...props} />);

            expect(wrapped.getElement()).toMatchSnapshot();
        });

        it('with newAssessmentExperience off', () => {
            const props: HeaderContextualMenuProps = {
                deps: {
                    popupActionMessageCreator: null,
                    launchPanelHeaderClickHandler: null,
                },
                header: null,
                popupWindow: null,
                featureFlags: {
                    [FeatureFlags.newAssessmentExperience]: false,
                },
            };
            const wrapped = shallow(<HeaderContextualMenu {...props} />);

            expect(wrapped.getElement()).toMatchSnapshot();
        });
    });

    describe('user interaction', () => {
        let testObject: ReactWrapper;
        let props: HeaderContextualMenuProps;

        const eventStubFactory = new EventStubFactory();
        const event = eventStubFactory.createMouseClickEvent() as any;

        const popupActionMessageCreatorMock = Mock.ofType<PopupActionMessageCreator>();
        const launchPanelHeaderClickHandlerMock = Mock.ofType<LaunchPanelHeaderClickHandler>();

        const headerMock = Mock.ofType<LaunchPanelHeader>();
        const popupWindowMock = Mock.ofType<Window>();

        beforeEach(() => {
            popupActionMessageCreatorMock.reset();
            launchPanelHeaderClickHandlerMock.reset();

            props = {
                deps: {
                    popupActionMessageCreator: popupActionMessageCreatorMock.object,
                    launchPanelHeaderClickHandler: launchPanelHeaderClickHandlerMock.object,
                },
                featureFlags: {
                    [FeatureFlags.newAssessmentExperience]: true,
                },
                header: headerMock.object,
                popupWindow: popupWindowMock.object,
            };

            testObject = mount(<HeaderContextualMenu {...props} />);
        });

        it('handle fast-pass', () => {
            popupActionMessageCreatorMock
                .setup(creator =>
                    creator.openDetailsView(
                        It.isObjectWith(event),
                        VisualizationType.Issues,
                        TelemetryEventSource.HamburgerMenu,
                        DetailsViewPivotType.fastPass,
                    ),
                )
                .verifiable(Times.once());

            const item = testObject.find('button[name="FastPass"]');

            item.simulate('click', event);

            popupActionMessageCreatorMock.verifyAll();
        });

        it('handles full-assessment', () => {
            props = {
                deps: {
                    popupActionMessageCreator: popupActionMessageCreatorMock.object,
                    launchPanelHeaderClickHandler: launchPanelHeaderClickHandlerMock.object,
                },
                featureFlags: {
                    [FeatureFlags.newAssessmentExperience]: false,
                },
                header: headerMock.object,
                popupWindow: popupWindowMock.object,
            };

            testObject = mount(<HeaderContextualMenu {...props} />);

            popupActionMessageCreatorMock
                .setup(creator =>
                    creator.openDetailsView(
                        It.isObjectWith(event),
                        VisualizationType.Issues,
                        TelemetryEventSource.HamburgerMenu,
                        DetailsViewPivotType.allTest,
                    ),
                )
                .verifiable(Times.once());

            const item = testObject.find('button[name="Full Assessment"]');

            item.simulate('click', event);

            popupActionMessageCreatorMock.verifyAll();
        });

        it('handles assessment', () => {
            popupActionMessageCreatorMock
                .setup(creator =>
                    creator.openDetailsView(
                        It.isObjectWith(event),
                        null,
                        TelemetryEventSource.HamburgerMenu,
                        DetailsViewPivotType.assessment,
                    ),
                )
                .verifiable(Times.once());

            const item = testObject.find('button[name="Assessment"]');

            item.simulate('click', event);

            popupActionMessageCreatorMock.verifyAll();
        });

        it('handles ad-hoc-tools', () => {
            launchPanelHeaderClickHandlerMock.setup(handler => handler.openAdhocToolsPanel(headerMock.object));

            const item = testObject.find('button[name="Ad hoc tools"]');

            item.simulate('click');

            launchPanelHeaderClickHandlerMock.verifyAll();
        });

        it('handles ad-hoc-tools', () => {
            popupActionMessageCreatorMock
                .setup(creator => creator.openShortcutConfigureTab(It.isObjectWith(event)))
                .verifiable(Times.once());

            const item = testObject.find('button[name="Keyboard shortcuts"]');

            item.simulate('click', event);

            popupActionMessageCreatorMock.verifyAll();
        });

        it('handles ad-hoc-tools', () => {
            launchPanelHeaderClickHandlerMock
                .setup(handler =>
                    handler.onClickLink(
                        popupWindowMock.object,
                        It.isObjectWith(event),
                        It.isObjectWith({
                            key: 'help',
                            iconProps: {
                                iconName: 'Unknown',
                            },
                            data: 'https://go.microsoft.com/fwlink/?linkid=2077937',
                            name: 'Help',
                        }),
                    ),
                )
                .verifiable(Times.once());

            const item = testObject.find('button[name="Help"]');

            item.simulate('click', event);

            launchPanelHeaderClickHandlerMock.verifyAll();
        });

        it('handle dismiss of the contextual menu', () => {
            launchPanelHeaderClickHandlerMock
                .setup(handler => handler.onDismissFeedbackMenu(props.header, It.isObjectWith(event)))
                .verifiable(Times.once());

            const contextualMenu = testObject.find(ContextualMenu);
            expect(contextualMenu.length).toBe(1);

            contextualMenu.prop('onDismiss')(event);

            launchPanelHeaderClickHandlerMock.verifyAll();
        });
    });
});
