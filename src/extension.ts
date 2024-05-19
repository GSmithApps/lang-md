import * as vscode from 'vscode';
import { getHighlighter } from 'shiki';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('rustmd.start', async () => {

			// `getHighlighter` is async, it initializes the internal and
			// loads the themes and languages specified.
			const highlighter = await getHighlighter({
				themes: ['nord'],
				langs: ['javascript'],
			});
		
		})
	);
}

