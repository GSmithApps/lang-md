![image](demo.gif)

# The Idea

This vscode extension is part of literate programming -- it
flips how we think about comments and code.

In traditional
programming, the code is written freely, but the comments are
clunky and have a symbol
in front of them:

```
# this is a function to do some stuff
def dostuff():

    # here is where we do stuff
    print('hi')
```

But in this extension, that paradigm is flipped.  The
comments can be written freely, and the code is what needs a symbol
in front of it:

```
this is a function to do some stuff
$ def dostuff():

    here is where we do stuff
    $ print('hi')
```

# Usage

The command is `Rust MD: Open RustMd preview` (in
the command pallette).  This will open a panel similar
to the markdown preview. 

# Contributors 

## Running Locally

- Open this example in VS Code 1.47+
- `npm install`
- `npm run watch` or `npm run compile`
- `F5` to start debugging


## ToDo

- code wrapping for newline. for example, `fn divide`...
  it currently makes everything shrink or grow at its mercy
- bug with spans and indentation
- syntax highlighting
  - [ ] we're capturing numbers that are part of identifiers
        and treating them as if they're numbers -- not
        identifiers
  - [ ] file icon
  - [ ] improve syntax highlighting

## Add more language features

* To add features such as IntelliSense, hovers and validators check out the VS Code extenders documentation at https://code.visualstudio.com/docs

## Install your extension

* To start using your extension with Visual Studio Code copy it into the `<user home>/.vscode/extensions` folder and restart Code.


## publishing

- https://marketplace.visualstudio.com/manage/publishers/grantsmith
- https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/create-organization?view=azure-devops
- https://code.visualstudio.com/api/working-with-extensions/publishing-extension (`vsce publish`)

- [link to scopes](https://macromates.com/manual/en/language_grammars)
