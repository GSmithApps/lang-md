import * as vscode from 'vscode';
import hljs from 'highlight.js'; // ES6 import


// app.ts
import { renderContent } from './renderer';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('rustmd.start', () => {
			RustMdPanel.createOrShow(context.extensionUri);
		})
	);
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

/**
 * Manages rustmd webview panels
 */
class RustMdPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: RustMdPanel | undefined;

	public static readonly viewType = 'rustMD';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private readonly _stylesResetUri: vscode.Uri;
	private readonly _stylesMainUri: vscode.Uri;
	private readonly _myStylesMainUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (RustMdPanel.currentPanel) {
			RustMdPanel.currentPanel._panel.reveal(column);

		} else {

			// Otherwise, create a new panel.
			const panel = vscode.window.createWebviewPanel(
				RustMdPanel.viewType,
				'Rust MD',
				column || vscode.ViewColumn.Two,
				getWebviewOptions(extensionUri),
			);
	
			RustMdPanel.currentPanel = new RustMdPanel(panel, extensionUri);
		}

	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		RustMdPanel.currentPanel = new RustMdPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._panel.title = "RustMd Panel Title";
		this._extensionUri = extensionUri;

		// Local path to main script and css styles to run in the webview
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
		const myStylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css');
		
		// And the uri we use to load this script and styles in the webview
		this._stylesResetUri = this._panel.webview.asWebviewUri(styleResetPath);
		this._stylesMainUri = this._panel.webview.asWebviewUri(stylesPathMainPath);
		this._myStylesMainUri = this._panel.webview.asWebviewUri(myStylesPathMainPath);

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			e => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

	}

	public dispose() {
		RustMdPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update() {

        // Get the active text editor's content
        const editor = vscode.window.activeTextEditor;
        const text = editor ? renderContent(editor.document.getText()) : 'No active editor';
		
		this._panel.webview.html = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">

			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			
			<link href="${this._stylesResetUri}" rel="stylesheet">
			<link href="${this._stylesMainUri}" rel="stylesheet">
			<link href="${this._myStylesMainUri}" rel="stylesheet">
			<link href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release/build/styles/default.min.css" rel="stylesheet">
			<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release/build/highlight.min.js"></script>
			</head>
			<body>
			
			<div>${text}</div>
			<script>hljs.highlightAll();</script>
			
		</body>
		</html>`;
	
		return;
	}
}

