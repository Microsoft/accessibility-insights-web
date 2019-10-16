// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import axios from 'axios';
import { axeRuleResultExample } from 'tests/unit/tests/electron/flux/action-creator/scan-result-example';
import { ScanResults } from './scan-results';

export type FetchScanResultsType = (port: number) => Promise<ScanResults>;

export type HttpGet = typeof axios.get;

export const createFetchScanResults = (httpGet: HttpGet): FetchScanResultsType => {
    return async (port: number) => {
        //  const response = await httpGet(`http://localhost:${port}/axe/result`);
        return new ScanResults(axeRuleResultExample);
    };
};
