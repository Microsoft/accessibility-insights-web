// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ContentProvider } from 'views/content/content-page';
import { ContentActionMessageCreator } from '../../../../../common/message-creators/content-action-message-creator';
import { InspectActionMessageCreator } from '../../../../../common/message-creators/inspect-action-message-creator';
import { ScopingActionMessageCreator } from '../../../../../common/message-creators/scoping-action-message-creator';
import { UserConfigMessageCreator } from '../../../../../common/message-creators/user-config-message-creator';
import { DetailsViewData } from '../../../../../common/types/store-data/details-view-data';
import { ScopingStoreData } from '../../../../../common/types/store-data/scoping-store-data';
import { UserConfigurationStoreData } from '../../../../../common/types/store-data/user-configuration-store';
import { DetailsViewActionMessageCreator } from '../../../../../DetailsView/actions/details-view-action-message-creator';
import {
    DetailsViewOverlay,
    DetailsViewOverlayDeps,
    DetailsViewOverlayProps,
} from '../../../../../DetailsView/components/details-view-overlay';
import { SettingsProvider } from '../../../../../DetailsView/components/settings-panel/settings/settings-provider';
import { PreviewFeatureFlagsHandler } from '../../../../../DetailsView/handlers/preview-feature-flags-handler';

describe('DetailsViewOverlay', () => {
    const detailsViewActionMessageCreator = {
        addFailureInstance: null,
    } as DetailsViewActionMessageCreator;
    const previewFeatureFlagsHandlerStub = {
        getDisplayableFeatureFlags: null,
    } as PreviewFeatureFlagsHandler;
    const scopingActionMessageCreatorStub = {
        addSelector: null,
    } as ScopingActionMessageCreator;

    const userConfigMessageCreatorStub = {} as UserConfigMessageCreator;

    const inspectActionMessageCreatorStub = {
        changeInspectMode: null,
    } as InspectActionMessageCreator;
    const detailsViewStoreData: DetailsViewData = {
        currentPanel: {
            isPreviewFeaturesOpen: false,
            isScopingOpen: false,
        },
    } as DetailsViewData;

    const userConfigStoreData = {} as UserConfigurationStoreData;
    const featureFlagStoreData = {};
    const scopingStoreData: ScopingStoreData = {} as ScopingStoreData;
    const deps: DetailsViewOverlayDeps = {
        contentProvider: {} as ContentProvider,
        contentActionMessageCreator: {} as ContentActionMessageCreator,
        detailsViewActionMessageCreator,
        userConfigMessageCreator: userConfigMessageCreatorStub,
        settingsProvider: {} as SettingsProvider,
    } as DetailsViewOverlayDeps;

    const props: DetailsViewOverlayProps = {
        deps,
        detailsViewStoreData,
        scopingStoreData,
        featureFlagStoreData,
        previewFeatureFlagsHandler: previewFeatureFlagsHandlerStub,
        scopingActionMessageCreator: scopingActionMessageCreatorStub,
        inspectActionMessageCreator: inspectActionMessageCreatorStub,
        userConfigurationStoreData: userConfigStoreData,
    };

    test('renders with scoping open', () => {
        detailsViewStoreData.currentPanel.isScopingOpen = true;
        const component = new DetailsViewOverlay(props);
        expect(component.render()).toMatchSnapshot();
    });

    test('renders with preview features open', () => {
        detailsViewStoreData.currentPanel.isPreviewFeaturesOpen = true;
        const component = new DetailsViewOverlay(props);
        expect(component.render()).toMatchSnapshot();
    });

    test('renders with content open', () => {
        detailsViewStoreData.contentPath = 'content/path';
        detailsViewStoreData.currentPanel.isContentOpen = true;
        const component = new DetailsViewOverlay(props);
        expect(component.render()).toMatchSnapshot();
    });

    test('renders with settings panel open', () => {
        detailsViewStoreData.currentPanel.isSettingsOpen = true;
        const component = new DetailsViewOverlay(props);
        expect(component.render()).toMatchSnapshot();
    });

    test('renders with settings false', () => {
        detailsViewStoreData.currentPanel.isSettingsOpen = false;
        const component = new DetailsViewOverlay(props);
        expect(component.render()).toMatchSnapshot();
    });
});
