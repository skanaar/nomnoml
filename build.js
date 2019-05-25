var fs = require('fs');
var jison = require('jison');
var uglify = require('uglify-js');

// minification is slow so only run this on-demand
if (!fs.existsSync('lib/dagre.min.js')) {
    var dagreRawSrc = read('node_modules/dagre/dist/dagre.min.js')
    fs.writeFileSync('lib/dagre.min.js', uglify.minify(dagreRawSrc).code);
}

var dagreSrc = read('lib/dagre.min.js')
var grammar = new jison.Parser(read('src/nomnoml.jison'));
var parser = grammar.generate({moduleName: 'nomnomlCoreParser',moduleType:'js'})
var source = read('dist/nomnoml.compiled.js') + ';\n' + parser
var wrapper = read('bundleWrapper.js')
var bundle = replace(wrapper, '/*{{body}}*/', source)
fs.writeFileSync('dist/nomnoml.js', bundle)
fs.writeFileSync('dist/nomnoml.web.js', dagreSrc + ';' + bundle)
fs.unlinkSync('dist/nomnoml.compiled.js')

try {
    assertLibraryVersion()
    require('./test/render-svg.js')
    require('./test/nomnoml.spec.js')
}
catch(e) {
    fs.unlinkSync('dist/nomnoml.js', bundle)
    throw e
}

function read(file){
    return fs.readFileSync(file, { encoding: 'utf8' })
}

function replace(source, token, replacement){
    return source.split(token).join(replacement)
}

function assertLibraryVersion() {
    var library = require('./dist/nomnoml.js')
    var package = require('./package.json')
    if (library.version != package.version) {
        throw new Error('version of distribution bundle and npm package must match')
    }
}
