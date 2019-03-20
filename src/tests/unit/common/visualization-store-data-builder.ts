// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as _ from 'lodash';

import { VisualizationStore } from '../../../background/stores/visualization-store';
import { VisualizationConfigurationFactory } from '../../../common/configs/visualization-configuration-factory';
import { DetailsViewPivotType } from '../../../common/types/details-view-pivot-type';
import { IAssessmentScanData, IVisualizationStoreData } from '../../../common/types/store-data/ivisualization-store-data';
import { VisualizationType } from '../../../common/types/visualization-type';
import { BaseDataBuilder } from './base-data-builder';

export class VisualizationStoreDataBuilder extends BaseDataBuilder<IVisualizationStoreData> {
    constructor() {
        super();
        this.data = new VisualizationStore(null, null, new VisualizationConfigurationFactory()).getDefaultState();
    }

    public withFocusedTarget(target: string[]): VisualizationStoreDataBuilder {
        this.data.focusedTarget = target;
        return this;
    }

    public withColorEnable(): VisualizationStoreDataBuilder {
        this.data.tests.adhoc.color.enabled = true;
        return this;
    }

    public withIssuesEnable(): VisualizationStoreDataBuilder {
        this.data.tests.adhoc.issues.enabled = true;
        return this;
    }

    public withLandmarksEnable(): VisualizationStoreDataBuilder {
        this.data.tests.adhoc.landmarks.enabled = true;
        return this;
    }

    public withLandmarksAssessment(enable: boolean, step: string): VisualizationStoreDataBuilder {
        return this.withAssessment(this.data.tests.assessments.landmarksAssessment, enable, step);
    }

    public withTabStopsEnable(): VisualizationStoreDataBuilder {
        this.data.tests.adhoc.tabStops.enabled = true;
        return this;
    }

    public withHeadingsEnable(): VisualizationStoreDataBuilder {
        this.data.tests.adhoc.headings.enabled = true;
        return this;
    }

    public withHeadingsAssessment(enable: boolean, step: string): VisualizationStoreDataBuilder {
        return this.withAssessment(this.data.tests.assessments.headingsAssessment, enable, step);
    }

    public withAllAdhocEnabled(): VisualizationStoreDataBuilder {
        this.data.tests.adhoc.issues.enabled = true;
        this.data.tests.adhoc.landmarks.enabled = true;
        this.data.tests.adhoc.headings.enabled = true;
        this.data.tests.adhoc.tabStops.enabled = true;
        this.data.tests.adhoc.color.enabled = true;
        return this;
    }

    public withAllAdhocTestsTo(enabled: boolean): VisualizationStoreDataBuilder {
        _.forOwn(this.data.tests.adhoc, testData => {
            testData.enabled = enabled;
        });
        return this;
    }

    public withEnable(type: VisualizationType): VisualizationStoreDataBuilder {
        // tslint:disable-next-line: switch-default
        switch (type) {
            case VisualizationType.Headings:
                this.data.tests.adhoc.headings.enabled = true;
                break;
            case VisualizationType.Issues:
                this.data.tests.adhoc.issues.enabled = true;
                break;
            case VisualizationType.Landmarks:
                this.data.tests.adhoc.landmarks.enabled = true;
                break;
            case VisualizationType.TabStops:
                this.data.tests.adhoc.tabStops.enabled = true;
                break;
            case VisualizationType.Color:
                this.data.tests.adhoc.color.enabled = true;
                break;
        }

        return this;
    }

    public withDisable(type: VisualizationType): VisualizationStoreDataBuilder {
        // tslint:disable-next-line: switch-default
        switch (type) {
            case VisualizationType.Headings:
                this.data.tests.adhoc.headings.enabled = false;
                break;
            case VisualizationType.Issues:
                this.data.tests.adhoc.issues.enabled = false;
                break;
            case VisualizationType.Landmarks:
                this.data.tests.adhoc.landmarks.enabled = false;
                break;
            case VisualizationType.Color:
                this.data.tests.adhoc.color.enabled = false;
                break;
        }

        return this;
    }

    private withAssessment(assessment: IAssessmentScanData, enabled: boolean, step?: string): VisualizationStoreDataBuilder {
        assessment.stepStatus[step] = enabled;
        assessment.enabled = Object.keys(assessment.stepStatus).some(step => assessment.stepStatus[step] === true);
        return this;
    }

    public withSelectedDetailsViewPivot(pivot: DetailsViewPivotType): VisualizationStoreDataBuilder {
        this.data.selectedDetailsViewPivot = pivot;
        return this;
    }

    public build(): IVisualizationStoreData {
        return _.cloneDeep(this.data);
    }
}
