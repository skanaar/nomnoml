var fs = require('fs');
var jison = require('jison');
var jshint = require('jshint').JSHINT;

var nomnomlParser = new jison.Parser(fs.readFileSync('src/nomnoml.jison', { encoding: 'utf8' }));
fs.writeFileSync('src/jison-parser.js', nomnomlParser.generate({moduleName: 'nomnomlCoreParser',moduleType:'js'}));

var nomnomlFiles = [
    'src/skanaar.canvas.js',
    'src/skanaar.util.js',
    'src/skanaar.vector.js',
    'src/skanaar.svg.js',
    'src/jison-parser.js',
    'src/parser.js',
    'src/visuals.js',
    'src/layouter.js',
    'src/renderer.js',
    'src/nomnoml.js'
];

var jshintConfig = JSON.parse(fs.readFileSync('./.jshintrc', { encoding: 'utf8' }))

function lint(filename, source) {
    jshint(source, jshintConfig, jshintConfig.globals)
    jshint.errors.forEach(e => console.log(e.id, filename+'#'+e.line, e.reason))
    //jshint.errors.forEach(e => console.log(e))
    if (jshint.errors.length)
        throw new Error('linting rules broken')
}

function concat(files){
    return files.map(function (filename){
        var source = fs.readFileSync(filename, { encoding: 'utf8' })
        if (!filename.includes('jison')) lint(filename, source)
        return source
    }).join(';\n')
}

function replace(source, token, replacement){
    return source.split(token).join(replacement)
}

var wrapper = fs.readFileSync('bundleWrapper.js', { encoding: 'utf8' })
var bundle = replace(wrapper, '/*{{body}}*/', concat(nomnomlFiles))

fs.writeFileSync('dist/nomnoml.js', bundle)

require('./test/render-svg.js')

try {
    require('./test/nomnoml.spec.js')
}
catch(e) {
    fs.unlinkSync('dist/nomnoml.js', bundle)
    throw e
}
