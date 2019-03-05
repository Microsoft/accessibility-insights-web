// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DetailsViewActionMessageCreator } from '../../../../../DetailsView/actions/details-view-action-message-creator';
import { AssessmentViewProps } from '../../../../../DetailsView/components/assessment-view';
import { selectFirstRequirementAfterAutomatedChecks } from '../../../../../DetailsView/extensions/select-first-requirement-after-automated-checks';

describe('selectFirstRequirementAfterAutomatedChecks', () => {
    const first = 'first';
    const second = 'second';
    const type = -2112;

    const getRequirementResults = () => [{ definition: { key: first } }, { definition: { key: second } }];

    const actionMessageCreator = {
        selectTestStep: jest.fn(),
    };

    const scanningProps = ({
        deps: {
            detailsViewActionMessageCreator: actionMessageCreator as Partial<DetailsViewActionMessageCreator>,
        },
        assessmentTestResult: {
            getOutcomeStats: () => ({ pass: 0, incomplete: 1, fail: 0 }),
            getRequirementResults,
            type,
        },
    } as Partial<AssessmentViewProps>) as AssessmentViewProps;

    const notScanningProps = ({
        deps: {
            detailsViewActionMessageCreator: actionMessageCreator as Partial<DetailsViewActionMessageCreator>,
        },
        assessmentTestResult: {
            getOutcomeStats: () => ({ pass: 1, incomplete: 0, fail: 0 }),
            getRequirementResults,
            type,
        },
    } as Partial<AssessmentViewProps>) as AssessmentViewProps;

    beforeEach(() => {
        actionMessageCreator.selectTestStep.mockClear();
    });

    const testObject = selectFirstRequirementAfterAutomatedChecks.component.onAssessmentViewUpdate;

    it('selects the first test step when transitioning from scanning to not scanning', () => {
        testObject(scanningProps, notScanningProps);

        expect(actionMessageCreator.selectTestStep).toBeCalledWith(null, first, type);
    });

    it('does not select the first test step when remaining scanning', () => {
        testObject(scanningProps, scanningProps);

        expect(actionMessageCreator.selectTestStep).not.toBeCalled();
    });

    it('does not select the first test step when remaining not scanning', () => {
        testObject(notScanningProps, notScanningProps);

        expect(actionMessageCreator.selectTestStep).not.toBeCalled();
    });

    it('selects the first test step when transitioning from not scanning to scanning', () => {
        testObject(notScanningProps, scanningProps);

        expect(actionMessageCreator.selectTestStep).not.toBeCalled();
    });
});
