import * as vscode from 'vscode';

// app.ts
import { greet } from './extrafile';

console.log(greet('Alice'));  // Output: Hello, Alice!


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('rustmd.start', () => {
			RustMdPanel.createOrShow(context.extensionUri);
		})
	);

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(RustMdPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				// Reset the webview options so we use latest uri for `localResourceRoots`.
				webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
				RustMdPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}
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

	public static readonly viewType = 'catCoding';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (RustMdPanel.currentPanel) {
			RustMdPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			RustMdPanel.viewType,
			'Rust MD',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		RustMdPanel.currentPanel = new RustMdPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		RustMdPanel.currentPanel = new RustMdPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

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

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
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
		const webview = this._panel.webview;

		this._panel.title = "RustMd Panel Title";
		
		// Local path to main script and css styles to run in the webview
		const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
		
		// And the uri we use to load this script and styles in the webview
		const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

        // Get the active text editor's content
        const editor = vscode.window.activeTextEditor;
        const text = editor ? editor.document.getText() : 'No active editor';
		
		this._panel.webview.html = `<!DOCTYPE html>
			<html lang="en">
			<head>
			<meta charset="UTF-8">

			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			
			<link href="${stylesResetUri}" rel="stylesheet">
			<link href="${stylesMainUri}" rel="stylesheet">
			
			<title>Rust MD</title>
			</head>
			<body>

			<h1>Hey Everyone</h1>
			<p>${text}</p>
			<div id="content"></div>
			
			</body>
			</html>`;

		return;
	}
}


// function renderContent(input_text: string) {
//     const lines = input_text.split('\n');
//     const container = document.getElementById('content');

//     const colordebug = false;

//     for (let i = 0; i < lines.length - 1; i++) {

//         const line = lines[i];
        
//         const trimmedLine = line.trim();
//         if (trimmedLine === '') {
//             const empty = document.createElement('br');
//             container.appendChild(empty);
//         } else {

//             // count the number of spaces at the beginning of the line
//             let spaces = 0;
//             while (line[spaces] === ' ') {
//                 spaces++;
//             }
    
//             const pre = document.createElement('pre');
//             const code = document.createElement('code');
//             pre.style.margin = '0px';
//             pre.style.padding = '0px';
            
//             // set the text content to be the number of spaces
//             code.textContent = ' '.repeat(spaces);
            
//             // set the background color to gray if we are in debug mode
//             if (colordebug) {code.style.backgroundColor = 'gray'};
            
//             container.appendChild(pre);
//             pre.appendChild(code);
            
//             if (trimmedLine.startsWith('$')) {
//                 const pre = document.createElement('pre');
//                 const code = document.createElement('code');
//                 code.className = 'language-rust';
//                 pre.style.margin = '0px';
//                 pre.style.padding = '0px';
//                 pre.style.backgroundColor = 'black';
                
//                 code.textContent = trimmedLine.slice(2); // Assuming you slice the first two characters to remove '$ '
                
//                 // Set the background color to light red if in debug mode
//                 if (colordebug) {
//                     pre.style.backgroundColor = 'lightcoral'; // Set on `<pre>` for overall background
//                 }
                
//                 container.appendChild(pre);
//                 pre.appendChild(code);
                
//                 // Adding an empty line after each code block might be unnecessary with `<pre>`, but if needed:
//                 const empty = document.createElement('br');
//                 container.appendChild(empty);
                
//             } else {
//                 const text = document.createElement('span');
//                 // text.textContent = trimmedLine + ' ';
//                 text.textContent = trimmedLine;
//                 // set the background color to light blue if we are in debug mode
//                 if (colordebug) {text.style.backgroundColor = 'lightblue';}
                
//                 if (i === lines.length - 1) {break;}
                
//                 const nextlineTrimmed = lines[i + 1].trim();
                
//                 if (nextlineTrimmed === '' || nextlineTrimmed.startsWith('$')) {
                    
//                     container.appendChild(text);
//                     const empty = document.createElement('br');
//                     container.appendChild(empty);
                    
//                 } else {
                    
//                     text.textContent = text.textContent + ' ';
//                     container.appendChild(text);

//                 }
                
//             }

//         }

//     }

// }

