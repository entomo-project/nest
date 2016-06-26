'use strict';
    
var assert = require('assert');

var foreach = require('foreach');
var extend = require('extend');

var TaskBuilder = function () {
  //TODO Inject as parameter
  this.componentNameComponentFileAssoc = {
    'baseTask': 'BaseTaskComponent',
    'commandBasedTask': 'CommandBasedTaskComponent'
  };
};

TaskBuilder.prototype = {
  componentNameComponentFileAssoc: null
};

TaskBuilder.prototype.buildTask = function (componentNames) {
  var components,
    that,
    data;

  assert.notStrictEqual(null, componentNames);

  that = this;

  if (undefined === componentNames) {
    componentNames= [ 'base' ];
  } else {
    assert(componentNames instanceof Array);

    componentNames= [ 'base' ].concat(componentNames);
  }

  components = [];

  foreach(componentNames, function (origComponentName) {
    var componentName;

    console.log(origComponentName)

    componentName = origComponentName + 'Task';

    var componentFileName = that.componentNameComponentFileAssoc[componentName];

    if (undefined === componentFileName) {
      throw new Error('Found no component file for component with name "' + origComponentName +'"');
    }

    components.push(
      require(__dirname + '/' + componentFileName).componentDefinition.component
    );
  });

  data = extend.apply(undefined, [{}].concat(components));

  var task = {
    meta: {
      components: componentNames
    },
    data: data
  };

  return task;
};

exports.TaskBuilder = TaskBuilder;