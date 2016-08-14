(function () {
  'use strict';

  const filePaths = require('./paths').file
  const gulp = require('gulp')
  const debug = require('gulp-debug')
  const expect = require('gulp-expect-file')

  module.exports = function(files) {
    //to ensure compatibility with gulp-expect-file, throws errors otherwise
    if (!(files instanceof Array)) {
      files = [files]
    }

    const filteredFiles = []

    files.forEach(function (file) {
      filteredFiles.push(
        file.replace(
          new RegExp('^'+ filePaths.root.self + '/'),
          ''
        )
      )
    })
    //end for gulp-expect-file workaround

    return gulp
      .src(filteredFiles)
      .pipe(debug({}))
      .pipe(expect({ checkRealFile: true, errorOnFailure: true }, filteredFiles))
  }
}())