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

TaskBuilder.prototype.buildTask = function (options) {
  var components,
    that,
    data,
    componentNames,
    createdBy;
    
  componentNames = options.componentNames;
  createdBy = options.createdBy;

  assert.notStrictEqual(null, componentNames);
  
  assert.notStrictEqual(null, createdBy);
  assert.notStrictEqual(undefined, createdBy);
  assert.notStrictEqual('', createdBy);

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
  
  data.createdBy = createdBy;
  data.createdAt = new Date();

  var task = {
    meta: {
      components: componentNames
    },
    data: data
  };

  return task;
};

exports.TaskBuilder = TaskBuilder;