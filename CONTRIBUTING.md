# Contributing to nomnoml

To start contributing you will need to fork the repo on github and clone it first.

## Local setup

When you have your local clone of nomnoml follow these steps.

1. Install gulp.

        npm install -g gulp

2. Initialize npm and bower packages. (make sure you cd into the nomnoml clone directory first)

        npm install
        bower install

## Building

You can build the `dist/nomnoml.js` script easily by running `gulp` in the nomnoml directory.

## Testing

Before committing and before making a pull request it is useful to make sure that all unit tests are still working and that the usecases are also running fine. Here is a good procedure:

 1. Run `gulp`.
 2. Check `index.html`.
 3. Check `test/index.html`.
 4. Check `test/standalone.usecase.html`.
 5. Check `test/requirejs.usecase.html`.
