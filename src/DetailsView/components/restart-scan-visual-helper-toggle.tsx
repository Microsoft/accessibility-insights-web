// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';

import { GeneratedAssessmentInstance } from '../../common/types/store-data/assessment-result-data';
import { BaseVisualHelperToggle } from './base-visual-helper-toggle';

export class RestartScanVisualHelperToggle extends BaseVisualHelperToggle {
    protected isDisabled(instances: GeneratedAssessmentInstance<{}, {}>[]): boolean {
        return false;
    }

    protected isChecked(instances: GeneratedAssessmentInstance<{}, {}>[]): boolean {
        return this.props.isStepEnabled;
    }

    @autobind
    protected onClick(event): void {
        if (this.props.isStepEnabled) {
            this.props.actionMessageCreator.disableVisualHelper(
                this.props.assessmentNavState.selectedTestType,
                this.props.assessmentNavState.selectedTestStep,
            );
        } else {
            this.props.actionMessageCreator.enableVisualHelper(
                this.props.assessmentNavState.selectedTestType,
                this.props.assessmentNavState.selectedTestStep,
            );
        }
    }
}
