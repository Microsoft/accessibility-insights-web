// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import { ISelection, Selection } from 'office-ui-fabric-react/lib/DetailsList';
import * as React from 'react';
import { IMock, Mock, Times } from 'typemoq';

import { VisualizationConfigurationFactory } from '../../../../../common/configs/visualization-configuration-factory';
import { DateProvider } from '../../../../../common/date-provider';
import { UserConfigurationStoreData } from '../../../../../common/types/store-data/user-configuration-store';
import { IssuesTable, IssuesTableDeps, IssuesTableProps } from '../../../../../DetailsView/components/issues-table';
import { DetailsRowData, IssuesTableHandler } from '../../../../../DetailsView/components/issues-table-handler';
import { ReportGenerator } from '../../../../../DetailsView/reports/report-generator';
import { ReportGeneratorProvider } from '../../../../../DetailsView/reports/report-generator-provider';
import { DecoratedAxeNodeResult } from '../../../../../injected/scanner-utils';
import { RuleResult } from '../../../../../scanner/iruleresults';
import { DictionaryStringTo } from '../../../../../types/common-types';

describe('IssuesTableTest', () => {
    let deps: IssuesTableDeps;
    let reportGeneratorMock: IMock<ReportGenerator>;
    let reportGeneratorProviderMock: IMock<ReportGeneratorProvider>;
    beforeEach(() => {
        reportGeneratorMock = Mock.ofType<ReportGenerator>();
        reportGeneratorProviderMock = Mock.ofType<ReportGeneratorProvider>();
        reportGeneratorProviderMock.setup(provider => provider.getGenerator()).returns(() => reportGeneratorMock.object);
        deps = {
            getDateFromTimestamp: DateProvider.getDateFromTimestamp,
            reportGeneratorProvider: reportGeneratorProviderMock.object,
        } as any;
    });

    it('spinner, issuesEnabled == null', () => {
        const props = new TestPropsBuilder().setDeps(deps).build();
        reportGeneratorProviderMock.setup(rgm => rgm.getGenerator()).verifiable(Times.never());

        const wrapped = shallow(<IssuesTable {...props} />);

        expect(wrapped.debug()).toMatchSnapshot();
        reportGeneratorProviderMock.verifyAll();
    });

    it('includes subtitle if specified', () => {
        const props = new TestPropsBuilder().setSubtitle(<>test subtitle text</>).build();

        const wrapped = shallow(<IssuesTable {...props} />);

        expect(wrapped.debug()).toMatchSnapshot();
    });

    it('automated checks disabled', () => {
        const issuesEnabled = false;
        const selectionMock = Mock.ofType<ISelection>(Selection);

        const toggleClickHandlerMock = Mock.ofInstance(event => {});

        const props = new TestPropsBuilder()
            .setDeps(deps)
            .setIssuesEnabled(issuesEnabled)
            .setIssuesSelection(selectionMock.object)
            .setToggleClickHandler(toggleClickHandlerMock.object)
            .build();

        const wrapped = shallow(<IssuesTable {...props} />);

        expect(wrapped.getElement()).toMatchSnapshot();
    });

    it('spinner for scanning state', () => {
        const issuesEnabled = true;
        const toggleClickHandlerMock = Mock.ofInstance(event => {});

        const props = new TestPropsBuilder()
            .setDeps(deps)
            .setIssuesEnabled(issuesEnabled)
            .setScanning(true)
            .setToggleClickHandler(toggleClickHandlerMock.object)
            .build();

        const wrapped = shallow(<IssuesTable {...props} />);

        expect(wrapped.debug()).toMatchSnapshot();
    });

    describe('table', () => {
        const issuesCount = [0, 1, 2];

        it.each(issuesCount)('with %s issues', count => {
            const sampleViolations: RuleResult[] = getSampleViolations(count);
            const sampleIdToRuleResultMap: DictionaryStringTo<DecoratedAxeNodeResult> = {};
            const items: DetailsRowData[] = [];
            for (let i: number = 1; i <= count; i++) {
                sampleIdToRuleResultMap['id' + i] = {} as DecoratedAxeNodeResult;
                items.push({} as DetailsRowData);
            }

            const issuesEnabled = true;
            const issuesTableHandlerMock = Mock.ofType<IssuesTableHandler>(IssuesTableHandler);
            const selectionMock = Mock.ofType<ISelection>(Selection);
            const toggleClickHandlerMock = Mock.ofInstance(event => {});

            const props = new TestPropsBuilder()
                .setDeps(deps)
                .setIssuesEnabled(issuesEnabled)
                .setViolations(sampleViolations)
                .setIssuesSelection(selectionMock.object)
                .setIssuesTableHandler(issuesTableHandlerMock.object)
                .setToggleClickHandler(toggleClickHandlerMock.object)
                .build();

            const wrapped = shallow(<IssuesTable {...props} />);

            expect(wrapped.debug()).toMatchSnapshot();
        });
    });

    it('spinner, issuesEnabled is an empty object', () => {
        const props = new TestPropsBuilder()
            .setDeps(deps)
            .setIssuesEnabled({} as any)
            .build();

        const wrapper = shallow(<IssuesTable {...props} />);

        expect(wrapper.debug()).toMatchSnapshot();
    });

    function getSampleViolations(count: number): RuleResult[] {
        if (count === 0) {
            return [];
        }

        const sampleViolations: RuleResult[] = [
            {
                id: 'rule name',
                description: 'rule description',
                help: 'rule help',
                nodes: [],
            },
        ];

        for (let i: number = 0; i < count; i++) {
            sampleViolations[0].nodes[i] = {
                any: [],
                none: [],
                all: [],
                html: '',
                target: ['#target-' + (i + 1)],
            };
        }

        return sampleViolations;
    }
});

