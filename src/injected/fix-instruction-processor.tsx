// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

type ColorMatch = {
    splitIndex: number;
    colorHexValue: string;
};

export class FixInstructionProcessor {
    private readonly colorGroupName = 'color';
    private readonly colorValueMatcher = `(?<${this.colorGroupName}>#[0-9a-f]{6})`;
    private readonly foregroundColorText = 'foreground color: ';
    private readonly foregroundRegExp = new RegExp(`${this.foregroundColorText}${this.colorValueMatcher}`, 'i');
    private readonly backgroundColorText = 'background color: ';
    private readonly backgroundRegExp = new RegExp(`${this.backgroundColorText}${this.colorValueMatcher}`, 'i');

    public process(fixInstruction: string): JSX.Element {
        const foregroundMatch = this.getColorMatch(fixInstruction, this.foregroundRegExp);
        const backgroundMatch = this.getColorMatch(fixInstruction, this.backgroundRegExp);

        const matches = [foregroundMatch, backgroundMatch];

        return this.splitFixInstruction(fixInstruction, matches);
    }

    private getColorMatch(fixInstruction: string, colorRegex: RegExp): ColorMatch {
        if (!colorRegex.test(fixInstruction)) {
            return null;
        }

        const match = colorRegex.exec(fixInstruction);

        const groups = match['groups'];

        return {
            splitIndex: match.index + this.foregroundColorText.length + 7,
            colorHexValue: groups[this.colorGroupName],
        };
    }

    private splitFixInstruction(fixInstruction: string, matches: ColorMatch[]): JSX.Element {
        const properMatches = matches.filter(current => current != null).sort((a, b) => a.splitIndex - b.splitIndex);

        if (properMatches.length === 0) {
            return <>{fixInstruction}</>;
        }

        let insertionIndex = 0;
        let keyIndex = 0;

        const result: JSX.Element[] = [];

        properMatches.forEach(match => {
            const substring = fixInstruction.substring(insertionIndex, match.splitIndex);

            result.push(<span key={`instruction-split-${keyIndex++}`}>{substring}</span>);

            result.push(this.createColorBox(match.colorHexValue, keyIndex++));

            insertionIndex = match.splitIndex;
        });

        const coda = fixInstruction.substr(insertionIndex);

        result.push(<span key={`instruction-split-${keyIndex++}`}>{coda}</span>);

        return <>{result}</>;
    }

    private createColorBox(colorHexValue: string, keyIndex: number): JSX.Element {
        return (
            <span key={`instruction-split-${keyIndex}`} className="fix-instruction-color-box" style={{ backgroundColor: colorHexValue }} />
        );
    }
}
