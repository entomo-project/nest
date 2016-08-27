(function () {
  'use strict';

  const webPaths = require('./paths').web
  const filePaths = require('./paths').file
  const gulp = require('gulp')
  const replace = require('gulp-replace')
  const merge = require('merge-stream')
  const uglifyCss = require('gulp-uglifycss')
  const concat = require('gulp-concat')
  const gulpInit = require('./init')
  const less = require('gulp-less')
  const rename = require('gulp-rename')

  gulp.task('build:static:css:vendor:font-awesome:fonts', function () {
    return gulpInit(filePaths.vendor.fontAwesome.fonts + '/*')
      .pipe(gulp.dest(filePaths.static.vendor.fontAwesome.fonts))
  })

  gulp.task('build:static:css:vendor:bootstrap:fonts', function () {
    return gulpInit(filePaths.vendor.bootstrap.fonts + '/*')
      .pipe(gulp.dest(filePaths.static.vendor.bootstrap.fonts))
  })

  function getFontAwesomeCssStream() {
    return gulpInit(filePaths.vendor.fontAwesome.css.main)
      .pipe(
        replace(
          /url\('\.\.\/fonts\/(.*?)'\)/g,
          'url(\'' + webPaths.static.vendor.fontAwesome.fonts +'/$1\')')
      )
  }

  function getBootstrapCssStream() {
    return gulpInit(filePaths.vendor.bootstrap.css.main)
      .pipe(
        replace(
          /url\('\.\.\/fonts\/(.*?)'\)/g,
          'url(\'' + webPaths.static.vendor.bootstrap.fonts +'/$1\')')
      )
  }

  function getOtherVendorCssStream() {
    return gulpInit([
      filePaths.vendor.bmichalskiReactTable.css.main
    ])
  }

  gulp.task('build:static:css:vendor', ['build:static:css:vendor:font-awesome:fonts', 'build:static:css:vendor:bootstrap:fonts'], function () {
    return merge(
        getFontAwesomeCssStream(),
        getBootstrapCssStream(),
        getOtherVendorCssStream()
      )
      .pipe(uglifyCss())
      .pipe(concat(filePaths.static.css.vendor.min))
      .pipe(gulp.dest(filePaths.static.css.self))
  })

  gulp.task('build:static:css:main', function () {
    return gulpInit(filePaths.src.Front.Resources.less.main)
      .pipe(
        less({
          paths: [ filePaths.vendor.self ]
        })
      )
      .pipe(uglifyCss())
      .pipe(rename(filePaths.static.css.main.min))
      .pipe(gulp.dest(filePaths.static.css.self))
  })

  gulp.task('build:static:css', ['build:static:css:vendor', 'build:static:css:main'])

}())