// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// How long to allow an entire test to execute, including startup/setup
export const DEFAULT_ELECTRON_TEST_TIMEOUT_MS = 60000;

// These govern how long to allow connection to the test app to take
// The product of these should be significantly less than the test timeout
export const DEFAULT_APP_CONNECT_TIMEOUT_MS = 10000;
export const DEFAULT_APP_CONNECT_RETRIES = 3;

// How long to wait for an element to be visible
export const DEFAULT_WAIT_FOR_ELEMENT_TO_BE_VISIBLE_TIMEOUT_MS = 10000;

// How long of a wait to artificially inject between element hover/mousedown/mouseup during clicks
export const DEFAULT_CLICK_HOVER_DELAY_MS = 100;

// How long to wait for a mock adb or service log to contain a value
export const DEFAULT_WAIT_FOR_LOG_TIMEOUT_MS = 1500;
