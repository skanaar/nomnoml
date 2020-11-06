var fs = require('fs');
var jison = require('jison');

var grammar = fs.readFileSync('src/nomnoml.jison', 'utf8');
var parserFactory = new jison.Parser(grammar);
var parser = parserFactory.generate({
  moduleName: 'nomnomlCoreParser',
  moduleType: 'js'
});
fs.writeFileSync('dist/nomnoml-core-parser.js', parser + '; export default nomnomlCoreParser;');