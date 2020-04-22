/* SPDX-FileCopyrightText: © 2019-2020 Nadim Kobeissi <nadim@symbolic.software>
 * SPDX-License-Identifier: GPL-3.0-only */

import * as vscode from 'vscode';
import VerifpalLib from './VerifpalLib';

export default class CoverageDecorations {
    private notCoveredLine: vscode.TextEditorDecorationType;
    private _listener: vscode.Disposable;
    private coverageData: any;
    private _decorationsOn: boolean;
    private _statusBar: vscode.StatusBarItem;
    constructor(disposables) {
        this.notCoveredLine = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'darkred'
        });
        this._decorationsOn = false;
        this._statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.coverageData = {};
        disposables.push(
            vscode.window.onDidChangeActiveTextEditor(() => this.refreshCoverage())
        );
        disposables.push(
            vscode.workspace.onDidSaveTextDocument(() => this.refreshCoverage())
        );
    }
    refreshCoverage() {
        vscode.window.visibleTextEditors.forEach((editor) => {
            this.getCoverage(editor).then((coverageResp) => {
                if (coverageResp) {
                    this.coverageUpdated(coverageResp, editor);
                }
            });
        });
    }
    toggleDecorations() {
        this._decorationsOn = this._decorationsOn ? false : true;
    }
    coverageUpdated(coverageData, editor) {
        const activeEditor = vscode.window.activeTextEditor;
        const filename = editor.document.uri.fsPath;
        this.coverageData[filename] = coverageData;
        if (activeEditor) {
            const currentFilename = activeEditor.document.uri.fsPath;
            const currentCoverage = this.coverageData[currentFilename];
            if (currentCoverage) {
                const coverageRatio = coverageData.covered_count / (coverageData.covered_count + coverageData.uncovered_count);
                const coveragePercent = Number(coverageRatio * 100).toFixed(0);
                this._statusBar.text = `Flow coverage ${coveragePercent}%`;
                this._statusBar.show();
            } else {
                this._statusBar.hide();
            }
        } else {
            this._statusBar.hide();
        }
        this._updateEditor(editor, filename);
    }
    mapToRanges(filename) {
        return this.coverageData[filename].uncovered_locs.map((detail) => (
            new vscode.Range(detail.start.line - 1, detail.start.column - 1, detail.end.line - 1, detail.end.column)
        ));
    }
    getCoverage(editor): any {
        const filename = editor.document.uri.fsPath;
        const text = editor.document.getText();
        if (!text) {
            return new Promise((resolve, reject) => resolve());
        }
        return VerifpalLib.getCoverage(text, filename).then((coverage) => {
            if (coverage) {
                return coverage.expressions;
            }
        });
    }
    _updateEditor(editor, filename) {
        if (!editor) {
            return;
        }
        if (this._decorationsOn) {
            editor.setDecorations(this.notCoveredLine, this.mapToRanges(filename));
        } else {
            editor.setDecorations(this.notCoveredLine, []);
        }
    }
}