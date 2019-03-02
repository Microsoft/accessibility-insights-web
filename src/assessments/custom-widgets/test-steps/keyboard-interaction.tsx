// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { AnalyzerConfigurationFactory } from '../../../assessments/common/analyzer-configuration-factory';
import { ICustomWidgetPropertyBag } from '../../../common/types/property-bag/icustom-widgets';
import { VisualizationType } from '../../../common/types/visualization-type';
import { link } from '../../../content/link';
import { productName } from '../../../content/strings/application';
import * as content from '../../../content/test/custom-widgets/keyboard-interaction';
import { AssessmentVisualizationEnabledToggle } from '../../../DetailsView/components/assessment-visualization-enabled-toggle';
import { ScannerUtils } from '../../../injected/scanner-utils';
import AssistedTestRecordYourResults from '../../common/assisted-test-record-your-results';
import * as Markup from '../../markup';
import { ReportInstanceField } from '../../types/report-instance-field';
import { TestStep } from '../../types/test-step';
import { getFlatDesignPatternStringFromRole } from '../custom-widgets-column-renderer';
import { CustomWidgetsColumnRendererFactory } from '../custom-widgets-column-renderer-factory';
import { CustomWidgetsTestStep } from './test-steps';

const keyboardInteractionDescription: JSX.Element = (
    <span>A custom widget must support the keyboard interaction specified by its design pattern.</span>
);

const keyboardInteractionHowToTest: JSX.Element = (
    <div>
        For this requirement, {productName} highlights custom widgets.
        <ol>
            <li>
                For each custom widget, open the spec for the design pattern that best describes the widget's function. (If the widget has
                the correct role, the design pattern link in the <Markup.Term>Instances</Markup.Term> list below will open the correct
                spec.)
            </li>
            <li>Familiarize yourself with the "Keyboard Interaction" section of the spec.</li>
            <li>Interact with the widget to verify that it supports the keyboard interactions specified by its design pattern.</li>
            <AssistedTestRecordYourResults />
        </ol>
    </div>
);

export const KeyboardInteraction: TestStep = {
    key: CustomWidgetsTestStep.keyboardInteraction,
    name: 'Keyboard interaction',
    description: keyboardInteractionDescription,
    howToTest: keyboardInteractionHowToTest,
    isManual: false,
    guidanceLinks: [link.WCAG_2_1_1],
    ...content,
    columnsConfig: [
        {
            key: 'keyboard-interaction-info',
            name: 'Keyboard Interaction',
            onRender: CustomWidgetsColumnRendererFactory.getWithLink<ICustomWidgetPropertyBag>([
                {
                    propertyName: 'designPattern',
                    displayName: 'Design pattern',
                    defaultValue: '-',
                },
                {
                    propertyName: 'text',
                    displayName: 'Accesssible name',
                    defaultValue: '-',
                },
            ]),
        },
    ],
    reportInstanceFields: [
        ReportInstanceField.fromPropertyBagFunction<ICustomWidgetPropertyBag>('Design pattern', 'designPattern', pb =>
            getFlatDesignPatternStringFromRole(pb.role),
        ),
        ReportInstanceField.fromColumnValueBagField<ICustomWidgetPropertyBag>('Accessible name', 'text'),
    ],
    getAnalyzer: provider =>
        provider.createRuleAnalyzer(
            AnalyzerConfigurationFactory.forScanner({
                rules: ['custom-widget'],
                key: CustomWidgetsTestStep.keyboardInteraction,
                testType: VisualizationType.CustomWidgets,
                resultProcessor: (scanner: ScannerUtils) => scanner.getPassingInstances,
            }),
        ),
    getDrawer: provider => provider.createHighlightBoxDrawer(),
    updateVisibility: false,
    getVisualHelperToggle: props => <AssessmentVisualizationEnabledToggle {...props} />,
};
