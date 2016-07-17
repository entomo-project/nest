'use strict';

const gulp = require('gulp')
const babel = require('gulp-babel')
const debug = require('gulp-debug')
const plumber = require('gulp-plumber')
const Cache = require('gulp-file-cache')
const clean = require('gulp-clean')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const rp = require('request-promise')
const forever = require('forever')
const assert = require('assert')
const process = require('process')
const watchify = require('watchify')
const extend = require('extend')

const cache = new Cache()

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

const paths = {
  src: 'src',
  browserify: {
    entries: [
      __dirname + '/dist/Front/Public/Main.js'
    ],
    destinationFolder: __dirname + '/static/js'
  }
}

const vendorLibs = [
  'react',
  'react-dom',
  'react-router',
  'request-promise',
  'js-beautify'
]

gulp.task('buildStaticJsVendor', function () {
  const browserifyOpts = {
    debug: false
  }

  const br = browserify(browserifyOpts)

  vendorLibs.forEach(function (lib) {
    br.require(require.resolve(lib), { expose: lib })
  })

  //Fixing a bug related to request-promise require
  br.ignore('cls-bluebird')

  return br.bundle()
    .pipe(source('vendor.js'))
    .pipe(gulp.dest(paths.browserify.destinationFolder))
})

gulp.task('buildStaticJsMain', [ 'main' ], function () {
  const browserifyOpts = {
    entries: [
      './dist/Front/Public/Main.js'
    ],
    debug: false
  }

  const br = browserify(browserifyOpts)

  vendorLibs.forEach(function (lib) {
    br.external(require.resolve(lib))
  })

  return br.bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest(paths.browserify.destinationFolder))
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
        presets: [ 'react', 'es2015' ]
    }))
//    .pipe(cache.cache())
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

gulp.task('main', [ 'notifyMainStarted', 'jsxCompile', 'jsCompile' ], function () {
  notify('Nest - Gulp - main', 'Build done.')
})

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

    if (child.running) {
      child.stop()

      console.log('Stopped child')
    } else {
      console.log('Child already stopped')
    }
  })

  children.length = 0
}

process.on('SIGINT', function() {
  console.log('SIGINT: aborting')

  stopChildren()

  process.exit()
})

gulp.task('mainWatch', [ 'main' ], function () {
  stopChildren()

  runProcess('dist/PublicApi/App.js')
  runProcess('dist/Front/App.js')
  runProcess('dist/Worker/App.js')
  runProcess('dist/Scheduler/App.js')

  notify('Nest - Gulp - mainWatch', 'Started processes.')
})

gulp.task('watch', [ 'notifyWatching', 'mainWatch', 'buildStaticJsMain' ], function () {
  return gulp.watch(paths.src + '/**/*', [ 'mainWatch', 'buildStaticJsMain' ])
})
