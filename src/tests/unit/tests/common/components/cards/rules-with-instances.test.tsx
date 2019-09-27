// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import { FixInstructionProcessor } from 'injected/fix-instruction-processor';
import * as React from 'react';
import { IMock, Mock } from 'typemoq';

import { NamedFC, ReactFCWithDisplayName } from '../../../../../../common/react/named-fc';
import { CollapsibleComponentCardsProps } from '../../../../../../DetailsView/components/cards/collapsible-component-cards';
import { RulesWithInstances, RulesWithInstancesDeps } from '../../../../../../DetailsView/components/cards/rules-with-instances';
import { exampleUnifiedRuleResult } from './sample-view-model-data';

describe('RulesWithInstances', () => {
    let fixInstructionProcessorMock: IMock<FixInstructionProcessor>;

    beforeEach(() => {
        fixInstructionProcessorMock = Mock.ofType(FixInstructionProcessor);
    });

    it('renders', () => {
        const rules = [exampleUnifiedRuleResult];
        const CollapsibleControlStub = getCollapsibleControlStub();
        const depsStub = {
            collapsibleControl: (props: CollapsibleComponentCardsProps) => <CollapsibleControlStub {...props} />,
        } as RulesWithInstancesDeps;

        const wrapped = shallow(
            <RulesWithInstances
                deps={depsStub}
                fixInstructionProcessor={fixInstructionProcessorMock.object}
                outcomeType={'pass'}
                rules={rules}
            />,
        );

        expect(wrapped.getElement()).toMatchSnapshot();
    });

    function getCollapsibleControlStub(): ReactFCWithDisplayName<CollapsibleComponentCardsProps> {
        return NamedFC<CollapsibleComponentCardsProps>('CollapsibleControlStub', _ => null);
    }
});
