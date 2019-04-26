// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { EnvironmentInfo, EnvironmentInfoProvider } from '../../../../../common/environment-info-provider';
import { UserConfigMessageCreator } from '../../../../../common/message-creators/user-config-message-creator';
import { CreateIssueDetailsTextData } from '../../../../../common/types/create-issue-details-text-data';
import { IssueFilingServicePropertiesMap } from '../../../../../common/types/store-data/user-configuration-store';
import { ActionAndCancelButtonsComponent } from '../../../../../DetailsView/components/action-and-cancel-buttons-component';
import {
    IssueFilingDialog,
    IssueFilingDialogDeps,
    IssueFilingDialogProps,
} from '../../../../../DetailsView/components/issue-filing-dialog';
import { IssueFilingSettingsContainer } from '../../../../../issue-filing/components/issue-filing-settings-container';
import { IssueFilingServiceProvider } from '../../../../../issue-filing/issue-filing-service-provider';
import { IssueFilingService } from '../../../../../issue-filing/types/issue-filing-service';
import { EventStub, EventStubFactory } from '../../../common/event-stub-factory';

describe('IssueFilingDialog', () => {
    let eventStub: EventStub;
    let isSettingsValidMock: IMock<Function>;
    let createIssueFilingUrlMock: IMock<Function>;
    let getSettingsFromStoreDataMock: IMock<Function>;
    let onCloseMock: IMock<(ev) => void>;
    let telemetryCallbackMock: IMock<(ev) => void>;
    let selectedIssueDataStub: CreateIssueDetailsTextData;
    let selectedServiceData;
    let deps: IssueFilingDialogDeps;
    let issueFilingServiceStub: IssueFilingService;
    let props: IssueFilingDialogProps;
    let envInfoProviderMock: IMock<EnvironmentInfoProvider>;
    let envInfo: EnvironmentInfo;
    let serviceKey: string;
    let issueFilingServicePropertiesMapStub: IssueFilingServicePropertiesMap;
    let userConfigMessageCreatorMock: IMock<UserConfigMessageCreator>;
    let issueFilingServiceProviderMock: IMock<IssueFilingServiceProvider>;

    beforeEach(() => {
        serviceKey = 'gitHub';
        envInfo = {
            extensionVersion: '1.1.1',
            browserSpec: '1.2.3',
            axeCoreVersion: '2.1.1',
        };
        eventStub = new EventStubFactory().createMouseClickEvent();
        isSettingsValidMock = Mock.ofInstance(data => null, MockBehavior.Strict);
        onCloseMock = Mock.ofInstance(() => null, MockBehavior.Strict);
        createIssueFilingUrlMock = Mock.ofInstance((serviceData, issueData, info) => null, MockBehavior.Strict);
        getSettingsFromStoreDataMock = Mock.ofInstance(data => null, MockBehavior.Strict);
        telemetryCallbackMock = Mock.ofInstance(data => null, MockBehavior.Strict);
        envInfoProviderMock = Mock.ofType(EnvironmentInfoProvider);
        userConfigMessageCreatorMock = Mock.ofType(UserConfigMessageCreator);
        issueFilingServiceProviderMock = Mock.ofType(IssueFilingServiceProvider);

        envInfoProviderMock.setup(p => p.getEnvironmentInfo()).returns(() => envInfo);

        selectedIssueDataStub = {
            pageTitle: 'some pageTitle',
        } as CreateIssueDetailsTextData;
        selectedServiceData = {
            someServiceData: null,
        };
        issueFilingServicePropertiesMapStub = {
            [serviceKey]: selectedServiceData,
        };
        deps = {
            issueFilingServiceProvider: issueFilingServiceProviderMock.object,
            userConfigMessageCreator: userConfigMessageCreatorMock.object,
            environmentInfoProvider: envInfoProviderMock.object,
        } as IssueFilingDialogDeps;
        issueFilingServiceStub = {
            isSettingsValid: isSettingsValidMock.object,
            issueFilingUrlProvider: createIssueFilingUrlMock.object,
            getSettingsFromStoreData: getSettingsFromStoreDataMock.object,
            key: serviceKey,
        } as IssueFilingService;
        props = {
            deps,
            isOpen: true,
            onClose: onCloseMock.object,
            selectedIssueFilingService: issueFilingServiceStub,
            selectedIssueData: selectedIssueDataStub,
            fileIssueTelemetryCallback: telemetryCallbackMock.object,
            issueFilingServicePropertiesMap: issueFilingServicePropertiesMapStub,
        };

        getSettingsFromStoreDataMock
            .setup(mock => mock(It.isValue(issueFilingServicePropertiesMapStub)))
            .returns(() => selectedServiceData)
            .verifiable(Times.once());
        isSettingsValidMock
            .setup(isSettingsValid => isSettingsValid(selectedServiceData))
            .returns(() => true)
            .verifiable(Times.once());
        createIssueFilingUrlMock
            .setup(createIssueFilingUrl => createIssueFilingUrl(selectedServiceData, selectedIssueDataStub, envInfo))
            .verifiable(Times.once());
    });

    it.each([true, false])('render with isSettingsValid: %s', isSettingsValid => {
        isSettingsValidMock.reset();
        isSettingsValidMock.setup(isValid => isValid(selectedServiceData)).returns(() => isSettingsValid);

        createIssueFilingUrlMock
            .setup(createIssueFilingUrl => createIssueFilingUrl(selectedServiceData, selectedIssueDataStub, envInfo))
            .returns(() => 'test url');

        const testSubject = shallow(<IssueFilingDialog {...props} />);

        expect(testSubject.getElement()).toMatchSnapshot();
    });

    it('render: validate correct callbacks to ActionAndCancelButtonsComponent (file issue on click and cancel)', () => {
        telemetryCallbackMock.setup(telemetryCallback => telemetryCallback(eventStub)).verifiable(Times.never());
        onCloseMock.setup(onClose => onClose(null)).verifiable(Times.once());

        const testSubject = shallow(<IssueFilingDialog {...props} />);
        const actionCancelButtons = testSubject.find(ActionAndCancelButtonsComponent);
        actionCancelButtons.props().cancelButtonOnClick(null);

        isSettingsValidMock.verifyAll();
        createIssueFilingUrlMock.verifyAll();
        telemetryCallbackMock.verifyAll();
        onCloseMock.verifyAll();
    });

    it('render: validate correct callbacks to ActionAndCancelButtonsComponent (file issue on click and cancel)', () => {
        userConfigMessageCreatorMock.setup(ucmcm => ucmcm.saveIssueFilingSettings(serviceKey, selectedServiceData)).verifiable();
        telemetryCallbackMock.setup(telemetryCallback => telemetryCallback(eventStub)).verifiable(Times.once());
        onCloseMock.setup(onClose => onClose(eventStub)).verifiable(Times.once());

        const testSubject = shallow(<IssueFilingDialog {...props} />);
        const actionCancelButtons = testSubject.find(ActionAndCancelButtonsComponent);
        actionCancelButtons.props().primaryButtonOnClick(eventStub);

        isSettingsValidMock.verifyAll();
        createIssueFilingUrlMock.verifyAll();
        telemetryCallbackMock.verifyAll();
        userConfigMessageCreatorMock.verifyAll();
        onCloseMock.verifyAll();
    });

    it('render: validate callback (onPropertyUpdateCallback) sent to settings container when service settings are null', () => {
        const propertyStub = 'some_property';
        const propertValueStub = 'some_value';
        const differentServiceKey = 'some_different_key';

        const testSubject = shallow(<IssueFilingDialog {...props} />);
        const issueFilingSettingsContainer = testSubject.find(IssueFilingSettingsContainer);

        getSettingsFromStoreDataMock.setup(mock => mock(It.isValue(issueFilingServicePropertiesMapStub))).returns(() => null);
        issueFilingServicePropertiesMapStub[differentServiceKey] = { [propertyStub]: propertValueStub };
        getSettingsFromStoreDataMock
            .setup(mock => mock(It.isValue(issueFilingServicePropertiesMapStub)))
            .returns(() => issueFilingServicePropertiesMapStub[differentServiceKey]);
        isSettingsValidMock
            .setup(isSettingsValid => isSettingsValid(issueFilingServicePropertiesMapStub[differentServiceKey]))
            .returns(() => true);
        createIssueFilingUrlMock.setup(createIssueFilingUrl =>
            createIssueFilingUrl(issueFilingServicePropertiesMapStub[differentServiceKey], selectedIssueDataStub, envInfo),
        );

        issueFilingSettingsContainer.props().onPropertyUpdateCallback(differentServiceKey, propertyStub, propertValueStub);

        expect(testSubject.getElement()).toMatchSnapshot();
    });

    it('render: validate callback (onPropertyUpdateCallback) sent to settings container when service settings are not null', () => {
        const propertyStub = 'some_property';
        const propertValueStub = 'some_value';
        const testSubject = shallow(<IssueFilingDialog {...props} />);
        const issueFilingSettingsContainer = testSubject.find(IssueFilingSettingsContainer);

        issueFilingServicePropertiesMapStub[serviceKey][propertyStub] = propertValueStub;
        getSettingsFromStoreDataMock
            .setup(mock => mock(It.isValue(issueFilingServicePropertiesMapStub)))
            .returns(() => issueFilingServicePropertiesMapStub[serviceKey]);
        isSettingsValidMock.setup(isSettingsValid => isSettingsValid(issueFilingServicePropertiesMapStub[serviceKey])).returns(() => true);
        createIssueFilingUrlMock.setup(createIssueFilingUrl =>
            createIssueFilingUrl(issueFilingServicePropertiesMapStub[serviceKey], selectedIssueDataStub, envInfo),
        );

        issueFilingSettingsContainer.props().onPropertyUpdateCallback(serviceKey, propertyStub, propertValueStub);

        expect(testSubject.getElement()).toMatchSnapshot();
    });

    it('render: validate callback (onSelectedServiceChange) sent to settings container', () => {
        const differentServiceKey = 'different_service';
        const differentIsSettingsValidMock = Mock.ofInstance(data => null, MockBehavior.Strict);
        const differentCreateIssueFilingUrlMock = Mock.ofInstance((serviceData, issueData, info) => null, MockBehavior.Strict);
        const differentGetSettingsFromStoreDataMock = Mock.ofInstance(data => null);
        const differentServiceStub = {
            isSettingsValid: differentIsSettingsValidMock.object,
            issueFilingUrlProvider: differentCreateIssueFilingUrlMock.object,
            getSettingsFromStoreData: differentGetSettingsFromStoreDataMock.object,
            key: differentServiceKey,
        } as IssueFilingService;
        const differentServiceData = {
            differentProperty: 'different_property',
        };

        issueFilingServiceProviderMock.setup(mock => mock.forKey(differentServiceKey)).returns(() => differentServiceStub);
        differentGetSettingsFromStoreDataMock
            .setup(mock => mock(It.isValue(issueFilingServicePropertiesMapStub)))
            .returns(() => differentServiceData);
        differentIsSettingsValidMock.setup(isSettingsValid => isSettingsValid(differentServiceData)).returns(() => true);
        differentCreateIssueFilingUrlMock.setup(createIssueFilingUrl =>
            createIssueFilingUrl(differentServiceData, selectedIssueDataStub, envInfo),
        );

        const testSubject = shallow(<IssueFilingDialog {...props} />);
        const issueFilingSettingsContainer = testSubject.find(IssueFilingSettingsContainer);
        issueFilingSettingsContainer.props().onSelectedServiceChange(differentServiceKey);

        expect(testSubject.getElement()).toMatchSnapshot();
    });

    const scenarios = [
        ['dialog is open & props have changed', true, { issueFilingServicePropertiesMap: {} }],
        ['dialog is open & props have not changed', true, {}],
        ['dialog is not open & props have changed', false, { issueFilingServicePropertiesMap: {} }],
        ['dialog is not open & props have not changed', false, {}],
    ];

    it.each(scenarios)('componentDidUpdate %s', (_, isOpenVal, additionalProperties) => {
        const testSubject = shallow(<IssueFilingDialog {...props} />);
        const newProps = {
            ...props,
            isOpen: isOpenVal,
            ...additionalProperties,
        } as IssueFilingDialogProps;
        const differentServiceData = {
            differentProperty: 'different_property',
        };

        isSettingsValidMock.setup(isSettingsValid => isSettingsValid(differentServiceData)).returns(() => true);
        createIssueFilingUrlMock.setup(createIssueFilingUrl => createIssueFilingUrl(differentServiceData, selectedIssueDataStub, envInfo));
        getSettingsFromStoreDataMock
            .setup(mock => mock(It.isValue(newProps.issueFilingServicePropertiesMap)))
            .returns(() => differentServiceData);

        testSubject.setProps(newProps);
        expect(testSubject.getElement()).toMatchSnapshot();
    });
});
