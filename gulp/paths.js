(function () {
  'use strict';

  const fs = require('fs')

  const rootPath = fs.realpathSync(__dirname + '/..')

  const distPath = rootPath + '/dist'

  const staticPath = rootPath + '/static'
  const staticCssPath = staticPath + '/css'
  const staticJsPath = staticPath + '/js'
  const staticVendorPath = staticPath + '/vendor'
  const staticVendorFontAwesomePath = staticVendorPath + '/font-awesome'
  const staticVendorFontAwesomeFontsPath = staticVendorFontAwesomePath + '/fonts'

  const srcPath = rootPath + '/src'

  const vendorPath = rootPath + '/node_modules'

  const fontAwesomePath = vendorPath + '/font-awesome'
  const fontAwesomeFontsPath = fontAwesomePath + '/fonts'
  const fontAwesomeCssMainPath = fontAwesomePath + '/css/font-awesome.css'

  const bootstrapCssMainPath = vendorPath + '/bootstrap/dist/css/bootstrap.css'

  const bmichalskiReactTableCssMainPath = vendorPath + '/@bmichalski-react/table/dist/css/react-table.css'

  const srcFrontResourcesLessMainPath = srcPath + '/Front/Resources/less/main.less'
  const srcFrontPublicAppPath = srcPath + '/Front/Public/App'

  const webFontAwesomeFontsPath =  '/static/vendor/font-awesome/fonts'

  module.exports = {
    web: {
      static: {
        vendor: {
          fontAwesome: {
            fonts: webFontAwesomeFontsPath
          }
        }
      }
    },
    file: {
      dist: {
        self: distPath
      },
      root: {
        self: rootPath
      },
      static: {
        self: staticPath,
        css: {
          self: staticCssPath,
          main: {
            min: 'main.min.css'
          },
          vendor: {
            min: 'vendor.min.css'
          }
        },
        js: {
          self: staticJsPath
        },
        vendor: {
          fontAwesome: {
            fonts: staticVendorFontAwesomeFontsPath
          }
        }
      },
      src: {
        self: srcPath,
        Front: {
          Public: {
            App: srcFrontPublicAppPath
          },
          Resources: {
            less: {
              main: srcFrontResourcesLessMainPath
            }
          }
        }
      },
      vendor: {
        self: vendorPath,
        bmichalskiReactTable: {
          css: {
            main: bmichalskiReactTableCssMainPath
          }
        },
        bootstrap: {
          css: {
            main: bootstrapCssMainPath
          }
        },
        fontAwesome: {
          css: {
            main: fontAwesomeCssMainPath
          },
          fonts: fontAwesomeFontsPath
        }
      }
    }
  }
}())