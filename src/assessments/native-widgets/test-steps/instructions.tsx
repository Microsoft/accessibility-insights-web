// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { AnalyzerConfigurationFactory } from '../../../assessments/common/analyzer-configuration-factory';
import { IDefaultWidgetPropertyBag } from '../../../common/types/property-bag/idefault-widget';
import { VisualizationType } from '../../../common/types/visualization-type';
import { link } from '../../../content/link';
import { productName } from '../../../content/strings/application';
import * as content from '../../../content/test/native-widgets/instructions';
import { AssessmentVisualizationEnabledToggle } from '../../../DetailsView/components/assessment-visualization-enabled-toggle';
import { ScannerUtils } from '../../../injected/scanner-utils';
import AssistedTestRecordYourResults from '../../common/assisted-test-record-your-results';
import { PropertyBagColumnRendererConfig } from '../../common/property-bag-column-renderer';
import { PropertyBagColumnRendererFactory } from '../../common/property-bag-column-renderer-factory';
import * as Markup from '../../markup';
import { ReportInstanceField } from '../../types/report-instance-field';
import { TestStep } from '../../types/test-step';
import { NativeWidgetsTestStep } from './test-steps';

const description: JSX.Element = <span>If a native widget has visible instructions, they must be programmatically related to it.</span>;

const howToTest: JSX.Element = (
    <div>
        <p>
            For this requirement, {productName} highlights native widgets. Native widgets include
            <Markup.NonBreakingSpace />
            <Markup.Tag tagName="button" isBold={true} />,
            <Markup.NonBreakingSpace />
            <Markup.Tag tagName="input" isBold={true} />,
            <Markup.NonBreakingSpace />
            <Markup.Tag tagName="select" isBold={true} />, and
            <Markup.NonBreakingSpace />
            <Markup.Tag tagName="textarea" isBold={true} /> elements.
        </p>
        <ol>
            <li>
                For each widget, verify that any instructions visible in the target page are also visible in the
                <Markup.Term> Instances</Markup.Term> list.
            </li>
            <AssistedTestRecordYourResults />
        </ol>
    </div>
);

const propertyBagConfig: PropertyBagColumnRendererConfig<IDefaultWidgetPropertyBag>[] = [
    {
        propertyName: 'element',
        displayName: 'Element',
        defaultValue: '-',
    },
    {
        propertyName: 'accessibleName',
        displayName: 'Accessible name',
        defaultValue: '-',
    },
    {
        propertyName: 'accessibleDescription',
        displayName: 'Accessible description',
        defaultValue: '-',
    },
];

export const Instructions: TestStep = {
    key: NativeWidgetsTestStep.instructions,
    name: 'Instructions',
    description,
    howToTest,
    isManual: false,
    guidanceLinks: [link.WCAG_1_3_1],
    ...content,
    columnsConfig: [
        {
            key: 'instructions-info',
            name: 'Instructions',
            onRender: PropertyBagColumnRendererFactory.get<IDefaultWidgetPropertyBag>(propertyBagConfig),
        },
    ],
    reportInstanceFields: ReportInstanceField.fromColumns(propertyBagConfig),
    getAnalyzer: provider =>
        provider.createRuleAnalyzer(
            AnalyzerConfigurationFactory.forScanner({
                rules: ['native-widgets-default'],
                key: NativeWidgetsTestStep.instructions,
                testType: VisualizationType.NativeWidgets,
                resultProcessor: (scanner: ScannerUtils) => scanner.getPassingInstances,
            }),
        ),
    getDrawer: provider => provider.createHighlightBoxDrawer(),
    updateVisibility: false,
    getVisualHelperToggle: props => <AssessmentVisualizationEnabledToggle {...props} />,
};
