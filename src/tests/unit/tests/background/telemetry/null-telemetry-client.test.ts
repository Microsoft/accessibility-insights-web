import { IMock, It, Mock, Times } from 'typemoq';

import { NullTelemetryClient } from '../../../../../background/telemetry/null-telemetry-client';
import { TelemetryBaseData } from '../../../../../background/telemetry/telemetry-base-data';
import { TelemetryLogger } from '../../../../../background/telemetry/telemetry-logger';

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
describe('Null telemetry client', () => {
    let loggerMock: IMock<TelemetryLogger>;

    beforeEach(() => {
        loggerMock = Mock.ofType<TelemetryLogger>();
    });

    describe('no op, no side effects', () => {
        const data = [
            ['constructor', createDefaultTestObject],
            ['enableTelemetry', () => createDefaultTestObject().enableTelemetry()],
            ['disableTelemetry', () => createDefaultTestObject().disableTelemetry()],
        ];

        it.each(data)('%s', (_, toExec) => {
            expect(toExec).not.toThrow();
        });
    });

    describe('trackEvent', () => {
        it('should log telemetry', () => {
            const name = 'test-event-name';
            const properties = {};

            const expected: TelemetryBaseData = {
                name,
                properties,
            };

            loggerMock.setup(logger => logger.log(expected)).verifiable(Times.once());

            const testObject = createDefaultTestObject();

            testObject.trackEvent(name, properties);

            loggerMock.verifyAll();
        });
    });

    function createDefaultTestObject(): NullTelemetryClient {
        return new NullTelemetryClient(loggerMock.object);
    }
});
