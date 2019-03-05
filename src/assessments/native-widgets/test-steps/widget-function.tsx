// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { AnalyzerConfigurationFactory } from '../../../assessments/common/analyzer-configuration-factory';
import { PropertyBagColumnRendererFactory } from '../../../assessments/common/property-bag-column-renderer-factory';
import { IWidgetFunctionPropertyBag } from '../../../common/types/property-bag/iwidget-function';
import { VisualizationType } from '../../../common/types/visualization-type';
import { link } from '../../../content/link';
import { productName } from '../../../content/strings/application';
import * as content from '../../../content/test/native-widgets/widget-function';
import { AssessmentVisualizationEnabledToggle } from '../../../DetailsView/components/assessment-visualization-enabled-toggle';
import { ScannerUtils } from '../../../injected/scanner-utils';
import AssistedTestRecordYourResults from '../../common/assisted-test-record-your-results';
import { PropertyBagColumnRendererConfig } from '../../common/property-bag-column-renderer';
import * as Markup from '../../markup';
import { ReportInstanceField } from '../../types/report-instance-field';
import { TestStep } from '../../types/test-step';
import { NativeWidgetsTestStep } from './test-steps';

const description: JSX.Element = (
    <span>
        If a native widget <Markup.Emphasis>functions</Markup.Emphasis> as a custom widget, it must have the appropriate ARIA widget role.
    </span>
);

const howToTest: JSX.Element = (
    <div>
        <p>
            For this requirement, {productName} highlights native widgets that are possible custom widgets. These elements don't have an
            ARIA widget role, but they do have some custom widget markup, such as
            <Markup.CodeTerm> tabindex="-1"</Markup.CodeTerm>, an ARIA attribute, or a non-widget role.
        </p>
        <ol>
            <li>
                In the target page, examine each highlighted widget to verify that it <Markup.Emphasis>functions </Markup.Emphasis>
                as a simple native widget.
            </li>
            <AssistedTestRecordYourResults />
        </ol>
    </div>
);

const propertyBagConfig: PropertyBagColumnRendererConfig<IWidgetFunctionPropertyBag>[] = [
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
        propertyName: 'role',
        displayName: 'Role',
        defaultValue: '-',
    },
    {
        propertyName: 'ariaAttributes',
        displayName: 'ARIA attributes',
        defaultValue: '-',
        expand: true,
    },
    {
        propertyName: 'tabIndex',
        displayName: 'Tab index',
        defaultValue: '-',
    },
];

export const WidgetFunction: TestStep = {
    key: NativeWidgetsTestStep.widgetFunction,
    name: 'Widget function',
    description,
    howToTest,
    isManual: false,
    guidanceLinks: [link.WCAG_4_1_2],
    ...content,
    columnsConfig: [
        {
            key: 'widget-function-info',
            name: 'Widget function',
            onRender: PropertyBagColumnRendererFactory.get<IWidgetFunctionPropertyBag>(propertyBagConfig),
        },
    ],
    reportInstanceFields: ReportInstanceField.fromColumns(propertyBagConfig),
    getAnalyzer: provider =>
        provider.createRuleAnalyzer(
            AnalyzerConfigurationFactory.forScanner({
                rules: ['widget-function'],
                key: NativeWidgetsTestStep.widgetFunction,
                testType: VisualizationType.NativeWidgets,
                resultProcessor: (scanner: ScannerUtils) => scanner.getPassingInstances,
            }),
        ),
    getDrawer: provider => provider.createHighlightBoxDrawer(),
    updateVisibility: false,
    getVisualHelperToggle: props => <AssessmentVisualizationEnabledToggle {...props} />,
};
