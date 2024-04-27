// Import Prism
const Prism = require('prismjs');

// Load the language component you need
require('prismjs/components/prism-rust');

document.addEventListener('DOMContentLoaded', function() {
    fetch('./example.rstmd')
    .then(response => response.text())
    .then(data => {
        renderContent(data);
        Prism.highlightAll();
    });
});

function renderContent(data) {
    const lines = data.split('\n');
    const container = document.getElementById('content');

    colordebug = false;

    for (let i = 0; i < lines.length - 1; i++) {

        const line = lines[i];
        
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
            const empty = document.createElement('br');
            container.appendChild(empty);
        } else {

            // count the number of spaces at the beginning of the line
            let spaces = 0;
            while (line[spaces] === ' ') {
                spaces++;
            }
    
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            pre.style.margin = '0px';
            pre.style.padding = '0px';
            
            // set the text content to be the number of spaces
            code.textContent = ' '.repeat(spaces);
            
            // set the background color to gray if we are in debug mode
            if (colordebug) {indent.style.backgroundColor = 'gray'};
            
            container.appendChild(pre);
            pre.appendChild(code);
            
            if (trimmedLine.startsWith('$')) {
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.className = 'language-rust';
                pre.style.margin = '0px';
                pre.style.padding = '0px';
                pre.style.backgroundColor = 'black';
                
                code.textContent = trimmedLine.slice(2); // Assuming you slice the first two characters to remove '$ '
                
                // Set the background color to light red if in debug mode
                if (colordebug) {
                    pre.style.backgroundColor = 'lightcoral'; // Set on `<pre>` for overall background
                }
                
                container.appendChild(pre);
                pre.appendChild(code);
                
                // Adding an empty line after each code block might be unnecessary with `<pre>`, but if needed:
                const empty = document.createElement('br');
                container.appendChild(empty);
                
            } else {
                const text = document.createElement('span');
                // text.textContent = trimmedLine + ' ';
                text.textContent = trimmedLine;
                // set the background color to light blue if we are in debug mode
                if (colordebug) {text.style.backgroundColor = 'lightblue'};
                
                if (i === lines.length - 1) {break;}
                
                const nextlineTrimmed = lines[i + 1].trim();
                
                if (nextlineTrimmed === '' || nextlineTrimmed.startsWith('$')) {
                    
                    container.appendChild(text);
                    const empty = document.createElement('br');
                    container.appendChild(empty);
                    
                } else {
                    
                    text.textContent = text.textContent + ' ';
                    container.appendChild(text);

                }
                
            }

        }

    };

}
