var fs = require('fs');

try {
    assertLibraryVersion()
    require('./render-svg.js')
    require('./nomnoml.spec.js')
}
catch(e) {
    fs.unlinkSync('dist/nomnoml.js', bundle)
    throw e
}

function assertLibraryVersion() {
    var library = require('../dist/nomnoml.js')
    var package = require('../package.json')
    if (library.version != package.version) {
        throw new Error('version of distribution bundle and npm package must match')
    }
}
