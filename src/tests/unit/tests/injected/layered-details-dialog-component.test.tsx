// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { getRTL } from '@uifabric/utilities';
import * as React from 'react';
import { IMock, Mock } from 'typemoq';

import { FeatureFlags } from '../../../../common/feature-flags';
import { LayeredDetailsDialogComponent, LayeredDetailsDialogProps } from '../../../../injected/layered-details-dialog-component';

describe(LayeredDetailsDialogComponent, () => {
    let featureFlagStoreData: IDictionaryStringTo<boolean>;
    let componentProps: LayeredDetailsDialogProps;
    let getRTLMock: IMock<typeof getRTL>;

    beforeEach(() => {
        featureFlagStoreData = {};
        getRTLMock = Mock.ofInstance(() => null);

        componentProps = createLayeredDetailsDialogProps();
    });

    it('render component when shadow dom is disabled', () => {
        expect(new LayeredDetailsDialogComponent(componentProps).render()).toMatchSnapshot();
    });

    test.each([true, false])('render component when shadow dom is enabled - isRTL - %o', isRTL => {
        featureFlagStoreData[FeatureFlags.shadowDialog] = true;

        getRTLMock.setup(g => g()).returns(() => isRTL);

        expect(new LayeredDetailsDialogComponent(componentProps).render()).toMatchSnapshot();
    });

    function createLayeredDetailsDialogProps(): LayeredDetailsDialogProps {
        return {
            featureFlagStoreData: featureFlagStoreData,
            deps: {
                getRTL: getRTLMock.object,
            },
            devToolActionMessageCreator: 'devToolActionMessageCreator' as any,
        } as LayeredDetailsDialogProps;
    }
});
