var fs = require('fs');
var jison = require('jison');

var nomnomlParser = new jison.Parser(fs.readFileSync('nomnoml.jison', { encoding: 'utf8' }));
fs.writeFileSync('nomnoml.jison.js', nomnomlParser.generate({moduleName: 'nomnomlCoreParser'}));

var nomnomlFiles = [
    'skanaar.canvas.js',
    'skanaar.util.js',
    'skanaar.vector.js',
    'skanaar.svg.js',
    'nomnoml.jison.js',
    'nomnoml.parser.js',
    'nomnoml.visuals.js',
    'nomnoml.layouter.js',
    'nomnoml.renderer.js',
    'nomnoml.js'
];

function concat(files){
    return files.map(function (filename){
        return fs.readFileSync(filename, { encoding: 'utf8' })
    }).join(';\n')
}

function replace(source, token, replacement){
    return source.split(token).join(replacement)
}

var wrapper = fs.readFileSync('bundleWrapper.js', { encoding: 'utf8' })
var bundle = replace(wrapper, '/*{{body}}*/', concat(nomnomlFiles))

fs.writeFileSync('dist/nomnoml.js', bundle)
