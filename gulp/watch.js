(function () {
  'use strict';

  require('./css')
  require('./js')

  const webpackWatch = require('./webpack')

  const filePaths = require('./paths').file

  const gulp = require('gulp')
  const os = require('os')
  const forever = require('forever')
  const process = require('process')

  const children = []

  function runProcess(command, options) {
    const child = new (forever.Monitor)(command, options)

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

  function getIpV4(iface) {
    let ipV4 = undefined

    iface.forEach(function (conf) {
      if ('IPv4' === conf.family) {
        ipV4 = conf.address
      }
    })

    return ipV4
  }

  gulp.task('main', ['build:js', 'build:static:css:main'])

  gulp.task('watch:main', ['main'], function () {
    stopChildren()

    const ifaces = os.networkInterfaces();

    getIpV4(ifaces.eth0)

    function makeArgs(port) {
      return {
        args: [
          'run',
          '--host',
          'localhost:'+port,
          '--host',
          getIpV4(ifaces.eth0)+':'+port
        ]
      }
    }

    runProcess(
      'dist/PublicApi/App.js',
      makeArgs(3000)
    )
    runProcess(
      'dist/Front/App.js',
      makeArgs(3001)
    )
    runProcess(
      'dist/Worker/App.js',
      makeArgs(3003)
    )
    runProcess(
      'dist/Scheduler/App.js',
      makeArgs(3002)
    )
  })

  gulp.task('watch', ['watch:main'], function () {
    gulp.watch(
      filePaths.src.self + '/**/*',
      ['watch:main']
    )

    webpackWatch()
  })
}())