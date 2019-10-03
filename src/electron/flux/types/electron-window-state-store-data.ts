// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type ElectronRoutes = 'deviceConnectView' | 'resultsView';

export interface ElectronWindowStateStoreData {
    routeId: ElectronRoutes;
}
