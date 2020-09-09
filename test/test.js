var fs = require('fs');

try {
    assertLibraryVersion()
    require('./render-svg.js')
    require('./nomnoml.spec.js')
}
catch(e) {
    fs.unlinkSync('dist/nomnoml.js')
    throw e
}

function assertLibraryVersion() {
    var library = require('../dist/nomnoml.js')
    var package = require('../package.json')
    var changelog = fs.readFileSync('changelog.md', { encoding: 'utf-8' })
    var versionMatch = changelog.match(/\d+\.\d+\.\d+/)
    var logVersion = versionMatch && versionMatch[0]
    if (library.version != package.version) {
        throw new Error('version of distribution bundle and npm package must match')
    }
    var isProductionVersion = !library.version.includes('-')
    if (isProductionVersion && library.version != logVersion) {
        throw new Error('production versions must be documented in changelog')
    }
}