class TestPropsBuilder {
    private title: string = 'test title';
    private subtitle?: JSX.Element;
    private issuesTableHandler: IssuesTableHandler;
    private issuesEnabled: boolean;
    private violations: RuleResult[];
    private issuesSelection: ISelection;
    private scanning: boolean = false;
    private clickHandler: (event) => void;
    private featureFlags = {};
    private deps: IssuesTableDeps;

    public setDeps(deps: IssuesTableDeps): TestPropsBuilder {
        this.deps = deps;
        return this;
    }

    public setToggleClickHandler(handler: (event) => void): TestPropsBuilder {
        this.clickHandler = handler;
        return this;
    }

    public setScanning(newValue: boolean): TestPropsBuilder {
        this.scanning = newValue;
        return this;
    }

    public setIssuesEnabled(data: boolean): TestPropsBuilder {
        this.issuesEnabled = data;
        return this;
    }

    public setViolations(data: RuleResult[]): TestPropsBuilder {
        this.violations = data;
        return this;
    }

    public setIssuesSelection(selection: ISelection): TestPropsBuilder {
        this.issuesSelection = selection;
        return this;
    }

    public setIssuesTableHandler(issuesTableHandler: IssuesTableHandler): TestPropsBuilder {
        this.issuesTableHandler = issuesTableHandler;
        return this;
    }

    public setFeatureFlag(name: string, value: boolean): TestPropsBuilder {
        this.featureFlags[name] = value;
        return this;
    }

    public setSubtitle(subtitle?: JSX.Element): TestPropsBuilder {
        this.subtitle = subtitle;
        return this;
    }

    public build(): IssuesTableProps {
        return {
            deps: this.deps,
            title: this.title,
            subtitle: this.subtitle,
            issuesTableHandler: this.issuesTableHandler,
            issuesEnabled: this.issuesEnabled,
            issuesSelection: this.issuesSelection,
            pageTitle: 'pageTitle',
            pageUrl: 'http://pageUrl',
            scanning: this.scanning,
            toggleClickHandler: this.clickHandler,
            violations: this.violations,
            visualizationConfigurationFactory: new VisualizationConfigurationFactory(),
            featureFlags: this.featureFlags,
            selectedIdToRuleResultMap: {},
            scanResult: {
                violations: [],
                passes: [],
                inapplicable: [],
                incomplete: [],
                timestamp: '',
                targetPageUrl: '',
                targetPageTitle: '',
            },
            userConfigurationStoreData: {
                bugService: 'gitHub',
            } as UserConfigurationStoreData,
        };
    }
}
