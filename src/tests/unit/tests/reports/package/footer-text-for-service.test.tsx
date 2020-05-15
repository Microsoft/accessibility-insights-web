// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ToolData, ScanMetadata } from 'common/types/store-data/unified-data-interface';
import { shallow } from 'enzyme';
import * as React from 'react';
import { FooterTextForService } from 'reports/package/footer-text-for-service';

describe('FooterTextForService', () => {
    it('renders', () => {
        const toolData: ToolData = {
            scanEngineProperties: {
                name: 'engine-name',
                version: 'engine-version',
            },
            applicationProperties: {
                name: 'app-name',
                version: 'app-version',
                environmentName: 'environmentName',
            },
        };
        const scanMetadata = {
            toolData,
        } as ScanMetadata;


        const footerWrapper = shallow(<FooterTextForService  {...{ scanMetadata }} />);
        expect(footerWrapper.getElement()).toMatchSnapshot('footer');
    });
});
