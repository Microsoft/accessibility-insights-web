// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import * as React from 'react';

import { CardsView, CardsViewDeps, CardsViewProps } from '../../../../../DetailsView/components/cards-view';
import { exampleUnifiedStatusResults } from './cards/sample-view-model-data';

describe('CardsView', () => {
    it('should return cards view', () => {
        const props: CardsViewProps = {
            deps: {} as CardsViewDeps,
            ruleResultsByStatus: exampleUnifiedStatusResults,
        };
        const actual = shallow(<CardsView {...props} />);
        expect(actual.debug()).toMatchSnapshot();
    });
});
