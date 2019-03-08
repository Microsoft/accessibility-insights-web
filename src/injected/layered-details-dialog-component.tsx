// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { getRTL } from '@uifabric/utilities';
import { LayerHost } from 'office-ui-fabric-react';
import * as React from 'react';

import { FeatureFlags } from '../common/feature-flags';
import { IBaseStore } from '../common/istore';
import { DevToolActionMessageCreator } from '../common/message-creators/dev-tool-action-message-creator';
import { DevToolState } from '../common/types/store-data/idev-tool-state';
import { UserConfigurationStoreData } from '../common/types/store-data/user-configuration-store';
import { DetailsDialog, DetailsDialogDeps } from './components/details-dialog';
import { DetailsDialogHandler } from './details-dialog-handler';
import { DecoratedAxeNodeResult } from './scanner-utils';

export interface LayeredDetailsDialogDeps extends DetailsDialogDeps {
    getRTL: typeof getRTL;
}

export interface LayeredDetailsDialogProps {
    deps: LayeredDetailsDialogDeps;
    userConfigStore: IBaseStore<UserConfigurationStoreData>;
    elementSelector: string;
    failedRules: IDictionaryStringTo<DecoratedAxeNodeResult>;
    target: string[];
    dialogHandler: DetailsDialogHandler;
    devToolStore: IBaseStore<DevToolState>;
    devToolActionMessageCreator: DevToolActionMessageCreator;
    featureFlagStoreData: IDictionaryStringTo<boolean>;
    devToolsShortcut: string;
}

export class LayeredDetailsDialogComponent extends React.Component<LayeredDetailsDialogProps> {
    public render(): JSX.Element {
        const detailsDialog = <DetailsDialog {...this.props} />;

        if (this.isShadowDOMDialogEnabled()) {
            return detailsDialog;
        }
        return (
            <LayerHost id="insights-dialog-layer-host" dir={this.props.deps.getRTL() ? 'rtl' : 'ltr'}>
                {detailsDialog}
            </LayerHost>
        );
    }

    private isShadowDOMDialogEnabled(): boolean {
        return this.props.featureFlagStoreData[FeatureFlags.shadowDialog];
    }
}
