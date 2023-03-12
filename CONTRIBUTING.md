# Contributing to nomnoml

To start contributing you will need to fork the repo on github and clone it first.

Unit tests use the node-native `node:test` module so at least **Node v19.6.0** is required for development.

## Building

Running `npm run build` will compile the nomnoml library, the webapp and run all tests.

## Testing

Before committing and before making a pull request make sure that all unit tests and usecase tests are ok. Here is a good procedure:

1.  Run `npm run build`
2.  Check `index.html`
3.  Check `test/index.html`
