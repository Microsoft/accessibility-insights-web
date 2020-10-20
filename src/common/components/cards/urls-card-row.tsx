// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NewTabLink } from 'common/components/new-tab-link';
import * as React from 'react';

import { CardRowProps } from 'common/configs/unified-result-property-configurations';
import { NamedFC } from 'common/react/named-fc';
import { SimpleCardRow } from './simple-card-row';

export interface UrlsCardRowProps extends CardRowProps {
    propertyData: string[];
}

export const UrlsCardRow = NamedFC<UrlsCardRowProps>('UrlsCardRow', ({ deps, ...props }) => {
    const renderUrlContent = () => {
        return (
            <div>
                {props.propertyData.map((url, index) => (
                    <div key={`urls-${index}`}>
                        <NewTabLink href={url}>{url}</NewTabLink>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <SimpleCardRow
            label="URL"
            content={renderUrlContent()}
            rowKey={`urls-row-${props.index}`}
        />
    );
});
