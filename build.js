var fs = require('fs');
var jison = require('jison');
var uglify = require('uglify-js');

var dagreSrc = read('node_modules/dagre/dist/dagre.min.js')
var dagreMinified = uglify.minify(dagreSrc).code;
fs.writeFileSync('lib/dagre.min.js', dagreMinified);

var grammar = new jison.Parser(read('src/nomnoml.jison'));
var parser = grammar.generate({moduleName: 'nomnomlCoreParser',moduleType:'js'})
var source = read('dist/nomnoml.compiled.js') + ';\n' + parser
var wrapper = read('bundleWrapper.js')
var bundle = replace(wrapper, '/*{{body}}*/', source)
fs.writeFileSync('dist/nomnoml.js', bundle)
fs.writeFileSync('dist/nomnoml.web.js', uglify.minify(dagreSrc + ';' + bundle).code)
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
