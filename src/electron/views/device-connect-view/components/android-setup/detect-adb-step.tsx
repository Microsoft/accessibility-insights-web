// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import { AndroidSetupSpinnerStep } from 'electron/views/device-connect-view/components/android-setup/android-setup-spinner-step';
import * as React from 'react';
import { CommonAndroidSetupStepProps } from './android-setup-types';

export const DetectAdbStep = NamedFC<CommonAndroidSetupStepProps>(
    'DetectAdbStep',
    (props: CommonAndroidSetupStepProps) => {
        return (
            <AndroidSetupSpinnerStep
                deps={props.deps}
                spinnerLabel="Loading..."
                disableCancel={true}
            />
        );
    },
);
