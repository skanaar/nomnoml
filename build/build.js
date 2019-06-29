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
var wrapper = read('build/umd-bundle.js.template')
var bundle = replace(wrapper, '/*{{body}}*/', source)
fs.writeFileSync('dist/nomnoml.js', bundle)
fs.writeFileSync('dist/nomnoml.web.js', dagreSrc + ';' + bundle)
fs.unlinkSync('dist/nomnoml.compiled.js')

function read(file){
    return fs.readFileSync(file, { encoding: 'utf8' })
}

function replace(source, token, replacement){
    return source.split(token).join(replacement)
}