#! /usr/bin/env node
var fs = require('fs')
var nomnoml = require('./nomnoml.js')

var args = process.argv

if (args[2] == '--help' || args.length == 2){
  console.log(`
  Nomnoml command line utility for generating SVG diagrams.

  Load source file and send rendered svg to stdout:

  > node nomnoml-cli.js <source_file>

  Load source file and save rendered svg to <output_file>:
  
  > node nomnoml-cli.js <source_file> <output_file>

  Third parameter overrides the import depth limit
  that protects us from recursive imports:

  > node nomnoml-cli.js <source_file> <output_file> <max_import_chain_length>`)
  return
}

var maxImportChainLength = args[4] || 10

var svg = nomnoml.renderSvg(preprocessFile(args[2], 0))
if (args[3]){
  fs.writeFileSync(args[3], svg)
}
else {
  console.log(svg)
}

function preprocessFile(filepath, depth){
  if (depth > maxImportChainLength)
    throw Error('max_import_chain_length exceeded')
  var source = fs.readFileSync(filepath, {encoding:'utf8'})
  return source.replace(/#import: *(.*)/g, function (a, file) {
    return preprocessFile(file, depth+1)
  })
}