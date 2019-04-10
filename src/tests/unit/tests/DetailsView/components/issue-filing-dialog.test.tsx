// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';
import { Mock, MockBehavior, Times, IMock } from 'typemoq';

import { BugFilingService } from '../../../../../bug-filing/types/bug-filing-service';
import { CreateIssueDetailsTextData } from '../../../../../common/types/create-issue-details-text-data';
import { ActionAndCancelButtonsComponent } from '../../../../../DetailsView/components/action-and-cancel-buttons-component';
import {
    IssueFilingDialog,
    IssueFilingDialogDeps,
    IssueFilingDialogProps,
} from '../../../../../DetailsView/components/issue-filing-dialog';
import { EventStubFactory, EventStub } from '../../../common/event-stub-factory';

describe('IssueFilingDialog', () => {
    let eventStub: EventStub;
    let isSettingsValidMock: IMock<Function>;
    let createBugFilingUrlMock: IMock<Function>;
    let onCloseMock: IMock<(ev) => void>;
    let telemetryCallbackMock: IMock<(ev) => void>;
    let selectedBugDataStub: CreateIssueDetailsTextData;
    let selectedServiceData;
    let deps: IssueFilingDialogDeps;
    let bugFilingServiceStub: BugFilingService;
    let props: IssueFilingDialogProps;

    beforeEach(() => {
        eventStub = new EventStubFactory().createMouseClickEvent();
        isSettingsValidMock = Mock.ofInstance(data => null, MockBehavior.Strict);
        onCloseMock = Mock.ofInstance(() => null, MockBehavior.Strict);
        createBugFilingUrlMock = Mock.ofInstance((serviceData, bugData) => null, MockBehavior.Strict);
        telemetryCallbackMock = Mock.ofInstance(data => null, MockBehavior.Strict);
        selectedBugDataStub = {
            pageTitle: 'some pageTitle',
        } as CreateIssueDetailsTextData;
        selectedServiceData = {
            someServiceData: null,
        };
        deps = {
            bugFilingServiceProvider: null,
        };
        bugFilingServiceStub = {
            isSettingsValid: isSettingsValidMock.object,
            createBugFilingUrl: createBugFilingUrlMock.object,
        } as BugFilingService;
        props = {
            deps,
            isOpen: true,
            onClose: onCloseMock.object,
            selectedBugFilingService: bugFilingServiceStub,
            selectedBugData: selectedBugDataStub,
            selectedBugFilingServiceData: selectedServiceData,
            bugFileTelemetryCallback: telemetryCallbackMock.object,
        };

        isSettingsValidMock.setup(isSettingsValid => isSettingsValid(selectedServiceData)).verifiable();
        createBugFilingUrlMock.setup(createBugFilingUrl => createBugFilingUrl(selectedServiceData, selectedBugDataStub)).verifiable();
    });

    it('render open', () => {
        const testSubject = shallow(<IssueFilingDialog {...props} />);

        isSettingsValidMock.verifyAll();
        createBugFilingUrlMock.verifyAll();
        expect(testSubject.getElement()).toMatchSnapshot();
    });

    it('render closed', () => {
        props.isOpen = false;
        const testSubject = shallow(<IssueFilingDialog {...props} />);

        isSettingsValidMock.verifyAll();
        createBugFilingUrlMock.verifyAll();
        expect(testSubject.getElement()).toMatchSnapshot();
    });

    it('render: validate correct callbacks (file issue on click and cancel/dismiss)', () => {
        isSettingsValidMock.setup(isSettingsValid => isSettingsValid(selectedServiceData)).verifiable();
        createBugFilingUrlMock.setup(createBugFilingUrl => createBugFilingUrl(selectedServiceData, selectedBugDataStub)).verifiable();
        telemetryCallbackMock.setup(telemetryCallback => telemetryCallback(eventStub)).verifiable();
        onCloseMock.setup(onClose => onClose(null)).verifiable();

        const testSubject = shallow(<IssueFilingDialog {...props} />);
        const actionCancelButtons = testSubject.find(ActionAndCancelButtonsComponent);
        actionCancelButtons.prop('cancelButtonOnClick')(null);
        actionCancelButtons.prop('primaryButtonOnClick')(eventStub);

        isSettingsValidMock.verifyAll();
        createBugFilingUrlMock.verifyAll();
        telemetryCallbackMock.verifyAll();
        onCloseMock.verifyAll();
    });
});
