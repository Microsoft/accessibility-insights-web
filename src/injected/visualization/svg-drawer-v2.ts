// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as _ from 'lodash/index';

import { ITabbedElementData } from '../../common/types/store-data/ivisualization-scan-result-data';
import { ShadowUtils } from '../shadow-utils';
import { WindowUtils } from './../../common/window-utils';
import { BaseDrawer } from './base-drawer';
import { CenterPositionCalculator } from './center-position-calculator';
import { DrawerUtils } from './drawer-utils';
import { IDrawerInitData } from './idrawer';
import { IFocusIndicator } from './ifocus-indicator';
import { ISVGDrawerConfiguration } from './iformatter';
import { IPoint } from './ipoint';
import { ITabbedItem } from './itabbed-item';
import { SVGNamespaceUrl } from './svg-constants';
import { SVGShapeFactory } from './svg-shape-factory';
import { SVGSolidShadowFilterFactory } from './svg-solid-shadow-filter-factory';
import { TabStopsFormatter } from './tab-stops-formatter';

export class SVGDrawerV2 extends BaseDrawer {
    protected tabbedElements: ITabbedItem[];
    private SVGContainer: HTMLElement;
    private filterFactory: SVGSolidShadowFilterFactory;
    private svgShapeFactory: SVGShapeFactory;
    private centerPositionCalculator: CenterPositionCalculator;

    constructor(
        dom: NodeSelector & Node,
        containerClass: string,
        windowUtils: WindowUtils,
        shadowUtils: ShadowUtils,
        drawerUtils: DrawerUtils,
        formatter: TabStopsFormatter,
        centerPositionCalculator: CenterPositionCalculator,
        filterFactory: SVGSolidShadowFilterFactory,
        svgShapeFactory: SVGShapeFactory,
    ) {
        super(dom, containerClass, windowUtils, shadowUtils, drawerUtils, formatter);
        this.tabbedElements = [];
        this.filterFactory = filterFactory;
        this.svgShapeFactory = svgShapeFactory;
        this.centerPositionCalculator = centerPositionCalculator;
    }

    public initialize(drawerInfo: IDrawerInitData<ITabbedElementData>): void {
        const tabbedElements = drawerInfo.data.map(element => {
            return {
                ...element,
                tabOrder: element.tabOrder || element.propertyBag.tabOrder,
            };
        });
        this.updateTabbedElements(tabbedElements);
    }

    private updateTabbedElements(newTabbedElements: ITabbedElementData[]): void {
        let diffFound = false;
        const dom: Document = this.drawerUtils.getDocumentElement();

        for (let pos = 0; pos < newTabbedElements.length; pos++) {
            const newStateElement: ITabbedElementData = newTabbedElements[pos];
            const oldStateElement: ITabbedItem = this.tabbedElements[pos];

            if (diffFound || this.shouldRedraw(oldStateElement, newStateElement, pos)) {
                diffFound = true;
                this.tabbedElements[pos] = this.getNewTabbedElement(oldStateElement, newStateElement, pos, dom);
            } else {
                this.tabbedElements[pos].shouldRedraw = false;
            }
        }
    }

    private shouldRedraw(oldStateElement: ITabbedItem, newStateElement: ITabbedElementData, pos: number): boolean {
        const elementsInSvgCount: number = this.tabbedElements.length;
        const isLastElementInSvg: boolean = pos === elementsInSvgCount - 1;

        return (
            oldStateElement == null ||
            newStateElement.target[newStateElement.target.length - 1] !== oldStateElement.selector ||
            newStateElement.tabOrder !== oldStateElement.tabOrder ||
            isLastElementInSvg
        );
    }

    private getNewTabbedElement(
        oldStateElement: ITabbedItem,
        newStateElement: ITabbedElementData,
        pos: number,
        dom: Document,
    ): ITabbedItem {
        const selector: string = newStateElement.target[newStateElement.target.length - 1];

        return {
            element: dom.querySelector(selector),
            selector: selector,
            tabOrder: newStateElement.tabOrder,
            shouldRedraw: true,
            focusIndicator: oldStateElement ? oldStateElement.focusIndicator : null,
        };
    }

    public eraseLayout(): void {
        super.eraseLayout();
        this.tabbedElements = [];
    }

    protected removeContainerElement(): void {
        super.removeContainerElement();

        this.tabbedElements.forEach((element: ITabbedItem) => (element.shouldRedraw = true));
    }

    protected addHighlightsToContainer(): void {
        const svgElements = this.getHighlightElements();
        this.addElementsToSVGContainer(svgElements);
    }

    protected createContainerElement(): void {
        super.createContainerElement();
        this.SVGContainer = this.createSVGElement();
        this.setSVGSize();
        const defs = this.createDefsAndFilterElement();
        this.SVGContainer.appendChild(defs);
        this.containerElement.appendChild(this.SVGContainer);
    }

    private createDefsAndFilterElement(): Element {
        const myDocument = this.drawerUtils.getDocumentElement();

        const defs = myDocument.createElementNS(SVGNamespaceUrl, 'defs');

        const filter = this.filterFactory.createFilter();

        defs.appendChild(filter);

        return defs;
    }

