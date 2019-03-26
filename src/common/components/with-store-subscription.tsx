// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { StoreActionMessageCreator } from '../message-creators/istore-action-message-creator';
import { IClientStoresHub } from '../stores/iclient-stores-hub';

export type WithStoreSubscriptionProps<T> = {
    deps: WithStoreSubscriptionDeps<T>;
    storeState?: T;
};

export type WithStoreSubscriptionDeps<T> = {
    storesHub: IClientStoresHub<T>;
    storeActionMessageCreator: StoreActionMessageCreator;
};

export function withStoreSubscription<P extends WithStoreSubscriptionProps<S>, S>(
    WrappedComponent: React.ComponentType<P>,
): React.ComponentClass<P, S> {
    return class extends React.Component<P, S> {
        constructor(props: P) {
            super(props);
            if (this.hasStores()) {
                this.state = this.props.deps.storesHub.getAllStoreData();
            } else {
                this.state = {} as S;
            }
        }

        public componentDidMount(): void {
            if (!this.hasStores()) {
                return;
            }

            const { storesHub, storeActionMessageCreator } = this.props.deps;
            storesHub.addChangedListenerToAllStores(this.onStoreChange);
            storeActionMessageCreator.getAllStates();
        }

        public componentWillUnmount(): void {
            if (!this.hasStores()) {
                return;
            }
            this.props.deps.storesHub.removeChangedListenerFromAllStores(this.onStoreChange);
        }

        public onStoreChange = () => {
            const storeData = this.props.deps.storesHub.getAllStoreData();
            this.setState(storeData);
        };

        public hasStores = () => {
            if (this.props.deps == null) {
                return false;
            }

            const { storesHub } = this.props.deps;
            return storesHub && storesHub.hasStores();
        };

        public render(): JSX.Element {
            return <WrappedComponent {...this.props} storeState={this.state} />;
        }
    };
}
