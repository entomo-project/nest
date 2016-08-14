(function () {
  'use strict';

  const gulpInit = require('./init')
  const filePaths = require('./paths').file

  const gulp = require('gulp')
  const conf = require('./conf')
  const babel = require('gulp-babel')
  const del = require('del')

  gulp.task('build:js:clean', function () {
    return del(filePaths.dist.self)
  })

  gulp.task('build:js', ['build:js:clean'], function () {
    return gulpInit(filePaths.src.self + '/**/*.js')
      .pipe(babel(conf.babel.query))
      .pipe(gulp.dest(filePaths.dist.self))
  })
}())