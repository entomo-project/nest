(function () {
  'use strict';

  const babelPresets = [ 'react', 'es2015', 'stage-0' ]
  const babelQuery = {
    presets: babelPresets
  }

  module.exports = {
    babel: {
      presets: babelPresets,
      query: babelQuery
    }
  }
}())