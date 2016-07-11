'use strict';

const gulp = require('gulp')
const babel = require('gulp-babel')
const debug = require('gulp-debug')
const rename = require('gulp-rename')
const plumber = require('gulp-plumber')
const Cache = require('gulp-file-cache')
const clean = require('gulp-clean')
const gutil = require('gulp-util')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const glob = require('glob')
const rp = require('request-promise')
const exec = require('child_process').exec
const Promise = require('promise')
const forever = require('forever')
const assert = require('assert')

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
});

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

function stringSrc(filename, string) {
  const src = require('stream').Readable({ objectMode: true })

  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }

  return src
}

var incrementCount = 0

gulp.task('notifyMainStarted', function () {
  notify('Nest - Gulp - main', 'Starting build.')
})

gulp.task('main', [ 'notifyMainStarted', 'jsxCompile', 'jsCompile' ], function () {
  incrementCount += 1

  return stringSrc('increment', '' + incrementCount)
    .on('end', function () {
      notify('Nest - Gulp - main', 'Done building.')
    })
    .pipe(gulp.dest('build/'))
})

// function runProcess(command, commandArguments) {
//   const spawn = require('child_process').spawn
//   const process = spawn(command, commandArguments)
//
//   process.stdout.on('data', function (data) {
//     console.log('' + data)
//   })
//
//   process.stderr.on('data', function (data) {
//     console.log('' + data)
//   })
//
//   process.on('exit', function (code) {
//     console.log('Child process exited with code ' + code)
//   })
// }

gulp.task('notifyWatching', function () {
  notify('Nest - Gulp - watch', 'Starting watching.')
})

var serverStarted

gulp.task('mainWatch', ['main'], function () {
  forever.startServer()

  forever.list(true, function (err, processes) {
    assert.strictEqual(null, err)

    console.log(processes)
  })

  forever.start('dist/PublicApi/App.js', { uid: 'PublicApi' })
})

gulp.task('watch', [ 'notifyWatching', 'mainWatch' ], function () {
  const nodemonBin = __dirname + '/node_modules/.bin/nodemon'
  const baseArgs = [ '--watch', 'build/increment' ]

  // runProcess(nodemonBin, baseArgs.concat([ 'dist/PublicApi/App.js' ]))
  // runProcess(nodemonBin, baseArgs.concat([ 'dist/Front/App.js' ]))
  // runProcess(nodemonBin, baseArgs.concat([ 'dist/Worker/App.js' ]))
  // runProcess(nodemonBin, baseArgs.concat([ 'dist/Scheduler/App.js' ]))

  return gulp.watch(paths.src + '/**/*', [ 'mainWatch' ])
})
