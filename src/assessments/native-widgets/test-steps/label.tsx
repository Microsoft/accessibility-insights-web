// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { AnalyzerConfigurationFactory } from '../../../assessments/common/analyzer-configuration-factory';
import { IDefaultWidgetPropertyBag } from '../../../common/types/property-bag/idefault-widget';
import { VisualizationType } from '../../../common/types/visualization-type';
import { link } from '../../../content/link';
import { productName } from '../../../content/strings/application';
import * as content from '../../../content/test/native-widgets/label';
import { AssessmentVisualizationEnabledToggle } from '../../../DetailsView/components/assessment-visualization-enabled-toggle';
import { ScannerUtils } from '../../../injected/scanner-utils';
import AssistedTestRecordYourResults from '../../common/assisted-test-record-your-results';
import { PropertyBagColumnRendererConfig } from '../../common/property-bag-column-renderer';
import { PropertyBagColumnRendererFactory } from '../../common/property-bag-column-renderer-factory';
import * as Markup from '../../markup';
import { ReportInstanceField } from '../../types/report-instance-field';
import { TestStep } from '../../types/test-step';
import { NativeWidgetsTestStep } from './test-steps';

const description: JSX.Element = <span>A native widget must have a label and/or instructions that identify the expected input.</span>;

const howToTest: JSX.Element = (
    <div>
        <p>For this requirement, {productName} highlights native widgets.</p>
        <p>
            <Markup.Emphasis>
                Note: If a native widget has no programmatically-related label, it will fail an automated check.
            </Markup.Emphasis>
        </p>
        <ol>
            <li>
                Examine each widget in the <Markup.Term>Instances</Markup.Term> list below to verify that its accessible name and/or
                instructions identify the expected input, including any unusual or specific formatting requirements.
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

export const Label: TestStep = {
    key: NativeWidgetsTestStep.label,
    name: 'Label',
    description,
    howToTest,
    isManual: false,
    guidanceLinks: [link.WCAG_3_3_2],
    ...content,
    columnsConfig: [
        {
            key: 'label-info',
            name: 'Label',
            onRender: PropertyBagColumnRendererFactory.get<IDefaultWidgetPropertyBag>(propertyBagConfig),
        },
    ],
    reportInstanceFields: ReportInstanceField.fromColumns(propertyBagConfig),
    getAnalyzer: provider =>
        provider.createRuleAnalyzer(
            AnalyzerConfigurationFactory.forScanner({
                rules: ['native-widgets-default'],
                key: NativeWidgetsTestStep.label,
                testType: VisualizationType.NativeWidgets,
                resultProcessor: (scanner: ScannerUtils) => scanner.getPassingInstances,
            }),
        ),
    getDrawer: provider => provider.createHighlightBoxDrawer(),
    updateVisibility: false,
    getVisualHelperToggle: props => <AssessmentVisualizationEnabledToggle {...props} />,
};
