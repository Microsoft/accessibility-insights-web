// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as Enzyme from 'enzyme';
import * as React from 'react';

import { ManualTestStatus } from '../../../../../../common/types/manual-test-status';
import { IAssessmentDetailsReportModel } from '../../../../../../DetailsView/reports/assessment-report-model';
import {
    AssessmentReportAssessmentList,
    AssessmentReportAssessmentListProps,
    AssessmentReportAssessmentListDeps,
} from '../../../../../../DetailsView/reports/components/assessment-report-assessment-list';
import { AssessmentReportBuilderTestHelper } from '../../assessment-report-builder-test-helper';
import { outcomeTypeSemanticsFromTestStatus } from '../../../../../../DetailsView/reports/components/outcome-type';

describe('AssessmentReportAssessmentListTest', () => {
    // TODO: Make this a local test function rather than importing the actual one
    const deps: AssessmentReportAssessmentListDeps = {
        outcomeTypeSemanticsFromTestStatus: outcomeTypeSemanticsFromTestStatus,
    };

    test('render: pass', () => {
        const assessments: AssessmentReportAssessmentListProps = {
            deps: deps,
            status: ManualTestStatus.PASS,
            assessments: AssessmentReportBuilderTestHelper.getAssessmentDetailsReportModelPass(),
        };

        testAssessments(assessments);
    });

    test('render: fail', () => {
        const assessments: AssessmentReportAssessmentListProps = {
            deps: deps,
            status: ManualTestStatus.FAIL,
            assessments: AssessmentReportBuilderTestHelper.getAssessmentDetailsReportModelFail(),
        };

        testAssessments(assessments);
    });

    test('render: incomplete', () => {
        const assessments: AssessmentReportAssessmentListProps = {
            deps: deps,
            status: ManualTestStatus.UNKNOWN,
            assessments: AssessmentReportBuilderTestHelper.getAssessmentDetailsReportModelUnknown(),
        };

        testAssessments(assessments);
    });

    function testAssessments(assessments: AssessmentReportAssessmentListProps): void {
        const wrapper = Enzyme.shallow(<AssessmentReportAssessmentList {...assessments} />);

        assessments.assessments.forEach((assessment, index) => {
            const assessmentDiv = wrapper.childAt(index);
            expect(assessmentDiv.children()).toHaveLength(2);
            expect(assessmentDiv.hasClass('assessment-details')).toBe(true);
            expect(assessmentDiv.key()).toEqual(assessment.key);

            testAssessmentHeader(assessment, assessmentDiv.childAt(0));
        });

        expect(wrapper.getElement()).toMatchSnapshot();
    }

    function testAssessmentHeader(assessment: IAssessmentDetailsReportModel, assessmentHeader: Enzyme.ShallowWrapper<any, any>): void {
        expect(assessmentHeader.hasClass('assessment-header')).toBe(true);
        expect(assessmentHeader.children()).toHaveLength(2);

        const headerName = assessmentHeader.childAt(0);
        expect(headerName.text()).toEqual(assessment.displayName);
    }
});
