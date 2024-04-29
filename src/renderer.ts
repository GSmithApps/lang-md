
export function renderContent(input_text: string) {

	let html_string = '';

    const lines = input_text.split('\n');

    const colordebug = false;

    for (let i = 0; i < lines.length - 1; i++) {

        const line = lines[i];
        
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
			html_string += '<br>';
        } else {

            // count the number of spaces at the beginning of the line
            let spaces = 0;
            while (line[spaces] === ' ') {
                spaces++;
            }
    
            // set the background color to gray if we are in debug mode
			const colorDebugStyle = colordebug ? 'background-color: lightgray;' : '';

			const indentation_blank_string = `<pre style="margin: 0px; padding: 0px; background-color: var(--vscode-editor-background); ${colorDebugStyle}"><code style="margin: 0px; padding: 0px; background-color: var(--vscode-editor-background);" class="language-rust">${' '.repeat(spaces)}</code></pre>`;
            
            if (trimmedLine.startsWith('$')) {
				
				const codeColorDebugStyle = colordebug ? 'background-color: lightcoral;' : '';
	
				html_string += indentation_blank_string;
				
				html_string += `<pre style="margin: 0px; padding: 0px; background-color: var(--vscode-editor-background); ${codeColorDebugStyle}"><code style="margin: 0px; padding: 0px; background-color: var(--vscode-editor-background);" class="language-rust">${trimmedLine.slice(2)}</code></pre>`;
                
                html_string += '<br>';
                
            } else {
				
				const textDebugStyle = colordebug ? 'background-color: lightblue;' : '';
                
				if (i === 0 || !isTrimmedLineNaturalLanguage(lines[i - 1].trim())) {
					
					html_string += indentation_blank_string + `<span style="${textDebugStyle}">` + trimmedLine + '</span>';
					
				} else {

					html_string += `<span style="${textDebugStyle}">` + " " + trimmedLine + '</span>';

				}
				
				if (i === lines.length - 1) {break;}
				
				const nextlineTrimmed = lines[i + 1].trim();
				if (!isTrimmedLineNaturalLanguage(nextlineTrimmed)) {html_string += '<br>';}
                
            }

        }

    }

	return html_string;

}

// natural language line if not blank and not starting with a $ sign
function isTrimmedLineNaturalLanguage(line: string) {
	return line !== '' && !line.startsWith('$');
}