// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as React from 'react';
import { TestConfig } from '../../../../types/test-config';

export const automatedChecksTestConfig: TestConfig = {
    key: 'automated-checks',
    title: 'Automated checks',
    description: (
        <>
            Automated checks can detect some common accessibility problems such as missing or
            invalid properties. But most accessibility problems can only be discovered through
            manual testing.
        </>
    ),
};

export const needsReviewTestConfig: TestConfig = {
    key: 'needs-review',
    title: 'Needs review',
    description: (
        <>
            Sometimes automated checks identify <i>possible</i> accessibility problems that need to
            be reviewed and verified by a human.
        </>
    ),
};
