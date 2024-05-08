// each line can be of 3 types: code, text, blank
// enum lineType {
//     code,
//     text,
//     blank,
// }

export function renderContent(input_text: string, language: string) {

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

			const indentation_blank_string = `<pre style="margin: 0px; padding: 0px; ${colorDebugStyle}"><code style="margin: 0px; padding: 0px; background-color: var(--vscode-editor-background);display: inline;" class="language-${language}">${' '.repeat(spaces)}</code></pre>`;
            
            if (isTrimmedLineCode(trimmedLine)) {
				
				const codeColorDebugStyle = colordebug ? 'background-color: lightcoral;' : '';
	
				html_string += indentation_blank_string;
				
				html_string += `<pre style="margin: 0px; padding: 0px; ${codeColorDebugStyle}"><code style="margin: 0px; padding: 0px;display: inline;" class="language-${language}">${trimmedLine.slice(2)}</code></pre>`;
                
                html_string += '<br>';
                
            } else {
				
				const textDebugStyle = colordebug ? 'background-color: lightblue;' : '';
                
                // add on the text depending on the previous line. 
                //
                // If there is no previous line (i.e. the first line), then treat
                // the line like the previous was code or blank -- which means to add
                // the indentation in front.
                //
                // if the previous line is text, then add a space in front of the line,
                // but not the indentation.
                //
                // Also, as a note, in here we get kind of lucky that if we keep adding
                // spans, and if they overflow the line, they will automatically wrap
                // to the next line but keep the indentation. NOPE - THIS IS A BUG
				if (
                    i === 0 ||
                    isTrimmedLineCode(lines[i - 1].trim()) ||
                    isTrimmedLineBlank(lines[i - 1].trim())
                ) {
					
                    // either we are in the first line, or the previous line is code or blank.
                    // which means the previous line is not text.
					html_string += indentation_blank_string + `<span style="${textDebugStyle}">` + trimmedLine + '</span>';
					
				} else {

                    // previous line does not start with $ and is not totally blank.
                    // which means the previous line is text -- it is not code or blank.
					html_string += `<span style="${textDebugStyle}">` + " " + trimmedLine + '</span>';

				}
				
                // break if this is the last line.
				if (i === lines.length - 1) {break;}
				
                // if the next line is code or blank, then add a break.
				const nextlineTrimmed = lines[i + 1].trim();
				if (
                    isTrimmedLineCode(nextlineTrimmed) ||
                    isTrimmedLineBlank(nextlineTrimmed)
                ) {html_string += '<br>';}
                
            }

        }

    }

	return html_string;

}

function isTrimmedLineCode(line: string) {
    return line.startsWith('$');
}

function isTrimmedLineBlank(line: string) {
    return line === '';
}
