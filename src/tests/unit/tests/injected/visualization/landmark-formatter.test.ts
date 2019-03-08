// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IAssessmentVisualizationInstance } from '../../../../../injected/frameCommunicators/html-element-axe-results-helper';
import { FailureInstanceFormatter } from '../../../../../injected/visualization/failure-instance-formatter';
import { IHeadingStyleConfiguration } from '../../../../../injected/visualization/heading-formatter';
import { DrawerConfiguration } from '../../../../../injected/visualization/iformatter';
import { LandmarkFormatter } from '../../../../../injected/visualization/landmark-formatter';

describe('LandmarkFormatterTests', () => {
    let testSubject: LandmarkFormatter;

    beforeEach(() => {
        testSubject = new LandmarkFormatter();
    });

    test('verifyStyling for an assessment instance', () => {
        const config = testSubject.getDrawerConfiguration(null, getAssessmentBannerInstance());
        testStyling(config, 'banner');
    });

    const landmarkRoles: string[] = ['banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation', 'region', 'search'];

    test.each(landmarkRoles)('verify styling for landmark role %s', role => {
        const axeData = getAxeData(role);
        const config = testSubject.getDrawerConfiguration(null, axeData);
        testStyling(config, role);
    });

    test.each(['application', 'unrecognized-role'])('verify styling for non-landmark-role %s', role => {
        const axeData = getAxeData(role, true);
        const config = testSubject.getDrawerConfiguration(null, axeData);
        testStyling(config, role, true);
    });

    function getLandmarkStyle(key: string): IHeadingStyleConfiguration {
        const landmarkStyle = LandmarkFormatter.getStyleForLandmarkRole(key);

        expect(landmarkStyle).toBeDefined();
        return landmarkStyle;
    }

    function getAssessmentBannerInstance(): IAssessmentVisualizationInstance {
        return {
            propertyBag: {
                role: 'banner',
                label: 'label',
            },
        } as IAssessmentVisualizationInstance;
    }

    function getAxeData(givenRole: string, isFailure = false): IAssessmentVisualizationInstance {
        const axeData: IAssessmentVisualizationInstance = {
            isFailure: isFailure,
            isVisualizationEnabled: true,
            html: 'html',
            target: ['html'],
            isVisible: true,
            identifier: 'some id',
            ruleResults: {
                'unique-landmark': {
                    any: [
                        {
                            id: 'unique-landmark',
                            message: 'message for none-check1',
                            data: {
                                role: givenRole,
                                label: 'test banner',
                            },
                        },
                    ],
                    none: [],
                    all: [],
                    status: true,
                    ruleId: 'unique-landmark',
                    selector: 'selector',
                    html: 'html',
                    failureSummary: 'failureSummary',
                    help: 'help1',
                    id: 'id1',
                    guidanceLinks: [],
                    helpUrl: 'help1',
                    fingerprint: 'fp1',
                    snippet: 'html',
                },
                rule2: {
                    any: [],
                    none: [],
                    all: [],
                    status: true,
                    ruleId: 'rule2',
                    selector: 'selector',
                    html: 'html',
                    failureSummary: 'failureSummary',
                    help: 'help2',
                    id: 'id2',
                    guidanceLinks: [],
                    helpUrl: 'help2',
                    fingerprint: 'fp2',
                    snippet: 'html',
                },
            },
        };

        return axeData;
    }

    function testStyling(config: DrawerConfiguration, givenRole: string, isFailure = false): void {
        const landmarkStyle = getLandmarkStyle(givenRole);
        expect(config.showVisualization).toBe(true);
        expect(config.outlineStyle).toEqual('dashed');
        expect(config.borderColor).toEqual(landmarkStyle.borderColor);
        expect(config.textBoxConfig.fontColor).toEqual(landmarkStyle.fontColor);

        if (isFailure) {
            expect(config.failureBoxConfig).toEqual(FailureInstanceFormatter.failureBoxConfig);
        }
    }
});
