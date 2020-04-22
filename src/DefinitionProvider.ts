/* SPDX-FileCopyrightText: © 2019-2020 Nadim Kobeissi <nadim@symbolic.software>
 * SPDX-License-Identifier: GPL-3.0-only */

import * as console from 'console';
import * as vscode from 'vscode';
import VerifpalLib from './VerifpalLib';
import * as Path from 'path';


export default class DefinitionProvider {
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
    ): Promise<vscode.Location | vscode.Location[]> {
        const fileContents = document.getText();
        const definitionPromise = VerifpalLib.getDefinition(fileContents, document.uri.fsPath, position);
        return definitionPromise.then((definition) => {

            if (definition) {
                const startPosition = new vscode.Position(definition.line - 1, definition.start - 1);
                const endPosition = new vscode.Position(definition.endline - 1, definition.end - 1);
                const uri = vscode.Uri.file(definition.path);

                return new vscode.Location(uri, new vscode.Range(startPosition, endPosition));
            }
            return null;
        });
    }
}