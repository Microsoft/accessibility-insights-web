// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { HighlightBoxFormatter } from './highlight-box-formatter';
import { TabbableElementsHelper } from '../../common/tabbable-elements-helper';
import { DeepPartial } from '../../common/types/deep-partial';
import { WindowUtils } from '../../common/window-utils';
import { ClientUtils } from '../client-utils';
import { FrameCommunicator } from '../frameCommunicators/frame-communicator';
import { ShadowUtils } from '../shadow-utils';
import { HTMLElementUtils } from './../../common/html-element-utils';
import { CenterPositionCalculator } from './center-position-calculator';
import { ColorDrawer } from './color-drawer';
import { ColorFormatter } from './color-formatter';
import { Drawer } from './drawer';
import { DrawerUtils } from './drawer-utils';
import { FrameFormatter } from './frame-formatter';
import { HeadingFormatter } from './heading-formatter';
import { IDrawer } from './idrawer';
import { IFormatter, ISVGDrawerConfiguration } from './iformatter';
import { IssuesFormatter } from './issues-formatter';
import { LandmarkFormatter } from './landmark-formatter';
import { NullDrawer } from './null-drawer';
import { SVGDrawerV2 } from './svg-drawer-v2';
import { SVGShapeFactory } from './svg-shape-factory';
import { SVGSolidShadowFilterFactory } from './svg-solid-shadow-filter-factory';
import { TabStopsFormatter } from './tab-stops-formatter';
import { CustomWidgetsFormatter } from './custom-widgets-formatter';
import { ClientBrowserAdapter } from '../../common/client-browser-adapter';

export type IPartialSVGDrawerConfiguration = DeepPartial<ISVGDrawerConfiguration>;

export class DrawerProvider {
    private windowUtils: WindowUtils;
    private shadowUtils: ShadowUtils;
    private drawerUtils: DrawerUtils;
    private clientUtils: ClientUtils;
    private dom: Document;
    private frameCommunicator: FrameCommunicator;

    constructor(
        windowUtils: WindowUtils,
        shadowUtils: ShadowUtils,
        drawerUtils: DrawerUtils,
        clientUtils: ClientUtils,
        dom: Document,
        frameCommunicator: FrameCommunicator,
        private readonly clientBrowserAdapter: ClientBrowserAdapter,
    ) {
        this.windowUtils = windowUtils;
        this.shadowUtils = shadowUtils;
        this.drawerUtils = drawerUtils;
        this.clientUtils = clientUtils;
        this.dom = dom;
        this.frameCommunicator = frameCommunicator;
    }

    public createNullDrawer(): IDrawer {
        return new NullDrawer();
    }

    public createColorDrawer(): IDrawer {
        return new ColorDrawer(this.drawerUtils, new ColorFormatter());
    }

    public createSVGDrawer(config: IPartialSVGDrawerConfiguration = null): IDrawer {
        const tabbableElementsHelper = new TabbableElementsHelper(new HTMLElementUtils(this.dom));
        const centerPositionCalculator = new CenterPositionCalculator(
            this.drawerUtils,
            this.windowUtils,
            tabbableElementsHelper,
            this.clientUtils,
        );
        const containerClass = 'insights-tab-stops';
        return new SVGDrawerV2(
            this.dom,
            containerClass,
            this.windowUtils,
            this.shadowUtils,
            this.drawerUtils,
            new TabStopsFormatter(config),
            centerPositionCalculator,
            new SVGSolidShadowFilterFactory(this.drawerUtils, containerClass),
            new SVGShapeFactory(this.drawerUtils),
        );
    }

    public createFrameDrawer(): IDrawer {
        const formatter = new FrameFormatter();
        return this.createDrawer('insights-frame', formatter);
    }

    public createHeadingsDrawer(): IDrawer {
        const formatter = new HeadingFormatter(window, this.clientUtils);
        return this.createDrawer('insights-heading', formatter);
    }

    public createLandmarksDrawer(): IDrawer {
        const formatter = new LandmarkFormatter();
        return this.createDrawer('insights-landmark', formatter);
    }

    public createIssuesDrawer(): IDrawer {
        const formatter = new IssuesFormatter(this.frameCommunicator, this.windowUtils, this.shadowUtils, this.clientBrowserAdapter);
        return this.createDrawer('insights-issues', formatter);
    }

    public createHighlightBoxDrawer(): IDrawer {
        const formatter = new HighlightBoxFormatter();
        return this.createDrawer('insights-general-highlight-box', formatter);
    }

    public createCustomWidgetsDrawer(): IDrawer {
        const formatter = new CustomWidgetsFormatter();
        return this.createDrawer('insights-custom-widgets', formatter);
    }

    private createDrawer(containerClass: string, formatter: IFormatter): IDrawer {
        return new Drawer(this.dom, containerClass, this.windowUtils, this.shadowUtils, this.drawerUtils, this.clientUtils, formatter);
    }
}
