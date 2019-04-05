// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BugFilingService } from './types/bug-filing-service';
export class BugFilingServiceProvider {
    constructor(private readonly services: BugFilingService[]) {}
    public all(): BugFilingService[] {
        return this.services.slice();
    }
}
