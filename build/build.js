var fs = require('fs');
var jison = require('jison');

async function build() {
  var graphre = read('../graphre/dist/graphre.js')
  var grammar = new jison.Parser(read('src/nomnoml.jison'));
  var parser = grammar.generate({moduleName: 'nomnomlCoreParser',moduleType:'js'})
  var source = read('dist/nomnoml.compiled.js') + ';\n' + parser
  var wrapper = read('build/umd-bundle.js.template')
  var bundle = replace(wrapper, '/*{{body}}*/', source)
  fs.writeFileSync('dist/nomnoml.js', bundle)
  fs.writeFileSync('dist/nomnoml.web.js', graphre + ';' + bundle)
  fs.unlinkSync('dist/nomnoml.compiled.js')
}

build()

function read(file){
    return fs.readFileSync(file, { encoding: 'utf8' })
}

function replace(source, token, replacement){
    return source.split(token).join(replacement)
}