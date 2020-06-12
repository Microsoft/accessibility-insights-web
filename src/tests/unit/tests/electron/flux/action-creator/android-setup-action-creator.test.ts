// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Action } from 'common/flux/action';
import { AndroidSetupActionCreator } from 'electron/flux/action-creator/android-setup-action-creator';
import { AndroidSetupActions } from 'electron/flux/action/android-setup-actions';
import { IMock, Mock, Times } from 'typemoq';

describe(AndroidSetupActionCreator, () => {
    let androidSetupActionsMock: IMock<AndroidSetupActions>;
    let testSubject: AndroidSetupActionCreator;

    beforeEach(() => {
        androidSetupActionsMock = Mock.ofType<AndroidSetupActions>();
        testSubject = new AndroidSetupActionCreator(androidSetupActionsMock.object);
    });

    it('invokes cancel action on cancel', () => {
        const actionMock = Mock.ofType<Action<void>>();
        androidSetupActionsMock.setup(actions => actions.cancel).returns(() => actionMock.object);
        actionMock.setup(s => s.invoke()).verifiable(Times.once());

        testSubject.cancel();
        actionMock.verifyAll();
    });

    it('invokes next action on rescan', () => {
        const actionMock = Mock.ofType<Action<void>>();
        androidSetupActionsMock.setup(actions => actions.next).returns(() => actionMock.object);
        actionMock.setup(s => s.invoke()).verifiable(Times.once());

        testSubject.next();
        actionMock.verifyAll();
    });

    it('invokes rescan action on rescan', () => {
        const actionMock = Mock.ofType<Action<void>>();
        androidSetupActionsMock.setup(actions => actions.rescan).returns(() => actionMock.object);
        actionMock.setup(s => s.invoke()).verifiable(Times.once());

        testSubject.rescan();
        actionMock.verifyAll();
    });

    it('invokes setSelectedDevice action on setSelectedDevice', () => {
        const actionMock = Mock.ofType<Action<string>>();
        androidSetupActionsMock
            .setup(actions => actions.setSelectedDevice)
            .returns(() => actionMock.object);
        actionMock.setup(s => s.invoke('new-device-id')).verifiable(Times.once());

        testSubject.setSelectedDevice('new-device-id');
        actionMock.verifyAll();
    });

    it('invokes saveAdbPath action on saveAdbPath', () => {
        const actionMock = Mock.ofType<Action<string>>();
        androidSetupActionsMock
            .setup(actions => actions.saveAdbPath)
            .returns(() => actionMock.object);
        actionMock.setup(s => s.invoke('/new/adb/path')).verifiable(Times.once());

        testSubject.saveAdbPath('/new/adb/path');
        actionMock.verifyAll();
    });
});
