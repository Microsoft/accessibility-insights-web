// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { readFileSync } from 'fs';
import * as path from 'path';
import { createAppController } from 'tests/electron/common/create-application';
import { AppController } from 'tests/electron/common/view-controllers/app-controller';
import { CodecTestViewController } from 'tests/electron/common/view-controllers/codecs-test-view-controller';
import { electronBuildId } from '../../../../pipeline/scripts/electron-build-id.js';

/*
We bundle a mirrored version of electron with no
audio/video codecs to avoid shipping proprietary codecs
we don't need in the release build. This e2e test checks
to ensure we have the right codecs. If this test fails,
it's likely node_modules/electron/dist was not replaced
with the appropriate electron mirror.
*/

const releaseTests = process.env.RUN_RELEASE_TESTS === 'true';
(releaseTests ? describe : describe.skip)(
    'electron bundled without proprietary audio-video codecs',
    () => {
        let appController: AppController;
        let viewContoller: CodecTestViewController;

        beforeEach(async () => {
            appController = await createAppController(
                path.resolve(__dirname, '..', '..', 'miscellaneous', 'codecs', 'codecs-test.js'),
            );
            viewContoller = new CodecTestViewController(appController.client);
            await viewContoller.waitForAudioVisible();
        });

        afterEach(async () => await appController.stop());

        // https://html.spec.whatwg.org/multipage/media.html#error-codes:dom-mediaerror-media_err_src_not_supported
        it('has error when loading mp3 <audio> in renderer process', async () => {
            expect(await viewContoller.client.getAttribute('#audio', 'data-err')).toEqual('4');
        });

        it('uses expected build during release', async () => {
            const buildId = await viewContoller.client.evaluate(() => {
                return (window as any).process.versions['microsoft-build'];
            });
            expect(buildId).toBe(electronBuildId);
        });
    },
);

it('electron versions in package.json and build id are updated together', async () => {
    const mainPackage = JSON.parse(readFileSync('package.json', { encoding: 'utf-8' }));
    const versions = {
        electronVersion: mainPackage.dependencies.electron,
        electronBuildId,
    };
    expect(versions).toMatchInlineSnapshot(`
        Object {
          "electronBuildId": "7912306",
          "electronVersion": "11.4.5",
        }
    `);
});
