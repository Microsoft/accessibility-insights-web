// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';

import { TargetAppData } from '../../../common/types/store-data/unified-data-interface';
import { CardRuleResult } from '../../types/store-data/card-view-model';
import { UserConfigurationStoreData } from '../../types/store-data/user-configuration-store';
import {
    InstanceDetailsGroup,
    InstanceDetailsGroupDeps,
} from './instance-details-group';
import { RuleResources, RuleResourcesDeps } from './rule-resources';

export type RuleContentDeps = InstanceDetailsGroupDeps & RuleResourcesDeps;

export type RuleContentProps = {
    deps: RuleContentDeps;
    rule: CardRuleResult;
    userConfigurationStoreData: UserConfigurationStoreData;
    targetAppInfo: TargetAppData;
};

export const RuleContent = NamedFC<RuleContentProps>('RuleContent', props => {
    return (
        <>
            <RuleResources {...props} />
            <InstanceDetailsGroup {...props} />
        </>
    );
});
