// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';

import { TestMode } from '../../common/configs/test-mode';
import { IVisualizationConfiguration, VisualizationConfigurationFactory } from '../../common/configs/visualization-configuration-factory';
import { EnumHelper } from '../../common/enum-helper';
import { ITab } from '../../common/itab';
import { StoreNames } from '../../common/stores/store-names';
import { DetailsViewPivotType } from '../../common/types/details-view-pivot-type';
import { IAssessmentScanData, IVisualizationStoreData, TestsEnabledState } from '../../common/types/store-data/ivisualization-store-data';
import { VisualizationType } from '../../common/types/visualization-type';
import {
    AssessmentToggleActionPayload,
    ToggleActionPayload,
    UpdateSelectedDetailsViewPayload,
    UpdateSelectedPivot,
} from '../actions/action-payloads';
import { TabActions } from '../actions/tab-actions';
import { VisualizationActions } from '../actions/visualization-actions';
import { BaseStore } from './base-store';

export class VisualizationStore extends BaseStore<IVisualizationStoreData> {
    private visualizationActions: VisualizationActions;
    private tabActions: TabActions;
    private visualizationConfigurationFactory: VisualizationConfigurationFactory;

    constructor(
        visualizationActions: VisualizationActions,
        tabActions: TabActions,
        visualizationConfigurationFactory: VisualizationConfigurationFactory,
    ) {
        super(StoreNames.VisualizationStore);

        this.visualizationActions = visualizationActions;
        this.tabActions = tabActions;
        this.visualizationConfigurationFactory = visualizationConfigurationFactory;
    }

    protected addActionListeners(): void {
        this.visualizationActions.enableVisualization.addListener(this.onEnableVisualization);
        this.visualizationActions.enableVisualizationWithoutScan.addListener(this.onEnableVisualizationWithoutScan);
        this.visualizationActions.disableVisualization.addListener(this.onDisableVisualization);
        this.visualizationActions.disableAssessmentVisualizations.addListener(this.onDisableAssessmentVisualizations);

        this.visualizationActions.scanCompleted.addListener(this.onScanCompleted);
        this.visualizationActions.updateFocusedInstance.addListener(this.onUpdateFocusedInstance);
        this.visualizationActions.scrollRequested.addListener(this.onScrollRequested);

        this.visualizationActions.getCurrentState.addListener(this.onGetCurrentState);
        this.tabActions.tabChange.addListener(this.onTabChange);

        this.visualizationActions.updateSelectedPivotChild.addListener(this.onUpdateSelectedPivotChild);
        this.visualizationActions.updateSelectedPivot.addListener(this.onUpdateSelectedPivot);

        this.visualizationActions.injectionCompleted.addListener(this.injectionCompleted);
        this.visualizationActions.injectionStarted.addListener(this.injectionStarted);
    }

    public getDefaultState(): IVisualizationStoreData {
        const tests: TestsEnabledState = {
            adhoc: {},
            assessments: {},
        };

        if (this.visualizationConfigurationFactory != null) {
            EnumHelper.getNumericValues(VisualizationType).forEach((test: VisualizationType) => {
                const config = this.visualizationConfigurationFactory.getConfiguration(test);
                tests[config.testMode][config.key] = {
                    enabled: false,
                };
            });

            Object.keys(tests.assessments).forEach(key => {
                tests.assessments[key].stepStatus = {};
            });
        }

        const defaultValues: IVisualizationStoreData = {
            tests,
            scanning: null,
            selectedFastPassDetailsView: VisualizationType.Issues,
            selectedAdhocDetailsView: VisualizationType.Issues,
            selectedDetailsViewPivot: DetailsViewPivotType.fastPass,
            injectingStarted: false,
            injectingInProgress: null,
            focusedTarget: null,
        };

        return defaultValues;
    }

    @autobind
    private onDisableVisualization(test: VisualizationType): void {
        if (this.toggleTestOff(test)) {
            this.emitChanged();
        }
    }

    private toggleTestOff(test: VisualizationType): boolean {
        let isStateChanged = false;
        if (this.state.scanning != null) {
            return isStateChanged;
        }

        const configuration = this.visualizationConfigurationFactory.getConfiguration(test);
        const scanData = configuration.getStoreData(this.state.tests);

        if (this.isAssessment(configuration)) {
            const scanData = configuration.getStoreData(this.state.tests) as IAssessmentScanData;
            Object.keys(scanData.stepStatus).forEach(step => {
                if (scanData.enabled) {
                    configuration.disableTest(scanData, step);
                    isStateChanged = true;
                }
            });
            isStateChanged = true;
        } else {
            if (scanData.enabled) {
                configuration.disableTest(scanData);
                isStateChanged = true;
            }
        }

        return isStateChanged;
    }

