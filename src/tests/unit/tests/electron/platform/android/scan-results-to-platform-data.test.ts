// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { PlatformData } from 'common/types/store-data/unified-data-interface';
import { ScanResults } from 'electron/platform/android/scan-results';
import { convertScanResultsToPlatformData } from 'electron/platform/android/scan-results-to-platform-data';
import { axeRuleResultExample } from 'tests/unit/tests/electron/flux/action-creator/scan-result-example';

describe('convertScanResultsToPlatformData', () => {
    it('produces the pinned output for the pinned example input', () => {
        expect(
            convertScanResultsToPlatformData(new ScanResults(axeRuleResultExample)),
        ).toMatchSnapshot();
    });

    it('populates output from the ScanResults axeDevice properties', () => {
        const input = new ScanResults({
            axeContext: {
                axeDevice: {
                    dpi: 1.2,
                    name: 'test-device-name',
                    osVersion: 'test-os-version',
                    screenHeight: 1,
                    screenWidth: 2,
                },
            },
        });
        const expectedOutput: PlatformData = {
            osInfo: {
                name: 'Android',
                version: 'test-os-version',
            },
            viewPortInfo: {
                width: 2,
                height: 1,
                dpi: 1.2,
            },
            deviceName: 'test-device-name',
        };
        expect(convertScanResultsToPlatformData(input)).toEqual(expectedOutput);
    });

    it('omits individual axeDevice properties not present in scanResults', () => {
        const input = new ScanResults({ axeContext: { axeDevice: {} } });
        const expectedOutput: PlatformData = {
            osInfo: {
                name: 'Android',
            },
            viewPortInfo: {},
        };
        expect(convertScanResultsToPlatformData(input)).toEqual(expectedOutput);
    });

    it.each([null, undefined, {}])('outputs null if scanResults is %p', emptyObject => {
        expect(convertScanResultsToPlatformData(new ScanResults(emptyObject))).toBeNull();
    });

    it.each([null, undefined, {}])('outputs null if scanResults.axeContext is %p', emptyObject => {
        expect(
            convertScanResultsToPlatformData(new ScanResults({ axeContext: emptyObject })),
        ).toBeNull();
    });

    it.each([null, undefined])(
        'outputs null if scanResults.axeContext.axeDevice is %p',
        emptyObject => {
            expect(
                convertScanResultsToPlatformData(
                    new ScanResults({ axeContext: { axeDevice: emptyObject } }),
                ),
            ).toBeNull();
        },
    );
});
