var fs = require('fs');
var jison = require('jison');
var terser = require('terser');

var package = require('../package.json');
var dagreMinifiedFile = 'cache/dagre-' + package.dependencies.dagre + '.js';
var dagreMinified = ''

async function build() {
  // minification is slow so only run this on-demand
  if (fs.existsSync(dagreMinifiedFile)) {
    dagreMinified = read(dagreMinifiedFile)
  } else {
    dagreMinified = (await terser.minify(read('node_modules/dagre/dist/dagre.min.js'))).code
    fs.mkdirSync('cache', { recursive: true })
    fs.writeFileSync(dagreMinifiedFile, dagreMinified)
  }

  var grammar = new jison.Parser(read('src/nomnoml.jison'));
  var parser = grammar.generate({moduleName: 'nomnomlCoreParser',moduleType:'js'})
  var source = read('dist/nomnoml.compiled.js') + ';\n' + parser
  var wrapper = read('build/umd-bundle.js.template')
  var bundle = replace(wrapper, '/*{{body}}*/', source)
  fs.writeFileSync('dist/nomnoml.js', bundle)
  fs.writeFileSync('dist/nomnoml.web.js', dagreMinified + ';' + bundle)
  fs.unlinkSync('dist/nomnoml.compiled.js')
}

build()

function read(file){
    return fs.readFileSync(file, { encoding: 'utf8' })
}

function replace(source, token, replacement){
    return source.split(token).join(replacement)
}