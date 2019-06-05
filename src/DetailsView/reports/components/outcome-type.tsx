// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';
import { InapplicableIcon } from '../../../common/icons/inapplicable-icon';
import { CheckIcon } from './../../../common/icons/check-icon';
import { CircleIcon } from './../../../common/icons/circle-icon';
import { CrossIcon } from './../../../common/icons/cross-icon';
import { InstanceOutcomeType } from './report-sections/outcome-summary-bar';
import { RequirementOutcomeType } from './requirement-outcome-type';

export type OutcomeType = RequirementOutcomeType | InstanceOutcomeType;

export interface OutcomeTypeSemantic {
    pastTense: string;
}

export const outcomeTypeSemantics: { [OT in OutcomeType]: OutcomeTypeSemantic } = {
    pass: { pastTense: 'Passed' },
    incomplete: { pastTense: 'Incomplete' },
    fail: { pastTense: 'Failed' },
    inapplicable: { pastTense: 'Not applicable' },
};

export const outcomeIconMap: { [OT in OutcomeType]: JSX.Element } = {
    pass: <CheckIcon />,
    incomplete: <CircleIcon />,
    fail: <CrossIcon />,
    inapplicable: <InapplicableIcon />,
};
