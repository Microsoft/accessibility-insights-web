// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { range } from 'lodash';
import { ReportNameGenerator } from '../../../../../DetailsView/reports/report-name-generator';

describe('ReportNameGenerator', () => {
    const theBase = 'BASE';
    const theTitle = 'Title';
    const theDate = new Date(2019, 2, 12, 16, 0, 0);

    const testObject = new ReportNameGenerator();

    it('generates single digit date/time elements', () => {
        const date = new Date(2018, 0, 1, 2, 3);

        const actual = testObject.generateName(theBase, date, theTitle);

        const expected = 'BASE_20180101_Title.html';
        expect(actual).toEqual(expected);
    });

    it('generates double digit date/time elements with long title', () => {
        const date = new Date(2017, 9, 10, 12, 13);

        const actual = testObject.generateName(theBase, date, theTitle);

        const expected = 'BASE_20171010_Title.html';
        expect(actual).toEqual(expected);
    });

    it('generates maximum date/time elements with invalid title characters', () => {
        const date = new Date(2017, 11, 31, 23, 59);

        const actual = testObject.generateName(theBase, date, theTitle);

        const expected = 'BASE_20171231_Title.html';
        expect(actual).toEqual(expected);
    });

    it('truncates a long title', () => {
        const title = 'ThisIsALongTitleThatShouldBeTruncated';

        const actual = testObject.generateName(theBase, theDate, title);

        const expected = 'BASE_20190312_ThisIsALongTitleThat.html';
        expect(actual).toEqual(expected);
    });

    function titleFromRange(start: number, end: number): string {
        return range(start, end).reduce((prev, cur) => prev + String.fromCharCode(cur), '');
    }

    it('excludes invalid title characters from 32-95', () => {
        const title = titleFromRange(32, 96);

        const actual = testObject.generateName(theBase, theDate, title);

        const expected = 'BASE_20190312_0123456789ABCDEFGHIJ.html';
        expect(actual).toEqual(expected);
    });

    it('excludes invalid title characters from 96-1023', () => {
        const title = titleFromRange(96, 1023);

        const actual = testObject.generateName(theBase, theDate, title);

        const expected = 'BASE_20190312_abcdefghijklmnopqrst.html';
        expect(actual).toEqual(expected);
    });
});
