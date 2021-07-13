// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as fs from 'fs';
import * as util from 'util';
import { DEFAULT_WAIT_FOR_LOG_TIMEOUT_MS } from 'tests/electron/setup/timeouts';
import { tick } from 'tests/unit/common/tick';
import {
    generateAdbLogPath,
    generateOutputLogsDir,
    generateServerLogPath,
} from '../../../miscellaneous/mock-adb/generate-log-paths';

const readFile = util.promisify(fs.readFile);
export class LogController {
    private adbLogPath: string;
    private serverLogPath: string;

    constructor(currentContext: string, private mockAdbPath: string) {
        this.adbLogPath = this.getAdbLogPath(currentContext);
        this.serverLogPath = this.getServerLogPath(currentContext);
    }

    private getOutputLogsDir(currentContext: string): string {
        return generateOutputLogsDir(this.mockAdbPath, currentContext);
    }

    private getServerLogPath(currentContext: string): string {
        return generateServerLogPath(this.getOutputLogsDir(currentContext));
    }

    private getAdbLogPath(currentContext: string): string {
        return generateAdbLogPath(this.getOutputLogsDir(currentContext));
    }

    public async getServerLog(): Promise<string> {
        const log = await readFile(this.serverLogPath);
        return log.toString();
    }

    public async getAdbLog(): Promise<string> {
        const log = await readFile(this.adbLogPath);
        return log.toString();
    }

    public resetAdbLog(): void {
        fs.unlinkSync(this.adbLogPath);
    }

    public resetServerLog(): void {
        fs.unlinkSync(this.serverLogPath);
    }

    private adbLogExists(): boolean {
        return fs.existsSync(this.adbLogPath);
    }

    private serverLogExists(): boolean {
        return fs.existsSync(this.adbLogPath);
    }

    public waitUntil = async (waitFunction, args?, options?): Promise<void> => {
        const { timeout } = options ? options : { timeout: DEFAULT_WAIT_FOR_LOG_TIMEOUT_MS };
        let currentTime = Number(new Date());
        const endTime = currentTime + timeout;

        do {
            const value = args ? await waitFunction(...args) : await waitFunction();
            if (value === true) {
                return value;
            } else {
                await tick();
                currentTime = Number(new Date());
            }
        } while (currentTime < endTime);
        throw new Error('timed out!');
    };

    public waitForAdbLogToExist = async () => {
        await this.waitUntil(this.adbLogExists.bind(this));
    };

    public waitForServerLogToExist = async () => {
        await this.waitUntil(this.serverLogExists.bind(this));
    };

    private waitForLogToContain = async (contains, log) => {
        return await this.waitUntil((log, contains) => log.includes(contains), [log, contains]);
    };

    public waitForAdbLogToContain = async (contains: string) => {
        await this.waitForAdbLogToExist();
        await this.waitForLogToContain(contains, await this.getAdbLog());
    };

    public waitForServerLogToContain = async (contains: string) => {
        await this.waitForServerLogToExist();
        await this.waitForLogToContain(contains, await this.getServerLog());
    };
}
