var gulp = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');

var nomnomlFiles = [
    'lib/_skanaar.js',
    'lib/skanaar.canvas.js',
    'nomnoml.vectorMath.js',
    'nomnoml.jison.js',
    'nomnoml.parser.js',
    'nomnoml.layouter.js',
    'nomnoml.renderer.js',
    'nomnoml.js'
];
var ftr = [
    '',
    '\tif (typeof define === "function" && define.amd) define(nomnoml);',
    '\telse if (typeof module === "object" && module.exports) module.exports = nomnoml;',
    '\tthis.nomnoml = nomnoml;',
    '})();'
].join('\n');

gulp.task('default', function () {
    gulp.src(nomnomlFiles)
        .pipe(concat('nomnoml.js'))
        .pipe(header('(function () {\n'))
        .pipe(footer(ftr))
        .pipe(gulp.dest('dist/'));
});
