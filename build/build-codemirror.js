var fs = require('fs');
var uglify = require('uglify-js');

var rawCodeMirrorSource = [
    read('build/codemirror/codemirror.js'),
    read('build/codemirror/matchbrackets.js'),
    read('build/codemirror/sublime.js'),
].join(';\n\n')
fs.writeFileSync('build/codemirror/codemirror-compressed.js', uglify.minify(rawCodeMirrorSource).code);

function read(file){
    return fs.readFileSync(file, { encoding: 'utf8' })
}
