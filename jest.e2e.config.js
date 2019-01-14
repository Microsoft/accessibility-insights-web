// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var common = require('./jest.common.config');

module.exports = {
    ...common,
    roots: ['<rootDir>/src/tests/end-to-end'],
    reporters: ['default', ['jest-junit', { outputDirectory: '.', outputName: './junit-e2e.xml' }]],

    moduleFileExtensions: [
        'ts',
        'json', // adding json, since puppeteer.launch throws error - refer https://github.com/GoogleChrome/puppeteer/issues/2754
        'js'
    ],

    // using js instead of ts files since globalSetup & globalTeardown files are not transformed. refer https://github.com/facebook/jest/issues/5164
    globalSetup: '<rootDir>/src/tests/end-to-end/setup/global-setup.js',
    globalTeardown : '<rootDir>/src/tests/end-to-end/setup/global-teardown.js',
};
