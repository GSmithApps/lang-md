import * as vscode from 'vscode';
import { BundledLanguage, BundledTheme, HighlighterGeneric, getHighlighter } from 'shiki';

// app.ts
import { renderContent } from './renderer';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('rustmd.start', async () => {

			// `getHighlighter` is async, it initializes the internal and
			// loads the themes and languages specified.
			const highlighter = await getHighlighter({
				themes: ['nord'],
				langs: ['javascript'],
			});
		
			RustMdPanel.createOrShow(context.extensionUri, highlighter);
		})
	);
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
	private _highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>;
	private _disposables: vscode.Disposable[] = [];
	private _debounceTimer?: NodeJS.Timeout;

	public static createOrShow(extensionUri: vscode.Uri, highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>) {
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
				column ? column + 1 : vscode.ViewColumn.One,
				{
					// Enable javascript in the webview
					enableScripts: true,
					// And restrict the webview to only loading content from our extension's `media` directory.
					localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
				},
			);
	
			RustMdPanel.currentPanel = new RustMdPanel(panel, extensionUri, highlighter);
		}

	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>) {
		this._panel = panel;
		this._panel.title = "RustMd Panel Title";
		this._extensionUri = extensionUri;
		this._highlighter = highlighter;
		
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

		vscode.window.onDidChangeActiveTextEditor(
			editor => {
				if (editor && this._panel.visible) {
					// The active editor has changed. You can run your code here.
					this._update();
				}
			},
			null,
			this._disposables
		);

        vscode.workspace.onDidChangeTextDocument(
            event => {
                if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
                    this.debouncedUpdate(1000);
                }
            },
            null,
            this._disposables
        );

	}

    private debouncedUpdate(delay: number) {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => this._update(), delay);
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


		// then later you can use `highlighter.codeToHtml` synchronously
		// with the loaded themes and languages.
		const code = this._highlighter.codeToHtml('const a = 1', {
			lang: 'javascript',
			theme: 'nord'
		});

        // Get the active text editor's content
        const editor = vscode.window.activeTextEditor;
		const fileExtension = editor ? editor.document.fileName.split('.').pop() : 'No active editor';
		const language = fileExtension ? fileExtension.substring(0, fileExtension.length - 2) : 'none';
        const text = editor ? renderContent(editor.document.getText(), language) : 'No active editor';
		const currentTheme = vscode.workspace.getConfiguration().get<string>('workbench.colorTheme');

		this._panel.webview.html = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">

			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			
			<link href="${this._stylesResetUri}" rel="stylesheet">
			<link href="${this._stylesMainUri}" rel="stylesheet">
			<link href="${this._myStylesMainUri}" rel="stylesheet">
			</head>
			<body>
			<div>${code}</div>
			<div>${text}</div>
			
		</body>
		</html>`;
	
		return;
	}
}

