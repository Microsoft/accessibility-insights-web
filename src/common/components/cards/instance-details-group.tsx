// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { GetGuidanceTagsFromGuidanceLinks } from 'common/get-guidance-tags-from-guidance-links';
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';

import { getPropertyConfiguration } from '../../../common/configs/unified-result-property-configurations';
import { TargetAppData, UnifiedRule, UnifiedRuleResult } from '../../../common/types/store-data/unified-data-interface';
import { UserConfigurationStoreData } from '../../types/store-data/user-configuration-store';
import { InstanceDetails, InstanceDetailsDeps } from './instance-details';
import { instanceDetailsList } from './instance-details-group.scss';

export type InstanceDetailsGroupDeps = {
    getGuidanceTagsFromGuidanceLinks: GetGuidanceTagsFromGuidanceLinks;
} & InstanceDetailsDeps;

export type InstanceDetailsGroupProps = {
    deps: InstanceDetailsGroupDeps;
    rule: UnifiedRuleResult;
    userConfigurationStoreData: UserConfigurationStoreData;
    targetAppInfo: TargetAppData;
};

export const InstanceDetailsGroup = NamedFC<InstanceDetailsGroupProps>('InstanceDetailsGroup', props => {
    const { deps, rule, userConfigurationStoreData, targetAppInfo } = props;
    const { nodes } = rule;
    const unifiedRule: UnifiedRule = {
        id: rule.id,
        description: rule.description,
        url: rule.url,
        guidance: rule.guidance,
    };

    return (
        <ul className={instanceDetailsList} aria-label="failed instances with path, snippet and how to fix information">
            {nodes.map((node, index) => (
                <li key={`instance-details-${index}`}>
                    <InstanceDetails
                        {...{ index }}
                        deps={deps}
                        result={node}
                        getPropertyConfigById={getPropertyConfiguration}
                        userConfigurationStoreData={userConfigurationStoreData}
                        rule={unifiedRule}
                        targetAppInfo={targetAppInfo}
                    />
                </li>
            ))}
        </ul>
    );
});
