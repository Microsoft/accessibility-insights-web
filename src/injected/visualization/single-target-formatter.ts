// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IFormatter, SingleTargetDrawerConfiguration } from './iformatter';

export class SingleTargetFormatter implements IFormatter {
    constructor(private injectedClassName: string) {}

    public getDrawerConfiguration(): SingleTargetDrawerConfiguration {
        const config: SingleTargetDrawerConfiguration = {
            injectedClassName: this.injectedClassName,
        };
        return config;
    }

    public getDialogRenderer(): void {
        return;
    }
}
