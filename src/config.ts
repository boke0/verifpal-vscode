/* SPDX-FileCopyrightText: © 2019-2020 Nadim Kobeissi <nadim@symbolic.software>
 * SPDX-License-Identifier: GPL-3.0-only */

/// <reference path="./cross-spawn.d.ts" />
import { spawn } from 'cross-spawn';
import { window, workspace } from 'vscode';
import * as fs from 'fs';

const VERIFPAL_NOT_FOUND = `[Verifpal] Specify Verifpal's location in your user config using verifpal.path.`

export function configGetPath(): string {
	const config = workspace.getConfiguration('verifpal');
	if (config) {
		return config.get('path').toString();
	}
	return '';
}

export function configGetEnabled() {
	return workspace.getConfiguration('verifpal').get('enabled')
}

export function configDeterminePath() {
	let pathToVerifpal = '';
	const localInstall = configGetPath()
	if (fs.existsSync(localInstall)) {
		pathToVerifpal = localInstall;
	} else {
		pathToVerifpal = 'verifpal';
	}
	return pathToVerifpal;
}