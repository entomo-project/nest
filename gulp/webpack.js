(function () {
  'use strict';

  const conf = require('./conf')
  const filePaths = require('./paths').file
  const gulpInit = require('./init')

  const gulp = require('gulp')
  const webpack = require('webpack-stream')
  const webpackOptimize = require('webpack').optimize
  const WebpackDefinePlugin = require('webpack').DefinePlugin

  const devtool = 'source-map'

  function buildWebpack(opts) {
    if (undefined === opts) {
      opts = {}
    }

    const defaultPlugins = [
      new webpackOptimize.CommonsChunkPlugin(
        {
          name: 'vendor',
          filename: 'vendor.js',
          minChunks: Infinity
        }
      )
    ]

    const optsPlugins = opts.plugins

    delete opts.plugins

    const webpackOpts = Object.assign(
      {},
      {
        entry: {
          vendor: [
            'babel-polyfill',
            'bluebird',
            'immutable',
            'react',
            'react-dom',
            'react-redux',
            'react-router',
            'redux',
            'redux-saga',
            'redux-thunk'
          ],
          app: filePaths.src.Front.Public.App
        },
        module: {
          loaders: [
            {
              test: /\.js|jsx$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel',
              query: conf.babel.query
            }
          ]
        },
        output: { filename: '[name].js' }
      },
      opts
    )

    if (undefined !== optsPlugins) {
      webpackOpts.plugins = defaultPlugins.concat(optsPlugins)
    }

    return gulpInit([])
      .pipe(webpack(webpackOpts))
      .pipe(gulp.dest(filePaths.static.js.self))
  }

  gulp.task('build:webpack', function () {
    return buildWebpack({ devtool: devtool })
  })

  function webpackWatch() {
    return buildWebpack({ watch: true, devtool: devtool })
  }

  gulp.task('build:webpack:watch', webpackWatch)

  gulp.task('build:webpack:prod', function () {
    return buildWebpack({
      plugins: [
        new WebpackDefinePlugin({
          'process.env':{
            'NODE_ENV': JSON.stringify('production')
          }
        }),
        new webpackOptimize.UglifyJsPlugin()
      ]
    })
  })
  
  module.exports = webpackWatch
}())