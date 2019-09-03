// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DeviceConnectState, UpdateStateCallback } from 'electron/device-connect-view/components/device-connect-body';
import { DeviceConnectPortEntry, DeviceConnectPortEntryProps } from 'electron/device-connect-view/components/device-connect-port-entry';
import { FetchScanResultsType } from 'electron/platform/android/fetch-scan-results';
import { ScanResults } from 'electron/platform/android/scan-results';
import { shallow } from 'enzyme';
import { Button } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import { EventStubFactory } from 'tests/unit/common/event-stub-factory';
import { IMock, Mock } from 'typemoq';

describe('DeviceConnectPortEntryTest', () => {
    const testPortNumber = 111;
    const eventStub = new EventStubFactory().createMouseClickEvent() as React.MouseEvent<Button>;

    let fetchScanResultsMock: IMock<FetchScanResultsType>;
    let updateStateCallbackMock: IMock<UpdateStateCallback>;

    beforeEach(() => {
        fetchScanResultsMock = Mock.ofType<FetchScanResultsType>();
        updateStateCallbackMock = Mock.ofType<UpdateStateCallback>();
    });

    describe('renders', () => {
        const needsValidationCases = [true, false];

        it.each(needsValidationCases)('with needsValidation = %s', needsValidation => {
            const props = {
                needsValidation,
            } as DeviceConnectPortEntryProps;

            const rendered = shallow(<DeviceConnectPortEntry {...props} />);

            expect(rendered.getElement()).toMatchSnapshot();
        });
    });

    test('onChange updates state', () => {
        const fetch: FetchScanResultsType = _ => Promise.reject({} as ScanResults);
        const props = SetupPropsMocks(fetch, DeviceConnectState.Default, undefined);
        const rendered = shallow(<DeviceConnectPortEntry {...props} />);

        expect(rendered.state()).toMatchSnapshot();

        const onChangeHandler = rendered.find('.port-number-field').prop('onChange') as (
            event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string,
        ) => void;

        onChangeHandler(null, testPortNumber.toString());

        updateStateCallbackMock.verifyAll();
        expect(rendered.state()).toMatchSnapshot();
    });

    test('validate click fetch succeeds', () => {
        const fetch: FetchScanResultsType = _ => Promise.resolve({ deviceName: 'dev', appIdentifier: 'app' } as ScanResults);
        const props = SetupPropsMocks(fetch, DeviceConnectState.Connected, 'dev - app');
        validatePortValidateClick(props);
    });

    test('validate click fetch fails', () => {
        const fetch: FetchScanResultsType = _ => Promise.reject({} as ScanResults);
        const props = SetupPropsMocks(fetch, DeviceConnectState.Error, undefined);
        validatePortValidateClick(props);
    });

    const SetupPropsMocks = (
        fetch: FetchScanResultsType,
        expectedState: DeviceConnectState,
        expectedDevice: string,
    ): DeviceConnectPortEntryProps => {
        fetchScanResultsMock = Mock.ofInstance(fetch);
        fetchScanResultsMock
            .setup(r => r(testPortNumber))
            .returns(fetch)
            .verifiable();

        updateStateCallbackMock.reset();
        updateStateCallbackMock.setup(r => r(expectedState, expectedDevice)).verifiable();

        return {
            fetchScanResults: fetchScanResultsMock.object,
            updateStateCallback: updateStateCallbackMock.object,
        } as DeviceConnectPortEntryProps;
    };

    const validatePortValidateClick = (props: DeviceConnectPortEntryProps) => {
        const rendered = shallow(<DeviceConnectPortEntry {...props} />);
        rendered.setState({ isValidateButtonDisabled: false, port: testPortNumber });
        const button = rendered.find('.button-validate-port');
        button.simulate('click', eventStub);

        fetchScanResultsMock.verifyAll();

        const validateAfterPromise = (): void => {
            expect(rendered.state()).toEqual({ isValidateButtonDisabled: false, port: testPortNumber });
            updateStateCallbackMock.verifyAll();
        };

        setImmediate(validateAfterPromise);
    };
});
