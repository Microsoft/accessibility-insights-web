// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ScanActions } from 'electron/flux/action/scan-actions';
import { ScanStore } from 'electron/flux/store/scan-store';
import { ScanStatus } from 'electron/flux/types/scan-status';
import { ScanStoreData } from 'electron/flux/types/scan-store-data';
import {
    createStoreWithNullParams,
    StoreTester,
} from 'tests/unit/common/store-tester';

describe('ScanStore', () => {
    let initialState: ScanStoreData;

    beforeEach(() => {
        initialState = createStoreWithNullParams(ScanStore).getDefaultState();
    });

    describe('constructor', () => {
        it('has no side effects', () => {
            const testObject = createStoreWithNullParams(ScanStore);
            expect(testObject).toBeDefined();
        });
    });

    it('returns default state', () => {
        const testObject = createStoreWithNullParams(ScanStore);

        expect(testObject.getState()).toMatchSnapshot();
    });

    describe('on scan started', () => {
        describe('updates to scanning', () => {
            const initialStatuses = [
                ScanStatus[ScanStatus.Default],
                ScanStatus[ScanStatus.Completed],
                ScanStatus[ScanStatus.Failed],
            ];

            it.each(initialStatuses)(
                'from initial state <%s>',
                initialStatus => {
                    initialState.status = ScanStatus[initialStatus];

                    const expectedState: ScanStoreData = {
                        status: ScanStatus.Scanning,
                    };

                    createStoreTesterForScanActions(
                        'scanStarted',
                    ).testListenerToBeCalledOnce(initialState, expectedState);
                },
            );
        });

        it('does not update if already scanning', () => {
            initialState.status = ScanStatus.Scanning;

            const expectedState: ScanStoreData = { ...initialState };

            createStoreTesterForScanActions(
                'scanStarted',
            ).testListenerToNeverBeCalled(initialState, expectedState);
        });
    });

    describe('on scan completed', () => {
        it('updates to completed', () => {
            initialState.status = ScanStatus.Scanning;

            const expectedState: ScanStoreData = {
                status: ScanStatus.Completed,
            };

            createStoreTesterForScanActions(
                'scanCompleted',
            ).testListenerToBeCalledOnce(initialState, expectedState);
        });

        describe('does not update if previous state is not scanning', () => {
            const initialStatuses = [
                ScanStatus[ScanStatus.Default],
                ScanStatus[ScanStatus.Failed],
                ScanStatus[ScanStatus.Completed],
            ];

            it.each(initialStatuses)(
                'with initial status <%s>',
                initialStatus => {
                    initialState.status = ScanStatus[initialStatus];

                    const expectedState: ScanStoreData = { ...initialState };

                    createStoreTesterForScanActions(
                        'scanCompleted',
                    ).testListenerToNeverBeCalled(initialState, expectedState);
                },
            );
        });
    });

    describe('on scan failed', () => {
        it('updates to failed', () => {
            initialState.status = ScanStatus.Scanning;

            const expectedState: ScanStoreData = {
                status: ScanStatus.Failed,
            };

            createStoreTesterForScanActions(
                'scanFailed',
            ).testListenerToBeCalledOnce(initialState, expectedState);
        });

        describe('does not update if previous state is not scanning', () => {
            const initialStatuses = [
                ScanStatus[ScanStatus.Default],
                ScanStatus[ScanStatus.Failed],
                ScanStatus[ScanStatus.Completed],
            ];

            it.each(initialStatuses)(
                'with initial status <%s>',
                initialStatus => {
                    initialState.status = ScanStatus[initialStatus];

                    const expectedState: ScanStoreData = { ...initialState };

                    createStoreTesterForScanActions(
                        'scanFailed',
                    ).testListenerToNeverBeCalled(initialState, expectedState);
                },
            );
        });
    });

    function createStoreTesterForScanActions(
        actionName: keyof ScanActions,
    ): StoreTester<ScanStoreData, ScanActions> {
        const factory = (actions: ScanActions) => new ScanStore(actions);

        return new StoreTester(ScanActions, actionName, factory);
    }
});
