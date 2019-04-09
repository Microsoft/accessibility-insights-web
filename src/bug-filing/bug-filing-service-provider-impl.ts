// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BugFilingServiceProvider } from './bug-filing-service-provider';
import { GithubBugFilingService } from './github/github-bug-filing-service';

export const BugFilingServiceProviderImpl = new BugFilingServiceProvider([GithubBugFilingService]);
