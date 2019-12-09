// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';

import * as styles from './device-connect-header.scss';
import { ElectronLink } from './electron-link';

export const DeviceConnectHeader = NamedFC('DeviceConnectHeader', () => {
    return (
        <header className={styles.deviceConnectHeader}>
            <h2>Connect to your android device</h2>
            <ElectronLink href="https://go.microsoft.com/fwlink/?linkid=2101252">
                How do I connect to my device?
            </ElectronLink>
        </header>
    );
});
