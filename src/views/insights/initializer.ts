// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { A11YSelfValidator } from 'common/a11y-self-validator';
import { ChromeAdapter } from 'common/browser-adapters/chrome-adapter';
import { HTMLElementUtils } from 'common/html-element-utils';
import { ScannerUtils } from 'injected/scanner-utils';
import { scan } from 'scanner/exposed-apis';
import { rendererDependencies } from './dependencies';
import { renderer } from './renderer';

const browserAdapter = new ChromeAdapter();
renderer(rendererDependencies(browserAdapter));

const a11ySelfValidator = new A11YSelfValidator(
    new ScannerUtils(scan),
    new HTMLElementUtils(),
);
(window as any).A11YSelfValidator = a11ySelfValidator;
