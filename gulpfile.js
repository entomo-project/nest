'use strict';
    
var gulp = require('gulp');
var babel = require('gulp-babel');
var debug = require('gulp-debug');
var rename = require('gulp-rename');
var del = require('del');
var plumber = require('gulp-plumber');

var paths = {
    views: [ 'src/Resources/views/**/*.jsx' ]
};

gulp.task('cleanCompiledJsx', function() {
    return del(['dist']);
});

gulp.task('jsxCompile', [ 'cleanCompiledJsx' ], function () {
    return gulp
        .src('src/Resources/views/**/*.jsx')
        .pipe(plumber())
        .pipe(debug({}))
        .pipe(babel({
            presets: ['react', 'es2015']
        }))
        .pipe(rename(function (path) {
            path.extname = '.js';
        }))
        .pipe(gulp.dest('dist'))
    ;
});

var watchDependencies = [ 'jsxCompile' ];

gulp.task('watch', watchDependencies, function () {
    gulp.watch(paths.views, watchDependencies);
});

gulp.task('default', [ 'jsxCompile' ]);