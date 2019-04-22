// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { EnvironmentInfo } from '../../common/environment-info-provider';
import { CreateIssueDetailsTextData } from '../../common/types/create-issue-details-text-data';
import { IssueUrlCreationUtils } from './issue-filing-url-string-utils';
export type IssueDetailsGetter = (environmentInfo: EnvironmentInfo, data: CreateIssueDetailsTextData) => string;
