// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { shallow } from 'enzyme';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import { IMock, Mock, Times } from 'typemoq';
import { GitHubBugFilingService, GitHubBugFilingSettings } from '../../../../../bug-filing/github/github-bug-filing-service';
import { SettingsFormProps } from '../../../../../bug-filing/types/settings-form-props';
import { UserConfigMessageCreator } from '../../../../../common/message-creators/user-config-message-creator';

describe('GithubBugFilingServiceTest', () => {
    let userConfigMessageCreatorMock: IMock<UserConfigMessageCreator>;
    let props: SettingsFormProps<GitHubBugFilingSettings>;
    beforeEach(() => {
        userConfigMessageCreatorMock = Mock.ofType(UserConfigMessageCreator);
        props = {
            deps: {
                userConfigMessageCreator: userConfigMessageCreatorMock.object,
            },
            settings: {
                repository: 'repo',
            },
        };
    });

    test('static properties', () => {
        expect(GitHubBugFilingService.key).toBe('gitHub');
        expect(GitHubBugFilingService.displayName).toBe('GitHub');
    });

    test('buildStoreData', () => {
        const url = 'base';
        const expectedStoreData: GitHubBugFilingSettings = {
            repository: url,
        };
        expect(GitHubBugFilingService.buildStoreData(url)).toEqual(expectedStoreData);
    });

    test('isSettingsValid', () => {
        const nullSettings: GitHubBugFilingSettings = null;
        const emptySettings: GitHubBugFilingSettings = {} as GitHubBugFilingSettings;
        const invalidSettings1: GitHubBugFilingSettings = {
            random: ' ',
        } as any;
        const invalidSettings2: GitHubBugFilingSettings = {
            repository: '  ',
        };
        const invalidSettings3: GitHubBugFilingSettings = {
            repository: 3,
        } as any;
        const validSettings: GitHubBugFilingSettings = {
            repository: 'repository',
        };
        expect(GitHubBugFilingService.isSettingsValid(nullSettings)).toBe(false);
        expect(GitHubBugFilingService.isSettingsValid(emptySettings)).toBe(false);
        expect(GitHubBugFilingService.isSettingsValid(invalidSettings1)).toBe(false);
        expect(GitHubBugFilingService.isSettingsValid(invalidSettings2)).toBe(false);
        expect(GitHubBugFilingService.isSettingsValid(invalidSettings3)).toBe(false);
        expect(GitHubBugFilingService.isSettingsValid(validSettings)).toBe(true);
    });

    test('renderSettingsForm', () => {
        const Component = GitHubBugFilingService.renderSettingsForm;
        const wrapper = shallow(<Component {...props} />);
        expect(wrapper.getElement()).toMatchSnapshot();
    });

    test('renderSettingsForm: onChange', () => {
        const Component = GitHubBugFilingService.renderSettingsForm;
        const wrapper = shallow(<Component {...props} />);
        userConfigMessageCreatorMock
            .setup(ucmm => ucmm.setBugServiceProperty('gitHub', 'repository', 'new value'))
            .verifiable(Times.once());
        wrapper
            .find(TextField)
            .props()
            .onChange(null, 'new value');
        userConfigMessageCreatorMock.verifyAll();
    });

    test('createBugFilingUrl', () => {
        expect(GitHubBugFilingService.createBugFilingUrl).not.toBeNull();
    });
});
