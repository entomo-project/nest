'use strict';
    
const gulp = require('gulp')
const babel = require('gulp-babel')
const debug = require('gulp-debug')
const rename = require('gulp-rename')
const plumber = require('gulp-plumber')
const Cache = require('gulp-file-cache')
const clean = require('gulp-clean')
const gutil = require('gulp-util')

const cache = new Cache()

const paths = {
  src: 'src'
}

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
      presets: ['es2015']
    }))
//    .pipe(cache.cache())
    .pipe(gulp.dest('dist/'))
})

function string_src(filename, string) {
  const src = require('stream').Readable({ objectMode: true })

  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  
  return src
}

var incrementCount = 0

gulp.task('main', [ 'jsxCompile', 'jsCompile' ], function () {
  incrementCount += 1
    
  return string_src('increment', '' + incrementCount)
    .pipe(gulp.dest('build/'))
})

function runProcess(command, commandArguments) {
  const spawn = require('child_process').spawn
  const process = spawn(command, commandArguments)

  process.stdout.on('data', function (data) {
    console.log('' + data)
  })

  process.stderr.on('data', function (data) {
    console.log('' + data)
  })

  process.on('exit', function (code) {
    console.log('Child process exited with code ' + code)
  })
}

gulp.task('watch', [ 'main' ], function () {
  const nodemonBin = __dirname + '/node_modules/.bin/nodemon'
  const baseArgs = [ '--watch', 'build/increment' ]

  runProcess(nodemonBin, baseArgs.concat([ 'dist/PublicApi/App.js' ]))
  runProcess(nodemonBin, baseArgs.concat([ 'dist/Front/App.js' ]))
  // runProcess(nodemonBin, baseArgs.concat([ 'dist/scheduler.js' ]))
  // runProcess(nodemonBin, baseArgs.concat([ 'dist/worker.js' ]))

  // runProcess(nodemonBin, baseArgs.concat([ 'dist/sc.js' ]))

  return gulp.watch(paths.src + '/**/*', [ 'main' ])
})
