var fs = require('fs');

var grammar = fs.readFileSync('src/nomnoml.jison', 'utf8');
var parserFactory = new jison.Parser(grammar);
var parser = parserFactory.generate({
  moduleName: 'nomnomlCoreParser',
  moduleType:'commonjs'
});
fs.writeFileSync('dist/nomnoml-core-parser.js', parser);