// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { DeviceMetadata } from 'electron/flux/types/device-metadata';
import {
    CheckboxVisibility,
    DefaultButton,
    DetailsList,
    FontIcon,
    ISelection,
    Selection,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { AndroidSetupStepLayout, AndroidSetupStepLayoutProps } from './android-setup-step-layout';
import { CommonAndroidSetupStepProps } from './android-setup-types';
import { DeviceDescription } from './device-description';
import * as styles from './prompt-choose-device-step.scss';

export type PromptChooseDeviceStepState = {
    selectedDevice: DeviceMetadata;
};

export class PromptChooseDeviceStep extends React.Component<
    CommonAndroidSetupStepProps,
    PromptChooseDeviceStepState
> {
    private selection: ISelection;
    constructor(props) {
        super(props);
        this.state = { selectedDevice: null };

        this.selection = new Selection({
            onSelectionChanged: () => {
                const details = this.selection.getSelection();
                if (details.length > 0) {
                    this.setState({ selectedDevice: details[0] as DeviceMetadata });
                }
            },
        });
    }

    public render(): JSX.Element {
        const onNextButton = () => {
            // To be implemented in future feature work
            console.log(`androidSetupActionCreator.next()`);
        };

        const onRescanButton = () => {
            // To be implemented in future feature work
            console.log(`androidSetupActionCreator.rescan()`);
        };

        // Available devices will be retrieved from store in future feature work
        const devices: DeviceMetadata[] = [
            {
                description: 'Phone 1',
                isEmulator: true,
            },
            {
                description: 'Phone 2',
                isEmulator: false,
            },
            {
                description: 'Phone 3',
                isEmulator: true,
            },
        ];

        const items = devices.map(m => ({ metadata: m }));

        const layoutProps: AndroidSetupStepLayoutProps = {
            headerText: 'Choose which device to use',
            children: (
                <>
                    <p>{devices.length} Android devices or emulators connected</p>
                    <DefaultButton text="Rescan" onClick={onRescanButton} />
                    <DetailsList
                        setKey={'devices'}
                        compact={true}
                        ariaLabel="android devices"
                        className={styles.phoneList}
                        items={items}
                        selection={this.selection}
                        selectionMode={SelectionMode.single}
                        checkboxVisibility={CheckboxVisibility.always}
                        isHeaderVisible={false}
                        checkboxCellClassName={styles.checkmarkCell}
                        checkButtonAriaLabel="select"
                        onRenderCheckbox={checkboxProps => {
                            return checkboxProps.checked ? (
                                <>
                                    <FontIcon iconName="CheckMark" className={styles.checkmark} />
                                </>
                            ) : null;
                        }}
                        onRenderItemColumn={item => {
                            return (
                                <DeviceDescription
                                    className={styles.row}
                                    {...item.metadata}
                                ></DeviceDescription>
                            );
                        }}
                    />
                </>
            ),
            leftFooterButtonProps: {
                text: 'Close',
                onClick: _ => this.props.deps.closeApp(),
            },
            rightFooterButtonProps: {
                text: 'Next',
                disabled: this.state.selectedDevice === null,
                onClick: onNextButton,
            },
        };

        return <AndroidSetupStepLayout {...layoutProps}></AndroidSetupStepLayout>;
    }
}
