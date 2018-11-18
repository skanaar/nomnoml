# Contributing to nomnoml

To start contributing you will need to fork the repo on github and clone it first.

## Building

Running `node build.js` will run the linter, the tests and bundle a stand alone AMD, node and globals compatible library to `dist/nomnoml.js`.

## Testing

Before committing and before making a pull request it is useful to make sure that all unit tests are still working and that the usecases are also running fine. Here is a good procedure:

 1. Run `node build.js`
 2. Check `index.html`
 3. Check `test/index.html`
 4. Run `nom run-script test_cli`
 5. Check `test/output.node-test.svg`
