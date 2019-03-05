// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { IAssessmentsProvider } from '../../../assessments/types/iassessments-provider';
import { NamedSFC } from '../../../common/react/named-sfc';
import { ManualTestStatus, ManualTestStatusData } from '../../../common/types/manual-test-status';
import { BaseLeftNav, BaseLeftNavLink } from '../base-left-nav';
import { LeftNavIndexIcon, LeftNavStatusIcon } from './left-nav-icon';
import { AssessmentLinkBuilderDeps, LeftNavLinkBuilder, OverviewLinkBuilderDeps } from './left-nav-link-builder';
import { NavLinkHandler } from './nav-link-handler';

export type AssessmentLeftNavDeps = {
    leftNavLinkBuilder: LeftNavLinkBuilder;
    navLinkHandler: NavLinkHandler;
} & OverviewLinkBuilderDeps &
    AssessmentLinkBuilderDeps;

export type AssessmentLeftNavProps = {
    deps: AssessmentLeftNavDeps;
    selectedKey: string;
    assessmentsProvider: IAssessmentsProvider;
    assessmentsData: IDictionaryStringTo<ManualTestStatusData>;
};

export type AssessmentLeftNavLink = {
    status: ManualTestStatus;
} & BaseLeftNavLink;

export const AssessmentLeftNav = NamedSFC<AssessmentLeftNavProps>('AssessmentLeftNav', props => {
    const { deps, selectedKey, assessmentsProvider, assessmentsData } = props;

    const { navLinkHandler, leftNavLinkBuilder } = deps;

    const renderAssessmentIcon = (link: AssessmentLeftNavLink) => {
        if (link.status === ManualTestStatus.UNKNOWN) {
            return <LeftNavIndexIcon item={link} />;
        }

        return <LeftNavStatusIcon item={link} />;
    };

    let links = [];
    links.push(leftNavLinkBuilder.buildOverviewLink(deps, navLinkHandler.onOverviewClick, assessmentsProvider, assessmentsData, 0));
    links = links.concat(
        leftNavLinkBuilder.buildAssessmentTestLinks(deps, navLinkHandler.onAssessmentTestClick, assessmentsProvider, assessmentsData, 1),
    );

    return <BaseLeftNav renderIcon={renderAssessmentIcon} selectedKey={selectedKey} links={links} />;
});
