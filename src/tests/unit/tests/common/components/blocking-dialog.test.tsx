// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import { Dialog, IDialogProps } from 'office-ui-fabric-react/lib/Dialog';
import * as React from 'react';

import { BlockingDialog } from '../../../../../common/components/blocking-dialog';

describe('BlockingDialog', () => {
    it('sets the properties necessary to emulate being blocking', () => {
        const wrapper = shallow(<BlockingDialog />);
        const dialogProps = wrapper.find(Dialog).props();

        expect(dialogProps.dialogContentProps.showCloseButton).toBeFalsy();
        expect(dialogProps.modalProps.onDismiss).toBeUndefined();
        expect(dialogProps.onDismiss).toBeUndefined();
        expect(dialogProps.modalProps.isBlocking).toBeFalsy();
    });

    it('passes through other props to the underlying dialog as-is', () => {
        const propsThatBlockingDialogShouldntModify: IDialogProps = {
            title: 'test title',
            dialogContentProps: {
                subTextId: 'test subTextId',
            },
            modalProps: {
                containerClassName: 'test containerClassName',
            },
        };

        const wrapper = shallow(<BlockingDialog {...propsThatBlockingDialogShouldntModify} />);
        const dialogProps = wrapper.find(Dialog).props();

        expect(dialogProps).toMatchObject(propsThatBlockingDialogShouldntModify);
    });
});