    @autobind
    private onTabChange(payload: ITab) {
        this.state = {
            ...this.getDefaultState(),
            selectedFastPassDetailsView: this.state.selectedFastPassDetailsView,
            selectedAdhocDetailsView: this.state.selectedAdhocDetailsView,
            selectedDetailsViewPivot: this.state.selectedDetailsViewPivot,
        };
        this.emitChanged();
    }

    private disableAssessmentVisualizationsWithoutEmitting(): void {
        EnumHelper.getNumericValues(VisualizationType).forEach((test: number) => {
            const configuration = this.visualizationConfigurationFactory.getConfiguration(test);
            const shouldDisableTest = this.isAssessment(configuration);
            if (shouldDisableTest) {
                this.toggleTestOff(test);
            }
        });
    }

    @autobind
    private onDisableAssessmentVisualizations(): void {
        this.disableAssessmentVisualizationsWithoutEmitting();
        this.emitChanged();
    }

    @autobind
    private onEnableVisualization(payload: ToggleActionPayload): void {
        this.enableTest(payload, false);
    }

    @autobind
    private onEnableVisualizationWithoutScan(payload: ToggleActionPayload): void {
        this.enableTest(payload, true);
    }

    private enableTest(payload: ToggleActionPayload, skipScanning: boolean): void {
        const isStateChanged: boolean = false;
        if (this.state.scanning != null) {
            // do not change state if currently scanning, not even the toggle
            return;
        }

        const configuration = this.visualizationConfigurationFactory.getConfiguration(payload.test);
        this.disableAssessmentVisualizationsWithoutEmitting();
        const scanData = configuration.getStoreData(this.state.tests);

        const step = (payload as AssessmentToggleActionPayload).step;
        const alreadyEnabled = configuration.getTestStatus(scanData, step);
        if (!alreadyEnabled) {
            if (!skipScanning) {
                this.state.scanning = configuration.getIdentifier(step);
            }

            this.state.injectingInProgress = true;
            configuration.enableTest(scanData, payload);
        }
        this.emitChanged();
    }

    private isAssessment(config: IVisualizationConfiguration): boolean {
        return config.testMode === TestMode.Assessments;
    }

    @autobind
    private onUpdateSelectedPivot(payload: UpdateSelectedPivot): void {
        const pivot = payload.pivotKey;

        if (this.state.selectedDetailsViewPivot !== pivot) {
            this.state.selectedDetailsViewPivot = pivot;
            this.disableAllTests();
            this.emitChanged();
        }
    }

    private disableAllTests(): void {
        EnumHelper.getNumericValues(VisualizationType).forEach((test: VisualizationType) => {
            this.toggleTestOff(test);
        });
    }

    @autobind
    private onUpdateSelectedPivotChild(payload: UpdateSelectedDetailsViewPayload): void {
        const pivot = payload.pivotType;
        const pivotChildUpdated = this.updateSelectedPivotChildUnderPivot(payload);
        const pivotUpdated = this.updateSelectedPivot(pivot);
        if (pivotChildUpdated || pivotUpdated) {
            this.disableAllTests();
            this.emitChanged();
        }
    }

    @autobind
    private onScanCompleted(): void {
        this.state.scanning = null;
        this.emitChanged();
    }

    @autobind
    private onScrollRequested(): void {
        this.state.focusedTarget = null;
        this.emitChanged();
    }

    @autobind
    private onUpdateFocusedInstance(focusedInstanceTarget: string[]): void {
        this.state.focusedTarget = focusedInstanceTarget;
        this.emitChanged();
    }

    @autobind
    private injectionCompleted(): void {
        this.state.injectingInProgress = false;
        this.state.injectingStarted = false;
        this.emitChanged();
    }

    @autobind
    private injectionStarted(): void {
        if (this.state.injectingStarted) {
            return;
        }

        this.state.injectingInProgress = true;
        this.state.injectingStarted = true;
        this.emitChanged();
    }

    private updateSelectedPivotChildUnderPivot(payload: UpdateSelectedDetailsViewPayload): boolean {
        let updated = false;
        if (payload.detailsViewType == null) {
            return updated;
        }

        if (payload.pivotType === DetailsViewPivotType.allTest) {
            this.state.selectedAdhocDetailsView = payload.detailsViewType;
            updated = true;
        } else if (payload.pivotType === DetailsViewPivotType.fastPass) {
            this.state.selectedFastPassDetailsView = payload.detailsViewType;
            updated = true;
        }

        return updated;
    }

    private updateSelectedPivot(pivot: DetailsViewPivotType): boolean {
        let updated = false;
        if (pivot != null && this.state.selectedDetailsViewPivot !== pivot) {
            this.state.selectedDetailsViewPivot = pivot;
            updated = true;
        }

        return updated;
    }
}
