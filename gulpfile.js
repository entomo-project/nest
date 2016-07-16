'use strict';

const gulp = require('gulp')
const babel = require('gulp-babel')
const debug = require('gulp-debug')
const rename = require('gulp-rename')
const plumber = require('gulp-plumber')
const Cache = require('gulp-file-cache')
const clean = require('gulp-clean')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const glob = require('glob')
const rp = require('request-promise')
const forever = require('forever')
const assert = require('assert')
const process = require('process')

const cache = new Cache()

const paths = {
  src: 'src'
}

function notify(title, message) {
  const uri = 'http://dockermachine:3333/notify'

  rp({
    uri: uri,
    method: 'POST',
    body: {
      title: title,
      message: message
    },
    json: true
  })
}

gulp.task('browserify', function () {
  const files = glob.sync('./dist/Common/Resources/views/*/*.js')

  return browserify({
    entries: files
  })
    .bundle()
    .pipe(source('components.js'))
    .pipe(gulp.dest('./public/js'))
})

gulp.task('cleanDistDirectory', function() {
  return gulp.src('dist', {read: false})
    .pipe(clean())
})

gulp.task('jsxCompile', [ 'cleanDistDirectory' ], function () {
  return gulp
    .src('src/**/*.jsx')
//    .pipe(cache.filter())
    .pipe(plumber())
    .pipe(debug({}))
    .pipe(babel({
        presets: ['react', 'es2015']
    }))
//    .pipe(cache.cache())
    .pipe(rename(function (path) {
      path.extname = '.js'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('jsCompile', [ 'cleanDistDirectory' ], function () {
  return gulp
    .src('src/**/*.js')
//    .pipe(cache.filter())
    .pipe(plumber())
    .pipe(debug({}))
    .pipe(babel({
      presets: [ 'es2015' ]
    }))
//    .pipe(cache.cache())
    .pipe(gulp.dest('dist/'))
})

gulp.task('notifyMainStarted', function () {
  notify('Nest - Gulp - main', 'Starting build.')
})

gulp.task('main', [ 'notifyMainStarted', 'jsxCompile', 'jsCompile' ])

gulp.task('notifyWatching', function () {
  notify('Nest - Gulp - watch', 'Starting watching.')
})

const children = []

function runProcess(command) {
  const child = new (forever.Monitor)(command)

  children.push(child)

  child.start()
}

function stopChildren() {
  children.forEach(function (child) {
    console.log('Stopping child')

    child.stop()
  })
}

process.on('SIGINT', function() {
  console.log('SIGINT: aborting')

  stopChildren()

  process.exit()
})

gulp.task('mainWatch', ['main'], function () {
  stopChildren()

  runProcess('dist/PublicApi/App.js')
  runProcess('dist/Front/App.js')
  runProcess('dist/Worker/App.js')
  runProcess('dist/Scheduler/App.js')
})

gulp.task('watch', [ 'notifyWatching', 'mainWatch' ], function () {
  return gulp.watch(paths.src + '/**/*', [ 'mainWatch' ])
})
