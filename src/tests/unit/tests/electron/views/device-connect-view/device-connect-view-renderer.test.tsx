// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BrowserWindow } from 'electron';
import { RootContainerRenderer } from 'electron/views/device-connect-view/device-connect-view-renderer';
import { RootContainer, RootContainerProps } from 'electron/views/root-container/components/root-container';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IMock, It, Mock } from 'typemoq';

describe('DeviceConnectViewRendererTest', () => {
    test('render', () => {
        const dom = document.createElement('div');
        const containerDiv = document.createElement('div');
        const renderMock: IMock<typeof ReactDOM.render> = Mock.ofInstance(() => null);

        const browserWindow: BrowserWindow = {
            close: () => {
                return;
            },
        } as BrowserWindow;

        containerDiv.setAttribute('id', 'device-connect-view-container');
        dom.appendChild(containerDiv);

        const props = {
            deps: {
                currentWindow: browserWindow,
            },
        } as RootContainerProps;

        const expectedComponent = <RootContainer {...props} />;

        renderMock.setup(r => r(It.isValue(expectedComponent), containerDiv)).verifiable();

        const renderer = new RootContainerRenderer(renderMock.object, dom, props);

        renderer.render();

        renderMock.verifyAll();
    });
});
