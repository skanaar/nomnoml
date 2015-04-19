var gulp = require('gulp');
var concat = require('gulp-concat');

var nomnomlFiles = [
    'lib/_skanaar.js',
    'lib/skanaar.canvas.js',
    'nomnoml.vectorMath.js',
    'nomnoml.jison.js',
    'nomnoml.parser.js',
    'nomnoml.layouter.js',
    'nomnoml.renderer.js',
    'nomnoml.js'
]

gulp.task('default', function () {
    gulp.src(nomnomlFiles)
        .pipe(concat('nomnoml.js'))
        .pipe(gulp.dest('dist/'));
});
