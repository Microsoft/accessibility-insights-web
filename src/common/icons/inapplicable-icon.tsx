// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { NamedSFC } from '../react/named-sfc';

export const InapplicableIcon = NamedSFC('InapplicableIcon', () => (
    <span className="check-container">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="8" fill="#737373" />
            <line x1="5.66064" y1="5.625" x2="10.2568" y2="10.2212" stroke="white" stroke-width="1.5" stroke-linecap="round" />
        </svg>
    </span>
));

export const InapplicableIconInverted = NamedSFC('InapplicableIconInverted', () => (
    <span className="check-container">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="8" fill="white" />
            <line x1="5.66064" y1="5.625" x2="10.2568" y2="10.2212" stroke="#737373" stroke-width="1.5" stroke-linecap="round" />
        </svg>
    </span>
));