    private createSVGElement(): HTMLElement {
        const myDocument = this.drawerUtils.getDocumentElement();
        const svg: HTMLElement = myDocument.createElementNS(SVGNamespaceUrl, 'svg') as HTMLElement;

        return svg;
    }

    protected handlePositionChange(): void {
        super.handlePositionChange();
        this.setSVGSize();
    }

    private setSVGSize(): void {
        const doc = this.drawerUtils.getDocumentElement();
        const body = doc.querySelector('body');
        const bodyStyle = this.windowUtils.getComputedStyle(body);
        const docStyle = this.windowUtils.getComputedStyle(doc.documentElement);

        const height = this.drawerUtils.getDocumentHeight(doc, bodyStyle, docStyle);
        const width = this.drawerUtils.getDocumentWidth(doc, bodyStyle, docStyle);

        this.SVGContainer.setAttribute('height', `${height}px`);
        this.SVGContainer.setAttribute('width', `${width}px`);
    }

    private createFocusIndicator(item: ITabbedItem, curElementIndex: number, isLastItem: boolean): IFocusIndicator {
        const centerPosition: IPoint = this.centerPositionCalculator.getElementCenterPosition(item.element);

        if (centerPosition == null) {
            return;
        }

        const drawerConfig: ISVGDrawerConfiguration = this.formatter.getDrawerConfiguration(item.element, null);

        const {
            tabIndexLabel: { showTabIndexedLabel },
            line: { showSolidFocusLine },
        } = drawerConfig;

        const circleConfiguration = isLastItem ? drawerConfig.focusedCircle : drawerConfig.circle;

        const newCircle = this.svgShapeFactory.createCircle(centerPosition, circleConfiguration);
        const newLabel =
            isLastItem || !showTabIndexedLabel
                ? null
                : this.svgShapeFactory.createTabIndexLabel(centerPosition, drawerConfig.tabIndexLabel, item.tabOrder);

        const newLine: Element = this.createLinesInTabOrderVisualization(
            curElementIndex,
            isLastItem,
            drawerConfig,
            centerPosition,
            showSolidFocusLine,
        );

        const focusIndicator: IFocusIndicator = {
            circle: newCircle,
            tabIndexLabel: newLabel,
            line: newLine,
        };

        return focusIndicator;
    }

    private createLinesInTabOrderVisualization(
        curElementIndex: number,
        isLastItem: boolean,
        drawerConfig: ISVGDrawerConfiguration,
        centerPosition: IPoint,
        showSolidFocusLine: boolean,
    ): Element {
        const circleConfiguration = isLastItem ? drawerConfig.focusedCircle : drawerConfig.circle;

        if (this.shouldBreakGraph(curElementIndex)) {
            return null;
        }
        if (!showSolidFocusLine && !isLastItem) {
            return null;
        }

        const prevElementPos = this.centerPositionCalculator.getElementCenterPosition(this.tabbedElements[curElementIndex - 1].element);

        if (prevElementPos == null) {
            return null;
        }

        let lineConfiguration = isLastItem ? drawerConfig.focusedLine : drawerConfig.line;

        if (showSolidFocusLine && isLastItem) {
            lineConfiguration = drawerConfig.focusedLine;
        }
        return this.svgShapeFactory.createLine(
            prevElementPos,
            centerPosition,
            lineConfiguration,
            this.filterFactory.filterId,
            parseFloat(circleConfiguration.ellipseRx),
        );
    }

    private shouldBreakGraph(curElementIndex: number): boolean {
        return (
            curElementIndex === 0 || this.tabbedElements[curElementIndex - 1].tabOrder !== this.tabbedElements[curElementIndex].tabOrder - 1
        );
    }

    private removeFocusIndicator(focusIndicator: IFocusIndicator): void {
        if (!focusIndicator) {
            return;
        }
        if (focusIndicator.circle) {
            focusIndicator.circle.remove();
        }
        if (focusIndicator.line) {
            focusIndicator.line.remove();
        }
        if (focusIndicator.tabIndexLabel) {
            focusIndicator.tabIndexLabel.remove();
        }
    }

    private getHighlightElements(): HTMLElement[] {
        const totalElements = _.size(this.tabbedElements);

        _.each(this.tabbedElements, (current: ITabbedItem, index: number) => {
            const isLastItem = index === totalElements - 1;
            if (current.shouldRedraw) {
                this.removeFocusIndicator(current.focusIndicator);
                current.focusIndicator = this.createFocusIndicator(current, index, isLastItem);
            }
        });

        const result = _.chain(this.tabbedElements)
            .filter((element: ITabbedItem) => element.shouldRedraw)
            .map(tabbed =>
                _.chain(tabbed.focusIndicator)
                    .values()
                    .compact()
                    .value(),
            )
            .flatten()
            .value();

        return result as HTMLElement[];
    }

    private addElementsToSVGContainer(elements: HTMLElement[]): void {
        elements.forEach((element: HTMLElement) => {
            if (element) {
                this.SVGContainer.appendChild(element);
            }
        });
    }
}
